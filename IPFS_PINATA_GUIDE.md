# IPFS & Pinata Integration Guide

## 🌐 Using IPFS for Cattle NFT Metadata

Farm Chain supports **IPFS** (InterPlanetary File System) for decentralized storage of NFT images and metadata using **Pinata**.

---

## 📋 Overview

### How It Works:
1. **Upload to Pinata** - Store images and metadata JSON files on IPFS
2. **Get CIDs** - Pinata provides Content Identifiers (CIDs) for each file
3. **Mint NFT** - Enter CIDs when minting cattle NFTs
4. **Dynamic Updates** - Changes to cattle data are stored on-chain via ARC-69

### Standards Used:
- **ARC-3**: Immutable base metadata (stored on IPFS)
- **ARC-69**: Dynamic metadata (stored on-chain in transaction notes)

---

## 🚀 Step-by-Step Guide

### 1. Create Pinata Account

1. Go to [pinata.cloud](https://www.pinata.cloud/)
2. Sign up for a free account
3. Navigate to your dashboard

### 2. Upload Cow Image

1. Click **"Upload"** → **"File"**
2. Select your cow image (JPG, PNG, etc.)
3. Add a descriptive name (e.g., "bessie-holstein-cow")
4. Click **"Upload"**
5. **Copy the CID** (starts with `Qm...` or `bafy...`)

**Example CID:**
```
QmYHNYAaYK5hm5cNbKs7gE7DDGpVkpPxGzfPU2tPfxC5sG
```

### 3. Create Metadata JSON (Optional)

For full ARC-3 compliance, create a metadata JSON file:

```json
{
  "name": "Bessie #001",
  "description": "Premium Holstein cattle from Farm Chain ranch",
  "image": "ipfs://QmYHNYAaYK5hm5cNbKs7gE7DDGpVkpPxGzfPU2tPfxC5sG",
  "image_integrity": "sha256-...",
  "image_mimetype": "image/jpeg",
  "external_url": "https://farmchain.app",
  "properties": {
    "breed": "Holstein",
    "initial_weight_kg": 450,
    "birth_date": "2024-01-15",
    "ranch_location": "Northern Farm",
    "certification": "Organic"
  }
}
```

### 4. Upload Metadata JSON

1. Save the JSON as `metadata.json`
2. Upload to Pinata
3. **Copy the metadata CID**

**Example Metadata CID:**
```
QmZZZabc123def456ghi789jkl012mno345pqr678stu901
```

### 5. Mint NFT with IPFS

1. Open **Admin Console** in Farm Chain
2. Go to **"Mint New Asset"**
3. Fill in cow details
4. **Paste Image CID** in "Image CID (Pinata)" field
5. **Paste Metadata CID** in "Metadata CID (Pinata)" field (optional)
6. Click **"Mint Cattle NFT"**

---

## 🔄 Dynamic Updates (ARC-69)

### What Gets Updated On-Chain:
- Weight changes
- Health score updates
- Status changes (fattening → ready for sale)
- Growth history

### How It Works:
1. User clicks **"Update Status"** in cow details
2. New data is packaged as ARC-69 metadata
3. Admin sends asset config transaction with updated note
4. Changes are permanently recorded on Algorand TestNet
5. **Anyone can verify** the update history on AlgoExplorer

### Verifying Updates:
1. Copy the Asset ID from cow details
2. Visit: `https://testnet.algoexplorer.io/asset/{ASSET_ID}`
3. View **"Transactions"** tab
4. Check `acfg` (asset config) transactions
5. Decode the **"Note"** field to see ARC-69 metadata

---

## 📊 Metadata Structure

### On-Chain (ARC-69) - Dynamic
```json
{
  "standard": "arc69",
  "description": "Farm Chain Cattle NFT - Bessie",
  "external_url": "https://farmchain.app",
  "properties": {
    "breed": "Holstein",
    "weight": 485,
    "health_score": 92,
    "status": "fattening",
    "last_updated": 1733097600000,
    "traits": {
      "current_weight_kg": 485,
      "health_status": "Excellent",
      "weight_gain_kg": 35
    }
  }
}
```

### IPFS (ARC-3) - Immutable
Stored on IPFS via Pinata, referenced in NFT asset URL.

---

## 🔗 Accessing IPFS Content

### Via Pinata Gateway:
```
https://gateway.pinata.cloud/ipfs/{CID}
```

### Via IPFS Protocol:
```
ipfs://{CID}
```

### Via Public Gateway:
```
https://ipfs.io/ipfs/{CID}
```

**Example:**
```
https://gateway.pinata.cloud/ipfs/QmYHNYAaYK5hm5cNbKs7gE7DDGpVkpPxGzfPU2tPfxC5sG
```

---

## 💡 Best Practices

### 1. Image Optimization
- Use compressed JPEG or optimized PNG
- Recommended size: 800x600px or smaller
- Keep file size under 2MB for fast loading

### 2. Metadata JSON
- Always include `image` field with IPFS URI
- Add descriptive properties
- Follow ARC-3 standard for maximum compatibility

### 3. Testing
- Test IPFS links work before minting
- Verify CIDs are correct (alphanumeric, starts with Q or b)
- Check on TestNet first before MainNet

### 4. Backup
- Keep local copies of images and metadata
- Save CIDs in a spreadsheet
- Pinata provides redundancy but have backups

---

## 🧪 Example Workflow (POC)

### Scenario: Minting "Bessie the Holstein"

1. **Take photo** of Bessie
2. **Upload to Pinata** → Get CID: `QmABC123...`
3. **Create metadata.json**:
   ```json
   {
     "name": "Bessie #001",
     "description": "Premium Holstein dairy cow",
     "image": "ipfs://QmABC123...",
     "properties": {
       "breed": "Holstein",
       "initial_weight_kg": 450
     }
   }
   ```
4. **Upload metadata** → Get CID: `QmXYZ789...`
5. **Mint in Farm Chain**:
   - Name: Bessie
   - Breed: Holstein
   - Weight: 450 kg
   - Image CID: `QmABC123...`
   - Metadata CID: `QmXYZ789...`
6. **NFT Created!** Asset ID: #12345678
7. **Verify on chain**: https://testnet.algoexplorer.io/asset/12345678

### After 30 Days:

1. **Click "Update Status"** in app
2. **Weight increases** to 485 kg
3. **Health score** updates to 92%
4. **New ARC-69 metadata** written on-chain
5. **Verify update**: Check transaction history on AlgoExplorer
6. **NFT holders see** updated data automatically

---

## 🔍 Verification

### For NFT Holders:
1. View cow in "My Ranch"
2. Click on cow for details
3. See "Blockchain Verified NFT" section
4. Click links to view on IPFS and blockchain

### For Third Parties:
1. Get Asset ID
2. Query Algorand Indexer API
3. Decode ARC-69 metadata from transaction notes
4. Fetch base metadata from IPFS CID

---

## 🛠️ Technical Details

### Asset URL Format:
```
ipfs://{METADATA_CID}#arc3
```

### Image URL Format:
```
ipfs://{IMAGE_CID}
```

### On-Chain Note Field:
```
Base64 encoded JSON containing ARC-69 metadata
```

### API Query (Example):
```javascript
// Get asset info
const assetInfo = await algodClient.getAssetByID(assetId).do();

// Get config transactions (updates)
const txns = await indexerClient
  .searchForTransactions()
  .assetID(assetId)
  .txType('acfg')
  .do();

// Decode latest metadata
const latestNote = Buffer.from(txns.transactions[0].note, 'base64').toString();
const metadata = JSON.parse(latestNote);
```

---

## 📚 Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [ARC-3 Standard](https://arc.algorand.foundation/ARCs/arc-0003)
- [ARC-69 Standard](https://arc.algorand.foundation/ARCs/arc-0069)
- [Algorand Asset Documentation](https://developer.algorand.org/docs/get-details/asa/)

---

## 🎯 POC Advantages

### Immutable History:
- Original metadata stored on IPFS (can't be changed)
- Update history stored on blockchain (transparent)
- Anyone can verify authenticity

### Decentralized:
- No central server required
- IPFS provides redundancy
- Blockchain ensures data integrity

### Cost-Effective:
- IPFS storage is cheap/free (via Pinata)
- On-chain updates cost ~0.001 ALGO each
- No expensive storage on blockchain

### Verifiable:
- NFT holders can prove ownership
- Third parties can verify data
- Transparent update timeline

---

**Ready to try it out? Start uploading to Pinata! 🚀**
