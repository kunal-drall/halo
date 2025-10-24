const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const bip39 = require('bip39');

async function getWalletInfo() {
  try {
    // Read the private key
    const privateKeyArray = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    
    console.log('🔑 WALLET INFORMATION');
    console.log('==================');
    console.log('Wallet Address:', keypair.publicKey.toString());
    console.log('');
    console.log('Private Key (Base64):', keypair.secretKey.toString('base64'));
    console.log('');
    console.log('Private Key (Array):', JSON.stringify(Array.from(keypair.secretKey)));
    console.log('');
    
    // Generate a seed phrase (this is a simplified approach)
    // Note: This is not the original seed phrase, but a way to import this key
    const seed = keypair.secretKey.slice(0, 32);
    const mnemonic = bip39.entropyToMnemonic(seed.toString('hex'));
    
    console.log('📝 IMPORT MNEMONIC (for wallet import):');
    console.log(mnemonic);
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('- Keep this information secure and private');
    console.log('- Never share your private key or seed phrase');
    console.log('- This wallet has 5.77 SOL on devnet');
    console.log('- Use only for development/testing purposes');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getWalletInfo();
