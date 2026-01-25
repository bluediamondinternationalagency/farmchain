#!/bin/bash

echo "🔐 FarmChain Admin Authorization Setup"
echo "======================================="
echo ""
echo "This script will help you set up admin access control."
echo ""
echo "📋 STEP 1: Get Your Pera Wallet Address"
echo "   1. Open Pera Wallet (mobile app or browser extension)"
echo "   2. Copy your wallet address (58 characters, starts with uppercase letter)"
echo "   3. Example: ABC123DEFG456HIJKL789MNOP012QRST345UVWX678YZ901ABC234DEFGH56"
echo ""
echo "💰 STEP 2: Fund Your Wallet (TestNet)"
echo "   1. Visit: https://bank.testnet.algorand.network/"
echo "   2. Paste your wallet address"
echo "   3. Click 'Dispense' to get 10 free TestNet ALGO"
echo ""
echo "⚙️  STEP 3: Configure Environment"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Found .env.local file"
    echo ""
    
    # Check if VITE_ADMIN_WHITELIST is set
    if grep -q "^VITE_ADMIN_WHITELIST=.\+" .env.local; then
        echo "✅ VITE_ADMIN_WHITELIST is configured"
        echo ""
        echo "Current value:"
        grep "^VITE_ADMIN_WHITELIST=" .env.local
        echo ""
        read -p "Do you want to update it? (y/n): " update_choice
        
        if [ "$update_choice" = "y" ] || [ "$update_choice" = "Y" ]; then
            read -p "Enter your Pera Wallet address: " wallet_address
            
            if [ -z "$wallet_address" ]; then
                echo "❌ No address entered. Skipping update."
            else
                # Update the line
                sed -i.bak "s/^VITE_ADMIN_WHITELIST=.*/VITE_ADMIN_WHITELIST=$wallet_address/" .env.local
                echo "✅ Updated VITE_ADMIN_WHITELIST in .env.local"
            fi
        fi
    else
        echo "⚠️  VITE_ADMIN_WHITELIST not configured yet"
        echo ""
        read -p "Enter your Pera Wallet address: " wallet_address
        
        if [ -z "$wallet_address" ]; then
            echo "❌ No address entered. Please edit .env.local manually."
        else
            # Add or update the line
            if grep -q "^VITE_ADMIN_WHITELIST=" .env.local; then
                sed -i.bak "s/^VITE_ADMIN_WHITELIST=.*/VITE_ADMIN_WHITELIST=$wallet_address/" .env.local
            else
                echo "VITE_ADMIN_WHITELIST=$wallet_address" >> .env.local
            fi
            echo "✅ Added VITE_ADMIN_WHITELIST to .env.local"
        fi
    fi
else
    echo "⚠️  .env.local not found. Creating from template..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo ""
        read -p "Enter your Pera Wallet address: " wallet_address
        
        if [ -z "$wallet_address" ]; then
            echo "❌ No address entered. Please edit .env.local manually."
        else
            sed -i.bak "s/^VITE_ADMIN_WHITELIST=.*/VITE_ADMIN_WHITELIST=$wallet_address/" .env.local
            echo "✅ Configured VITE_ADMIN_WHITELIST in .env.local"
        fi
    else
        echo "❌ .env.example not found! Creating basic .env.local..."
        echo "VITE_ADMIN_WHITELIST=" > .env.local
        read -p "Enter your Pera Wallet address: " wallet_address
        
        if [ ! -z "$wallet_address" ]; then
            echo "VITE_ADMIN_WHITELIST=$wallet_address" > .env.local
            echo "✅ Created .env.local with your address"
        fi
    fi
fi

echo ""
echo "🚀 STEP 4: Restart the App"
echo "   Run: npm run dev"
echo ""
echo "🔗 STEP 5: Connect Your Wallet"
echo "   1. Open the app in your browser"
echo "   2. Click 'Connect Wallet'"
echo "   3. Approve connection in Pera Wallet"
echo "   4. The shield icon (🛡️) should now appear!"
echo ""
echo "✨ That's it! You can now access the Admin Console."
echo ""
echo "📖 For more details, see: ADMIN_AUTHORIZATION_GUIDE.md"
echo ""
echo "💡 Pro Tips:"
echo "   • Add multiple admins: ADDR1,ADDR2,ADDR3"
echo "   • No spaces in the address list"
echo "   • TestNet ALGO has no real value (safe to test)"
echo ""
echo "🔒 Security:"
echo "   • .env.local is NOT committed to git"
echo "   • Only whitelisted wallets can access admin features"
echo "   • Shield icon only appears for authorized users"
echo ""
echo "Happy minting! 🐄"
