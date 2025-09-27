import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import { HaloProtocolClient } from "./halo-client";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";

/**
 * Switchboard Oracle Automation Example
 * 
 * This script demonstrates how to:
 * 1. Initialize automation state
 * 2. Create a circle with automation
 * 3. Set up Switchboard integration
 * 4. Schedule automated tasks
 * 5. Monitor and execute automation
 */

async function runAutomationExample() {
  console.log("🚀 Starting Switchboard Oracle Automation Example...\n");

  // Initialize provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  const client = new HaloProtocolClient(program);

  // Create test accounts
  const authority = anchor.web3.Keypair.generate();
  const creator = anchor.web3.Keypair.generate();
  const member1 = anchor.web3.Keypair.generate();
  const member2 = anchor.web3.Keypair.generate();

  console.log("🔑 Created test keypairs");
  console.log("Authority:", authority.publicKey.toString());
  console.log("Creator:", creator.publicKey.toString());
  console.log("Member1:", member1.publicKey.toString());
  console.log("Member2:", member2.publicKey.toString());

  // Airdrop SOL
  await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  await provider.connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  await provider.connection.requestAirdrop(member1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  await provider.connection.requestAirdrop(member2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

  console.log("💰 Airdropped SOL to all accounts");

  // Create test token and accounts
  const mint = await createMint(
    provider.connection,
    authority,
    authority.publicKey,
    null,
    6
  );

  const creatorTokenAccount = await createAccount(
    provider.connection,
    creator,
    mint,
    creator.publicKey
  );

  const member1TokenAccount = await createAccount(
    provider.connection,
    member1,
    mint,
    member1.publicKey
  );

  const member2TokenAccount = await createAccount(
    provider.connection,
    member2,
    mint,
    member2.publicKey
  );

  // Mint tokens
  await mintTo(provider.connection, authority, mint, creatorTokenAccount, authority, 10000000000);
  await mintTo(provider.connection, authority, mint, member1TokenAccount, authority, 10000000000);
  await mintTo(provider.connection, authority, mint, member2TokenAccount, authority, 10000000000);

  console.log("🪙 Created token mint and accounts:", mint.toString());

  // =============================================================================
  // Step 1: Initialize Automation State
  // =============================================================================
  console.log("\n📋 Step 1: Initialize Automation State");

  // Mock Switchboard queue (in practice, this would be a real Switchboard queue)
  const mockSwitchboardQueue = anchor.web3.Keypair.generate();
  const minInterval = 3600; // 1 hour

  try {
    const { tx: automationTx, automationStateAccount } = await client.initializeAutomationState(
      authority,
      mockSwitchboardQueue.publicKey,
      minInterval
    );

    console.log("✅ Automation state initialized");
    console.log("Transaction:", automationTx);
    console.log("Automation State Account:", automationStateAccount.toString());

    const automationState = await client.getAutomationState();
    console.log("Min Interval:", automationState.minInterval.toString(), "seconds");
    console.log("Enabled:", automationState.enabled);
    console.log("Active Jobs:", automationState.activeJobs);
  } catch (error) {
    console.error("❌ Failed to initialize automation state:", error.message);
    return;
  }

  // =============================================================================
  // Step 2: Create Circle with Automation
  // =============================================================================
  console.log("\n📋 Step 2: Create Circle with Automation");

  const contributionAmount = new anchor.BN(1000_000); // 1 token
  const durationMonths = 3;
  const maxMembers = 3;
  const penaltyRate = 1000; // 10%

  // Generate circle PDA
  const timestamp = Date.now();
  const [circleAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("circle"),
      creator.publicKey.toBuffer(),
      Buffer.from(timestamp.toString())
    ],
    program.programId
  );

  const [escrowAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circleAccount.toBuffer()],
    program.programId
  );

  // Create escrow token account
  const escrowTokenAccount = await createAccount(
    provider.connection,
    creator,
    mint,
    escrowAccount,
    true
  );

  try {
    // Create circle
    const circleTx = await program.methods
      .initializeCircle(contributionAmount, durationMonths, maxMembers, penaltyRate)
      .accounts({
        circle: circleAccount,
        escrow: escrowAccount,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();

    console.log("✅ Circle created");
    console.log("Transaction:", circleTx);
    console.log("Circle Account:", circleAccount.toString());

    // Setup automation for the circle
    const mockSwitchboardJob = anchor.web3.Keypair.generate();
    const { tx: automationSetupTx, circleAutomationAccount } = await client.setupCircleAutomation(
      circleAccount,
      creator,
      mockSwitchboardJob.publicKey,
      true, // auto collect
      true, // auto distribute
      true  // auto penalty
    );

    console.log("✅ Circle automation setup");
    console.log("Transaction:", automationSetupTx);
    console.log("Circle Automation Account:", circleAutomationAccount.toString());

    const circleAutomation = await client.getCircleAutomation(circleAccount);
    console.log("Auto Collect Enabled:", circleAutomation.autoCollectEnabled);
    console.log("Auto Distribute Enabled:", circleAutomation.autoDistributeEnabled);
    console.log("Auto Penalty Enabled:", circleAutomation.autoPenaltyEnabled);
    console.log("Contribution Schedule Length:", circleAutomation.contributionSchedule.length);
    console.log("Distribution Schedule Length:", circleAutomation.distributionSchedule.length);
    console.log("Penalty Schedule Length:", circleAutomation.penaltySchedule.length);

  } catch (error) {
    console.error("❌ Failed to create circle or setup automation:", error.message);
    return;
  }

  // =============================================================================
  // Step 3: Add Members
  // =============================================================================
  console.log("\n📋 Step 3: Add Members");

  const stakeAmount = contributionAmount.mul(new anchor.BN(2)); // 2x stake for newcomers

  // Generate member PDAs
  const [member1Account] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circleAccount.toBuffer(), member1.publicKey.toBuffer()],
    program.programId
  );

  const [member2Account] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circleAccount.toBuffer(), member2.publicKey.toBuffer()],
    program.programId
  );

  try {
    // Member 1 joins
    await program.methods
      .joinCircle(stakeAmount)
      .accounts({
        circle: circleAccount,
        member: member1Account,
        escrow: escrowAccount,
        memberAuthority: member1.publicKey,
        trustScore: null,
        memberTokenAccount: member1TokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([member1])
      .rpc();

    // Member 2 joins
    await program.methods
      .joinCircle(stakeAmount)
      .accounts({
        circle: circleAccount,
        member: member2Account,
        escrow: escrowAccount,
        memberAuthority: member2.publicKey,
        trustScore: null,
        memberTokenAccount: member2TokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([member2])
      .rpc();

    console.log("✅ Members joined circle");
    console.log("Member 1 Account:", member1Account.toString());
    console.log("Member 2 Account:", member2Account.toString());

  } catch (error) {
    console.error("❌ Failed to add members:", error.message);
    return;
  }

  // =============================================================================
  // Step 4: Monitor Automation Events
  // =============================================================================
  console.log("\n📋 Step 4: Monitor Automation Events");

  try {
    // Get next scheduled events
    const nextEvents = await client.getNextAutomationEvents(circleAccount);
    console.log("Next Events:");
    console.log("- Contribution:", nextEvents.nextContribution ? new Date(nextEvents.nextContribution * 1000).toISOString() : "None");
    console.log("- Distribution:", nextEvents.nextDistribution ? new Date(nextEvents.nextDistribution * 1000).toISOString() : "None");
    console.log("- Penalty:", nextEvents.nextPenalty ? new Date(nextEvents.nextPenalty * 1000).toISOString() : "None");

    // Check if it's time for any automation
    const timeForContribution = await client.isTimeForContributionCollection(circleAccount);
    const timeForDistribution = await client.isTimeForPayoutDistribution(circleAccount);
    const timeForPenalty = await client.isTimeForPenaltyEnforcement(circleAccount);

    console.log("\nCurrent Time Checks:");
    console.log("- Time for contribution collection:", timeForContribution);
    console.log("- Time for payout distribution:", timeForDistribution);
    console.log("- Time for penalty enforcement:", timeForPenalty);

  } catch (error) {
    console.error("❌ Failed to monitor automation events:", error.message);
  }

  // =============================================================================
  // Step 5: Test Automation Triggers
  // =============================================================================
  console.log("\n📋 Step 5: Test Automation Triggers");

  try {
    // Test contribution collection trigger (this will likely fail due to timing)
    console.log("Testing automated contribution collection...");
    try {
      const { tx: collectionTx } = await client.triggerAutomatedContributionCollection(
        circleAccount,
        authority
      );
      console.log("✅ Contribution collection triggered:", collectionTx);
    } catch (error) {
      console.log("⏰ Contribution collection not scheduled (expected):", error.message.includes("AutomationNotScheduled") ? "Not scheduled" : error.message);
    }

    // Test penalty enforcement trigger
    console.log("Testing automated penalty enforcement...");
    try {
      const { tx: penaltyTx } = await client.triggerAutomatedPenaltyEnforcement(
        circleAccount,
        authority
      );
      console.log("✅ Penalty enforcement triggered:", penaltyTx);
    } catch (error) {
      console.log("⏰ Penalty enforcement not scheduled (expected):", error.message.includes("AutomationNotScheduled") ? "Not scheduled" : error.message);
    }

  } catch (error) {
    console.error("❌ Failed to test automation triggers:", error.message);
  }

  // =============================================================================
  // Step 6: Update Automation Settings
  // =============================================================================
  console.log("\n📋 Step 6: Update Automation Settings");

  try {
    // Update settings
    const newMinInterval = 1800; // 30 minutes
    const updateTx = await client.updateAutomationSettings(authority, true, newMinInterval);
    console.log("✅ Automation settings updated:", updateTx);

    const updatedState = await client.getAutomationState();
    console.log("New Min Interval:", updatedState.minInterval.toString(), "seconds");
    console.log("Enabled:", updatedState.enabled);

    // Disable automation
    const disableTx = await client.updateAutomationSettings(authority, false);
    console.log("✅ Automation disabled:", disableTx);

    const disabledState = await client.getAutomationState();
    console.log("Automation Enabled:", disabledState.enabled);

    // Re-enable automation
    const enableTx = await client.updateAutomationSettings(authority, true);
    console.log("✅ Automation re-enabled:", enableTx);

  } catch (error) {
    console.error("❌ Failed to update automation settings:", error.message);
  }

  // =============================================================================
  // Summary
  // =============================================================================
  console.log("\n📋 Automation Example Summary");
  console.log("✅ Automation state initialized");
  console.log("✅ Circle created with automation");
  console.log("✅ Schedules generated for contributions, distributions, and penalties");
  console.log("✅ Members added to circle");
  console.log("✅ Automation monitoring demonstrated");
  console.log("✅ Automation triggers tested");
  console.log("✅ Automation settings updated");

  console.log("\n🎉 Switchboard Oracle Automation Example Complete!");
  console.log("\n📝 Next Steps:");
  console.log("1. Integrate with real Switchboard oracles");
  console.log("2. Set up actual cron jobs for automation");
  console.log("3. Monitor automation events in production");
  console.log("4. Handle edge cases and error recovery");
  console.log("5. Optimize gas costs for automation");
}

// Run the example
if (require.main === module) {
  runAutomationExample().catch(console.error);
}

export { runAutomationExample };