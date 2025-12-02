import algosdk from 'algosdk';
import { encrypt, decrypt } from '../utils/encryption';
import { Pool } from 'pg';

// Setup Algorand Client (Testnet)
const algodToken = process.env.ALGO_NODE_TOKEN || '';
const algodServer = process.env.ALGO_NODE_URL || 'https://testnet-api.algonode.cloud';
const algodPort = '';
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Master Wallet (Funder)
const MASTER_MNEMONIC = process.env.MASTER_MNEMONIC || '';
let masterAccount: algosdk.Account;
try {
  masterAccount = algosdk.mnemonicToSecretKey(MASTER_MNEMONIC);
} catch (e) {
  console.error("Failed to load master account. Check env vars.");
}

export const createCustodialWallet = () => {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  const { encryptedData, iv } = encrypt(mnemonic);
  
  return {
    address: account.addr.toString(), // Ensure string return
    encryptedSk: encryptedData,
    iv: iv,
    mnemonic: mnemonic // Only return this once to the user or never (pure custodial)
  };
};

export const fundNewWallet = async (targetAddress: string) => {
  if (!masterAccount) throw new Error("Master account not configured");

  const params = await algodClient.getTransactionParams().do();
  
  // Fund with 1 ALGO (1,000,000 microAlgos) for opt-ins and basic txns
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: masterAccount.addr.toString(),
    receiver: targetAddress,
    amount: 1000000, 
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(masterAccount.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = (response as any).txId;
  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
};

// Helper to recover signer from DB info
const getAccountFromEncrypted = (encryptedSk: string, iv: string): algosdk.Account => {
  const mnemonic = decrypt(encryptedSk, iv);
  return algosdk.mnemonicToSecretKey(mnemonic);
};

export const mintCowNFT = async (
  ownerEncryptedSk: string, 
  ownerIv: string, 
  metadata: any
) => {
  // recover account
  const ownerAccount = getAccountFromEncrypted(ownerEncryptedSk, ownerIv);
  const params = await algodClient.getTransactionParams().do();

  // Create ASA (ARC-3 compliant)
  // Note: In a real scenario, upload metadata to IPFS first and get the CID
  const ipfsUrl = `ipfs://QmPlaceholderHash/${metadata.name}`; 
  const metadataHash = new Uint8Array(32); // Placeholder hash

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: ownerAccount.addr.toString(),
    total: 1,
    decimals: 0,
    assetName: `COW-${metadata.name}`,
    unitName: 'COW',
    assetURL: ipfsUrl,
    assetMetadataHash: metadataHash,
    defaultFrozen: false,
    manager: ownerAccount.addr.toString(),
    reserve: ownerAccount.addr.toString(),
    freeze: ownerAccount.addr.toString(),
    clawback: ownerAccount.addr.toString(),
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(ownerAccount.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = (response as any).txId;
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
  const assetIndex = result['asset-index'];
  
  return assetIndex;
};

export const optInToAsset = async (
  walletEncryptedSk: string,
  walletIv: string,
  assetId: number
) => {
  const account = getAccountFromEncrypted(walletEncryptedSk, walletIv);
  const params = await algodClient.getTransactionParams().do();

  // Opt-in is a 0 amount transfer to self
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: account.addr.toString(),
    receiver: account.addr.toString(),
    assetIndex: assetId,
    amount: 0,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(account.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = (response as any).txId;
  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
};

export const transferAsset = async (
  fromEncryptedSk: string,
  fromIv: string,
  toAddress: string,
  assetId: number
) => {
  const fromAccount = getAccountFromEncrypted(fromEncryptedSk, fromIv);
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: fromAccount.addr.toString(),
    receiver: toAddress,
    assetIndex: assetId,
    amount: 1,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(fromAccount.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = (response as any).txId;
  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
}