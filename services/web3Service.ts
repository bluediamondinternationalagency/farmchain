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

  mintCowNFT: async (cowData: Cow, signerAddress: string): Promise<number> => {
    console.log('🔨 Minting NFT with Pera Wallet:', signerAddress);
    console.log('💰 Checking wallet balance...');
    
    // Check balance first
    const balance = await Web3Service.getBalance(signerAddress);
    console.log(`💰 Wallet balance: ${balance.toFixed(4)} ALGO`);
    
    if (balance < 0.2) {
      console.error('❌ Insufficient balance for minting!');
      console.error(`📍 Fund your Pera Wallet: ${signerAddress}`);
      console.error('🔗 Dispenser: https://bank.testnet.algorand.network/');
      throw new Error(
        `Insufficient balance: ${balance.toFixed(4)} ALGO. Need at least 0.2 ALGO to mint.\n\n` +
        `Fund your Pera Wallet at: https://bank.testnet.algorand.network/`
      );
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
        sex: cowData.sex || 'female',
        weight: cowData.weight,
        health_score: cowData.healthScore,
        status: cowData.status,
        purchase_date: cowData.purchaseDate,
        vaccination_records: cowData.vaccination_records || [],
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
      from: signerAddress,
      manager: signerAddress,
      reserve: signerAddress,
      assetName: trimmedAssetName,
      assetURL: trimmedAssetURL,
      noteLength: note.length
    });

    // Create asset creation transaction
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: signerAddress,
      total: BigInt(1),
      decimals: 0,
      assetName: trimmedAssetName,
      unitName: 'FCLSTK',
      assetURL: trimmedAssetURL,
      defaultFrozen: false,
      manager: signerAddress,
      reserve: signerAddress,
      note: note,
      suggestedParams: params,
    });

    // Sign with Pera Wallet
    console.log('📝 Requesting signature from Pera Wallet...');
    const signedTxn = await PeraWalletService.signTransaction(txn, signerAddress);
    
    try {
      console.log('Sending transaction to network...');
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      console.log('Raw response:', response);
      
      // The response is just the txid string
      const txId = typeof response === 'string' ? response : response.txid;
      
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
                         (result['txn']?.['txn']?.['caid']);
      
      if (!assetIndex) {
        console.error('Could not find asset index in result:', JSON.stringify(result, null, 2));
        throw new Error("Failed to retrieve Asset ID from confirmation");
      }
      
      console.log('Asset minted successfully! Asset ID:', assetIndex);
      // Convert BigInt to number for storage
      const assetIdNumber = typeof assetIndex === 'bigint' ? Number(assetIndex) : assetIndex;
      return assetIdNumber;
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
      sender: adminAddress,
      assetIndex: cowData.assetId,
      manager: adminAddress,
      reserve: adminAddress,
      note: note,
      suggestedParams: params,
      strictEmptyAddressChecking: false
    });

    const signedTxn = txn.signTxn(admin.sk);
    const response = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = typeof response === 'string' ? response : response.txid;
    
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
              const noteText = Buffer.from(txn.note as any, 'base64').toString('utf-8');
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

  assignAssetToUser: async (assetId: number, userAddress: string, adminWalletAddress: string) => {
    console.log('📦 Transferring NFT...');
    console.log('📍 From (Admin):', adminWalletAddress);
    console.log('📍 To (User):', userAddress);
    console.log('🎫 Asset ID:', assetId);

    // Check admin wallet balance
    const adminBalance = await Web3Service.getBalance(adminWalletAddress);
    if (adminBalance < 0.002) {
      throw new Error(`Admin wallet needs at least 0.002 ALGO for transfer fees. Current: ${adminBalance.toFixed(4)} ALGO`);
    }

    const params = await algodClient.getTransactionParams().do();

    // Step 1: User Opt-In (signed by user via Pera Wallet)
    console.log('1️⃣ Creating opt-in transaction for user...');
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: userAddress,
      receiver: userAddress,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: params,
    });
    
    console.log('✍️ Requesting user signature for opt-in...');
    const signedOptIn = await PeraWalletService.signTransaction(optInTxn, userAddress);
    const optInRes = await algodClient.sendRawTransaction(signedOptIn).do();
    const optInTxId = typeof optInRes === 'string' ? optInRes : optInRes.txid;
    
    if (!optInTxId) throw new Error('Failed to get opt-in transaction ID');
    
    console.log('✅ Opt-in transaction sent. TxID:', optInTxId);
    await algosdk.waitForConfirmation(algodClient, optInTxId, 10);
    console.log('✅ User opted-in successfully');

    // Step 2: Admin Transfer (signed by admin's Pera Wallet)
    const params2 = await algodClient.getTransactionParams().do();
    
    console.log('2️⃣ Creating transfer transaction from admin...');
    const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: adminWalletAddress,
      receiver: userAddress,
      assetIndex: assetId,
      amount: 1,
      suggestedParams: params2,
    });

    console.log('✍️ Requesting admin signature for transfer...');
    const signedTransfer = await PeraWalletService.signTransaction(transferTxn, adminWalletAddress);
    const transferRes = await algodClient.sendRawTransaction(signedTransfer).do();
    const transferTxId = typeof transferRes === 'string' ? transferRes : transferRes.txid;
    
    if (!transferTxId) throw new Error('Failed to get transfer transaction ID');
    
    console.log('✅ Transfer transaction sent. TxID:', transferTxId);
    await algosdk.waitForConfirmation(algodClient, transferTxId, 10);
    console.log('✅ NFT transferred successfully!');

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
  },

  // --- Update NFT Metadata (ARC-69) ---
  updateNFTMetadata: async (assetId: number, cowData: Cow, signerAddress: string): Promise<string> => {
    console.log('📝 Updating NFT metadata for Asset:', assetId);
    
    const params = await algodClient.getTransactionParams().do();
    
    // Ensure genesisHash is a Uint8Array if it exists
    if (params.genesisHash && typeof params.genesisHash === 'string') {
      params.genesisHash = new Uint8Array(Buffer.from(params.genesisHash, 'base64'));
    }

    // Create updated ARC-69 metadata
    const arc69Metadata = {
      standard: "arc69",
      description: `Farm Chain Livestock - ${cowData.name}`,
      external_url: "https://farmchain.app",
      properties: {
        breed: cowData.breed,
        sex: cowData.sex || 'female',
        weight: cowData.weight,
        health_score: cowData.healthScore,
        status: cowData.status,
        purchase_date: cowData.purchaseDate,
        vaccination_records: cowData.vaccination_records || [],
        last_updated: Date.now()
      }
    };
    
    const note = new TextEncoder().encode(JSON.stringify(arc69Metadata));
    
    if (note.length > 1024) {
      throw new Error('Metadata too large. Please reduce description or properties.');
    }

    // Asset config transaction to update metadata (manager must be the signer)
    const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
      sender: signerAddress,
      assetIndex: assetId,
      manager: signerAddress,
      reserve: signerAddress,
      freeze: undefined,
      clawback: undefined,
      note: note,
      suggestedParams: params,
      strictEmptyAddressChecking: false
    });

    console.log('📝 Requesting signature for metadata update...');
    const signedTxn = await PeraWalletService.signTransaction(txn, signerAddress);
    
    const response = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = typeof response === 'string' ? response : response.txid;
    
    console.log('Metadata update transaction sent. TxID:', txId);
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('✅ Metadata updated successfully!');
    
    return txId;
  },

  // --- Burn/Opt-Out NFT (for slaughter or off-chain sales) ---
  burnNFT: async (assetId: number, ownerAddress: string): Promise<string> => {
    console.log('🔥 Burning NFT (Opt-Out) - Asset:', assetId);
    console.log('👤 Owner:', ownerAddress);
    
    const params = await algodClient.getTransactionParams().do();
    
    // Ensure genesisHash is a Uint8Array
    if (params.genesisHash && typeof params.genesisHash === 'string') {
      params.genesisHash = new Uint8Array(Buffer.from(params.genesisHash, 'base64'));
    }

    // Asset opt-out transaction (removes from wallet, keeps on blockchain)
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: ownerAddress,
      receiver: ownerAddress,
      assetIndex: assetId,
      amount: BigInt(0),
      closeRemainderTo: algosdk.encodeAddress(new Uint8Array(32)), // Burn address
      suggestedParams: params,
    });

    console.log('📝 Requesting signature for NFT burn...');
    const signedTxn = await PeraWalletService.signTransaction(txn, ownerAddress);
    
    const response = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = typeof response === 'string' ? response : response.txid;
    
    console.log('🔥 NFT burn transaction sent. TxID:', txId);
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('✅ NFT burnt successfully! Asset removed from wallet, history preserved on blockchain.');
    
    return txId;
  }
};