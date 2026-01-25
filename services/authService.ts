/**
 * Authorization Service
 * Manages admin access control based on wallet addresses
 */

// Access environment variables
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || '';
  }
  return '';
};

export const AuthService = {
  /**
   * Get list of authorized admin addresses from environment variable
   * @returns Array of authorized Algorand addresses
   */
  getAuthorizedAdmins: (): string[] => {
    const whitelist = getEnvVar('VITE_ADMIN_WHITELIST');
    
    // Split by comma and trim whitespace
    return whitelist
      .split(',')
      .map((addr: string) => addr.trim())
      .filter((addr: string) => addr.length > 0);
  },

  /**
   * Check if a wallet address is authorized to access admin features
   * @param walletAddress - The Pera Wallet address to check
   * @returns true if authorized, false otherwise
   */
  isAuthorizedAdmin: (walletAddress: string | null): boolean => {
    if (!walletAddress) {
      return false;
    }

    const authorizedAddresses = AuthService.getAuthorizedAdmins();
    
    // If no whitelist is configured, deny access (secure by default)
    if (authorizedAddresses.length === 0) {
      console.warn('⚠️ No admin whitelist configured. Set VITE_ADMIN_WHITELIST in .env.local');
      return false;
    }

    // Check if the wallet address is in the whitelist
    const isAuthorized = authorizedAddresses.includes(walletAddress);
    
    if (!isAuthorized) {
      console.log('🚫 Unauthorized admin access attempt from:', walletAddress);
    }

    return isAuthorized;
  },

  /**
   * Get a formatted string of authorized addresses (for display purposes)
   * Masks addresses for security
   */
  getAuthorizedAddressesMasked: (): string[] => {
    return AuthService.getAuthorizedAdmins().map(addr => 
      `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    );
  }
};
