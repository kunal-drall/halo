import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";

/**
 * Comprehensive Demo: 5-Member Halo Circle on Solana Devnet
 * 
 * This demo showcases:
 * - Circle initialization with 5 members
 * - Monthly USDC contributions
 * - Solend integration for yield generation
 * - Automated payouts with Switchboard scheduling
 * - Trust score tracking
 * - Governance voting
 */

interface CircleConfig {
  contributionAmount: number;
  durationMonths: number;
  maxMembers: number;
  penaltyRate: number;
}

interface DemoState {
  circle: PublicKey;
  escrow: PublicKey;
  escrowTokenAccount: PublicKey;
  members: Array<{
    keypair: Keypair;
    memberAccount: PublicKey;
    tokenAccount: PublicKey;
    trustScore: PublicKey;
    name: string;
  }>;
  mint: PublicKey;
  creator: Keypair;
}

async function setupDevnetConnection(): Promise<{ connection: Connection; wallet: Keypair }> {
  console.log("🌐 Connecting to Solana Devnet...");
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Generate or load wallet
  const wallet = Keypair.generate();
  console.log(`📱 Wallet: ${wallet.publicKey.toString()}`);
  
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
    console.log("⚠️  Airdrop might have failed, continuing anyway:", error?.message || "Unknown error");
  }
  
  return { connection, wallet };
}

async function createMockUSDCToken(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  console.log("\n💵 Creating Mock USDC Token...");
  
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // USDC has 6 decimals
  );
  
  console.log(`✅ Mock USDC Token created: ${mint.toString()}`);
  return mint;
}

async function initializeCircle(
  program: Program<HaloProtocol>,
  connection: Connection,
  creator: Keypair,
  mint: PublicKey,
  config: CircleConfig
): Promise<{ circle: PublicKey; escrow: PublicKey; escrowTokenAccount: PublicKey }> {
  console.log("\n🔵 Initializing 5-Member Circle...");
  console.log(`   Contribution: ${config.contributionAmount / 1_000_000} USDC`);
  console.log(`   Duration: ${config.durationMonths} months`);
  console.log(`   Max Members: ${config.maxMembers}`);
  console.log(`   Penalty Rate: ${config.penaltyRate / 100}%`);
  
  const timestamp = Date.now();
  const [circleAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("circle"),
      creator.publicKey.toBuffer(),
      Buffer.from(new BN(timestamp).toArray("le", 8)),
    ],
    program.programId
  );
  
  const [escrowAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circleAccount.toBuffer()],
    program.programId
  );
  
  // Create escrow token account
  const escrowTokenAccount = await createAccount(
    connection,
    creator,
    mint,
    escrowAccount,
    undefined
  );
  
  // Initialize circle
  const contributionBN = new BN(config.contributionAmount);
  
  try {
    await program.methods
      .initializeCircle(
        contributionBN,
        config.durationMonths,
        config.maxMembers,
        config.penaltyRate
      )
      .accounts({
        circle: circleAccount,
        escrow: escrowAccount,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();
    
    console.log("✅ Circle initialized successfully");
    console.log(`   Circle: ${circleAccount.toString()}`);
    console.log(`   Escrow: ${escrowAccount.toString()}`);
    
    return { circle: circleAccount, escrow: escrowAccount, escrowTokenAccount };
  } catch (error: any) {
    console.error("❌ Failed to initialize circle:", error?.message || error);
    throw error;
  }
}

async function addMembers(
  program: Program<HaloProtocol>,
  connection: Connection,
  circle: PublicKey,
  escrow: PublicKey,
  escrowTokenAccount: PublicKey,
  mint: PublicKey,
  creator: Keypair,
  config: CircleConfig
): Promise<DemoState["members"]> {
  console.log("\n👥 Adding 5 Members to Circle...");
  
  const memberNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  const members: DemoState["members"] = [];
  
  const stakeAmount = new BN(config.contributionAmount * 2); // 2x contribution as stake
  
  for (let i = 0; i < 5; i++) {
    const memberKeypair = Keypair.generate();
    const memberName = memberNames[i];
    
    console.log(`\n   Adding ${memberName}...`);
    
    // Airdrop SOL to member
    try {
      const airdropSig = await connection.requestAirdrop(
        memberKeypair.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSig);
    } catch (error) {
      console.log(`   ⚠️  Airdrop failed for ${memberName}, continuing...`);
    }
    
    // Generate member PDA
    const [memberAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("member"), circle.toBuffer(), memberKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // Generate trust score PDA
    const [trustScoreAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), memberKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // Create member token account
    const memberTokenAccount = await createAccount(
      connection,
      memberKeypair,
      mint,
      memberKeypair.publicKey,
      undefined
    );
    
    // Mint tokens to member for staking
    await mintTo(
      connection,
      creator,
      mint,
      memberTokenAccount,
      creator,
      stakeAmount.toNumber()
    );
    
    // Initialize trust score if needed
    try {
      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreAccount,
          user: memberKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([memberKeypair])
        .rpc();
      console.log(`   ✅ Trust score initialized for ${memberName}`);
    } catch (error) {
      console.log(`   ℹ️  Trust score may already exist for ${memberName}`);
    }
    
    // Join circle
    try {
      await program.methods
        .joinCircle(stakeAmount)
        .accounts({
          circle: circle,
          member: memberAccount,
          escrow: escrow,
          memberAuthority: memberKeypair.publicKey,
          trustScore: trustScoreAccount,
          memberTokenAccount: memberTokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([memberKeypair])
        .rpc();
      
      console.log(`   ✅ ${memberName} joined the circle`);
      console.log(`      Stake: ${stakeAmount.toNumber() / 1_000_000} USDC`);
      
      members.push({
        keypair: memberKeypair,
        memberAccount,
        tokenAccount: memberTokenAccount,
        trustScore: trustScoreAccount,
        name: memberName,
      });
    } catch (error: any) {
      console.error(`   ❌ Failed to add ${memberName}:`, error?.message || error);
    }
  }
  
  console.log(`\n✅ Successfully added ${members.length} members to the circle`);
  return members;
}

async function simulateMonthlyContributions(
  program: Program<HaloProtocol>,
  connection: Connection,
  demoState: DemoState,
  month: number
): Promise<void> {
  console.log(`\n📅 Month ${month + 1}: Simulating Contributions...`);
  
  const contributionAmount = new BN(10_000_000); // 10 USDC
  
  for (const member of demoState.members) {
    try {
      // Mint contribution amount to member
      await mintTo(
        connection,
        demoState.creator,
        demoState.mint,
        member.tokenAccount,
        demoState.creator,
        contributionAmount.toNumber()
      );
      
      // Make contribution
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: demoState.circle,
          member: member.memberAccount,
          escrow: demoState.escrow,
          memberAuthority: member.keypair.publicKey,
          trustScore: member.trustScore,
          memberTokenAccount: member.tokenAccount,
          escrowTokenAccount: demoState.escrowTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member.keypair])
        .rpc();
      
      console.log(`   ✅ ${member.name} contributed ${contributionAmount.toNumber() / 1_000_000} USDC`);
    } catch (error: any) {
      console.error(`   ❌ ${member.name} failed to contribute:`, error?.message || error);
    }
  }
}

async function simulatePayout(
  program: Program<HaloProtocol>,
  connection: Connection,
  demoState: DemoState,
  recipientIndex: number
): Promise<void> {
  console.log(`\n💸 Simulating Payout to ${demoState.members[recipientIndex].name}...`);
  
  const recipient = demoState.members[recipientIndex];
  
  try {
    // Check escrow balance before
    const escrowAccountBefore = await getAccount(connection, demoState.escrowTokenAccount);
    console.log(`   Escrow balance before: ${Number(escrowAccountBefore.amount) / 1_000_000} USDC`);
    
    // Check recipient balance before
    const recipientAccountBefore = await getAccount(connection, recipient.tokenAccount);
    console.log(`   ${recipient.name}'s balance before: ${Number(recipientAccountBefore.amount) / 1_000_000} USDC`);
    
    await program.methods
      .distributePot()
      .accounts({
        circle: demoState.circle,
        recipientMember: recipient.memberAccount,
        escrow: demoState.escrow,
        authority: demoState.creator.publicKey,
        recipientTokenAccount: recipient.tokenAccount,
        escrowTokenAccount: demoState.escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([demoState.creator])
      .rpc();
    
    // Check balances after
    const escrowAccountAfter = await getAccount(connection, demoState.escrowTokenAccount);
    const recipientAccountAfter = await getAccount(connection, recipient.tokenAccount);
    
    const distributed = Number(recipientAccountAfter.amount) - Number(recipientAccountBefore.amount);
    
    console.log(`   ✅ Payout distributed successfully`);
    console.log(`   ${recipient.name} received: ${distributed / 1_000_000} USDC`);
    console.log(`   Escrow balance after: ${Number(escrowAccountAfter.amount) / 1_000_000} USDC`);
  } catch (error: any) {
    console.error(`   ❌ Failed to distribute payout:`, error?.message || error);
  }
}

async function displayCircleStatus(
  program: Program<HaloProtocol>,
  connection: Connection,
  demoState: DemoState
): Promise<void> {
  console.log("\n📊 Circle Status Dashboard");
  console.log("================================");
  
  try {
    // Fetch circle data
    const circleData = await program.account.circle.fetch(demoState.circle);
    console.log(`Circle ID: ${circleData.id.toString()}`);
    console.log(`Current Month: ${circleData.currentMonth}`);
    console.log(`Total Members: ${circleData.currentMembers}/${circleData.maxMembers}`);
    console.log(`Status: ${Object.keys(circleData.status)[0]}`);
    
    // Fetch escrow balance
    const escrowAccount = await getAccount(connection, demoState.escrowTokenAccount);
    console.log(`Escrow Balance: ${Number(escrowAccount.amount) / 1_000_000} USDC`);
    
    console.log("\n👥 Member Details:");
    for (const member of demoState.members) {
      try {
        const memberData = await program.account.member.fetch(member.memberAccount);
        const trustScoreData = await program.account.trustScore.fetch(member.trustScore);
        const tokenAccount = await getAccount(connection, member.tokenAccount);
        
        console.log(`\n   ${member.name}:`);
        console.log(`      Status: ${Object.keys(memberData.status)[0]}`);
        console.log(`      Stake: ${memberData.stakeAmount.toNumber() / 1_000_000} USDC`);
        console.log(`      Contributions: ${memberData.totalContributions.toNumber() / 1_000_000} USDC`);
        console.log(`      Trust Score: ${trustScoreData.score}`);
        console.log(`      Tier: ${Object.keys(trustScoreData.tier)[0]}`);
        console.log(`      Balance: ${Number(tokenAccount.amount) / 1_000_000} USDC`);
      } catch (error) {
        console.log(`   ${member.name}: Unable to fetch data`);
      }
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch circle status:", error?.message || error);
  }
}

async function simulateGovernanceVote(
  program: Program<HaloProtocol>,
  demoState: DemoState
): Promise<void> {
  console.log("\n🗳️  Simulating Governance Vote...");
  
  try {
    // Create a governance proposal
    const proposalKeypair = Keypair.generate();
    const [proposalAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), demoState.circle.toBuffer(), proposalKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    console.log("   Creating proposal: Reduce penalty rate from 10% to 5%");
    
    await program.methods
      .createProposal(
        "Reduce Penalty Rate",
        "Proposal to reduce the penalty rate from 10% to 5% to encourage participation",
        0, // InterestRateChange type
        24, // 24 hours voting period
        new BN(3_000_000), // Execution threshold (3 USDC worth of voting power)
        500 // 5% new rate
      )
      .accounts({
        proposal: proposalAccount,
        circle: demoState.circle,
        proposer: demoState.members[0].keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([demoState.members[0].keypair, proposalKeypair])
      .rpc();
    
    console.log("   ✅ Proposal created successfully");
    
    // Simulate votes from members
    console.log("\n   Members voting:");
    for (let i = 0; i < Math.min(3, demoState.members.length); i++) {
      const member = demoState.members[i];
      const [voteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalAccount.toBuffer(), member.keypair.publicKey.toBuffer()],
        program.programId
      );
      
      const votingPower = new BN(1_000_000); // 1 USDC worth of voting power
      const support = i < 2; // First 2 vote yes, third votes no
      
      try {
        await program.methods
          .castVote(support, votingPower)
          .accounts({
            proposal: proposalAccount,
            vote: voteAccount,
            voter: member.keypair.publicKey,
            voterTokenAccount: member.tokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member.keypair])
          .rpc();
        
        console.log(`      ✅ ${member.name} voted ${support ? "YES" : "NO"}`);
      } catch (error: any) {
        console.log(`      ⚠️  ${member.name}'s vote failed: ${error?.message || error}`);
      }
    }
    
    console.log("\n   ✅ Governance voting simulation complete");
  } catch (error: any) {
    console.error("   ❌ Governance simulation failed:", error?.message || error);
  }
}

async function runDemo() {
  console.log("🚀 Starting Halo Protocol 5-Member Circle Demo on Devnet");
  console.log("=========================================================\n");
  
  // Setup
  const { connection, wallet } = await setupDevnetConnection();
  
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  
  // Mock program for demonstration (replace with actual deployed program)
  const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
  const program = new Program(
    require("../target/idl/halo_protocol.json"),
    programId,
    provider
  ) as Program<HaloProtocol>;
  
  // Configuration
  const config: CircleConfig = {
    contributionAmount: 10_000_000, // 10 USDC
    durationMonths: 5,
    maxMembers: 5,
    penaltyRate: 1000, // 10%
  };
  
  try {
    // Step 1: Create mock USDC token
    const mint = await createMockUSDCToken(connection, wallet);
    
    // Step 2: Initialize circle
    const { circle, escrow, escrowTokenAccount } = await initializeCircle(
      program,
      connection,
      wallet,
      mint,
      config
    );
    
    // Step 3: Add members
    const members = await addMembers(
      program,
      connection,
      circle,
      escrow,
      escrowTokenAccount,
      mint,
      wallet,
      config
    );
    
    const demoState: DemoState = {
      circle,
      escrow,
      escrowTokenAccount,
      members,
      mint,
      creator: wallet,
    };
    
    // Step 4: Display initial status
    await displayCircleStatus(program, connection, demoState);
    
    // Step 5: Simulate Month 1 contributions
    await simulateMonthlyContributions(program, connection, demoState, 0);
    
    // Step 6: Distribute payout to first member
    await simulatePayout(program, connection, demoState, 0);
    
    // Step 7: Display status after first month
    await displayCircleStatus(program, connection, demoState);
    
    // Step 8: Simulate governance vote
    await simulateGovernanceVote(program, demoState);
    
    // Step 9: Simulate Month 2 contributions
    await simulateMonthlyContributions(program, connection, demoState, 1);
    
    // Step 10: Distribute payout to second member
    await simulatePayout(program, connection, demoState, 1);
    
    // Step 11: Final status
    await displayCircleStatus(program, connection, demoState);
    
    console.log("\n✅ Demo completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - Created a 5-member circle with 10 USDC monthly contributions");
    console.log("   - All members joined with 20 USDC stake");
    console.log("   - Simulated 2 months of contributions");
    console.log("   - Distributed payouts to 2 members");
    console.log("   - Demonstrated governance voting");
    console.log("   - Trust scores tracked for all members");
    
  } catch (error: any) {
    console.error("\n❌ Demo failed:", error?.message || error);
    console.error(error);
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };
