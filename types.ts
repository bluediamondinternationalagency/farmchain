export interface VaccinationRecord {
  date: string;
  vaccine: string;
  batch?: string;
  veterinarian?: string;
  notes?: string;
}

export interface Cow {
  id: string;
  assetId?: number; // Real Algorand Asset ID
  name: string;
  breed: string;
  sex?: 'male' | 'female'; // Added for tracking
  cattleType?: string; // For payment split configuration
  weight: number; // in kg
  purchasePrice: number; // in ALGO
  purchaseDate: number; // timestamp
  expectedReturn: number; // percentage
  imageUrl: string;
  imageCID?: string; // IPFS CID for image
  metadataCID?: string; // IPFS CID for full metadata JSON
  status: 'fattening' | 'ready_for_sale' | 'sold' | 'slaughtered';
  healthScore: number; // 0-100
  ownerAddress?: string | null; // Null if in marketplace/admin inventory, set if owned
  vaccination_records?: VaccinationRecord[]; // Vaccination history
  history: {
    date: number;
    weight: number;
    note: string;
  }[];
  lastUpdated?: number; // Timestamp of last on-chain update
  
  // Supply Chain & Payment
  supplyChain?: SupplyChainEvent[];
  paymentSplit?: PaymentSplit;
  slaughterInfo?: SlaughterInfo;
  permanentRecordCID?: string; // IPFS CID of final records after slaughter
}

export interface PaymentSplit {
  farmerAddress: string;
  platformAddress: string;
  farmerPercentage: number; // e.g., 70
  platformPercentage: number; // e.g., 30
  escrowAddress?: string;
  cattleType?: string; // Link to payment split config
}

export interface PaymentSplitConfig {
  id: string;
  cattleType: string; // e.g., "Premium Holstein", "Standard Angus", "Organic Grass-Fed"
  farmerPercentage: number;
  platformPercentage: number;
  description?: string;
  isActive: boolean;
}

export interface SupplyChainEvent {
  id: string;
  timestamp: number;
  eventType: 'birth' | 'transfer' | 'weight_update' | 'health_check' | 'vaccination' | 'sale' | 'slaughter';
  txId?: string; // Algorand transaction ID
  actor: string; // Address or name
  data: any;
  ipfsCID?: string; // Optional IPFS reference for detailed records
}

export interface SlaughterInfo {
  date: number;
  facility: string;
  finalWeight: number;
  grossPrice: number;
  expenses: number;
  netPrice: number;
  certificateCID?: string; // IPFS CID for slaughter certificate
  paymentTxId?: string; // Transaction ID of payment distribution
}

export interface IPFSMetadata {
  standard: string; // "arc3" or "arc69"
  name: string;
  description: string;
  image?: string; // ipfs://CID
  imageCID?: string;
  image_integrity?: string;
  image_mimetype?: string;
  external_url?: string;
  properties: {
    breed: string;
    sex?: 'male' | 'female';
    birth_date?: string;
    birth_weight_kg?: number;
    birth_location?: string;
    dam_id?: string; // Mother
    sire_id?: string; // Father
    genetic_lineage?: string;
    vaccination_records?: Array<{
      date: string;
      vaccine: string;
      batch: string;
      veterinarian?: string;
    }>;
    certifications?: string[]; // e.g., ["Organic", "Grass-Fed", "Halal"]
    health_checks?: Array<{
      date: string;
      score: number;
      notes: string;
    }>;
    [key: string]: any;
  };
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  MARKET = 'MARKET',
  DETAILS = 'DETAILS',
  ADMIN = 'ADMIN',
  VERIFY = 'VERIFY',
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  walletType: 'pera' | 'none';
}

