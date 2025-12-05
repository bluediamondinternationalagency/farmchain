import algosdk from 'algosdk';

// Test transaction creation
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

async function testMint() {
  try {
    console.log('Creating test account...');
    const admin = algosdk.generateAccount();
    console.log('Admin object:', admin);
    console.log('Admin.addr type:', typeof admin.addr);
    console.log('Admin.addr:', admin.addr);
    
    // Convert to string properly
    const adminAddress = algosdk.encodeAddress(admin.addr.publicKey);
    console.log('Admin address string:', adminAddress);
    console.log('Admin address string type:', typeof adminAddress);
    
    console.log('\nGetting transaction params...');
    const params = await algodClient.getTransactionParams().do();
    console.log('Params:', params);
    console.log('Params keys:', Object.keys(params));
    console.log('genesisHash type:', typeof params.genesisHash, params.genesisHash instanceof Uint8Array);
    
    // Check if we need to extract specific fields
    const cleanParams = {
      fee: params.fee || params.minFee,
      firstRound: params.firstValid || params.firstRound,
      lastRound: params.lastValid || params.lastRound,
      genesisID: params.genesisID,
      genesisHash: params.genesisHash,
    };
    console.log('\nClean params:', cleanParams);
    
    console.log('\nAttempting minimal transaction...');
    try {
      const txn1 = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: adminAddress,
        total: BigInt(1),
        decimals: 0,
        defaultFrozen: false,
        suggestedParams: params,
      });
      console.log('✅ Minimal transaction works!');
      console.log('Transaction type:', txn1.type);
    } catch (err) {
      console.error('❌ Minimal transaction failed:', err.message);
    }
    
    console.log('\nAttempting with assetName only...');
    try {
      const txn2 = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: adminAddress,
        total: BigInt(1),
        decimals: 0,
        assetName: 'TestCow',
        defaultFrozen: false,
        suggestedParams: params,
      });
      console.log('✅ Transaction with assetName works!');
    } catch (err) {
      console.error('❌ Transaction with assetName failed:', err.message);
    }
    
    console.log('\nAttempting with manager...');
    try {
      const txn3 = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: adminAddress,
        total: BigInt(1),
        decimals: 0,
        assetName: 'TestCow',
        manager: adminAddress,
        defaultFrozen: false,
        suggestedParams: params,
      });
      console.log('✅ Transaction with manager works!');
    } catch (err) {
      console.error('❌ Transaction with manager failed:', err.message);
      console.error('Manager value:', adminAddress, typeof adminAddress);
    }
    
    console.log('\nAttempting to create transaction with Transaction constructor...');
    try {
      const fromPublicKey = algosdk.decodeAddress(adminAddress).publicKey;
      const txn2 = new algosdk.Transaction({
        from: fromPublicKey,
        fee: params.fee,
        firstRound: params.firstRound,
        lastRound: params.lastRound,
        genesisID: params.genesisID,
        genesisHash: params.genesisHash,
        type: 'acfg',
        assetTotal: 1,
        assetDecimals: 0,
        assetDefaultFrozen: false,
        assetUnitName: 'FCLSTK',
        assetName: 'TestCow',
        assetURL: 'https://example.com',
        assetManager: fromPublicKey,
        assetReserve: fromPublicKey,
        note: new TextEncoder().encode('test'),
      });
      console.log('✅ Transaction constructor works!');
      console.log('Transaction type:', txn2.type);
    } catch (err) {
      console.error('❌ Transaction constructor failed:', err.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMint();
