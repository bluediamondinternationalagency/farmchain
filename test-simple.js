import algosdk from 'algosdk';

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

async function testTransaction() {
  const admin = algosdk.generateAccount();
  const adminAddress = admin.addr.toString();
  
  console.log('Address:', adminAddress);
  console.log('Type:', typeof adminAddress);
  
  const params = await algodClient.getTransactionParams().do();
  
  try {
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: adminAddress,
      total: BigInt(1),
      decimals: 0,
      assetName: 'TestCow',
      unitName: 'FCLSTK',
      assetURL: 'https://example.com',
      defaultFrozen: false,
      manager: adminAddress,
      reserve: adminAddress,
      note: new TextEncoder().encode('test'),
      suggestedParams: params,
    });
    console.log('✅ Transaction created successfully!');
    console.log('Transaction from:', algosdk.encodeAddress(txn.from.publicKey));
  } catch (err) {
    console.error('❌ Failed:', err.message);
    console.error(err);
  }
}

testTransaction();
