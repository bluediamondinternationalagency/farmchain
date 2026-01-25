# Admin Authorization Setup Guide

## Overview
The Admin Console is now protected by wallet-based authorization. Only Pera Wallet addresses that are whitelisted can access the admin features (shield icon) to mint NFTs.

## Security Features
✅ **Wallet-Based Access Control**: Only authorized Pera Wallet addresses can access admin features  
✅ **No Admin Mnemonic Required**: Minting uses your connected Pera Wallet, not a stored admin wallet  
✅ **Secure by Default**: If no whitelist is configured, admin access is denied  
✅ **Multiple Admins Supported**: You can authorize multiple wallet addresses  

---

## Setup Instructions

### Step 1: Get Your Pera Wallet Address

1. Open the Pera Wallet mobile app or browser extension
2. Copy your wallet address (starts with an uppercase letter, 58 characters)
   - Example: `ABC123DEFG456HIJKL789MNOP012QRST345UVWX678YZ901ABC234DEFGH56`

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Pera Wallet address:
   ```bash
   # Single admin
   VITE_ADMIN_WHITELIST=YOUR_PERA_WALLET_ADDRESS_HERE

   # Multiple admins (comma-separated)
   VITE_ADMIN_WHITELIST=ABC123...,DEF456...,GHI789...
   ```

3. **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 3: Fund Your Pera Wallet (TestNet)

1. Visit the Algorand TestNet Dispenser: https://bank.testnet.algorand.network/
2. Paste your Pera Wallet address
3. Click "Dispense" to get 10 ALGO (for testing)
4. Wait ~5 seconds for confirmation

### Step 4: Restart the App

```bash
npm run dev
```

### Step 5: Connect Your Pera Wallet

1. Click "Connect Wallet" button in the app
2. Approve the connection in your Pera Wallet
3. The shield icon (🛡️) should now appear in the header

### Step 6: Access Admin Console

1. Click the shield icon to open Admin Console
2. You can now mint NFTs directly using your Pera Wallet
3. All minting transactions will be signed by your Pera Wallet

---

## How It Works

### Previous Flow (Insecure)
❌ Admin wallet stored in browser LocalStorage  
❌ Anyone could access admin console  
❌ Custodial wallet with mnemonic in browser  

### New Flow (Secure)
✅ Admin access requires authorized Pera Wallet connection  
✅ Only whitelisted addresses see the shield icon  
✅ All admin actions signed by your real Pera Wallet  
✅ No admin mnemonic stored in browser  

---

## Minting Process

1. **Admin connects** their authorized Pera Wallet
2. **Shield icon appears** (only for authorized addresses)
3. **Admin clicks shield** → Opens Admin Console
4. **Admin fills mint form** (name, breed, weight, etc.)
5. **Admin clicks "Mint NFT"**
6. **Pera Wallet prompt** appears asking to sign transaction
7. **Admin approves** in Pera Wallet
8. **NFT is created** on Algorand TestNet
9. **Admin can assign** NFT to any user's wallet address

---

## Troubleshooting

### Shield Icon Not Appearing?

**Check these:**
1. ✅ Is your Pera Wallet connected? (Should show address in header)
2. ✅ Is your address in `VITE_ADMIN_WHITELIST` in `.env.local`?
3. ✅ Did you restart the app after editing `.env.local`?
4. ✅ Check browser console for authorization messages

### "Access Denied" Error?

This means your wallet address is not in the whitelist:
1. Check the exact address in your Pera Wallet
2. Verify it matches the address in `.env.local`
3. Make sure there are no extra spaces or typos
4. Restart the app after editing `.env.local`

### Insufficient Balance Error?

Your Pera Wallet needs at least 0.2 ALGO to mint NFTs:
1. Visit https://bank.testnet.algorand.network/
2. Paste your Pera Wallet address
3. Click "Dispense" to get free TestNet ALGO

---

## Multiple Admins

To authorize multiple admins, separate addresses with commas:

```bash
VITE_ADMIN_WHITELIST=ABC123DEFG456...,XYZ789LMNOP012...,QRS345TUVWX678...
```

Each admin will:
- See the shield icon when their wallet is connected
- Be able to mint and manage NFTs
- Use their own Pera Wallet to sign transactions

---

## Security Best Practices

### ✅ DO:
- Keep your `.env.local` file private
- Use different addresses for TestNet and MainNet
- Regularly review who has admin access
- Test with small amounts on TestNet first

### ❌ DON'T:
- Share your `.env.local` file
- Commit `.env.local` to git
- Use TestNet addresses on MainNet
- Give admin access to untrusted addresses

---

## Production Deployment

For production (MainNet):

1. **Use a secure backend service** for minting (not browser-based)
2. **Implement proper authentication** (e.g., OAuth, JWT)
3. **Use environment variables** in your hosting platform (Netlify, Vercel, etc.)
4. **Enable audit logging** for all admin actions
5. **Use multi-signature wallets** for high-value operations

### Setting Environment Variables in Netlify:

1. Go to Site Settings → Environment Variables
2. Add `VITE_ADMIN_WHITELIST` with your MainNet addresses
3. Redeploy your site

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FarmChain App                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. User connects Pera Wallet                       │
│     ↓                                               │
│  2. AuthService checks if address is whitelisted    │
│     ↓                                               │
│  3a. NOT AUTHORIZED → Shield icon hidden            │
│      └── User sees normal dashboard only            │
│                                                     │
│  3b. AUTHORIZED → Shield icon visible               │
│      └── User can access Admin Console              │
│          └── All minting transactions signed by     │
│              their Pera Wallet (not custodial)      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify your wallet address matches exactly
3. Ensure you have sufficient TestNet ALGO
4. Review this guide step-by-step

For additional help, check the main [README.md](README.md) or [TESTING_QUICK_START.md](TESTING_QUICK_START.md).
