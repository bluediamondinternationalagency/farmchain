#!/bin/bash

echo "🐄 Farm Chain - Algorand TestNet Setup"
echo "======================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if admin wallet exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found. Creating one..."
    echo "GEMINI_API_KEY=your_api_key_here" > .env.local
    echo "ALGORAND_NETWORK=testnet" >> .env.local
fi

echo "🚀 Starting Farm Chain..."
echo ""
echo "📌 Important Setup Steps:"
echo "   1. Install Pera Wallet: https://perawallet.app/"
echo "   2. Get TestNet ALGO: https://bank.testnet.algorand.network/"
echo "   3. Click Admin Console (shield icon) and fund the admin wallet"
echo ""
echo "📖 Full guide: See PERA_WALLET_GUIDE.md"
echo ""
echo "Starting development server..."
echo ""

npm run dev
