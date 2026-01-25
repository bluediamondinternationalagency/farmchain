import algosdk from 'algosdk';
import { SupplyChainEvent, Cow } from '../types';
import { IPFSService } from './ipfsService';
import { PeraWalletService } from './peraWalletService';

// Algorand Configuration
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const PORT = '';
const TOKEN = '';

const algodClient = new algosdk.Algodv2(TOKEN, ALGOD_SERVER, PORT);
const indexerClient = new algosdk.Indexer(TOKEN, INDEXER_SERVER, PORT);

/**
 * Supply Chain Service for tracking complete cattle lifecycle
 * Records all events on-chain for transparency and consumer confidence
 */
export const SupplyChainService = {

  /**
   * Record a supply chain event on-chain using ARC-69
   * Now uses Pera Wallet for signing
   */
  recordEventOnChain: async (
    assetId: number,
    event: Omit<SupplyChainEvent, 'id' | 'txId'>,
    adminWalletAddress: string
  ): Promise<string> => {
    
    try {
      const params = await algodClient.getTransactionParams().do();

      // Create ARC-69 metadata for the event
      const arc69Metadata = IPFSService.createARC69Update(event.eventType, event.data);
      arc69Metadata.properties.actor = event.actor;
      arc69Metadata.properties.timestamp = event.timestamp;
      
      if (event.ipfsCID) {
        arc69Metadata.properties.ipfs_cid = event.ipfsCID;
      }

      const note = new TextEncoder().encode(JSON.stringify(arc69Metadata));

      // Asset config transaction to record history in note field
      const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
        sender: adminWalletAddress,
        assetIndex: assetId,
        manager: adminWalletAddress,
        reserve: adminWalletAddress,
        freeze: undefined,
        clawback: undefined,
        note: note,
        suggestedParams: params,
        strictEmptyAddressChecking: false,
      });

      // Sign with Pera Wallet
      const signedTxn = await PeraWalletService.signTransaction(txn, adminWalletAddress);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = typeof response === 'string' ? response : (response as any).txId || (response as any).txid;
      
      if (!txId) throw new Error('Failed to get transaction ID');

      await algosdk.waitForConfirmation(algodClient, txId, 4);

      console.log(`✅ Supply chain event recorded: ${event.eventType} (TxID: ${txId})`);
      return txId;

    } catch (error) {
      console.error('Failed to record supply chain event:', error);
      throw error;
    }
  },

  /**
   * Get complete supply chain history for a cattle from blockchain
   */
  getSupplyChainHistory: async (assetId: number): Promise<SupplyChainEvent[]> => {
    
    try {
      // Query all transactions related to this asset
      const response = await indexerClient
        .searchForTransactions()
        .assetID(assetId)
        .do();

      const events: SupplyChainEvent[] = [];

      for (const txn of response.transactions) {
        // Extract metadata from transaction notes
        if (txn.note) {
          try {
            const noteBytes = typeof txn.note === 'string' ? Buffer.from(txn.note, 'base64') : Buffer.from(txn.note);
            const noteText = noteBytes.toString('utf-8');
            const metadata = JSON.parse(noteText);

            if (metadata.standard === 'arc69' && metadata.properties) {
              const event: SupplyChainEvent = {
                id: txn.id,
                timestamp: metadata.properties.timestamp || txn['round-time'] * 1000,
                eventType: metadata.properties.event_type,
                txId: txn.id,
                actor: metadata.properties.actor || txn.sender,
                data: metadata.properties.data || metadata.properties,
                ipfsCID: metadata.properties.ipfs_cid
              };

              events.push(event);
            }
          } catch (e) {
            // Not JSON or invalid metadata, skip
          }
        }

        // Also track transfers as events
        if (txn['tx-type'] === 'axfer' && txn['asset-transfer-transaction']) {
          const transfer = txn['asset-transfer-transaction'];
          events.push({
            id: txn.id,
            timestamp: txn['round-time'] * 1000,
            eventType: 'transfer',
            txId: txn.id,
            actor: txn.sender,
            data: {
              from: txn.sender,
              to: transfer.receiver,
              amount: transfer.amount
            }
          });
        }
      }

      // Sort by timestamp
      return events.sort((a, b) => a.timestamp - b.timestamp);

    } catch (error) {
      console.error('Failed to fetch supply chain history:', error);
      return [];
    }
  },

  /**
   * Record weight update event
   */
  recordWeightUpdate: async (
    assetId: number,
    currentWeight: number,
    previousWeight: number,
    notes: string,
    adminAccount: algosdk.Account
  ): Promise<string> => {
    
    const event: Omit<SupplyChainEvent, 'id' | 'txId'> = {
      timestamp: Date.now(),
      eventType: 'weight_update',
      actor: adminAccount.addr.toString(),
      data: {
        current_weight_kg: currentWeight,
        previous_weight_kg: previousWeight,
        weight_gain_kg: currentWeight - previousWeight,
        notes: notes
      }
    };

    return await SupplyChainService.recordEventOnChain(assetId, event, adminAccount);
  },

  /**
   * Record health check event
   */
  recordHealthCheck: async (
    assetId: number,
    healthScore: number,
    veterinarian: string,
    findings: string,
    adminAccount: algosdk.Account
  ): Promise<string> => {
    
    const event: Omit<SupplyChainEvent, 'id' | 'txId'> = {
      timestamp: Date.now(),
      eventType: 'health_check',
      actor: veterinarian,
      data: {
        health_score: healthScore,
        findings: findings,
        checked_by: veterinarian,
        date: new Date().toISOString()
      }
    };

    return await SupplyChainService.recordEventOnChain(assetId, event, adminAccount);
  },

  /**
   * Record vaccination event
   */
  recordVaccination: async (
    assetId: number,
    vaccine: string,
    batch: string,
    veterinarian: string,
    adminAccount: algosdk.Account
  ): Promise<string> => {
    
    const event: Omit<SupplyChainEvent, 'id' | 'txId'> = {
      timestamp: Date.now(),
      eventType: 'vaccination',
      actor: veterinarian,
      data: {
        vaccine: vaccine,
        batch: batch,
        administered_by: veterinarian,
        date: new Date().toISOString()
      }
    };

    return await SupplyChainService.recordEventOnChain(assetId, event, adminAccount);
  },

  /**
   * Record slaughter event with IPFS certificate
   */
  recordSlaughter: async (
    assetId: number,
    slaughterData: {
      facility: string;
      finalWeight: number;
      date: number;
      certificateCID: string;
    },
    adminWalletAddress: string
  ): Promise<string> => {
    
    const event: Omit<SupplyChainEvent, 'id' | 'txId'> = {
      timestamp: slaughterData.date,
      eventType: 'slaughter',
      actor: slaughterData.facility,
      data: {
        facility: slaughterData.facility,
        final_weight_kg: slaughterData.finalWeight,
        slaughter_date: new Date(slaughterData.date).toISOString(),
        certificate: `ipfs://${slaughterData.certificateCID}`
      },
      ipfsCID: slaughterData.certificateCID
    };

    return await SupplyChainService.recordEventOnChain(assetId, event, adminWalletAddress);
  },

  /**
   * Get consumer-facing summary (public data only)
   */
  getConsumerSummary: async (assetId: number): Promise<any> => {
    
    try {
      // Get asset info
      const assetInfo = await algodClient.getAssetByID(assetId).do();
      const history = await SupplyChainService.getSupplyChainHistory(assetId);

      // Fetch metadata from IPFS if available
      let metadata = null;
      if (assetInfo.params.url && assetInfo.params.url.startsWith('ipfs://')) {
        const cid = assetInfo.params.url.replace('ipfs://', '').split('#')[0];
        try {
          metadata = await IPFSService.fetchMetadata(cid);
        } catch (e) {
          console.warn('Could not fetch IPFS metadata');
        }
      }

      // Extract public information
      const birthEvent = history.find(e => e.eventType === 'birth');
      const weightUpdates = history.filter(e => e.eventType === 'weight_update');
      const healthChecks = history.filter(e => e.eventType === 'health_check');
      const vaccinations = history.filter(e => e.eventType === 'vaccination');
      const slaughterEvent = history.find(e => e.eventType === 'slaughter');

      const latestWeight = weightUpdates.length > 0 
        ? weightUpdates[weightUpdates.length - 1].data.current_weight_kg
        : metadata?.properties?.birth_weight_kg || 0;

      const latestHealthScore = healthChecks.length > 0
        ? healthChecks[healthChecks.length - 1].data.health_score
        : 100;

      return {
        asset_id: assetId,
        name: assetInfo.params.name,
        breed: metadata?.properties?.breed || 'Unknown',
        sex: metadata?.properties?.sex,
        birth_date: metadata?.properties?.birth_date,
        age_days: metadata?.properties?.birth_date 
          ? Math.floor((Date.now() - new Date(metadata.properties.birth_date).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        current_weight_kg: latestWeight,
        health_score: latestHealthScore,
        certifications: metadata?.properties?.certifications || [],
        vaccination_count: vaccinations.length,
        total_weight_gain_kg: weightUpdates.length > 0
          ? latestWeight - (metadata?.properties?.birth_weight_kg || 0)
          : 0,
        is_slaughtered: !!slaughterEvent,
        slaughter_date: slaughterEvent?.data?.slaughter_date,
        slaughter_facility: slaughterEvent?.data?.facility,
        blockchain: 'Algorand TestNet',
        verified: true,
        total_events: history.length,
        transparency_score: Math.min(100, history.length * 10) // Simple scoring
      };

    } catch (error) {
      console.error('Failed to generate consumer summary:', error);
      throw error;
    }
  },

  /**
   * Create QR code data for consumer verification
   */
  createQRCodeData: (assetId: number): string => {
    // URL that consumers can scan to see cattle history
    return `https://farmchain.app/verify/${assetId}`;
  }
};
