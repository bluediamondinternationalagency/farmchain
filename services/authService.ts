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
    
    console.log('🔑 Raw VITE_ADMIN_WHITELIST:', whitelist);
    
    // Split by comma and trim whitespace
    const addresses = whitelist
      .split(',')
      .map((addr: string) => addr.trim())
      .filter((addr: string) => addr.length > 0);
    
    console.log('🔑 Parsed admin addresses:', addresses);
    
    return addresses;
  },

  /**
   * Check if a wallet address is authorized to access admin features
   * @param walletAddress - The Pera Wallet address to check
   * @returns true if authorized, false otherwise
   */
  isAuthorizedAdmin: (walletAddress: string | null): boolean => {
    if (!walletAddress) {
      console.log('🚫 Auth check: No wallet address provided');
      return false;
    }

    const authorizedAddresses = AuthService.getAuthorizedAdmins();
    
    console.log('🔍 Auth check for:', walletAddress);
    console.log('🔍 Authorized addresses:', authorizedAddresses);
    
    // If no whitelist is configured, deny access (secure by default)
    if (authorizedAddresses.length === 0) {
      console.warn('⚠️ No admin whitelist configured. Set VITE_ADMIN_WHITELIST in .env.local');
      return false;
    }

    // Check if the wallet address is in the whitelist
    const isAuthorized = authorizedAddresses.includes(walletAddress);
    
    console.log('🛡️ Is authorized:', isAuthorized);
    
    if (!isAuthorized) {
      console.log('🚫 Unauthorized admin access attempt from:', walletAddress);
      console.log('🚫 Expected one of:', authorizedAddresses);
    } else {
      console.log('✅ Admin access granted to:', walletAddress);
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
