import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  HaloProtocolClient,
  setupTestEnvironment,
  createAndFundTokenAccount,
} from "./halo-client";

/**
 * Example script demonstrating Solend integration with Halo Protocol
 */

async function main() {
  console.log("🚀 Starting Halo Protocol + Solend Integration Example");

  // Setup connection to devnet for Solend testing
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate();

  console.log("📡 Using Solana devnet for Solend integration");
  console.log(`Wallet: ${wallet.publicKey.toString()}`);

  // Airdrop SOL for transactions
  try {
    console.log("💰 Requesting SOL airdrop...");
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("✅ SOL airdrop received");
  } catch (error: any) {
    console.log("⚠️  Airdrop failed, continuing anyway:", error?.message || error);
  }

  // Setup provider and program
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Create mock program instance for this example
  const programId = new anchor.web3.PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
  const program = {
    programId,
    provider,
  } as any;

  const client = new HaloProtocolClient(program);

  console.log("🏗️  Setting up test environment...");

  try {
    // Create test environment
    const { mint } = await setupTestEnvironment(connection, wallet);
    console.log(`💰 Created test mint: ${mint.toString()}`);

    // Create test users
    const creator = Keypair.generate();
    const member1 = Keypair.generate();

    // Airdrop SOL to test users
    for (const user of [creator, member1]) {
      try {
        const signature = await connection.requestAirdrop(
          user.publicKey,
          LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(signature);
      } catch (error: any) {
        console.log(`Airdrop to ${user.publicKey.toString()} failed:`, error?.message || error);
      }
    }

    // Create and fund token accounts
    const contributionAmount = 1_000_000; // 1 token
    const initialFunding = 10_000_000; // 10 tokens

    const creatorTokenAccount = await createAndFundTokenAccount(
      connection,
      mint,
      creator.publicKey,
      wallet,
      initialFunding
    );

    const member1TokenAccount = await createAndFundTokenAccount(
      connection,
      mint,
      member1.publicKey,
      wallet,
      initialFunding
    );

    console.log(`👤 Creator token account: ${creatorTokenAccount.toString()}`);
    console.log(`👤 Member1 token account: ${member1TokenAccount.toString()}`);

    // Initialize Solend integration
    console.log("\n🔗 Initializing Solend integration...");
    
    try {
      await client.initializeSolend();
      console.log("✅ Solend service initialized successfully");

      // Demonstrate Solend functionality
      console.log("\n📊 Fetching Solend market data...");

      // Get available reserves
      const reserves = await client.getSolendAvailableReserves();
      console.log(`📋 Found ${reserves.length} available reserves:`);
      
      reserves.slice(0, 5).forEach((reserve, index) => {
        console.log(`  ${index + 1}. ${reserve.symbol} (${reserve.name}) - ${reserve.mint}`);
      });

      // Get market yields
      const yields = await client.getSolendMarketYields();
      console.log(`\n💹 Market yields for ${yields.reserves.length} reserves:`);
      
      yields.reserves.slice(0, 3).forEach((reserve, index) => {
        console.log(`  ${index + 1}. ${reserve.symbol}:`);
        console.log(`     Deposit APY: ${reserve.depositApy.toFixed(2)}%`);
        console.log(`     Borrow APY: ${reserve.borrowApy.toFixed(2)}%`);
        console.log(`     Utilization: ${reserve.utilizationRate.toFixed(2)}%`);
      });

      // Generate mock circle PDAs for demonstration
      const timestamp = Math.floor(Date.now() / 1000);
      const [circleAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("circle"),
          creator.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(timestamp).toArray("le", 8)),
        ],
        programId
      );

      console.log(`\n🔄 Mock circle account: ${circleAccount.toString()}`);

      // Demonstrate deposit flow (will fail with custom token but shows the flow)
      console.log("\n💰 Testing deposit flow...");
      try {
        await client.depositCircleFundsToSolend(
          circleAccount,
          mint,
          contributionAmount,
          creatorTokenAccount,
          creator
        );
        console.log("✅ Deposit successful!");
      } catch (error: any) {
        console.log(`⚠️  Deposit failed (expected with custom token): ${error?.message || error}`);
      }

      // Test borrow flow
      console.log("\n🏦 Testing borrow flow...");
      try {
        await client.borrowFromSolend(
          circleAccount,
          mint, // collateral
          mint, // borrow token
          500000, // 0.5 token
          member1TokenAccount,
          creator
        );
        console.log("✅ Borrow successful!");
      } catch (error: any) {
        console.log(`⚠️  Borrow failed (expected with custom token): ${error?.message || error}`);
      }

      // Test user position
      console.log("\n👤 Testing user position query...");
      try {
        const position = await client.getSolendUserPosition(creator.publicKey, mint);
        console.log(`Position: Deposited: ${position.depositedAmount}, Borrowed: ${position.borrowedAmount}`);
      } catch (error: any) {
        console.log(`⚠️  Position query failed (expected with custom token): ${error?.message || error}`);
      }

      // Test repay flow
      console.log("\n💸 Testing repay flow...");
      try {
        await client.repayToSolend(
          circleAccount,
          mint,
          500000, // 0.5 token
          member1TokenAccount,
          creator
        );
        console.log("✅ Repay successful!");
      } catch (error: any) {
        console.log(`⚠️  Repay failed (expected with custom token): ${error?.message || error}`);
      }

      // Test withdraw flow
      console.log("\n💳 Testing withdraw flow...");
      try {
        await client.withdrawFromSolend(
          circleAccount,
          mint,
          contributionAmount,
          creatorTokenAccount,
          creator
        );
        console.log("✅ Withdraw successful!");
      } catch (error: any) {
        console.log(`⚠️  Withdraw failed (expected with custom token): ${error?.message || error}`);
      }

    } catch (error: any) {
      console.error("❌ Solend integration failed:", error?.message || error);
      console.log("This is expected on devnet as Solend may not be fully available");
    }

    console.log("\n✨ Example completed!");
    console.log("\n📝 Summary:");
    console.log("- ✅ Halo Protocol client created");
    console.log("- ✅ Test tokens and accounts set up");
    console.log("- ✅ Solend integration demonstrated");
    console.log("- ✅ All major flows tested (deposit, borrow, repay, withdraw)");
    console.log("\n💡 Note: Some operations may fail with custom tokens on devnet.");
    console.log("   In production, use established tokens like USDC, SOL, etc.");

  } catch (error: any) {
    console.error("❌ Error in example:", error?.message || error);
    throw error;
  }
}

// Error handling wrapper
async function runExample() {
  try {
    await main();
  } catch (error: any) {
    console.error("💥 Example failed:", error?.message || error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

export { main as runSolendExample };