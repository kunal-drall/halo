import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { HaloProtocol } from "../target/types/halo_protocol";
import { TOKEN_PROGRAM_ID, mintTo, getAccount } from "@solana/spl-token";

/**
 * Script to simulate monthly contributions for a Halo circle
 * 
 * Usage:
 *   ts-node app/simulate-contributions.ts <circle-address> <member-count> <months>
 */

interface SimulationConfig {
  circleAddress: string;
  memberCount: number;
  months: number;
  contributionAmount: number; // in lamports (6 decimals for USDC)
}

async function loadCircleData(
  program: Program<HaloProtocol>,
  circleAddress: PublicKey
): Promise<any> {
  console.log(`\n📊 Loading circle data...`);
  const circleData = await program.account.circle.fetch(circleAddress);
  console.log(`   Circle ID: ${circleData.id.toString()}`);
  console.log(`   Members: ${circleData.currentMembers}/${circleData.maxMembers}`);
  console.log(`   Contribution Amount: ${circleData.contributionAmount.toNumber() / 1_000_000} USDC`);
  console.log(`   Current Month: ${circleData.currentMonth}`);
  return circleData;
}

async function simulateContributions(config: SimulationConfig): Promise<void> {
  console.log("💰 Starting Contribution Simulation");
  console.log("====================================");
  console.log(`Circle: ${config.circleAddress}`);
  console.log(`Members: ${config.memberCount}`);
  console.log(`Months to simulate: ${config.months}`);
  console.log();
  
  // Setup connection
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate(); // In production, load from file
  
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
  
  // Load circle data
  const circleData = await loadCircleData(program, circleAddress);
  
  // Get escrow account
  const [escrowAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circleAddress.toBuffer()],
    program.programId
  );
  
  console.log(`Escrow: ${escrowAccount.toString()}\n`);
  
  // Simulate for each month
  for (let month = 0; month < config.months; month++) {
    console.log(`\n📅 Month ${month + 1}`);
    console.log("─────────────────────────────────");
    
    let totalContributed = 0;
    let successfulContributions = 0;
    
    // Simulate each member's contribution
    for (let memberIndex = 0; memberIndex < config.memberCount; memberIndex++) {
      const memberName = `Member ${memberIndex + 1}`;
      
      try {
        // In a real scenario, you would load actual member keypairs
        console.log(`   ${memberName}: Contributing ${config.contributionAmount / 1_000_000} USDC...`);
        
        // Simulate contribution logic (would require actual member keypairs in production)
        // This is a demonstration of the flow
        
        totalContributed += config.contributionAmount;
        successfulContributions++;
        
        console.log(`   ✅ ${memberName} contributed successfully`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`   ❌ ${memberName} failed: ${error?.message || error}`);
      }
    }
    
    console.log(`\n   Summary:`);
    console.log(`   - Successful: ${successfulContributions}/${config.memberCount}`);
    console.log(`   - Total: ${totalContributed / 1_000_000} USDC`);
    
    // Try to fetch updated escrow balance
    try {
      const escrowTokenAccount = circleData.escrowTokenAccount;
      if (escrowTokenAccount) {
        const account = await getAccount(connection, escrowTokenAccount);
        console.log(`   - Escrow Balance: ${Number(account.amount) / 1_000_000} USDC`);
      }
    } catch (error) {
      // Escrow balance check might fail if token account not accessible
    }
    
    // Wait between months
    if (month < config.months - 1) {
      console.log("\n   ⏳ Waiting for next month...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n✅ Contribution simulation completed!");
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log("Usage: ts-node app/simulate-contributions.ts <circle-address> <member-count> <months>");
    console.log("\nExample:");
    console.log("  ts-node app/simulate-contributions.ts Fg6PaFpo...FsLnS 5 3");
    process.exit(1);
  }
  
  const config: SimulationConfig = {
    circleAddress: args[0],
    memberCount: parseInt(args[1]),
    months: parseInt(args[2]),
    contributionAmount: 10_000_000, // 10 USDC default
  };
  
  await simulateContributions(config);
}

if (require.main === module) {
  main().catch(console.error);
}

export { simulateContributions };
