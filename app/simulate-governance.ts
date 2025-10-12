import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { HaloProtocol } from "../target/types/halo_protocol";

/**
 * Script to simulate governance voting in a Halo circle
 * 
 * Usage:
 *   ts-node app/simulate-governance.ts <circle-address> <proposal-type>
 */

interface GovernanceConfig {
  circleAddress: string;
  proposalType: string;
}

const PROPOSAL_TYPES = {
  "interest-rate": {
    title: "Adjust Penalty Interest Rate",
    description: "Proposal to reduce the penalty rate from 10% to 5% to encourage participation and reduce barriers",
    type: 0,
    newRate: 500,
  },
  "duration": {
    title: "Extend Circle Duration",
    description: "Proposal to extend circle duration by 2 months to accommodate more members",
    type: 1,
    newRate: null,
  },
  "emergency": {
    title: "Emergency Pause",
    description: "Emergency proposal to pause circle operations due to security concerns",
    type: 2,
    newRate: null,
  },
};

async function simulateGovernanceVoting(config: GovernanceConfig): Promise<void> {
  console.log("🗳️  Starting Governance Voting Simulation");
  console.log("=========================================");
  console.log(`Circle: ${config.circleAddress}`);
  console.log(`Proposal Type: ${config.proposalType}\n`);
  
  // Setup connection
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate();
  
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  
  const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
  const program = new Program(
    require("../target/idl/halo_protocol.json"),
    programId,
    provider
  ) as Program<HaloProtocol>;
  
  const circleAddress = new PublicKey(config.circleAddress);
  
  // Get proposal details
  const proposalTemplate = PROPOSAL_TYPES[config.proposalType as keyof typeof PROPOSAL_TYPES];
  if (!proposalTemplate) {
    console.error(`❌ Unknown proposal type: ${config.proposalType}`);
    console.log(`Available types: ${Object.keys(PROPOSAL_TYPES).join(", ")}`);
    return;
  }
  
  try {
    // Load circle data
    console.log("📊 Loading circle data...");
    const circleData = await program.account.circle.fetch(circleAddress);
    console.log(`   Circle ID: ${circleData.id.toString()}`);
    console.log(`   Total Members: ${circleData.currentMembers}`);
    
    // Step 1: Create Proposal
    console.log("\n📝 Step 1: Creating Proposal");
    console.log("─────────────────────────────");
    console.log(`   Title: ${proposalTemplate.title}`);
    console.log(`   Description: ${proposalTemplate.description}`);
    console.log(`   Type: ${proposalTemplate.type}`);
    console.log(`   Voting Duration: 24 hours`);
    
    const proposalKeypair = Keypair.generate();
    const [proposalAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), circleAddress.toBuffer(), proposalKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    console.log(`   Proposal Account: ${proposalAccount.toString()}`);
    
    // In production, execute actual transaction:
    // await program.methods
    //   .createProposal(...)
    //   .accounts({...})
    //   .rpc();
    
    console.log("   ✅ Proposal created successfully");
    
    // Step 2: Simulate Member Votes
    console.log("\n🗳️  Step 2: Collecting Member Votes");
    console.log("─────────────────────────────────────");
    
    const memberVotes = [
      { name: "Alice", votingPower: 4_000_000, support: true },
      { name: "Bob", votingPower: 3_000_000, support: true },
      { name: "Charlie", votingPower: 2_000_000, support: false },
      { name: "Diana", votingPower: 5_000_000, support: true },
      { name: "Eve", votingPower: 1_000_000, support: false },
    ];
    
    let totalVotesFor = 0;
    let totalVotesAgainst = 0;
    let quadraticVotesFor = 0;
    let quadraticVotesAgainst = 0;
    
    for (const vote of memberVotes) {
      console.log(`\n   ${vote.name}:`);
      console.log(`      Voting Power: ${vote.votingPower / 1_000_000} USDC`);
      console.log(`      Vote: ${vote.support ? "✅ YES" : "❌ NO"}`);
      
      // Calculate quadratic voting weight (sqrt of voting power)
      const quadraticWeight = Math.sqrt(vote.votingPower);
      console.log(`      Quadratic Weight: ${quadraticWeight.toFixed(2)}`);
      
      if (vote.support) {
        totalVotesFor += vote.votingPower;
        quadraticVotesFor += quadraticWeight;
      } else {
        totalVotesAgainst += vote.votingPower;
        quadraticVotesAgainst += quadraticWeight;
      }
      
      // Simulate vote transaction
      // await program.methods
      //   .castVote(vote.support, new BN(vote.votingPower))
      //   .accounts({...})
      //   .rpc();
      
      console.log(`      ✅ Vote recorded`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Step 3: Tally Results
    console.log("\n📊 Step 3: Vote Tally");
    console.log("─────────────────────");
    console.log(`\n   Linear Voting:`);
    console.log(`      For: ${totalVotesFor / 1_000_000} USDC`);
    console.log(`      Against: ${totalVotesAgainst / 1_000_000} USDC`);
    console.log(`      Total: ${(totalVotesFor + totalVotesAgainst) / 1_000_000} USDC`);
    
    console.log(`\n   Quadratic Voting:`);
    console.log(`      For: ${quadraticVotesFor.toFixed(2)}`);
    console.log(`      Against: ${quadraticVotesAgainst.toFixed(2)}`);
    console.log(`      Total: ${(quadraticVotesFor + quadraticVotesAgainst).toFixed(2)}`);
    
    const passed = quadraticVotesFor > quadraticVotesAgainst;
    const passingPercentage = (quadraticVotesFor / (quadraticVotesFor + quadraticVotesAgainst) * 100).toFixed(1);
    
    console.log(`\n   Result: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`   Approval: ${passingPercentage}%`);
    
    // Step 4: Execute Proposal (if passed)
    if (passed) {
      console.log("\n⚡ Step 4: Executing Proposal");
      console.log("───────────────────────────────");
      console.log("   ⏳ Waiting for voting period to end...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("   🔄 Executing proposal...");
      
      // In production:
      // await program.methods
      //   .executeProposal()
      //   .accounts({...})
      //   .rpc();
      
      console.log("   ✅ Proposal executed successfully");
      
      if (proposalTemplate.newRate !== null) {
        console.log(`   📝 New penalty rate: ${proposalTemplate.newRate / 100}%`);
      }
    } else {
      console.log("\n❌ Proposal Failed");
      console.log("   Insufficient votes to pass");
    }
    
    // Summary
    console.log("\n📋 Governance Summary");
    console.log("════════════════════");
    console.log(`   Proposal: ${proposalTemplate.title}`);
    console.log(`   Participants: ${memberVotes.length}/${circleData.currentMembers}`);
    console.log(`   Status: ${passed ? "Executed" : "Rejected"}`);
    console.log(`   Quadratic Approval: ${passingPercentage}%`);
    
    console.log("\n✅ Governance simulation completed!");
    
  } catch (error: any) {
    console.error("\n❌ Governance simulation failed:", error?.message || error);
  }
}

async function displayGovernanceStats(circleAddress: string): Promise<void> {
  console.log("📊 Governance Statistics Dashboard");
  console.log("===================================\n");
  
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate();
  
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  
  const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
  const program = new Program(
    require("../target/idl/halo_protocol.json"),
    programId,
    provider
  ) as Program<HaloProtocol>;
  
  try {
    const circle = new PublicKey(circleAddress);
    const circleData = await program.account.circle.fetch(circle);
    
    console.log(`Circle: ${circleAddress}`);
    console.log(`Total Members: ${circleData.currentMembers}`);
    console.log(`\nGovernance Activity:`);
    console.log(`   - Total Proposals: Simulated - 3`);
    console.log(`   - Active Proposals: 0`);
    console.log(`   - Passed Proposals: 2`);
    console.log(`   - Failed Proposals: 1`);
    console.log(`   - Average Participation: 85%`);
    
    console.log(`\nVoting Power Distribution:`);
    console.log(`   - Highly Active (>5 USDC): 2 members`);
    console.log(`   - Active (2-5 USDC): 2 members`);
    console.log(`   - Low Activity (<2 USDC): 1 member`);
    
  } catch (error: any) {
    console.error("Failed to load governance stats:", error?.message || error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log("Usage: ts-node app/simulate-governance.ts <circle-address> [proposal-type|stats]");
    console.log("\nProposal Types:");
    console.log("  - interest-rate: Adjust penalty interest rate");
    console.log("  - duration: Extend circle duration");
    console.log("  - emergency: Emergency pause");
    console.log("\nExamples:");
    console.log("  ts-node app/simulate-governance.ts Fg6PaFpo...FsLnS interest-rate");
    console.log("  ts-node app/simulate-governance.ts Fg6PaFpo...FsLnS stats");
    process.exit(1);
  }
  
  const circleAddress = args[0];
  const action = args[1] || "interest-rate";
  
  if (action === "stats") {
    await displayGovernanceStats(circleAddress);
  } else {
    await simulateGovernanceVoting({
      circleAddress,
      proposalType: action,
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { simulateGovernanceVoting, displayGovernanceStats };
