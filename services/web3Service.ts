import algosdk from 'algosdk';
import { Cow } from '../types';
import { PeraWalletService } from './peraWalletService';
import { IPFSService } from './ipfsService';
import { SupplyChainService } from './supplyChainService';

// public Testnet Nodes (AlgoNode)
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const PORT = '';
const TOKEN = '';

const algodClient = new algosdk.Algodv2(TOKEN, ALGOD_SERVER, PORT);
const indexerClient = new algosdk.Indexer(TOKEN, INDEXER_SERVER, PORT);

// Key storage keys for LocalStorage (Admin is custodial for demo)
const ADMIN_KEY = 'fc_admin_mnemonic';

// Helper: Get or Create Admin Account from LocalStorage (Custodial)
const getOrCreateAccount = (storageKey: string): algosdk.Account => {
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return algosdk.mnemonicToSecretKey(existing);
  }
  const newAccount = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(newAccount.sk);
  localStorage.setItem(storageKey, mnemonic);
  return newAccount;
};

export const Web3Service = {
  // --- Account Management ---
  
  getAdminAccount: (): { address: string; mnemonic: string } => {
    const acc = getOrCreateAccount(ADMIN_KEY);
    return { address: acc.addr.toString(), mnemonic: algosdk.secretKeyToMnemonic(acc.sk) };
  },

  // Set custom admin mnemonic (for importing existing funded wallet)
  setAdminMnemonic: (mnemonic: string): { address: string; mnemonic: string } => {
    try {
      // Validate the mnemonic
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      // Store it
      localStorage.setItem(ADMIN_KEY, mnemonic);
      return { address: account.addr.toString(), mnemonic };
    } catch (e) {
      throw new Error('Invalid mnemonic phrase. Please check and try again.');
    }
  },

  // Clear admin wallet (to generate a new one)
  clearAdminWallet: () => {
    localStorage.removeItem(ADMIN_KEY);
  },

  // Pera Wallet Methods
  connectPeraWallet: async (): Promise<string[]> => {
    return await PeraWalletService.connect();
  },

  disconnectPeraWallet: async (): Promise<void> => {
    await PeraWalletService.disconnect();
  },

  reconnectPeraWallet: async (): Promise<string | null> => {
    return await PeraWalletService.reconnect();
  },

  isPeraWalletConnected: (): boolean => {
    return PeraWalletService.isConnected();
  },

  getBalance: async (address: string): Promise<number> => {
    try {
      const info = await algodClient.accountInformation(address).do();
      return Number(info.amount) / 1000000; // Convert microAlgos to ALGO
    } catch (e) {
      // Account might not exist on chain yet (needs funding)
      return 0;
    }
  },

  // --- Asset Management (Minting) ---

  mintCowNFT: async (cowData: Cow): Promise<number> => {
    const admin = getOrCreateAccount(ADMIN_KEY);
    const adminAddress = admin.addr.toString();
    
    console.log('Minting NFT with admin address:', adminAddress);
    
    // Check balance first
    const balance = await Web3Service.getBalance(adminAddress);
    if (balance < 0.2) {
      throw new Error(`Insufficient balance: ${balance.toFixed(4)} ALGO. Need at least 0.2 ALGO to mint.`);
    }
    
    const params = await algodClient.getTransactionParams().do();
    console.log('Transaction params:', params);

    // Ensure genesisHash is a Uint8Array if it exists
    if (params.genesisHash && typeof params.genesisHash === 'string') {
      params.genesisHash = new Uint8Array(Buffer.from(params.genesisHash, 'base64'));
    }

    // Determine image URL (IPFS or HTTP)
    const imageUrl = cowData.imageCID 
      ? `ipfs://${cowData.imageCID}`
      : cowData.imageUrl;

    // Determine asset URL (metadata CID or image URL)
    const assetURL = cowData.metadataCID
      ? `ipfs://${cowData.metadataCID}#arc3`
      : imageUrl.substring(0, 96); // Max 96 chars for asset URL

    // ARC-69 Dynamic Metadata in Note
    const arc69Metadata = {
      standard: "arc69",
      description: `Farm Chain Livestock - ${cowData.name}`,
      external_url: "https://farmchain.app",
      properties: {
        breed: cowData.breed,
        weight: cowData.weight,
        health_score: cowData.healthScore,
        status: cowData.status,
        purchase_date: cowData.purchaseDate,
        last_updated: Date.now()
      }
    };
    
    const note = new TextEncoder().encode(JSON.stringify(arc69Metadata));
    
    // Ensure note is not too large (max 1024 bytes)
    if (note.length > 1024) {
      throw new Error('Metadata too large. Please reduce description or properties.');
    }

    // Ensure assetURL is within 96 character limit
    const trimmedAssetURL = assetURL.substring(0, 96);
    
    // Ensure assetName is within 32 character limit
    const trimmedAssetName = cowData.name.substring(0, 32);

    // Debug logging
    console.log('Transaction parameters:', {
      from: adminAddress,
      manager: adminAddress,
      reserve: adminAddress,
      assetName: trimmedAssetName,
      assetURL: trimmedAssetURL,
      noteLength: note.length
    });

    // Encode addresses to ensure proper format
    const encodedFrom = algosdk.encodeAddress(algosdk.decodeAddress(adminAddress).publicKey);
    const encodedManager = algosdk.encodeAddress(algosdk.decodeAddress(adminAddress).publicKey);
    const encodedReserve = algosdk.encodeAddress(algosdk.decodeAddress(adminAddress).publicKey);

    // Create asset creation transaction
    // Note: freeze and clawback are omitted entirely (not set to undefined)
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: encodedFrom,
      total: 1,
      decimals: 0,
      assetName: trimmedAssetName,
      unitName: 'FCLSTK',
      assetURL: trimmedAssetURL,
      defaultFrozen: false,
      manager: encodedManager,
      reserve: encodedReserve,
      note: note,
      suggestedParams: params,
    });

    const signedTxn = txn.signTxn(admin.sk);
    
    try {
      console.log('Sending transaction to network...');
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      console.log('Raw response:', response);
      
      // The response is just the txId string
      const txId = typeof response === 'string' ? response : response.txId || response.txid;
      
      if (!txId) {
        console.error('Invalid response format:', response);
        throw new Error("No transaction ID returned from network");
      }
      
      console.log('Transaction sent successfully. TxID:', txId);
      
      // Wait for confirmation with more retries
      console.log('Waiting for confirmation...');
      const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
      console.log('Confirmation result:', result);
      
      // Try different possible property names for asset index
      const assetIndex = result['asset-index'] || 
                         result.assetIndex || 
                         result['created-asset-index'] ||
                         result.createdAssetIndex ||
                         (result.txn?.txn?.caid) ||
                         (result['txn']?.['txn']?.['caid']);
      
      if (!assetIndex) {
        console.error('Could not find asset index in result:', JSON.stringify(result, null, 2));
        throw new Error("Failed to retrieve Asset ID from confirmation");
      }
      
      console.log('Asset minted successfully! Asset ID:', assetIndex);
      return assetIndex;
    } catch (error: any) {
      console.error('Minting error details:', error);
      
      if (error.message?.includes('overspend')) {
        throw new Error('Insufficient funds in admin wallet. Please fund it with at least 0.2 ALGO.');
      }
      
      if (error.response?.body) {
        console.error('API Error:', error.response.body);
      }
      
      throw new Error(`Minting failed: ${error.message || 'Unknown error'}`);
    }
  },

  // --- Update NFT Metadata (ARC-69) ---
  // Send asset config transaction with updated metadata in note field
  updateCowNFT: async (cowData: Cow): Promise<string> => {
    if (!cowData.assetId) throw new Error("Asset ID required for update");
    
    const admin = getOrCreateAccount(ADMIN_KEY);
    const adminAddress = admin.addr.toString();
    const params = await algodClient.getTransactionParams().do();

    // Updated ARC-69 metadata
    const arc69Metadata = {
      standard: "arc69",
      description: `Farm Chain Cattle NFT - ${cowData.name}`,
      external_url: "https://farmchain.app",
      properties: {
        breed: cowData.breed,
        weight: cowData.weight,
        health_score: cowData.healthScore,
        status: cowData.status,
        purchase_date: cowData.purchaseDate,
        last_updated: Date.now(),
        traits: {
          breed: cowData.breed,
          current_weight_kg: cowData.weight,
          health_status: cowData.healthScore >= 90 ? "Excellent" : cowData.healthScore >= 70 ? "Good" : "Fair",
          weight_gain_kg: cowData.history.length > 1 
            ? cowData.weight - cowData.history[0].weight 
            : 0
        }
      }
    };
    const note = new TextEncoder().encode(JSON.stringify(arc69Metadata));

    // Asset config transaction (only updating note/metadata)
    const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
      from: adminAddress,
      assetIndex: cowData.assetId,
      manager: adminAddress,
      reserve: adminAddress,
      note: note,
      suggestedParams: params,
      strictEmptyAddressChecking: false
    });

    const signedTxn = txn.signTxn(admin.sk);
    const response = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = typeof response === 'string' ? response : response.txId || response.txid;
    
    if (!txId) throw new Error('Failed to get transaction ID for update');
    
    await algosdk.waitForConfirmation(algodClient, txId, 10);
    console.log('Metadata updated on-chain. TxID:', txId);
    return txId;
  },

  // --- Get NFT Metadata from chain ---
  getNFTMetadata: async (assetId: number): Promise<any> => {
    try {
      // Get asset info
      const assetInfo = await algodClient.getAssetByID(assetId).do();
      
      // Get recent transactions to find latest metadata update
      const txns = await indexerClient
        .searchForTransactions()
        .assetID(assetId)
        .txType('acfg')
        .do();

      // Find most recent transaction with note (metadata update)
      let latestMetadata = null;
      if (txns.transactions && txns.transactions.length > 0) {
        for (const txn of txns.transactions) {
          if (txn.note) {
            try {
              const noteText = Buffer.from(txn.note, 'base64').toString('utf-8');
              const metadata = JSON.parse(noteText);
              if (metadata.standard === 'arc69') {
                latestMetadata = metadata;
                break; // Most recent is first
              }
            } catch (e) {
              // Invalid JSON in note, skip
            }
          }
        }
      }

      return {
        assetInfo,
        metadata: latestMetadata
      };
    } catch (e) {
      console.error('Failed to fetch NFT metadata:', e);
      return null;
    }
  },

  // --- Transfer Flow (User uses Pera Wallet) ---
  // 1. Opt-In User (User signs via Pera)
  // 2. Transfer Asset (Admin signs - custodial)

  assignAssetToUser: async (assetId: number, userAddress: string) => {
    const admin = getOrCreateAccount(ADMIN_KEY);
    const adminAddress = admin.addr.toString();
    const params = await algodClient.getTransactionParams().do();

    // Step 1: User Opt-In (signed by user via Pera Wallet)
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: userAddress,
      to: userAddress,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: params,
    });
    
    const signedOptIn = await PeraWalletService.signTransaction(optInTxn, userAddress);
    const optInRes = await algodClient.sendRawTransaction(signedOptIn).do();
    const optInTxId = typeof optInRes === 'string' ? optInRes : optInRes.txId || optInRes.txid;
    
    if (!optInTxId) throw new Error('Failed to get opt-in transaction ID');
    
    console.log('Opt-in transaction sent. TxID:', optInTxId);
    await algosdk.waitForConfirmation(algodClient, optInTxId, 10);

    // Step 2: Admin Transfer (signed by admin custodial wallet)
    const params2 = await algodClient.getTransactionParams().do();
    
    const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: adminAddress,
      to: userAddress,
      assetIndex: assetId,
      amount: 1,
      suggestedParams: params2,
    });

    const signedTransfer = transferTxn.signTxn(admin.sk);
    const transferRes = await algodClient.sendRawTransaction(signedTransfer).do();
    const transferTxId = typeof transferRes === 'string' ? transferRes : transferRes.txId || transferRes.txid;
    
    if (!transferTxId) throw new Error('Failed to get transfer transaction ID');
    
    console.log('Transfer transaction sent. TxID:', transferTxId);
    await algosdk.waitForConfirmation(algodClient, transferTxId, 10);

    return true;
  },

  // Get user's held assets
  getUserAssets: async (address: string): Promise<any[]> => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      return accountInfo.assets || [];
    } catch (e) {
      console.error('Failed to fetch user assets:', e);
      return [];
    }
  },

  // --- Supply Chain Integration ---
  
  // Record weight update on-chain
  recordWeightUpdate: async (
    assetId: number,
    currentWeight: number,
    previousWeight: number,
    notes: string
  ): Promise<string> => {
    const admin = getOrCreateAccount(ADMIN_KEY);
    return await SupplyChainService.recordWeightUpdate(
      assetId,
      currentWeight,
      previousWeight,
      notes,
      admin
    );
  },

  // Record health check on-chain
  recordHealthCheck: async (
    assetId: number,
    healthScore: number,
    veterinarian: string,
    findings: string
  ): Promise<string> => {
    const admin = getOrCreateAccount(ADMIN_KEY);
    return await SupplyChainService.recordHealthCheck(
      assetId,
      healthScore,
      veterinarian,
      findings,
      admin
    );
  },

  // Get complete supply chain history
  getSupplyChainHistory: async (assetId: number) => {
    return await SupplyChainService.getSupplyChainHistory(assetId);
  },

  // Get consumer-facing summary
  getConsumerSummary: async (assetId: number) => {
    return await SupplyChainService.getConsumerSummary(assetId);
  },

  // --- IPFS Integration ---
  
  // Upload cattle image to IPFS
  uploadImageToIPFS: async (file: File): Promise<string> => {
    return await IPFSService.uploadFile(file);
  },

  // Upload metadata to IPFS
  uploadMetadataToIPFS: async (metadata: any, filename: string): Promise<string> => {
    return await IPFSService.uploadJSON(metadata, filename);
  },

  // Create ARC-3 metadata
  createARC3Metadata: (cattleData: any) => {
    return IPFSService.createARC3Metadata(cattleData);
  }
};