import algosdk from 'algosdk';
import { PaymentSplit } from '../types';

// Algorand Configuration
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const PORT = '';
const TOKEN = '';

const algodClient = new algosdk.Algodv2(TOKEN, ALGOD_SERVER, PORT);

// Platform wallet address - for demo, we'll use the admin wallet or environment variable
// In production, this should be a dedicated platform wallet
const getPlatformAddress = (): string => {
  // Try environment variable first
  const envAddress = (import.meta as any).env?.VITE_PLATFORM_WALLET;
  if (envAddress && envAddress.length === 58) {
    return envAddress;
  }
  
  // Fallback: Use admin wallet as platform wallet for demo
  const adminMnemonic = localStorage.getItem('farmchain_admin_wallet');
  if (adminMnemonic) {
    try {
      const account = algosdk.mnemonicToSecretKey(adminMnemonic);
      return account.addr.toString();
    } catch (e) {
      console.warn('Failed to get admin address for platform wallet');
    }
  }
  
  // Last resort: generate a temporary address (warning: funds will be lost!)
  console.warn('⚠️ No platform wallet configured! Using temporary address. Set VITE_PLATFORM_WALLET in .env.local');
  const tempAccount = algosdk.generateAccount();
  return tempAccount.addr.toString();
};

const PLATFORM_ADDRESS = getPlatformAddress();

/**
 * Escrow Service for handling payment splits on cattle slaughter
 * Implements atomic transactions for 70/30 or custom splits
 */
export const EscrowService = {

  /**
   * Create payment split configuration for a cattle
   */
  createPaymentSplit: (
    farmerAddress: string,
    farmerPercentage: number = 70,
    platformPercentage: number = 30,
    cattleType?: string
  ): PaymentSplit => {
    // Validate percentages
    if (farmerPercentage + platformPercentage !== 100) {
      throw new Error('Payment split percentages must total 100');
    }

    return {
      farmerAddress,
      platformAddress: PLATFORM_ADDRESS,
      farmerPercentage,
      platformPercentage,
      cattleType
    };
  },

  /**
   * Execute atomic payment distribution on slaughter
   * Splits payment between farmer and platform in a single atomic transaction
   */
  executeSlaughterPayment: async (
    paymentSplit: PaymentSplit,
    totalAmount: number, // in microALGOs
    adminAccount: algosdk.Account
  ): Promise<{ txId: string; farmerAmount: number; platformAmount: number }> => {
    
    try {
      const params = await algodClient.getTransactionParams().do();
      
      // Calculate split amounts
      const farmerAmount = Math.floor(totalAmount * (paymentSplit.farmerPercentage / 100));
      const platformAmount = Math.floor(totalAmount * (paymentSplit.platformPercentage / 100));

      // Create payment transactions
      const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: adminAccount.addr,
        receiver: paymentSplit.farmerAddress,
        amount: farmerAmount,
        note: new TextEncoder().encode(`FarmChain: ${paymentSplit.farmerPercentage}% farmer share`),
        suggestedParams: params,
      });

      const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: adminAccount.addr,
        receiver: paymentSplit.platformAddress,
        amount: platformAmount,
        note: new TextEncoder().encode(`FarmChain: ${paymentSplit.platformPercentage}% platform share`),
        suggestedParams: params,
      });

      // Group transactions atomically (both succeed or both fail)
      const txnGroup = algosdk.assignGroupID([txn1, txn2]);

      // Sign both transactions
      const signedTxn1 = txn1.signTxn(adminAccount.sk);
      const signedTxn2 = txn2.signTxn(adminAccount.sk);

      // Submit atomic group
      const signedTxns = [signedTxn1, signedTxn2];
      const response = await algodClient.sendRawTransaction(signedTxns).do();
      const txId = typeof response === 'string' ? response : (response as any).txId || (response as any).txid;
      
      if (!txId) throw new Error('Failed to get transaction ID');

      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      console.log('✅ Payment split executed:', {
        txId,
        farmer: `${farmerAmount / 1000000} ALGO (${paymentSplit.farmerPercentage}%)`,
        platform: `${platformAmount / 1000000} ALGO (${paymentSplit.platformPercentage}%)`
      });

      return {
        txId,
        farmerAmount,
        platformAmount
      };

    } catch (error) {
      console.error('Payment split execution failed:', error);
      throw error;
    }
  },

  /**
   * Execute payment split with NFT transfer atomically
   * Used for marketplace sales with automatic payment distribution
   */
  executeAtomicSaleWithSplit: async (
    assetId: number,
    sellerAddress: string,
    buyerAddress: string,
    salePrice: number, // in microALGOs
    paymentSplit: PaymentSplit,
    sellerAccount: algosdk.Account,
    buyerAccount: algosdk.Account
  ): Promise<string> => {
    
    try {
      const params = await algodClient.getTransactionParams().do();
      
      // Calculate split amounts
      const sellerAmount = Math.floor(salePrice * (paymentSplit.farmerPercentage / 100));
      const platformAmount = Math.floor(salePrice * (paymentSplit.platformPercentage / 100));

      // Transaction 1: Buyer pays seller (70%)
      const paymentTxn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: buyerAddress,
        receiver: sellerAddress,
        amount: sellerAmount,
        suggestedParams: params,
      });

      // Transaction 2: Buyer pays platform (30%)
      const paymentTxn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: buyerAddress,
        receiver: paymentSplit.platformAddress,
        amount: platformAmount,
        suggestedParams: params,
      });

      // Transaction 3: Seller transfers NFT to buyer
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: sellerAddress,
        receiver: buyerAddress,
        assetIndex: assetId,
        amount: 1,
        suggestedParams: params,
      });

      // Group all transactions atomically
      const txnGroup = algosdk.assignGroupID([paymentTxn1, paymentTxn2, assetTransferTxn]);

      // Sign transactions
      const signedPayment1 = paymentTxn1.signTxn(buyerAccount.sk);
      const signedPayment2 = paymentTxn2.signTxn(buyerAccount.sk);
      const signedTransfer = assetTransferTxn.signTxn(sellerAccount.sk);

      // Submit atomic group (all succeed or all fail)
      const signedTxns = [signedPayment1, signedPayment2, signedTransfer];
      const response = await algodClient.sendRawTransaction(signedTxns).do();
      const txId = typeof response === 'string' ? response : (response as any).txId || (response as any).txid;
      
      if (!txId) throw new Error('Failed to get transaction ID');

      await algosdk.waitForConfirmation(algodClient, txId, 4);

      console.log('✅ Atomic sale with split completed:', txId);
      return txId;

    } catch (error) {
      console.error('Atomic sale execution failed:', error);
      throw error;
    }
  },

  /**
   * Calculate payment amounts based on split configuration
   */
  calculatePaymentAmounts: (
    totalAmount: number,
    paymentSplit: PaymentSplit
  ): { farmerAmount: number; platformAmount: number } => {
    const farmerAmount = Math.floor(totalAmount * (paymentSplit.farmerPercentage / 100));
    const platformAmount = Math.floor(totalAmount * (paymentSplit.platformPercentage / 100));
    
    return { farmerAmount, platformAmount };
  },

  /**
   * Validate payment split configuration
   */
  validatePaymentSplit: (paymentSplit: PaymentSplit): boolean => {
    if (!paymentSplit.farmerAddress || !paymentSplit.platformAddress) {
      throw new Error('Invalid addresses in payment split');
    }

    if (paymentSplit.farmerPercentage + paymentSplit.platformPercentage !== 100) {
      throw new Error('Payment percentages must total 100');
    }

    if (paymentSplit.farmerPercentage < 0 || paymentSplit.platformPercentage < 0) {
      throw new Error('Payment percentages cannot be negative');
    }

    return true;
  },

  /**
   * Get platform address
   */
  getPlatformAddress: (): string => {
    return PLATFORM_ADDRESS;
  },

  /**
   * Set platform address (for configuration)
   */
  setPlatformAddress: (address: string): void => {
    // Validate Algorand address
    if (!algosdk.isValidAddress(address)) {
      throw new Error('Invalid Algorand address');
    }
    // In production, this should update environment variable or database
    console.warn('Platform address update requested:', address);
  }
};
