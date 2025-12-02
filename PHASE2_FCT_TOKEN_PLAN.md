# 🪙 Phase 2: FarmChain Token (FCT) & Naira Integration - Implementation Plan

## Overview
Implement custom FarmChain Token (FCT) on Algorand for all platform transactions, with off-chain Naira liquidity pool for Nigerian market.

---

## Architecture

```
User (Naira) → Liquidity Service → FCT Token → Cattle Purchase
                     ↓                              ↓
              Paystack/Flutterwave          Atomic Transaction
                     ↓                              ↓
              Off-Chain Ledger              NFT Transfer + FCT Payment
```

---

## Phase 2 Implementation Steps

### Step 1: Create FarmChain Token (FCT) as Algorand ASA

**File:** `/services/tokenService.ts`

```typescript
export const TokenService = {
  // Mint FCT token (admin only, one-time)
  mintFCT: async (totalSupply: number): Promise<number> => {
    // Create ASA with:
    // - Name: "FarmChain Token"
    // - Unit: "FCT"
    // - Decimals: 6 (like USDT)
    // - Total: 1,000,000,000 (1 billion)
    // - Manager: Admin address
    // - Reserve: Admin address
    // Returns: FCT Asset ID
  },

  // Get FCT balance of address
  getFCTBalance: async (address: string, fctAssetId: number): Promise<number>,

  // Transfer FCT between addresses
  transferFCT: async (
    from: Account,
    to: string,
    amount: number,
    fctAssetId: number
  ): Promise<string>,

  // Opt-in to FCT (required before receiving)
  optInToFCT: async (
    account: Account,
    fctAssetId: number
  ): Promise<string>
}
```

### Step 2: Off-Chain Naira Liquidity System

**File:** `/services/liquidityService.ts`

```typescript
export const LiquidityService = {
  // Exchange rates
  getExchangeRate: (): { fctToNaira: number; nairaToFCT: number } => {
    // Fixed rate: 1 FCT = ₦100
    // Or fetch from API for floating rate
  },

  // Buy FCT with Naira
  buyFCTWithNaira: async (
    userAddress: string,
    nairaAmount: number,
    paymentMethod: 'paystack' | 'flutterwave'
  ): Promise<{
    fctAmount: number;
    paymentUrl: string;
    reference: string;
  }> => {
    // 1. Calculate FCT amount
    // 2. Create payment link (Paystack/Flutterwave)
    // 3. Store pending transaction in DB
    // 4. Return payment URL
  },

  // Webhook handler for payment confirmation
  handlePaymentWebhook: async (
    reference: string,
    status: 'success' | 'failed'
  ): Promise<void> => {
    // 1. Verify payment with payment processor
    // 2. If success, transfer FCT to user
    // 3. Update off-chain ledger
    // 4. Send confirmation email
  },

  // Sell FCT for Naira (withdrawal)
  sellFCTForNaira: async (
    userAddress: string,
    fctAmount: number,
    bankDetails: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    }
  ): Promise<{
    nairaAmount: number;
    reference: string;
    estimatedTime: string;
  }> => {
    // 1. Transfer FCT from user to platform
    // 2. Calculate Naira amount
    // 3. Initiate bank transfer (Paystack Transfer API)
    // 4. Update off-chain ledger
  },

  // Get user's transaction history
  getTransactionHistory: async (
    userAddress: string
  ): Promise<LiquidityTransaction[]>
}
```

### Step 3: Update Marketplace for FCT Payments

**File:** `/components/Marketplace.tsx`

- Display cattle prices in both FCT and Naira
- Show user's FCT balance
- "Buy with FCT" button
- "Add Funds" button (redirect to Paystack)

**File:** `/services/web3Service.ts`

Add method:
```typescript
purchaseCattleWithFCT: async (
  assetId: number,
  seller: string,
  buyer: string,
  priceFCT: number,
  paymentSplit: PaymentSplit,
  fctAssetId: number
): Promise<string> => {
  // Atomic transaction group:
  // 1. Buyer transfers FCT to seller (70%)
  // 2. Buyer transfers FCT to platform (30%)
  // 3. Seller transfers cattle NFT to buyer
}
```

### Step 4: Update Slaughter Payment to Use FCT

**File:** `/services/escrowService.ts`

Add:
```typescript
executeSlaughterPaymentFCT: async (
  paymentSplit: PaymentSplit,
  totalAmountFCT: number,
  fctAssetId: number,
  adminAccount: Account
): Promise<{ txId: string }> => {
  // Similar to ALGO version but with FCT asset transfers
}
```

### Step 5: Admin FCT Management Dashboard

**File:** `/components/AdminFCTManager.tsx`

Features:
- Mint initial FCT supply
- View total FCT supply
- View platform FCT balance
- Distribute FCT to users manually (for testing)
- View Naira reserves vs FCT circulation
- Exchange rate configuration

---

## Database Schema (Off-Chain Ledger)

```sql
-- Liquidity transactions
CREATE TABLE liquidity_transactions (
  id UUID PRIMARY KEY,
  user_address VARCHAR(58),
  type VARCHAR(20), -- 'buy' | 'sell'
  naira_amount DECIMAL(18, 2),
  fct_amount DECIMAL(18, 6),
  exchange_rate DECIMAL(10, 2),
  payment_method VARCHAR(20),
  payment_reference VARCHAR(100),
  payment_status VARCHAR(20), -- 'pending' | 'success' | 'failed'
  bank_details JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Platform reserves
CREATE TABLE platform_reserves (
  id UUID PRIMARY KEY,
  total_naira_received DECIMAL(18, 2),
  total_naira_paid DECIMAL(18, 2),
  total_fct_distributed DECIMAL(18, 6),
  total_fct_received DECIMAL(18, 6),
  last_updated TIMESTAMP
);
```

---

## Environment Variables

Add to `.env.local`:

```env
# FCT Token
FCT_ASSET_ID=123456789

# Exchange Rate (optional, for fixed rate)
FCT_TO_NAIRA_RATE=100

# Payment Processors
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxx

# Webhook URLs
PAYSTACK_WEBHOOK_SECRET=xxx
PAYMENT_WEBHOOK_URL=https://farmchain.app/api/webhooks/payment

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/farmchain
```

---

## API Endpoints (Backend)

```typescript
// POST /api/liquidity/buy-fct
// Body: { userAddress, nairaAmount, paymentMethod }
// Returns: { fctAmount, paymentUrl, reference }

// POST /api/liquidity/sell-fct
// Body: { userAddress, fctAmount, bankDetails }
// Returns: { nairaAmount, reference, estimatedTime }

// POST /api/webhooks/payment
// Body: Paystack/Flutterwave webhook payload
// Returns: 200 OK

// GET /api/liquidity/transactions/:address
// Returns: LiquidityTransaction[]

// GET /api/liquidity/exchange-rate
// Returns: { fctToNaira, nairaToFCT, lastUpdated }
```

---

## Testing Plan

### TestNet Testing:
1. Mint FCT token on TestNet
2. Distribute test FCT to admin wallet
3. Simulate Paystack payment (use test mode)
4. Test FCT → Naira conversion calculation
5. Test cattle purchase with FCT
6. Test slaughter payment distribution in FCT

### Production Checklist:
- [ ] Mint FCT on MainNet
- [ ] Set up Paystack/Flutterwave production accounts
- [ ] Configure webhook endpoints with SSL
- [ ] Set up database with backups
- [ ] Implement KYC for large transactions (>₦100,000)
- [ ] Set up monitoring for liquidity pool
- [ ] Legal review of token terms
- [ ] CBN compliance consultation

---

## Cost Estimation

### Algorand Fees (TestNet/MainNet):
- Mint FCT: 0.1 ALGO (one-time)
- User opt-in: 0.001 ALGO (one-time per user)
- FCT transfer: 0.001 ALGO per transaction
- Atomic transaction (3 txns): 0.003 ALGO

### Payment Processor Fees:
- Paystack: 1.5% + ₦100 (capped at ₦2,000)
- Flutterwave: 1.4% + ₦10
- Bank transfer: ₦50 per transaction

### Example Transaction:
```
User buys ₦10,000 worth of FCT:
- FCT Amount: 100 FCT (at ₦100/FCT)
- Paystack Fee: (10,000 × 1.5%) + 100 = ₦250
- Net to Platform: ₦9,750
- Algorand Fee: 0.001 ALGO (~₦1)
- User Receives: 100 FCT
```

---

## Security Considerations

1. **Platform Wallet Security:**
   - Store FCT admin keys in HSM
   - Implement multi-sig for large transfers
   - Regular security audits

2. **Payment Verification:**
   - Always verify webhook signatures
   - Double-check payment status via API
   - Implement idempotency for webhooks

3. **Fraud Prevention:**
   - Rate limiting on FCT purchases
   - KYC for transactions above threshold
   - Monitor suspicious activity patterns

4. **Liquidity Management:**
   - Maintain Naira reserve ratio (e.g., 1:1)
   - Set daily/monthly withdrawal limits
   - Alert when reserves fall below threshold

---

## Compliance Requirements (Nigeria)

1. **CBN Regulations:**
   - Not a stablecoin (utility token only)
   - Proper KYC/AML procedures
   - Transaction reporting above ₦5M

2. **Tax Implications:**
   - VAT on platform fees (7.5%)
   - Withholding tax on earnings
   - Annual financial statements

3. **Consumer Protection:**
   - Clear terms of service
   - Refund policy
   - Dispute resolution process

---

## Migration Path from ALGO to FCT

### Option 1: Dual Currency (Recommended for Testing)
- Support both ALGO and FCT
- Let users choose payment method
- Gradually phase out ALGO

### Option 2: Hard Switch
- Announce migration date
- Convert all ALGO balances to FCT
- Disable ALGO payments after date

### Option 3: Hybrid
- Use FCT for cattle purchases
- Continue ALGO for slaughter payments
- Simplifies initial rollout

---

## Timeline Estimate

- **Week 1:** Mint FCT, create TokenService
- **Week 2:** Build LiquidityService, Paystack integration
- **Week 3:** Update Marketplace UI for FCT
- **Week 4:** Update slaughter payments for FCT
- **Week 5:** Testing, bug fixes, documentation
- **Week 6:** Production deployment

---

## Next Steps

1. Review this plan with team
2. Choose payment processor (Paystack vs Flutterwave)
3. Decide on fixed vs floating exchange rate
4. Set up test Paystack account
5. Create database schema
6. Begin implementation of TokenService

---

**Ready to proceed with Phase 2?** Let me know and I'll start implementing the TokenService!
