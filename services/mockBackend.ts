import { Cow } from '../types';

// Simulating the backend database in browser memory/storage for POC
interface MockUser {
  id: string;
  email: string;
  walletAddress: string;
  balance: number;
}

const DELAY = 800; // ms to simulate network latency

export const MockBackend = {
  createAccount: async (email: string): Promise<MockUser> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const address = 'ALGO' + Math.random().toString(36).substring(2, 10).toUpperCase() + '...CUSTODIAL';
        const user = {
          id: Math.random().toString(36).substring(7),
          email,
          walletAddress: address,
          balance: 1.0 // 1 ALGO funding
        };
        // Store in local session for persistence during demo
        sessionStorage.setItem('fc_user', JSON.stringify(user));
        resolve(user);
      }, DELAY);
    });
  },

  getCurrentUser: (): MockUser | null => {
    const stored = sessionStorage.getItem('fc_user');
    return stored ? JSON.parse(stored) : null;
  },

  mintCow: async (cowData: any): Promise<{ assetId: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ assetId: Math.floor(Math.random() * 10000000) });
      }, DELAY);
    });
  },

  assignCowToUser: async (assetId: number, userAddress: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Backend] Opting in ${userAddress} to ASA ${assetId}`);
        console.log(`[Backend] Transferring ASA ${assetId} to ${userAddress}`);
        resolve({ success: true });
      }, DELAY);
    });
  },
  
  logout: () => {
    sessionStorage.removeItem('fc_user');
  }
};