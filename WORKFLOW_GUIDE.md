# FarmChain Admin Workflow Guide

## Complete Cattle Slaughter Workflow with Payment Distribution

### Step-by-Step User Journey

---

## Step 1: Configure Payment Splits

**Location**: Admin Dashboard → Settings Button (top right)

### Actions:
1. Click the **Settings** button next to "Network Status"
2. AdminSettings modal opens
3. Add new payment split configuration:
   - **Cattle Type**: e.g., "Premium Holstein"
   - **Owner Percentage**: e.g., 75%
   - **Platform Percentage**: e.g., 25%
   - **Description**: Optional notes
   - Click **Add Configuration**

### Available Cattle Types:
- Standard (default: 70/30)
- Premium (suggested: 75/25)
- Wagyu (suggested: 80/20)
- Organic (suggested: 75/25)
- Custom types (can add your own)

### Features:
- ✅ Edit existing configurations
- ✅ Delete configurations
- ✅ Activate/Deactivate (only active configs are used)
- ✅ Saved to localStorage (persists across sessions)

---

## Step 2: Mint Cattle NFT with Type

**Location**: Admin Dashboard → Mint New Asset tab

### Form Fields:
1. **Cow Name**: e.g., "Bessie Premium"
2. **Breed**: Holstein, Angus, Hereford, Wagyu
3. **Cattle Type**: **NEW!** Select from:
   - Standard
   - Premium
   - Wagyu
   - Organic
4. **Initial Weight**: e.g., 450 kg
5. **Listing Price**: e.g., 3000 ALGO
6. **Projected ROI**: e.g., 15%
7. **IPFS Metadata** (optional):
   - Image CID (Pinata)
   - Metadata CID (Pinata)
8. **Asset Image URL**: Fallback URL

### Click "Mint to Blockchain"
- Creates ARC-69 NFT on Algorand TestNet
- Stores cattle type for payment split lookup
- Initializes supply chain array
- Admin wallet must have 0.2+ ALGO

---

## Step 3: Assign to User

**Location**: Admin Dashboard → Inventory tab

### Process:
1. See list of unassigned cattle
2. Enter **Wallet Address** in input field
3. Click **Transfer Ownership** button (👤+)
4. Blockchain transfer executed:
   - User wallet opts-in to asset
   - Admin transfers NFT
   - Ownership updated

### Result:
- Cattle now shows owner address
- User can view in their dashboard
- **Slaughter button** now appears!

---

## Step 4: Process Slaughter

**Location**: Admin Dashboard → Inventory tab → Slaughter button

### Trigger:
- **Slaughter button** appears only for cattle with owners
- Button is **orange** and labeled "Slaughter"
- Hidden if cattle already slaughtered

### Click "Slaughter" → Modal Opens

---

## Step 5: Fill Slaughter Details

**SlaughterModal Form**:

### Section 1: Basic Information
1. **Slaughter Date**: Date picker
2. **Facility Name**: e.g., "Premium Slaughterhouse LLC"
3. **Final Weight**: e.g., 520 kg (auto-shows weight gain)

### Section 2: Financial Details
4. **Gross Sale Price**: e.g., 5000 ALGO
5. **Expenses**: Click "Add Expense"
   - Transport: e.g., 200 ALGO
   - Processing: e.g., 300 ALGO
   - Inspection: e.g., 50 ALGO
   - **Total Expenses**: Auto-calculated (550 ALGO)

### Section 3: Payment Preview (Real-time)
- **Net Price**: Auto-calculated (5000 - 550 = 4450 ALGO)
- **Payment Split**: Shows configured ratio (e.g., 75/25 for Premium)
- **Owner Gets**: 3337.50 ALGO (75%)
- **Platform Gets**: 1112.50 ALGO (25%)

### Validation:
- ✅ All fields required
- ✅ Final weight must be positive
- ✅ Sale price must be positive
- ✅ Expenses cannot exceed sale price

---

## Step 6: Execute Slaughter

**Click "Execute Slaughter"**

### Backend Process (Automatic):

#### 1. **Payment Distribution** (EscrowService)
```
✅ Create PaymentSplit object
✅ Convert ALGO to microALGOs (4450 → 4,450,000,000)
✅ Create 2 payment transactions:
   - Transaction 1: Owner receives 3,337,500,000 microALGOs
   - Transaction 2: Platform receives 1,112,500,000 microALGOs
✅ Group transactions atomically (both succeed or both fail)
✅ Sign with admin wallet
✅ Submit to Algorand blockchain
✅ Wait for confirmation (~4 seconds)
```

#### 2. **Certificate Creation** (IPFSService)
```
✅ Create JSON certificate with:
   - Cattle ID, Name, Asset ID
   - Slaughter date, facility
   - Final weight (520 kg)
   - Financial breakdown (gross, expenses, net)
   - Owner address
   - Inspector name
   - Blockchain: "Algorand TestNet"
✅ Upload to IPFS via Pinata
✅ Get Content Identifier (CID)
   Example: QmXoYz5K8c9vKjH3FhYt6W2eR4nM7bP1qL8dS9fG3hJ4k
```

#### 3. **On-Chain Recording** (SupplyChainService)
```
✅ Create ARC-69 metadata for slaughter event
✅ Include:
   - Event type: "slaughter"
   - Timestamp
   - Facility name
   - Final weight
   - Certificate CID (links to IPFS)
✅ Create asset config transaction
✅ Store in note field (on-chain forever)
✅ Submit to blockchain
✅ Wait for confirmation
```

#### 4. **State Update** (App.tsx)
```
✅ Update cow status to "slaughtered"
✅ Store slaughter info with certificate CID
✅ Store payment split details
✅ Add slaughter event to supply chain
✅ Mark permanent record CID
✅ Update UI
```

---

## Step 7: Success Confirmation

### Alert Message Shows:
```
✅ Slaughter processed successfully!

Payment Split: 75/25
Owner: 3337.50 ALGO
Platform: 1112.50 ALGO

Certificate: ipfs://QmXoYz5K8c9vKjH3FhYt6W2eR4nM7bP1qL8dS9fG3hJ4k
On-chain TxID: 7KHJF4N2QWERTY3456789ASDFGHJKL
```

### What Happened:
- ✅ **Owner's wallet received 3337.50 ALGO** (instant)
- ✅ **Platform wallet received 1112.50 ALGO** (instant)
- ✅ **Certificate uploaded to IPFS** (permanent, decentralized)
- ✅ **Event recorded on blockchain** (immutable, transparent)
- ✅ **Cattle marked as slaughtered** (no longer shows Slaughter button)

---

## Step 8: Verification

### Admin Dashboard:
- Cattle status: **Slaughtered**
- Slaughter button: **Hidden**
- Payment split details stored
- Certificate CID stored

### Blockchain Explorer:
1. Visit: `https://testnet.explorer.perawallet.app/tx/[TxID]`
2. See atomic transaction group (2 payments)
3. Verify amounts match split ratio

### IPFS Gateway:
1. Visit: `https://gateway.pinata.cloud/ipfs/[CID]`
2. View complete slaughter certificate JSON
3. Verify all details (weight, prices, farmer address)

### Consumer Portal (Future):
- Scan QR code on meat package
- View complete supply chain history
- See birth → fattening → health checks → slaughter
- Verify certificate authenticity
- Trust transparent process

---

## Error Handling

### Common Errors & Solutions:

**"Cannot slaughter: Cattle has no owner"**
- Solution: Assign cattle to user first

**"Admin Wallet needs funds"**
- Solution: Fund admin wallet (need enough for payment + fees)
  Visit: https://bank.testnet.algorand.network/

**"Payment Failed: Insufficient balance"**
- Solution: Ensure admin wallet has net price + 0.002 ALGO for fees

**"IPFS Upload Failed"**
- Solution: Check Pinata API keys in .env.local
- Falls back to mock CID if no keys configured

**"Transaction failed"**
- Solution: Check network status, wait and retry
- Verify admin wallet has balance

---

## Payment Split Logic

### How It Works:

1. **On Mint**: Cattle gets `cattleType` field (e.g., "premium")

2. **On Slaughter**: 
   - Load all payment configs from localStorage
   - Find config matching cattle type
   - Filter for `isActive: true`
   - Use matched config percentages
   - Fall back to 70/30 if no match

3. **Calculation**:
   ```javascript
   netPrice = grossPrice - totalExpenses
   ownerAmount = netPrice × (ownerPercentage / 100)
   platformAmount = netPrice × (platformPercentage / 100)
   ```

4. **Execution**:
   - Both payments in single atomic transaction
   - All or nothing (if one fails, both revert)
   - Instant distribution (no escrow delay)

---

## Supply Chain Transparency

### Permanent Records:

**On Blockchain**:
- Every update recorded as ARC-69 transaction
- Weight updates
- Health checks
- Vaccinations
- Ownership transfers
- **Slaughter event with certificate link**

**On IPFS**:
- Cattle images
- Metadata (breed, birth date, etc.)
- **Slaughter certificate (permanent)**
- Inspection reports

### Consumer Benefit:
- Scan QR code
- See full history (birth to table)
- Verify authenticity
- Trust in transparency
- Know the farm, know the farmer

---

## Admin Dashboard Features

### Inventory View Enhancements:

**Cattle Table Columns**:
1. **Asset Details**: Image, Name, ID
2. **Stats**: Breed, Weight, Cattle Type
3. **Chain Status**: Asset ID, Price, Status Badge
4. **Actions**:
   - Assign (if unassigned)
   - Delete (admin only)
   - **Slaughter** (if assigned & not slaughtered)

**Status Badges**:
- 🟢 Active (can be slaughtered)
- 🔴 Slaughtered (view-only)
- 🟡 Pending (minting in progress)

---

## Future Enhancements (Phase 2)

### FCT Token Integration:
- Replace ALGO with FarmChain Token (FCT)
- Naira-pegged: 1 FCT = ₦1
- Off-chain liquidity via Paystack/Flutterwave
- Instant Naira withdrawals

### Consumer Portal:
- Public cattle viewer
- QR code scanner
- Certificate verification
- Farm ratings/reviews

### Analytics Dashboard:
- Total cattle processed
- Revenue by cattle type
- Average payment splits
- IPFS usage statistics
- Blockchain transaction costs

---

## Quick Reference

### Button Locations:
- **Settings**: Admin header (right side, next to Network Status)
- **Mint**: Left sidebar → "Mint New Asset"
- **Inventory**: Left sidebar → "Inventory"
- **Slaughter**: Inventory table → Orange button (right side)

### Required Balances:
- **Admin Wallet**: 0.2+ ALGO for minting
- **Admin Wallet**: Net price + 0.002 ALGO for slaughter payments
- **User Wallet**: 0.001 ALGO for opt-in

### Configuration Files:
- **Payment Splits**: Stored in `localStorage` key `farmchain_payment_splits`
- **Admin Wallet**: Stored in `localStorage` key `farmchain_admin_wallet`
- **IPFS Keys**: `.env.local` (PINATA_JWT, PINATA_API_KEY, PINATA_SECRET_KEY)

---

**Status**: Ready for Testing ✅  
**Version**: Phase 1 Complete  
**Last Updated**: 2025-06-07
