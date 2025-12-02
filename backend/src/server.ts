import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import * as AlgoService from './services/algorandService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors() as any);

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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

    // Transfer
    const txId = await AlgoService.transferAsset(
      userWallet.encrypted_sk, 
      userWallet.iv, 
      externalAddress, 
      assetId
    );

    res.json({ success: true, txId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Farm Chain Backend running on port ${PORT}`);
});