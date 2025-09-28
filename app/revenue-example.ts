import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  createAssociatedTokenAccount,
} from "@solana/spl-token";

async function runRevenueExample() {
  console.log("🚀 Halo Protocol Revenue Module Example");
  console.log("=====================================");

  // Setup connection and provider
  const connection = new web3.Connection("http://localhost:8899", "confirmed");
  const wallet = web3.Keypair.generate();
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Load program
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;

  console.log("Program ID:", program.programId.toString());

  // Airdrop SOL to wallet
  try {
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("✅ Airdropped SOL to wallet");
  } catch (error) {
    console.log("⚠️ Airdrop failed:", error.message);
  }

  // =============================================================================
  // Step 1: Initialize Revenue Module
  // =============================================================================
  console.log("\n📋 Step 1: Initialize Revenue Module");

  // Create test token
  const mint = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    null,
    6 // USDC-like decimals
  );
  console.log("✅ Created test token:", mint.toString());

  // Generate PDAs
  const [treasury] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    program.programId
  );

  const [revenueParams] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("revenue_params")],
    program.programId
  );

  // Create treasury token account
  const treasuryTokenAccount = await createAccount(
    connection,
    wallet,
    mint,
    treasury,
    wallet
  );

  // Initialize treasury
  try {
    await program.methods
      .initializeTreasury()
      .accounts({
        treasury: treasury,
        authority: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log("✅ Treasury initialized");
  } catch (error) {
    console.log("⚠️ Treasury initialization failed:", error.message);
  }

  // Initialize revenue parameters
  try {
    await program.methods
      .initializeRevenueParams()
      .accounts({
        revenueParams: revenueParams,
        authority: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log("✅ Revenue parameters initialized with defaults");
    
    const paramsData = await program.account.revenueParams.fetch(revenueParams);
    console.log(`   - Distribution fee: ${paramsData.distributionFeeRate / 100}%`);
    console.log(`   - Yield fee: ${paramsData.yieldFeeRate / 100}%`);
    console.log(`   - Management fee: ${paramsData.managementFeeRate / 100}% annually`);
  } catch (error) {
    console.log("⚠️ Revenue params initialization failed:", error.message);
  }

  // =============================================================================
  // Step 2: Demonstrate Governance (Parameter Updates)
  // =============================================================================
  console.log("\n📋 Step 2: Demonstrate Governance");

  try {
    // Update fee rates
    await program.methods
      .updateRevenueParams(
        75,  // 0.75% distribution fee
        50,  // 0.5% yield fee  
        250, // 2.5% management fee
        new BN(15 * 24 * 60 * 60) // 15 days interval
      )
      .accounts({
        revenueParams: revenueParams,
        authority: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();

    const updatedParams = await program.account.revenueParams.fetch(revenueParams);
    console.log("✅ Revenue parameters updated by governance");
    console.log(`   - New distribution fee: ${updatedParams.distributionFeeRate / 100}%`);
    console.log(`   - New yield fee: ${updatedParams.yieldFeeRate / 100}%`);
    console.log(`   - New management fee: ${updatedParams.managementFeeRate / 100}% annually`);
  } catch (error) {
    console.log("⚠️ Parameter update failed:", error.message);
  }

  // =============================================================================
  // Step 3: Demonstrate Yield Fee Collection
  // =============================================================================
  console.log("\n📋 Step 3: Demonstrate Yield Fee Collection");

  try {
    // Create user token accounts
    const userTokenAccount = await createAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    const walletTokenAccount = await createAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    // Mint tokens to simulate yield
    const yieldAmount = new BN(1_000_000); // 1 token
    await mintTo(
      connection,
      wallet,
      mint,
      walletTokenAccount,
      wallet,
      yieldAmount.toNumber()
    );

    const initialTreasuryBalance = (await getAccount(connection, treasuryTokenAccount)).amount;
    const initialUserBalance = (await getAccount(connection, userTokenAccount)).amount;

    // Distribute yield with fee collection
    await program.methods
      .distributeYield(yieldAmount)
      .accounts({
        treasury: treasury,
        revenueParams: revenueParams,
        authority: wallet.publicKey,
        sourceTokenAccount: walletTokenAccount,
        recipientTokenAccount: userTokenAccount,
        treasuryTokenAccount: treasuryTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([wallet])
      .rpc();

    const newTreasuryBalance = (await getAccount(connection, treasuryTokenAccount)).amount;
    const newUserBalance = (await getAccount(connection, userTokenAccount)).amount;
    
    const feeCollected = Number(newTreasuryBalance - initialTreasuryBalance);
    const userReceived = Number(newUserBalance - initialUserBalance);

    console.log("✅ Yield distributed with fee collection");
    console.log(`   - Yield amount: ${yieldAmount.toNumber() / 1_000_000} tokens`);
    console.log(`   - Fee collected: ${feeCollected / 1_000_000} tokens`);
    console.log(`   - User received: ${userReceived / 1_000_000} tokens`);
    console.log(`   - Fee rate: ${(feeCollected / yieldAmount.toNumber() * 100).toFixed(2)}%`);
  } catch (error) {
    console.log("⚠️ Yield distribution failed:", error.message);
  }

  // =============================================================================
  // Step 4: Revenue Reporting
  // =============================================================================
  console.log("\n📋 Step 4: Revenue Reporting");

  try {
    const periodStart = new BN(Math.floor(Date.now() / 1000) - 86400); // 24 hours ago
    const periodEnd = new BN(Math.floor(Date.now() / 1000));
    
    const [revenueReport] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("revenue_report"),
        periodStart.toArray("le", 8),
        periodEnd.toArray("le", 8),
      ],
      program.programId
    );

    await program.methods
      .createRevenueReport(periodStart, periodEnd)
      .accounts({
        revenueReport: revenueReport,
        treasury: treasury,
        authority: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    const reportData = await program.account.revenueReport.fetch(revenueReport);
    console.log("✅ Revenue report created");
    console.log(`   - Period: ${new Date(periodStart.toNumber() * 1000).toISOString()} to ${new Date(periodEnd.toNumber() * 1000).toISOString()}`);
    console.log(`   - Total fees: ${reportData.totalPeriodFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Distribution fees: ${reportData.periodDistributionFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Yield fees: ${reportData.periodYieldFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Management fees: ${reportData.periodManagementFees.toNumber() / 1_000_000} tokens`);
  } catch (error) {
    console.log("⚠️ Revenue report creation failed:", error.message);
  }

  // =============================================================================
  // Step 5: Final Treasury Status
  // =============================================================================
  console.log("\n📋 Step 5: Final Treasury Status");

  try {
    const treasuryData = await program.account.treasury.fetch(treasury);
    const tokenBalance = (await getAccount(connection, treasuryTokenAccount)).amount;

    console.log("✅ Treasury Summary:");
    console.log(`   - Total fees collected: ${treasuryData.totalFeesCollected.toNumber() / 1_000_000} tokens`);
    console.log(`   - Distribution fees: ${treasuryData.distributionFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Yield fees: ${treasuryData.yieldFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Management fees: ${treasuryData.managementFees.toNumber() / 1_000_000} tokens`);
    console.log(`   - Actual token balance: ${Number(tokenBalance) / 1_000_000} tokens`);
    console.log(`   - Treasury authority: ${treasuryData.authority.toString()}`);
  } catch (error) {
    console.log("⚠️ Treasury status check failed:", error.message);
  }

  console.log("\n🎉 Revenue Module Example Completed!");
  console.log("\nKey Features Demonstrated:");
  console.log("- ✅ Treasury initialization and management");
  console.log("- ✅ Governance-controlled fee parameter updates");
  console.log("- ✅ Automated fee collection on yield distribution (0.5% default)");
  console.log("- ✅ Revenue reporting and analytics");
  console.log("- ✅ Secure PDA-based treasury with proper accounting");
}

// Run the example
runRevenueExample().catch((error) => {
  console.error("❌ Example failed:", error);
  process.exit(1);
});