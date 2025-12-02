import { IPFSMetadata } from '../types';

// Pinata Configuration
// Get your API keys from https://app.pinata.cloud/
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';

const PINATA_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

/**
 * IPFS Service for storing cattle metadata and images
 * Uses Pinata for reliable IPFS pinning
 */
export const IPFSService = {
  
  /**
   * Upload JSON metadata to IPFS
   */
  uploadJSON: async (metadata: any, filename: string): Promise<string> => {
    try {
      // For demo purposes without Pinata keys, simulate upload
      if (!PINATA_JWT && !PINATA_API_KEY) {
        console.warn('IPFS: No Pinata keys configured. Simulating upload...');
        const mockCID = 'Qm' + Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
        return mockCID;
      }

      const headers: HeadersInit = PINATA_JWT 
        ? { 
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'application/json'
          }
        : {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
            'Content-Type': 'application/json'
          };

      const body = JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: filename,
          keyvalues: {
            type: 'cattle-metadata',
            timestamp: Date.now().toString()
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      });

      const response = await fetch(PINATA_UPLOAD_URL, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
      
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  },

  /**
   * Upload image file to IPFS
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      // For demo without Pinata keys
      if (!PINATA_JWT && !PINATA_API_KEY) {
        console.warn('IPFS: No Pinata keys configured. Using placeholder image...');
        return 'QmPlaceholderImageCID' + Math.random().toString(36).substring(2, 10);
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: 'cattle-image',
          timestamp: Date.now().toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const headers: HeadersInit = PINATA_JWT 
        ? { 'Authorization': `Bearer ${PINATA_JWT}` }
        : {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          };

      const response = await fetch(PINATA_FILE_URL, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata file upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
      
    } catch (error) {
      console.error('IPFS file upload error:', error);
      throw error;
    }
  },

  /**
   * Create ARC-3 compliant metadata for cattle NFT
   */
  createARC3Metadata: (cattleData: {
    name: string;
    breed: string;
    sex?: 'male' | 'female';
    birthDate?: string;
    birthWeight?: number;
    birthLocation?: string;
    imageCID?: string;
    vaccinations?: Array<{date: string; vaccine: string; batch: string}>;
    certifications?: string[];
  }): IPFSMetadata => {
    return {
      standard: 'arc3',
      name: cattleData.name,
      description: `${cattleData.breed} cattle from FarmChain - Blockchain verified livestock`,
      image: cattleData.imageCID ? `ipfs://${cattleData.imageCID}` : undefined,
      imageCID: cattleData.imageCID,
      image_mimetype: 'image/jpeg',
      external_url: 'https://farmchain.app',
      properties: {
        breed: cattleData.breed,
        sex: cattleData.sex,
        birth_date: cattleData.birthDate,
        birth_weight_kg: cattleData.birthWeight,
        birth_location: cattleData.birthLocation,
        vaccination_records: cattleData.vaccinations || [],
        certifications: cattleData.certifications || [],
        platform: 'FarmChain',
        blockchain: 'Algorand',
        created_at: new Date().toISOString()
      }
    };
  },

  /**
   * Create ARC-69 metadata for on-chain updates
   */
  createARC69Update: (eventType: string, data: any): any => {
    return {
      standard: 'arc69',
      description: `Cattle lifecycle event: ${eventType}`,
      properties: {
        event_type: eventType,
        timestamp: Date.now(),
        data: data
      }
    };
  },

  /**
   * Calculate SHA-256 hash for metadata integrity
   */
  calculateSHA256: async (data: string | ArrayBuffer): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = typeof data === 'string' 
        ? encoder.encode(data)
        : data;
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('SHA-256 calculation error:', error);
      throw error;
    }
  },

  /**
   * Get IPFS URL from CID
   */
  getIPFSUrl: (cid: string): string => {
    return `${PINATA_GATEWAY}${cid}`;
  },

  /**
   * Fetch metadata from IPFS
   */
  fetchMetadata: async (cid: string): Promise<any> => {
    try {
      const url = IPFSService.getIPFSUrl(cid);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS metadata: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw error;
    }
  },

  /**
   * Create slaughter certificate metadata
   */
  createSlaughterCertificate: (slaughterData: {
    cattleId: string;
    cattleName: string;
    assetId: number;
    date: number;
    facility: string;
    finalWeight: number;
    grossPrice: number;
    expenses: number;
    netPrice: number;
    farmerAddress: string;
    inspectorName?: string;
  }): any => {
    return {
      standard: 'farmchain-slaughter-v1',
      title: `Slaughter Certificate - ${slaughterData.cattleName}`,
      cattle_id: slaughterData.cattleId,
      asset_id: slaughterData.assetId,
      slaughter_date: new Date(slaughterData.date).toISOString(),
      facility: slaughterData.facility,
      final_weight_kg: slaughterData.finalWeight,
      financial: {
        gross_price: slaughterData.grossPrice,
        expenses: slaughterData.expenses,
        net_price: slaughterData.netPrice,
        currency: 'ALGO'
      },
      farmer_address: slaughterData.farmerAddress,
      inspector: slaughterData.inspectorName || 'FarmChain Certified',
      issued_at: new Date().toISOString(),
      blockchain: 'Algorand TestNet',
      verified: true
    };
  }
};
