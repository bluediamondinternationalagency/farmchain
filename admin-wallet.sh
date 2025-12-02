#!/bin/bash

echo "🛡️  Farm Chain Admin Wallet Manager"
echo "===================================="
echo ""

# Check localStorage for admin wallet
ADMIN_KEY="fc_admin_mnemonic"

echo "This script helps you manage your admin wallet."
echo ""
echo "⚠️  Note: Admin wallet is stored in browser localStorage"
echo "         Open the browser console to access it."
echo ""
echo "📋 To view your admin wallet:"
echo "   1. Open your browser (Chrome/Firefox/Safari)"
echo "   2. Open Developer Tools (F12 or Cmd+Option+I)"
echo "   3. Go to Console tab"
echo "   4. Run: localStorage.getItem('fc_admin_mnemonic')"
echo ""
echo "💰 To fund your admin wallet:"
echo "   1. Start the app: npm run dev"
echo "   2. Click Admin Console (shield icon)"
echo "   3. Copy the admin address"
echo "   4. Visit: https://bank.testnet.algorand.network/"
echo "   5. Paste address and click 'Dispense'"
echo "   6. Wait ~5 seconds for confirmation"
echo ""
echo "🔒 Security Tips:"
echo "   • Admin wallet is for TESTNET only"
echo "   • Never share your mnemonic phrase"
echo "   • For production, use a backend service"
echo ""
echo "🚀 Start the app now?"
read -p "Press Enter to start, or Ctrl+C to cancel..."

npm run dev
