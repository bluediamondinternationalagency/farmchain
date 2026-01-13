-- Farm Chain Database Schema
-- PostgreSQL Database for Custodial Wallet Management

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custodial Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address VARCHAR(58) UNIQUE NOT NULL,
  encrypted_sk TEXT NOT NULL, -- AES encrypted secret key
  iv VARCHAR(32) NOT NULL, -- Initialization vector for decryption
  balance_algo DECIMAL(20, 6) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets (NFTs) Table
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_id BIGINT UNIQUE NOT NULL, -- Algorand Asset ID
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  unit_name VARCHAR(8) DEFAULT 'COW',
  image_cid VARCHAR(255), -- IPFS CID for image
  metadata_cid VARCHAR(255), -- IPFS CID for metadata
  initial_weight DECIMAL(10, 2),
  purchase_price DECIMAL(20, 6),
  status VARCHAR(50) DEFAULT 'minted', -- minted, assigned, slaughtered
  owner_wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supply Chain Events Table
CREATE TABLE IF NOT EXISTS supply_chain_events (
  id SERIAL PRIMARY KEY,
  asset_id BIGINT REFERENCES assets(asset_id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- weight_update, health_check, vaccination, slaughter
  event_data JSONB, -- Flexible JSON data for different event types
  transaction_id VARCHAR(52), -- Algorand transaction ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Log Table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(52) UNIQUE NOT NULL, -- Algorand transaction ID
  from_wallet_id INTEGER REFERENCES wallets(id),
  to_wallet_id INTEGER REFERENCES wallets(id),
  asset_id BIGINT REFERENCES assets(asset_id),
  amount DECIMAL(20, 6),
  transaction_type VARCHAR(50), -- mint, transfer, opt_in, payment
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slaughter Records Table
CREATE TABLE IF NOT EXISTS slaughter_records (
  id SERIAL PRIMARY KEY,
  asset_id BIGINT UNIQUE REFERENCES assets(asset_id) ON DELETE CASCADE,
  facility VARCHAR(255),
  slaughter_date TIMESTAMP NOT NULL,
  final_weight DECIMAL(10, 2),
  gross_price DECIMAL(20, 6),
  expenses DECIMAL(20, 6),
  net_price DECIMAL(20, 6),
  admin_share DECIMAL(20, 6),
  investor_share DECIMAL(20, 6),
  payment_tx_id VARCHAR(52), -- Transaction ID for payment split
  certificate_cid VARCHAR(255), -- IPFS CID for slaughter certificate
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Split Configurations Table
CREATE TABLE IF NOT EXISTS payment_split_configs (
  id SERIAL PRIMARY KEY,
  cattle_type VARCHAR(50) NOT NULL, -- standard, premium, organic
  admin_percentage INTEGER NOT NULL, -- 30, 25, etc.
  investor_percentage INTEGER NOT NULL, -- 70, 75, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_assets_asset_id ON assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_wallet_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_supply_chain_asset ON supply_chain_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_id ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_wallet_id);

-- Insert Default Payment Split Configurations
INSERT INTO payment_split_configs (cattle_type, admin_percentage, investor_percentage) VALUES
  ('standard', 30, 70),
  ('premium', 25, 75),
  ('organic', 20, 80)
ON CONFLICT DO NOTHING;

-- Insert Default Admin Settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('platform_fee', '{"percentage": 2, "min_amount": 0.1}', 'Platform transaction fee configuration'),
  ('min_investment', '{"algo": 1}', 'Minimum investment amount'),
  ('slaughter_enabled', 'true', 'Whether slaughter functionality is enabled')
ON CONFLICT DO NOTHING;

-- Update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Update Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
