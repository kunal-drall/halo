const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function testCreateCircle() {
  try {
    console.log('🚀 Testing Circle Creation on Solana Devnet...\n');

    // Setup connection
    const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('✅ Connected to Solana Devnet');

    // Load wallet
    const walletKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')))
    );
    const wallet = new anchor.Wallet(walletKeypair);
    console.log('✅ Wallet loaded:', wallet.publicKey.toString());

    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL\n');

    if (balance < 0.01 * 1e9) {
      console.log('❌ Insufficient balance. Need at least 0.01 SOL for testing.');
      return;
    }

    // Setup provider
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    anchor.setProvider(provider);

    // Load IDL
    const idl = JSON.parse(fs.readFileSync('./target/idl/halo_protocol.json', 'utf-8'));
    console.log('✅ IDL loaded');
    console.log('   - Instructions:', idl.instructions.length);
    console.log('   - Accounts:', idl.accounts?.length || 0);
    console.log('   - Program ID in IDL:', idl.address, '\n');

    // Get program
    const programId = new PublicKey('9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR');
    console.log('📋 Program ID:', programId.toString());

    // Check if program exists
    const programInfo = await connection.getAccountInfo(programId);
    if (!programInfo) {
      console.log('❌ Program not found on-chain!');
      return;
    }
    console.log('✅ Program found on-chain');
    console.log('   - Size:', programInfo.data.length, 'bytes');
    console.log('   - Executable:', programInfo.executable, '\n');

    // Create program instance
    let program;
    try {
      program = new anchor.Program(idl, programId, provider);
      console.log('✅ Program instance created');
      console.log('   - Methods available:', Object.keys(program.methods).join(', '), '\n');
    } catch (error) {
      console.log('❌ Error creating program instance:', error.message);
      return;
    }

    // Generate circle PDA
    const timestamp = Math.floor(Date.now() / 1000);
    const [circlePda, circleBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('circle'),
        wallet.publicKey.toBuffer(),
        Buffer.from(timestamp.toString())
      ],
      programId
    );

    console.log('📝 Creating circle with:');
    console.log('   - Circle PDA:', circlePda.toString());
    console.log('   - Creator:', wallet.publicKey.toString());
    console.log('   - Contribution Amount: 1 SOL');
    console.log('   - Duration: 12 months');
    console.log('   - Max Members: 10');
    console.log('   - Penalty Rate: 500 (5%)\n');

    // Generate escrow PDA
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), circlePda.toBuffer()],
      programId
    );
    console.log('   - Escrow PDA:', escrowPda.toString());

    // Create circle
    const tx = await program.methods
      .initializeCircle(
        new anchor.BN(1 * 1e9), // 1 SOL
        12, // 12 months
        10, // 10 members
        500 // 5% penalty
      )
      .accounts({
        circle: circlePda,
        escrow: escrowPda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Circle created successfully!');
    console.log('   - Transaction:', tx);
    console.log('   - Circle Address:', circlePda.toString());
    console.log('   - Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);

    // Fetch the created circle
    const circleAccount = await program.account.circle.fetch(circlePda);
    console.log('📊 Circle Data:');
    console.log('   - Creator:', circleAccount.creator.toString());
    console.log('   - Contribution Amount:', circleAccount.contributionAmount.toString(), 'lamports');
    console.log('   - Duration:', circleAccount.durationMonths, 'months');
    console.log('   - Max Members:', circleAccount.maxMembers);
    console.log('   - Current Members:', circleAccount.members?.length || 0);
    console.log('   - Status:', circleAccount.status);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.logs) {
      console.log('\n📝 Program Logs:');
      error.logs.forEach(log => console.log('   ', log));
    }
  }
}

testCreateCircle();

