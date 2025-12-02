# Farm Chain - Pera Wallet Integration Guide

## 🚀 Algorand TestNet Setup with Pera Wallet

Farm Chain now supports **Pera Wallet** on Algorand TestNet! Users can connect their real Pera Wallet to manage cattle NFTs.

---

## 📱 Prerequisites

### 1. Install Pera Wallet
- **Mobile**: Download from [App Store](https://apps.apple.com/app/pera-algo-wallet/id1459898525) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
- **Browser Extension**: Install [Pera Wallet Web](https://chrome.google.com/webstore/detail/pera-wallet/goidkcfkbhadjaaonhfbdcjfdlpkmlhj)

### 2. Create a Wallet
1. Open Pera Wallet
2. Create a new wallet or import existing
3. **Save your recovery phrase securely!**

### 3. Get TestNet ALGO
1. Go to [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
2. Enter your Pera Wallet address
3. Click "Dispense" to receive 10 TestNet ALGO (free)
4. Repeat if you need more funds

---

## 🛠️ Admin Setup (First Time Only)

The admin account is used to mint cattle NFTs. It's auto-generated and stored in your browser.

### Fund the Admin Wallet:
1. Run the app: `npm run dev`
2. Click the **Admin Shield Icon** (🛡️) in the header
3. Copy the **Admin Address** shown in the dashboard
4. Go to [TestNet Dispenser](https://bank.testnet.algorand.network/)
5. Paste the admin address and click "Dispense"
6. Wait ~4 seconds for confirmation
7. Refresh the admin dashboard to see the balance

**⚠️ Important**: The admin wallet needs at least 1 ALGO to mint NFTs (0.1 ALGO per cow + transaction fees)

---

## 🐄 How to Use Farm Chain

### Step 1: Connect Your Pera Wallet
1. Click **"Connect Pera Wallet"** button
2. Approve the connection in Pera Wallet
3. Your address and ALGO balance will appear

### Step 2: Admin Mints a Cow NFT
1. Toggle to **Admin Console** (shield icon)
2. Fill in cow details (name, breed, weight, etc.)
3. Click **"Mint Cow NFT"**
4. Wait for blockchain confirmation (~4 seconds)
5. The cow will appear in the "Available Cows" list

### Step 3: Assign Cow to User
1. In Admin Console, find the minted cow
2. Enter the user's Pera Wallet address
3. Click **"Assign to User"**
4. User must approve the **Opt-In transaction** in Pera Wallet (required for receiving NFTs on Algorand)
5. Admin transfer executes automatically
6. User now owns the cow NFT!

### Step 4: View Your Cows
1. Toggle back to **My Ranch** view
2. See your owned cows with live data
3. Click on a cow to view details, history, and health

---

## 🔑 Key Features

### ✅ Real Blockchain Integration
- All cows are **real Algorand NFTs** (ASA - Algorand Standard Assets)
- Transactions are verified on **Algorand TestNet**
- View your NFTs in [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)

### ✅ Pera Wallet Support
- Non-custodial wallet (you control your keys)
- Sign transactions directly from your wallet
- Works on mobile and browser

### ✅ Transparent Ownership
- Every cow ownership transfer is on-chain
- View transaction history on AlgoExplorer
- Immutable proof of ownership

---

## 🔍 Verify Transactions

After minting or transferring, you can verify on the blockchain:

1. Copy the Asset ID from the cow details
2. Go to [TestNet AlgoExplorer](https://testnet.algoexplorer.io/)
3. Search for the Asset ID
4. See the full transaction history!

---

## 🐛 Troubleshooting

### "Failed to connect Pera Wallet"
- Ensure Pera Wallet extension/app is installed
- Check that you're connected to the internet
- Try refreshing the page

### "Assignment Failed: Ensure User wallet has funds for Opt-In!"
- User needs at least **0.1 ALGO** in their wallet for opt-in fees
- Get more from the [TestNet Dispenser](https://bank.testnet.algorand.network/)

### "Minting Failed: Ensure Admin wallet is funded!"
- Admin wallet needs at least **0.2 ALGO** per cow
- Fund the admin wallet using the dispenser

### Pera Wallet not prompting for signature
- Check if you accidentally closed the Pera popup
- Try disconnecting and reconnecting your wallet
- On mobile, ensure the app is open in the background

---

## 🌐 Network Configuration

The app is configured for **Algorand TestNet**:
- **Node**: https://testnet-api.algonode.cloud
- **Indexer**: https://testnet-idx.algonode.cloud
- **Chain ID**: 416002

To switch to MainNet (production), update `services/peraWalletService.ts` and `services/web3Service.ts`.

---

## 💡 Tips

1. **Save Your Keys**: Never share your Pera Wallet recovery phrase
2. **TestNet Only**: This is for testing - TestNet ALGO has no real value
3. **Transaction Fees**: Each transaction costs ~0.001 ALGO
4. **Asset Opt-In**: Required before receiving any Algorand NFT (one-time 0.1 ALGO cost per asset)
5. **Admin Custody**: Admin wallet is custodial (stored in browser) for demo purposes

---

## 📚 Learn More

- [Algorand Developer Docs](https://developer.algorand.org/)
- [Pera Wallet Documentation](https://docs.perawallet.app/)
- [ASA (Algorand Standard Assets)](https://developer.algorand.org/docs/get-details/asa/)
- [ARC-69 NFT Standard](https://arc.algorand.foundation/ARCs/arc-0069)

---

## 🚀 Ready to Deploy?

When you're ready to go to MainNet:
1. Replace TestNet endpoints with MainNet
2. Use production Algorand accounts (with real ALGO)
3. Ensure proper key management for admin wallet
4. Consider using a backend service for admin operations
5. Implement proper security audits

**Happy Farming on the Blockchain! 🌾🐄⛓️**
