import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true,
});

export const PeraWalletService = {
  wallet: peraWallet,

  // Connect to Pera Wallet
  connect: async (): Promise<string[]> => {
    try {
      const accounts = await peraWallet.connect();
      // Store the connected account
      if (accounts && accounts.length > 0) {
        localStorage.setItem('pera_wallet_connected', 'true');
        localStorage.setItem('pera_wallet_address', accounts[0]);
      }
      return accounts;
    } catch (error) {
      console.error('Pera Wallet connection failed:', error);
      throw error;
    }
  },

  // Disconnect from Pera Wallet
  disconnect: async (): Promise<void> => {
    try {
      await peraWallet.disconnect();
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_address');
    } catch (error) {
      console.error('Pera Wallet disconnect failed:', error);
      throw error;
    }
  },

  // Reconnect to Pera Wallet on page load
  reconnect: async (): Promise<string | null> => {
    try {
      const isConnected = localStorage.getItem('pera_wallet_connected');
      if (isConnected === 'true') {
        const accounts = await peraWallet.reconnectSession();
        if (accounts && accounts.length > 0) {
          return accounts[0];
        }
      }
      return null;
    } catch (error) {
      console.error('Pera Wallet reconnection failed:', error);
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_address');
      return null;
    }
  },

  // Sign and send a transaction
  signTransaction: async (txn: algosdk.Transaction, senderAddr: string): Promise<Uint8Array> => {
    try {
      const txnGroup = [{ txn, signers: [senderAddr] }];
      const signedTxn = await peraWallet.signTransaction([txnGroup]);
      return signedTxn[0];
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  },

  // Sign multiple transactions
  signTransactions: async (txns: algosdk.Transaction[], signerAddrs: string[]): Promise<Uint8Array[]> => {
    try {
      const txnGroup = txns.map((txn, idx) => ({
        txn,
        signers: [signerAddrs[idx]]
      }));
      const signedTxns = await peraWallet.signTransaction([txnGroup]);
      return signedTxns;
    } catch (error) {
      console.error('Transactions signing failed:', error);
      throw error;
    }
  },

  // Check if wallet is connected
  isConnected: (): boolean => {
    return localStorage.getItem('pera_wallet_connected') === 'true';
  },

  // Get connected address
  getAddress: (): string | null => {
    return localStorage.getItem('pera_wallet_address');
  }
};
