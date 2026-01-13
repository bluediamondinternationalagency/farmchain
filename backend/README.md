# FarmChain Backend API

This is the backend server for FarmChain, handling blockchain operations, database management, and API endpoints.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. **Initialize the database:**
   ```bash
   sqlite3 db/farmchain.db < db/schema.sql
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_PATH` - Path to SQLite database
- `ALGOD_TOKEN` - Algorand node API token
- `ALGOD_SERVER` - Algorand node server URL
- `ALGOD_PORT` - Algorand node port
- `INDEXER_TOKEN` - Algorand indexer API token
- `INDEXER_SERVER` - Algorand indexer server URL
- `INDEXER_PORT` - Algorand indexer port
- `MASTER_ACCOUNT_MNEMONIC` - Master account mnemonic for funding
- `ENCRYPTION_KEY` - 32-byte hex key for wallet encryption

## API Endpoints

### Wallet Management

#### Create Wallet
```http
POST /api/wallets
Content-Type: application/json

{
  "role": "farmer" | "processor" | "consumer"
}
```

Response:
```json
{
  "address": "ALGORAND_ADDRESS",
  "encryptedSk": "...",
  "iv": "..."
}
```

#### Fund Wallet
```http
POST /api/wallets/fund
Content-Type: application/json

{
  "address": "ALGORAND_ADDRESS"
}
```

### Asset Management

#### Mint Cow NFT
```http
POST /api/assets/mint
Content-Type: application/json

{
  "ownerEncryptedSk": "...",
  "ownerIv": "...",
  "metadata": {
    "name": "Cow Name",
    "breed": "Angus",
    "birthDate": "2023-01-01",
    "weight": 500,
    "healthStatus": "healthy"
  }
}
```

#### Transfer Asset
```http
POST /api/assets/transfer
Content-Type: application/json

{
  "fromEncryptedSk": "...",
  "fromIv": "...",
  "toAddress": "RECEIVER_ADDRESS",
  "assetId": 12345
}
```

#### Get Asset Info
```http
GET /api/assets/:assetId
```

### Supply Chain

#### Record Event
```http
POST /api/supply-chain/event
Content-Type: application/json

{
  "assetId": 12345,
  "eventType": "birth" | "vaccination" | "weight_check" | "transfer" | "slaughter",
  "location": "Farm XYZ",
  "metadata": {
    "key": "value"
  }
}
```

#### Get Asset History
```http
GET /api/supply-chain/history/:assetId
```

## Database Schema

The database includes tables for:
- `users` - User accounts and roles
- `wallets` - Algorand wallet information
- `assets` - NFT asset records
- `supply_chain_events` - Supply chain event history
- `transactions` - Transaction history

## Security

- Private keys are encrypted using AES-256-GCM
- Master account mnemonic should be stored securely
- Use HTTPS in production
- Implement rate limiting and authentication

## Technologies

- **Node.js** with TypeScript
- **Express.js** - Web framework
- **SQLite** - Database
- **Algorand SDK** - Blockchain integration
- **crypto** - Encryption utilities
