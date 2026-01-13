import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import * as AlgoService from './services/algorandService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

// Database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// 1. Create Custodial Wallet
app.post('/api/wallets/create', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 1. Create User in DB
    const userResult = await pool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id', 
      [email]
    );
    const userId = userResult.rows[0].id;

    // 2. Generate Algo Wallet
    const wallet = AlgoService.createCustodialWallet();

    // 3. Store Encrypted Wallet
    await pool.query(
      'INSERT INTO wallets (address, encrypted_sk, iv, user_id) VALUES ($1, $2, $3, $4)',
      [wallet.address, wallet.encryptedSk, wallet.iv, userId]
    );

    // 4. Fund Wallet (Async)
    AlgoService.fundNewWallet(wallet.address).catch(err => 
      console.error(`Failed to fund ${wallet.address}:`, err)
    );

    res.json({ 
      success: true, 
      userId, 
      address: wallet.address,
      message: "Wallet created and funding initiated." 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Mint Asset (Admin)
app.post('/api/assets/mint', async (req, res) => {
  try {
    const { metadata } = req.body;
    // Assume Admin Wallet is stored in env or special DB entry
    // Here using a mock flow where we have admin keys
    // In production, fetch Admin Encrypted SK from DB
    
    // Placeholder for demo: Using a temporary wallet creation to simulate "Minting Source"
    // In real backend, use the MASTER or ADMIN wallet from DB
    const tempAdmin = AlgoService.createCustodialWallet(); 
    
    const assetId = await AlgoService.mintCowNFT(tempAdmin.encryptedSk, tempAdmin.iv, metadata);

    // Store in DB
    await pool.query(
      'INSERT INTO assets (asset_id, name, unit_name, status) VALUES ($1, $2, $3, $4)',
      [assetId, metadata.name, 'COW', 'minted']
    );

    res.json({ success: true, assetId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Assign/Transfer to User (Auto Opt-In)
app.post('/api/assets/assign', async (req, res) => {
  try {
    const { userId, assetId } = req.body;

    // Get User Wallet
    const walletRes = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    const userWallet = walletRes.rows[0];

    if (!userWallet) throw new Error("User wallet not found");

    // 1. Opt-In User Wallet
    await AlgoService.optInToAsset(userWallet.encrypted_sk, userWallet.iv, assetId);

    // 2. Transfer from Admin (Source) to User
    // Fetch Admin/Source wallet logic here...
    // await AlgoService.transferAsset(adminSk, adminIv, userWallet.address, assetId);

    res.json({ success: true, message: "Asset assigned and transferred" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Withdraw to External Wallet
app.post('/api/wallets/withdraw', async (req, res) => {
  try {
    const { userId, assetId, externalAddress } = req.body;
    
    const walletRes = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    const userWallet = walletRes.rows[0];

    if (!userWallet) throw new Error("User wallet not found");

    // Transfer
    const txId = await AlgoService.transferAsset(
      userWallet.encrypted_sk, 
      userWallet.iv, 
      externalAddress, 
      assetId
    );

    // Log transaction
    await pool.query(
      'INSERT INTO transactions (transaction_id, from_wallet_id, asset_id, transaction_type, status) VALUES ($1, $2, $3, $4, $5)',
      [txId, userWallet.id, assetId, 'withdraw', 'confirmed']
    );

    res.json({ success: true, txId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get User Wallet Info
app.get('/api/wallets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT id, address, balance_algo, created_at FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get User Assets
app.get('/api/users/:userId/assets', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT a.* FROM assets a
       JOIN wallets w ON a.owner_wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Record Supply Chain Event
app.post('/api/supply-chain/event', async (req, res) => {
  try {
    const { assetId, eventType, eventData, transactionId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO supply_chain_events (asset_id, event_type, event_data, transaction_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [assetId, eventType, JSON.stringify(eventData), transactionId]
    );

    res.json({ success: true, event: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get Supply Chain History
app.get('/api/supply-chain/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM supply_chain_events WHERE asset_id = $1 ORDER BY created_at ASC',
      [assetId]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Record Slaughter
app.post('/api/slaughter/record', async (req, res) => {
  try {
    const {
      assetId,
      facility,
      slaughterDate,
      finalWeight,
      grossPrice,
      expenses,
      netPrice,
      adminShare,
      investorShare,
      paymentTxId,
      certificateCID
    } = req.body;
    
    // Update asset status
    await pool.query(
      'UPDATE assets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE asset_id = $2',
      ['slaughtered', assetId]
    );

    // Insert slaughter record
    const result = await pool.query(
      `INSERT INTO slaughter_records 
       (asset_id, facility, slaughter_date, final_weight, gross_price, expenses, 
        net_price, admin_share, investor_share, payment_tx_id, certificate_cid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [assetId, facility, slaughterDate, finalWeight, grossPrice, expenses, 
       netPrice, adminShare, investorShare, paymentTxId, certificateCID]
    );

    res.json({ success: true, record: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Get Payment Split Configs
app.get('/api/payment-splits', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payment_split_configs WHERE is_active = true ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Update Payment Split Config
app.put('/api/payment-splits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPercentage, investorPercentage } = req.body;
    
    if (adminPercentage + investorPercentage !== 100) {
      return res.status(400).json({ error: 'Percentages must sum to 100' });
    }

    const result = await pool.query(
      `UPDATE payment_split_configs 
       SET admin_percentage = $1, investor_percentage = $2 
       WHERE id = $3 RETURNING *`,
      [adminPercentage, investorPercentage, id]
    );

    res.json({ success: true, config: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Get All Assets (Admin)
app.get('/api/assets', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM assets ORDER BY created_at DESC';
    let params: any[] = [];
    
    if (status) {
      query = 'SELECT * FROM assets WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Get Asset Details
app.get('/api/assets/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM assets WHERE asset_id = $1',
      [assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Get Transaction History
app.get('/api/transactions/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE from_wallet_id = $1 OR to_wallet_id = $1 
       ORDER BY created_at DESC`,
      [walletId]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Farm Chain Backend running on port ${PORT}`);
});