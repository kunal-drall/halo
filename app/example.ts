import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  HaloProtocolClient,
  setupTestEnvironment,
  createAndFundTokenAccount,
} from "./halo-client";

/**
 * Example script demonstrating Halo Protocol usage
 */

async function main() {
  // Setup connection and provider
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const wallet = Keypair.generate();

  // Airdrop SOL for transactions
  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);

  // Setup provider and program
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = anchor.workspace.HaloProtocol as anchor.Program<HaloProtocol>;
  const client = new HaloProtocolClient(program);

  console.log("🏗️  Setting up test environment...");

  // Create test environment
  const { mint } = await setupTestEnvironment(connection, wallet);
  console.log(`💰 Created mint: ${mint.toString()}`);

  // Create test users
  const creator = Keypair.generate();
  const member1 = Keypair.generate();
  const member2 = Keypair.generate();

  // Airdrop SOL to all users
  for (const user of [creator, member1, member2]) {
    const signature = await connection.requestAirdrop(
      user.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
  }

  // Create and fund token accounts
  const contributionAmount = 1_000_000; // 1 token
  const stakeAmount = 2_000_000; // 2 tokens
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

  const member2TokenAccount = await createAndFundTokenAccount(
    connection,
    mint,
    member2.publicKey,
    wallet,
    initialFunding
  );

  console.log("👥 Created and funded user token accounts");

  // Step 1: Create a circle
  console.log("\n🔄 Step 1: Creating ROSCA circle...");
  const { circleAccount, escrowAccount } = await client.createCircle(
    creator,
    contributionAmount,
    3, // 3 months
    3, // max 3 members
    1000 // 10% penalty rate
  );

  console.log(`✅ Circle created: ${circleAccount.toString()}`);
  console.log(`🔒 Escrow account: ${escrowAccount.toString()}`);

  // Create escrow token account
  const escrowTokenAccount = await createAndFundTokenAccount(
    connection,
    mint,
    escrowAccount,
    wallet,
    0
  );

  // Step 2: Members join the circle
  console.log("\n👋 Step 2: Members joining circle...");

  const { memberAccount: member1Account } = await client.joinCircle(
    member1,
    circleAccount,
    escrowAccount,
    member1TokenAccount,
    escrowTokenAccount,
    stakeAmount
  );
  console.log(`✅ Member 1 joined: ${member1Account.toString()}`);

  const { memberAccount: member2Account } = await client.joinCircle(
    member2,
    circleAccount,
    escrowAccount,
    member2TokenAccount,
    escrowTokenAccount,
    stakeAmount
  );
  console.log(`✅ Member 2 joined: ${member2Account.toString()}`);

  // Check circle status
  const circleInfo = await client.getCircleInfo(circleAccount);
  console.log(`📊 Circle now has ${circleInfo.currentMembers} members`);

  // Step 3: Members make contributions
  console.log("\n💰 Step 3: Making contributions...");

  await client.contribute(
    member1,
    circleAccount,
    member1Account,
    escrowAccount,
    member1TokenAccount,
    escrowTokenAccount,
    contributionAmount
  );
  console.log("✅ Member 1 contributed");

  await client.contribute(
    member2,
    circleAccount,
    member2Account,
    escrowAccount,
    member2TokenAccount,
    escrowTokenAccount,
    contributionAmount
  );
  console.log("✅ Member 2 contributed");

  // Check updated circle info
  const updatedCircleInfo = await client.getCircleInfo(circleAccount);
  console.log(`💵 Total pot: ${updatedCircleInfo.totalPot.toString()} tokens`);

  // Step 4: Distribute pot
  console.log("\n🎁 Step 4: Distributing monthly pot...");

  await client.distributePot(
    creator,
    circleAccount,
    member1Account,
    escrowAccount,
    member1TokenAccount,
    escrowTokenAccount
  );
  console.log("✅ Pot distributed to Member 1");

  // Check member status
  const member1Info = await client.getMemberInfo(member1Account);
  console.log(`🏆 Member 1 has received pot: ${member1Info.hasReceivedPot}`);

  // Display final stats
  console.log("\n📈 Final Status:");
  console.log("================");

  const finalCircleInfo = await client.getCircleInfo(circleAccount);
  console.log(`Circle Status: ${JSON.stringify(finalCircleInfo.status)}`);
  console.log(`Total Members: ${finalCircleInfo.currentMembers}`);
  console.log(`Current Month: ${finalCircleInfo.currentMonth}`);
  console.log(`Total Contributions: ${finalCircleInfo.totalPot.toString()}`);

  const escrowInfo = await client.getEscrowInfo(escrowAccount);
  console.log(`Escrow Balance: ${escrowInfo.totalAmount.toString()}`);

  console.log("\n🎉 Example completed successfully!");
}

// Run the example
main().catch(console.error);
