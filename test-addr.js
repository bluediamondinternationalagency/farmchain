import algosdk from 'algosdk';

const account = algosdk.generateAccount();
console.log('Account.addr type:', typeof account.addr);
console.log('Account.addr.publicKey:', account.addr.publicKey);
console.log('String(account.addr):', String(account.addr));
console.log('account.addr.toString():', account.addr.toString());
