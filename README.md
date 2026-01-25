<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Farm Chain - Livestock Investment on Algorand

A blockchain-based cattle investment platform powered by Algorand TestNet and Pera Wallet.

🔗 **Live on Algorand TestNet** | 🐄 **Real NFT Cattle** | 🟣 **Pera Wallet Compatible**

View your app in AI Studio: https://ai.studio/apps/drive/1VmnWH44Al_BD4-teEhn9deYc8Py8Pw9K

---

## 🚀 Quick Start

**Prerequisites:**  
- Node.js (v18 or higher)
- [Pera Wallet](https://perawallet.app/) (Mobile app or Browser extension)
- TestNet ALGO from [Algorand Dispenser](https://bank.testnet.algorand.network/)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` (if needed)
   - Set your `GEMINI_API_KEY` for AI features (optional)

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open http://localhost:5173 in your browser

---

## 🐄 How It Works

### For Users (Investors):
1. **Connect Pera Wallet** - Use your real Algorand wallet
2. **Browse Cattle** - View available cows in the marketplace
3. **Own NFTs** - Each cow is a unique Algorand NFT (ASA)
4. **Track Growth** - Monitor weight, health, and expected returns
5. **Manage Portfolio** - View all your cattle investments in one place

### For Admins (Farm Operators):
1. **Connect Authorized Wallet** - Use your whitelisted Pera Wallet
2. **Mint Cow NFTs** - Create new cattle as blockchain assets
3. **Assign Ownership** - Transfer NFTs to investors
4. **Update Records** - Maintain cattle health and weight data
5. **Manage Inventory** - Track all cattle on the platform

**🔒 Admin Authorization:** Only whitelisted Pera Wallet addresses can access admin features. See [ADMIN_AUTHORIZATION_GUIDE.md](./ADMIN_AUTHORIZATION_GUIDE.md)

---

## 🟣 Pera Wallet Integration

Farm Chain uses **Pera Wallet** for secure, non-custodial wallet connections:

- ✅ **Mobile & Web Support** - Works with Pera Wallet app and browser extension
- ✅ **TestNet Ready** - Fully integrated with Algorand TestNet
- ✅ **Real Transactions** - All NFT mints and transfers are on-chain
- ✅ **User-Controlled** - You own your keys and assets

**📖 Detailed Guide:** See [PERA_WALLET_GUIDE.md](./PERA_WALLET_GUIDE.md) for complete setup instructions.

---

## 🔑 Getting TestNet ALGO

1. Install Pera Wallet and create/import a wallet
2. Copy your wallet address
3. Visit [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
4. Paste your address and click "Dispense"
5. Receive 10 free TestNet ALGO instantly

**Note:** TestNet ALGO has no monetary value - it's for testing only.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Blockchain:** Algorand TestNet
- **Wallet:** Pera Wallet Connect SDK
- **Smart Assets:** Algorand ASA (NFTs)
- **Styling:** Tailwind CSS (inline)
- **Charts:** Recharts
- **AI:** Google Gemini (optional)

---

## 📦 Project Structure

```
farmchain/
├── App.tsx                 # Main app component
├── types.ts                # TypeScript interfaces
├── components/             # React components
│   ├── WalletButton.tsx   # Pera Wallet connection UI
│   ├── Dashboard.tsx      # User cattle portfolio
│   ├── AdminDashboard.tsx # Admin NFT management
│   ├── Marketplace.tsx    # Browse available cattle
│   └── CowDetails.tsx     # Individual cow info
├── services/
│   ├── peraWalletService.ts  # Pera Wallet integration
│   ├── web3Service.ts        # Algorand blockchain logic
│   └── geminiService.ts      # AI features (optional)
└── PERA_WALLET_GUIDE.md   # Detailed setup guide
```

---

## 🔐 Admin Setup (First Time)

**Admin access is now secured with wallet-based authorization.**

### Quick Setup:

1. **Copy `.env.example` to `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Pera Wallet address to `.env.local`:**
   ```bash
   VITE_ADMIN_WHITELIST=YOUR_PERA_WALLET_ADDRESS_HERE
   ```

3. **Fund your Pera Wallet with TestNet ALGO:**
   - Visit [Algorand Dispenser](https://bank.testnet.algorand.network/)
   - Paste your Pera Wallet address
   - Click "Dispense" to get 10 ALGO

4. **Restart the app:**
   ```bash
   npm run dev
   ```

5. **Connect your Pera Wallet** - The shield icon (🛡️) will appear
6. **Click the shield** to access Admin Console

**📖 Full Guide:** See [ADMIN_AUTHORIZATION_GUIDE.md](./ADMIN_AUTHORIZATION_GUIDE.md) for detailed setup and security information.

**Minimum Balance:** 0.2 ALGO per NFT mint

---

## 🎯 Features

### ✨ User Features
- Connect Pera Wallet with one click
- View owned cattle NFTs in "My Ranch"
- Track cattle growth and health metrics
- See expected investment returns
- View transaction history on AlgoExplorer

### 🔧 Admin Features  
- Mint new cattle as Algorand NFTs
- Assign cattle to user wallets
- Update cattle weight and health data
- Manage platform inventory
- View all cattle on the blockchain

### 🌐 Blockchain Features
- Real Algorand TestNet transactions
- NFT standard (Algorand Standard Assets)
- Transparent ownership records
- On-chain transaction verification
- ARC-69 metadata support

---

## 🧪 Testing

### Test the Full Flow:

1. **Connect Wallet:**
   - Click "Connect Pera Wallet"
   - Approve in Pera Wallet app/extension

2. **Mint a Cow (Admin):**
   - Switch to Admin Console
   - Fill in cow details
   - Click "Mint Cow NFT"
   - Wait for blockchain confirmation

3. **Assign to User:**
   - Enter user's Pera Wallet address
   - Click "Assign to User"
   - User approves opt-in in Pera Wallet
   - Ownership transfers on-chain

4. **Verify on Blockchain:**
   - Copy the Asset ID
   - Visit [TestNet Explorer](https://testnet.algoexplorer.io/)
   - Search for the Asset ID
   - See full transaction history!

---

## 🐛 Troubleshooting

**Wallet won't connect?**
- Ensure Pera Wallet is installed and you have an account
- Try refreshing the page
- Check browser console for errors

**Transaction fails?**
- Ensure you have enough TestNet ALGO (minimum 0.1 for opt-ins)
- Check that admin wallet is funded
- Wait a few seconds between transactions

**NFT not showing?**
- Wait ~4 seconds for blockchain confirmation
- Refresh the page
- Check transaction on AlgoExplorer

For more help, see [PERA_WALLET_GUIDE.md](./PERA_WALLET_GUIDE.md)

---

## 🚀 Deployment

### Deploy to Vercel/Netlify:
```bash
npm run build
# Deploy the 'dist' folder
```

### Environment Variables:
```env
GEMINI_API_KEY=your_key_here (optional)
```

---

## 📚 Resources

- [Algorand Documentation](https://developer.algorand.org/)
- [Pera Wallet Docs](https://docs.perawallet.app/)
- [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)
- [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)

---

## ⚖️ License

MIT License - Free to use and modify

---

**Built with ❤️ on Algorand** | **Powered by Pera Wallet** 🟣

