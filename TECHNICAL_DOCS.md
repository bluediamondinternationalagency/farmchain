# Farm Chain Technical Documentation

## Architecture Overview

Farm Chain is a decentralized livestock investment platform built on the Algorand blockchain. The application enables transparent cattle ownership through NFTs (Algorand Standard Assets - ASA).

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │ Marketplace  │  │Admin Console │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Services Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Web3Service  │  │PeraWallet    │  │Gemini AI     │     │
│  │              │  │  Service     │  │  (optional)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Algorand Blockchain (TestNet)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Algod API   │  │  Indexer API │  │  ASA/NFTs    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    User's Pera Wallet                        │
│               (Mobile App / Browser Extension)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Frontend Layer

#### **App.tsx**
Main application container that manages:
- Global state (wallet, cows, view)
- Wallet connection lifecycle
- Cow minting and assignment coordination
- Navigation between views

**Key Functions:**
- `handleConnectWallet()` - Pera Wallet connection/disconnection
- `handleMintCow()` - Mints new cattle NFT on blockchain
- `handleAssignCow()` - Transfers NFT from admin to user
- `refreshBalance()` - Updates wallet ALGO balance

#### **Dashboard.tsx**
User's cattle portfolio view showing:
- Owned cattle NFTs
- Investment metrics
- Health and growth data

#### **AdminDashboard.tsx**
Admin control panel for:
- Minting new cattle NFTs
- Assigning NFTs to users
- Managing platform inventory
- Viewing admin wallet status

#### **WalletButton.tsx**
Wallet connection UI component:
- Displays connection status
- Shows wallet address and balance
- Provides link to TestNet dispenser
- Pera Wallet branding

### 2. Services Layer

#### **peraWalletService.ts**
Handles all Pera Wallet interactions:

```typescript
interface PeraWalletService {
  connect(): Promise<string[]>          // Connect wallet
  disconnect(): Promise<void>           // Disconnect wallet
  reconnect(): Promise<string | null>   // Reconnect on page load
  signTransaction(txn, address): Promise<Uint8Array>  // Sign single tx
  signTransactions(txns, addresses): Promise<Uint8Array[]> // Sign multiple
  isConnected(): boolean                // Check connection status
  getAddress(): string | null           // Get connected address
}
```

**Configuration:**
- Chain ID: `416002` (Algorand TestNet)
- Toast notifications enabled
- Persistent session via localStorage

#### **web3Service.ts**
Blockchain interaction layer:

```typescript
interface Web3Service {
  // Wallet Management
  connectPeraWallet(): Promise<string[]>
  disconnectPeraWallet(): Promise<void>
  reconnectPeraWallet(): Promise<string | null>
  getBalance(address): Promise<number>
  
  // Admin Functions
  getAdminAccount(): { address: string; mnemonic: string }
  
  // NFT Operations
  mintCowNFT(cowData): Promise<number>  // Returns Asset ID
  assignAssetToUser(assetId, userAddress): Promise<boolean>
  getUserAssets(address): Promise<any[]>
}
```

**Algorand Configuration:**
- Node: `https://testnet-api.algonode.cloud`
- Indexer: `https://testnet-idx.algonode.cloud`
- Network: TestNet (Chain ID 416002)

---

## Blockchain Implementation

### NFT Standard: Algorand Standard Assets (ASA)

Each cow is represented as a unique ASA with the following properties:

```typescript
{
  total: 1,                    // Total supply (unique NFT)
  decimals: 0,                 // Non-divisible
  assetName: "Bessie",         // Cow name (max 32 chars)
  unitName: "COW",             // Unit identifier
  assetURL: "https://...",     // Image URL
  defaultFrozen: false,        // Transferable
  manager: admin.address,      // Can modify metadata
  reserve: admin.address,      // Reserve address
  freeze: admin.address,       // Can freeze transfers
  clawback: admin.address,     // Can revoke ownership
  note: ARC69_METADATA         // JSON metadata
}
```

### ARC-69 Metadata Standard

NFTs follow the ARC-69 standard for metadata:

```json
{
  "standard": "arc69",
  "description": "Farm Chain Cattle: Bessie",
  "properties": {
    "breed": "Holstein",
    "weight": 450,
    "health": 92
  }
}
```

### Transaction Flow

#### 1. Minting Cattle NFT

```
Admin Wallet → Create ASA Transaction → Algorand Network
                                        ↓
                                   Asset ID returned
                                        ↓
                                   Store in database
```

**Cost:** ~0.1 ALGO per NFT + 0.001 ALGO transaction fee

#### 2. Assigning NFT to User

```
Step 1: User Opt-In
User Wallet → Opt-In Transaction (amount: 0) → Algorand Network
  (via Pera Wallet)                             ↓
                                          Opt-In confirmed

Step 2: Admin Transfer
Admin Wallet → Transfer ASA (amount: 1) → Algorand Network
                                          ↓
                                    User receives NFT
```

**Cost:**
- User pays: 0.001 ALGO (opt-in fee) + 0.1 ALGO (min balance increase per asset)
- Admin pays: 0.001 ALGO (transfer fee)

---

## State Management

### Wallet State

```typescript
interface WalletState {
  isConnected: boolean;        // Connection status
  address: string | null;      // Algorand address
  balance: number;             // ALGO balance
  walletType: 'pera' | 'none'; // Wallet provider
}
```

### Cow State

```typescript
interface Cow {
  id: string;                  // Local ID
  assetId?: number;            // Algorand Asset ID
  name: string;                // Cow name
  breed: string;               // Breed type
  weight: number;              // Current weight (kg)
  purchasePrice: number;       // Price in ALGO
  purchaseDate: number;        // Unix timestamp
  expectedReturn: number;      // Expected ROI %
  imageUrl: string;            // Image URL
  status: 'fattening' | 'ready_for_sale' | 'sold';
  healthScore: number;         // 0-100
  ownerAddress?: string | null; // Owner's wallet address
  history: HistoryEntry[];     // Weight/health updates
}
```

---

## Security Considerations

### Current Implementation (TestNet/Demo)

1. **Admin Wallet:**
   - Custodial (stored in localStorage)
   - Auto-generated on first launch
   - Should be replaced with backend service for production

2. **User Wallet:**
   - Non-custodial (Pera Wallet)
   - User controls private keys
   - Secure transaction signing

3. **Data Storage:**
   - Cow data stored in React state (demo)
   - Should use database for production
   - Blockchain only stores ownership

### Production Recommendations

1. **Backend Service:**
   - Move admin wallet to secure backend
   - Implement API authentication
   - Use Algorand Key Management Service (KMS)

2. **Database:**
   - PostgreSQL for cow data
   - Index blockchain transactions
   - Cache asset information

3. **Smart Contracts:**
   - Use Algorand Smart Contracts (ASC1) for:
     - Escrow payments
     - Automated profit distribution
     - Transparent auction system

4. **Audit:**
   - Smart contract security audit
   - Penetration testing
   - Code review

---

## API Endpoints (Future Backend)

```
POST   /api/cows              - Create new cow record
GET    /api/cows              - List all cows
GET    /api/cows/:id          - Get cow details
PUT    /api/cows/:id          - Update cow data
DELETE /api/cows/:id          - Delete cow record

POST   /api/mint              - Mint NFT (admin only)
POST   /api/assign            - Assign NFT to user (admin only)
GET    /api/assets/:id        - Get asset details from blockchain

GET    /api/wallet/balance    - Get wallet balance
GET    /api/wallet/assets     - Get user's owned assets
POST   /api/wallet/transaction - Submit signed transaction
```

---

## Testing Guide

### Local Testing

```bash
# 1. Start development server
npm run dev

# 2. Test wallet connection
- Click "Connect Pera Wallet"
- Approve in Pera Wallet extension/app

# 3. Fund admin wallet
- Click Admin Console (shield icon)
- Copy admin address
- Get ALGO from https://bank.testnet.algorand.network/

# 4. Mint test NFT
- Fill in cow details
- Click "Mint Cow NFT"
- Verify on AlgoExplorer TestNet

# 5. Assign to user
- Enter user's Pera Wallet address
- Click "Assign to User"
- User approves opt-in in Pera Wallet
- Verify ownership on AlgoExplorer
```

### Verify on Blockchain

1. Copy Asset ID from cow details
2. Visit https://testnet.algoexplorer.io/
3. Search for Asset ID
4. View transaction history and current holder

---

## Performance Optimization

### Current Bottlenecks

1. **Transaction Confirmation:**
   - ~4 seconds per confirmation
   - Blocks every ~3.7 seconds on Algorand

2. **State Updates:**
   - React re-renders on wallet state changes
   - Consider React.memo for optimization

### Optimization Strategies

1. **Batch Transactions:**
   - Group multiple operations
   - Atomic transfers

2. **Caching:**
   - Cache asset metadata
   - Store recent balances
   - Use Algorand Indexer for queries

3. **Lazy Loading:**
   - Load cow images on demand
   - Paginate cow listings

---

## Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --prod
```

### Environment Variables

```env
# Production
VITE_ALGORAND_NETWORK=mainnet
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://mainnet-idx.algonode.cloud

# Optional
GEMINI_API_KEY=your_api_key
```

### MainNet Considerations

1. **Wallet Funding:**
   - Real ALGO required
   - Minimum 0.1 ALGO per account
   - 0.1 ALGO locked per asset held

2. **Transaction Costs:**
   - 0.001 ALGO minimum fee
   - 0.1 ALGO to create asset
   - Budget accordingly

3. **Admin Wallet:**
   - Use hardware wallet or KMS
   - Never expose private keys
   - Implement multi-sig for high-value operations

---

## Monitoring & Analytics

### Blockchain Monitoring

1. **AlgoExplorer:**
   - Track asset creation
   - Monitor transactions
   - View account details

2. **Algorand Indexer:**
   - Query historical data
   - Search transactions
   - Track asset holders

### Application Monitoring

1. **Error Tracking:**
   - Implement Sentry or similar
   - Log blockchain errors
   - Monitor failed transactions

2. **User Analytics:**
   - Track wallet connections
   - Monitor NFT minting/transfers
   - Measure engagement

---

## Troubleshooting

### Common Issues

**1. "Transaction failed: Account does not exist"**
- Solution: Fund the account with minimum 0.1 ALGO

**2. "Asset opt-in required"**
- Solution: User must opt-in before receiving NFTs (costs 0.1 ALGO)

**3. "Insufficient funds"**
- Solution: Ensure wallet has enough ALGO for transaction + fees

**4. "Transaction rejected in Pera Wallet"**
- Solution: User declined or wallet locked - retry transaction

**5. "Wallet connection timeout"**
- Solution: Check Pera Wallet is installed and unlocked

### Debug Mode

Enable debug logging:
```typescript
// In web3Service.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Transaction details:', txn);
  console.log('Signed transaction:', signedTxn);
}
```

---

## Resources

- [Algorand Developer Portal](https://developer.algorand.org/)
- [Pera Wallet SDK Docs](https://docs.perawallet.app/)
- [algosdk Documentation](https://algorand.github.io/js-algorand-sdk/)
- [ARC Standards](https://arc.algorand.foundation/)
- [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)

---

## License

MIT License - See LICENSE file for details
