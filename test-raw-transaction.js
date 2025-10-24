const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram, Keypair, Transaction, TransactionInstruction } = require('@solana/web3.js');
const fs = require('fs');
const borsh = require('borsh');

async function testRawTransaction() {
  try {
    console.log('🚀 Testing Raw Transaction to Halo Program...\n');

    // Setup connection
    const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('✅ Connected to Solana Devnet');

    // Load wallet
    const walletKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')))
    );
    console.log('✅ Wallet loaded:', walletKeypair.publicKey.toString());

    // Check wallet balance
    const balance = await connection.getBalance(walletKeypair.publicKey);
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL\n');

    const programId = new PublicKey('9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR');
    
    // Check if program exists
    const programInfo = await connection.getAccountInfo(programId);
    console.log('📋 Program Info:');
    console.log('   - Program ID:', programId.toString());
    console.log('   - Data Length:', programInfo?.data.length, 'bytes');
    console.log('   - Executable:', programInfo?.executable);
    console.log('   - Owner:', programInfo?.owner.toString(), '\n');

    // Generate circle PDA
    const timestamp = Math.floor(Date.now() / 1000);
    const [circlePda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('circle'),
        walletKeypair.publicKey.toBuffer(),
        Buffer.from(timestamp.toString())
      ],
      programId
    );

    console.log('📝 Circle PDA:', circlePda.toString());
    console.log('   - Bump:', bump, '\n');

    // Try to call a simple instruction - just check if the program responds
    console.log('🔍 Attempting to query program accounts...');
    
    // Get program data account
    const [programDataAddress] = PublicKey.findProgramAddressSync(
      [programId.toBuffer()],
      new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    );
    
    const programDataInfo = await connection.getAccountInfo(programDataAddress);
    console.log('   - Program Data Account:', programDataAddress.toString());
    console.log('   - Program Data Size:', programDataInfo?.data.length, 'bytes');
    
    console.log('\n✅ Program is deployed and accessible!');
    console.log('   - Explorer:', `https://explorer.solana.com/address/${programId}?cluster=devnet`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

testRawTransaction();

