// Test script to verify admin wallet and connection
import algosdk from 'algosdk';

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

async function testConnection() {
  console.log('🔍 Testing Algorand TestNet connection...\n');
  
  try {
    // Test 1: Check network health
    console.log('1️⃣ Checking network status...');
    const health = await algodClient.healthCheck().do();
    console.log('✅ Network is healthy\n');
    
    // Test 2: Get network params
    console.log('2️⃣ Getting transaction parameters...');
    const params = await algodClient.getTransactionParams().do();
    console.log('✅ Network params received:');
    console.log(`   - Current round: ${params.firstRound}`);
    console.log(`   - Min fee: ${params.minFee} microALGO`);
    console.log(`   - Genesis ID: ${params.genesisID}\n`);
    
    // Test 3: Check admin wallet (if exists in localStorage)
    if (typeof window !== 'undefined' && window.localStorage) {
      const adminMnemonic = localStorage.getItem('fc_admin_mnemonic');
      if (adminMnemonic) {
        console.log('3️⃣ Checking admin wallet...');
        const admin = algosdk.mnemonicToSecretKey(adminMnemonic);
        console.log(`✅ Admin address: ${admin.addr}`);
        
        const accountInfo = await algodClient.accountInformation(admin.addr).do();
        const balance = accountInfo.amount / 1000000;
        
        console.log(`   - Balance: ${balance.toFixed(6)} ALGO`);
        console.log(`   - Min balance: ${accountInfo['min-balance'] / 1000000} ALGO`);
        console.log(`   - Can mint: ${balance >= 0.2 ? '✅ YES' : '❌ NO (need 0.2+ ALGO)'}\n`);
        
        if (balance < 0.2) {
          console.log('⚠️  Fund your wallet at:');
          console.log(`   https://bank.testnet.algorand.network/?account=${admin.addr}\n`);
        }
      } else {
        console.log('3️⃣ No admin wallet found in localStorage');
        console.log('   Creating one now...');
        const newAccount = algosdk.generateAccount();
        const mnemonic = algosdk.secretKeyToMnemonic(newAccount.sk);
        localStorage.setItem('fc_admin_mnemonic', mnemonic);
        console.log(`✅ New admin address: ${newAccount.addr}`);
        console.log(`   Fund it at: https://bank.testnet.algorand.network/?account=${newAccount.addr}\n`);
      }
    }
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testConnection();
