# FarmChain Testing Quick Start

## Ready to Test! 🚀

Your Phase 1 implementation is complete. Follow these steps to test the complete cattle slaughter workflow.

---

## Prerequisites ✅

- ✅ Development server running on http://localhost:3002/
- ✅ TypeScript compiles with zero errors
- ✅ Admin wallet funded (get TestNet ALGO from dispenser)
- ✅ Optional: Pera Wallet extension installed for user testing

---

## 5-Minute Test Workflow

### 1. Fund Admin Wallet (30 seconds)

```
1. Open http://localhost:3002/
2. Click Admin Console button (🛡️ icon, top right)
3. Click "Wallet Settings" tab (left sidebar)
4. Copy admin wallet address
5. Visit: https://bank.testnet.algorand.network/
6. Paste address and click "Dispense"
7. Wait 5 seconds, click refresh (↻) in admin dashboard
8. Verify balance shows > 10 ALGO
```

---

### 2. Configure Payment Split (1 minute)

```
1. Click "Settings" button (top right, next to Network Status)
2. In AdminSettings modal:
   - Cattle Type: "premium"
   - Owner Percentage: 75
   - Platform Percentage: 25
   - Description: "Premium cattle partnership"
3. Click "Add Configuration"
4. Verify it appears in list with green "Active" badge
5. Click "Close"
```

---

### 3. Mint Premium Cattle (1 minute)

```
1. Click "Mint New Asset" tab (left sidebar)
2. Fill form:
   - Cow Name: "Bella Premium"
   - Breed: Holstein
   - Cattle Type: premium ← IMPORTANT!
   - Initial Weight: 450
   - Listing Price: 3000
   - Projected ROI: 15
   - (Leave IPFS fields empty for demo)
3. Click "Mint to Blockchain"
4. Wait 5 seconds for confirmation
5. See success alert "Minted Cow successfully!"
6. Click "Inventory" tab to verify
```

---

### 4. Assign to User (1 minute)

**Option A: Assign to Test Address**
```
1. In Inventory tab, find "Bella Premium"
2. Enter test address: 
   AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
   (or use your Pera Wallet address)
3. Click transfer button (👤+)
4. Wait 5 seconds
5. Verify "Slaughter" button appears (orange)
```

**Option B: Assign to Your Pera Wallet**
```
1. Connect Pera Wallet (purple button, top right)
2. Copy your address from wallet button
3. Follow Option A steps with your address
4. Now you can see cattle in your user dashboard!
```

---

### 5. Execute Slaughter (2 minutes)

```
1. Click orange "Slaughter" button on "Bella Premium"
2. SlaughterModal opens
3. Fill details:
   - Slaughter Date: [Today]
   - Facility: "TestNet Slaughterhouse"
   - Final Weight: 550 (shows +100kg gain!)
   - Gross Sale Price: 5000
   - Click "Add Expense"
     - Transport: 200
     - Processing: 300
     - Inspection: 50
4. Verify preview shows:
   - Net Price: 4450 ALGO
   - Owner Gets: 3337.50 ALGO (75%)
   - Platform Gets: 1112.50 ALGO (25%)
5. Click "Execute Slaughter"
6. Wait ~10 seconds (blockchain confirmation)
7. See success alert with:
   ✅ Payment Split: 75/25
   ✅ Owner: 3337.50 ALGO
   ✅ Platform: 1112.50 ALGO
   ✅ Certificate: ipfs://Qm...
   ✅ On-chain TxID: ABC...
```

---

### 6. Verify Results (1 minute)

**Check Admin Dashboard:**
```
1. "Bella Premium" status changed
2. "Slaughter" button disappeared
3. Owner received funds
```

**Check Blockchain:**
```
1. Copy TxID from alert
2. Visit: https://testnet.explorer.perawallet.app/tx/[TxID]
3. See atomic transaction group (2 payments)
4. Verify amounts: 3337.50 + 1112.50 ALGO
```

**Check IPFS:**
```
1. Copy CID from alert (Qm...)
2. Visit: https://gateway.pinata.cloud/ipfs/[CID]
3. View certificate JSON with all details
```

---

## What You've Tested ✅

- ✅ **Payment Split Configuration**: Admin can set custom ratios
- ✅ **Cattle Type Selection**: Mint with type for split lookup
- ✅ **Ownership Transfer**: Blockchain NFT transfer
- ✅ **Atomic Payment Distribution**: 2-transaction group (all or nothing)
- ✅ **IPFS Certificate**: Permanent decentralized storage
- ✅ **On-Chain Recording**: Immutable supply chain event
- ✅ **Real-time Calculation**: Dynamic net price and split preview
- ✅ **Expense Tracking**: Multi-expense support with totals
- ✅ **State Management**: Proper UI updates after slaughter

---

## Testing Different Scenarios

### Scenario 1: Standard Cattle (70/30 split)
```
1. Mint new cattle with cattleType: "standard"
2. Assign and slaughter
3. Verify 70% owner / 30% platform
```

### Scenario 2: Multiple Expenses
```
1. Add 5+ expenses
2. Verify total auto-calculates
3. Verify net price subtracts all
```

### Scenario 3: Low Sale Price
```
1. Enter sale price barely above expenses
2. Verify split still calculates correctly
3. Test with sale price < expenses (should fail validation)
```

### Scenario 4: No Payment Config
```
1. Don't configure split for cattle type
2. Slaughter cattle
3. Verify defaults to 70/30
```

### Scenario 5: Inactive Config
```
1. Configure split but set "Inactive"
2. Slaughter cattle of that type
3. Verify falls back to default
```

---

## Troubleshooting

### "Minting Failed"
- **Cause**: Admin wallet has < 0.2 ALGO
- **Fix**: Fund wallet, try again

### "Assignment Failed"
- **Cause**: User wallet not opted-in
- **Fix**: App handles opt-in automatically, check user wallet has 0.001 ALGO

### "Slaughter button not showing"
- **Cause**: Cattle not assigned yet
- **Fix**: Assign to user first

### "Payment Failed"
- **Cause**: Admin wallet has < net price + 0.002 ALGO
- **Fix**: Fund admin wallet, try again

### "IPFS upload simulated"
- **Cause**: No Pinata keys in .env.local
- **Fix**: Normal for demo, uses mock CID (still works!)

---

## Advanced Testing

### Test Multiple Cattle Types
```bash
# Create different splits:
- Standard: 70/30
- Premium: 75/25
- Wagyu: 80/20
- Organic: 75/25

# Mint one of each type
# Slaughter all
# Verify each uses correct split
```

### Test Payment Split Math
```bash
# Formula verification:
Net = Gross - Expenses
Owner = Net × (OwnerPercent / 100)
Platform = Net × (PlatformPercent / 100)

# Example:
Gross: 5000 ALGO
Expenses: 550 ALGO
Net: 4450 ALGO
Split: 75/25
Owner: 4450 × 0.75 = 3337.50 ✅
Platform: 4450 × 0.25 = 1112.50 ✅
Total: 3337.50 + 1112.50 = 4450 ✅
```

### Test Supply Chain History
```typescript
// In browser console:
const cow = allCows.find(c => c.name === 'Bella Premium');
console.log(cow.supplyChain);

// Should show:
[{
  id: "slaughter-1234567890",
  eventType: "slaughter",
  timestamp: 1234567890,
  actor: "TestNet Slaughterhouse",
  data: { ... slaughter details ... },
  txId: "ABC123...",
  ipfsCID: "Qm..."
}]
```

---

## Performance Benchmarks

### Expected Timings:
- **Mint**: 3-5 seconds
- **Assign**: 3-5 seconds
- **Slaughter**: 8-12 seconds
  - Payment: 4-5 seconds
  - IPFS upload: 1-2 seconds
  - On-chain record: 4-5 seconds

### Blockchain Costs (TestNet):
- **Mint**: 0.001 ALGO (asset creation)
- **Assign**: 0.001 ALGO (transfer)
- **Slaughter**: 0.002 ALGO (2 payments + 1 config)

---

## Success Criteria ✅

Your implementation is working correctly if:

- ✅ Settings modal opens and saves configs
- ✅ Mint form includes cattle type dropdown
- ✅ Minting creates NFT on blockchain
- ✅ Assignment transfers ownership
- ✅ Slaughter button appears after assignment
- ✅ SlaughterModal shows real-time calculations
- ✅ Execute Slaughter completes in ~10 seconds
- ✅ Success alert shows payment details
- ✅ Owner wallet receives correct amount
- ✅ Platform wallet receives correct amount
- ✅ Certificate uploaded to IPFS
- ✅ Event recorded on blockchain
- ✅ Cattle status changes to "slaughtered"
- ✅ Slaughter button disappears
- ✅ No TypeScript errors
- ✅ No console errors

---

## Next Steps

### Phase 2 Planning:
1. **FCT Token**: Replace ALGO with custom token
2. **Naira Integration**: Off-chain fiat liquidity
3. **Consumer Portal**: Public cattle viewer
4. **QR Codes**: Supply chain transparency
5. **Analytics**: Revenue and payment reports

### Immediate Improvements:
1. Add loading spinners during blockchain operations
2. Add transaction history view
3. Add cattle status filters (active/slaughtered)
4. Add search functionality in inventory
5. Add export to CSV (slaughter records)

---

## Getting Help

### Check Documentation:
- `PHASE1_INTEGRATION_COMPLETE.md` - Integration summary
- `WORKFLOW_GUIDE.md` - Detailed workflow explanations
- `IMPLEMENTATION_GUIDE.md` - Technical implementation details
- `PHASE1_COMPLETE.md` - Phase 1 completion summary

### Common Questions:

**Q: Can I change payment split after minting?**
A: Yes! Update config, applies to all future slaughters of that type.

**Q: Can I slaughter without IPFS keys?**
A: Yes! App simulates IPFS upload with mock CID.

**Q: What happens if payment fails mid-transaction?**
A: Atomic transactions ensure both payments succeed or both revert (no partial payments).

**Q: Can users slaughter their own cattle?**
A: Currently admin-only. Phase 2 will add user permissions.

**Q: Where is payment split data stored?**
A: On-chain (in cow's PaymentSplit field) + localStorage (configs).

---

## Ready to Ship? 🚀

Phase 1 is **production-ready** for TestNet deployment!

**Deploy Checklist**:
- ✅ Configure IPFS API keys (Pinata)
- ✅ Set platform wallet address (.env.local)
- ✅ Fund platform wallet for operations
- ✅ Document payment split policies
- ✅ Train admin users on workflow
- ✅ Set up blockchain explorer monitoring
- ✅ Configure backup/export procedures

**Start Testing**: http://localhost:3002/ 🎯

---

**Happy Testing!** 🐄⛓️💰
