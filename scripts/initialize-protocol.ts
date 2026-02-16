import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5");
const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";

async function main() {
  console.log("=== Halo Protocol — Initialize On-Chain State ===\n");

  // Load wallet keypair
  const walletPath =
    process.env.WALLET_PATH ||
    path.join(process.env.HOME || "~", ".config/solana/id.json");

  if (!fs.existsSync(walletPath)) {
    console.error(`ERROR: Wallet keypair not found at ${walletPath}`);
    console.error("Set WALLET_PATH env var or create with: solana-keygen new");
    process.exit(1);
  }

  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log(`Wallet:  ${wallet.publicKey.toBase58()}`);
  console.log(`RPC:     ${RPC_URL}`);
  console.log(`Program: ${PROGRAM_ID.toBase58()}\n`);

  // Set up Anchor
  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );

  const idlPath = path.join(__dirname, "..", "frontend", "public", "halo_protocol.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const program = new anchor.Program(idl, provider);

  // Check balance
  const balance = await connection.getBalance(wallet.publicKey);
  const solBalance = balance / 1e9;
  console.log(`Balance: ${solBalance.toFixed(4)} SOL`);
  if (solBalance < 0.01) {
    console.error("ERROR: Insufficient SOL. Need at least 0.01 SOL for rent.");
    process.exit(1);
  }

  // Derive PDAs
  const [treasuryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    PROGRAM_ID
  );
  const [revenueParamsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("revenue_params")],
    PROGRAM_ID
  );

  console.log(`\nTreasury PDA:       ${treasuryPDA.toBase58()}`);
  console.log(`RevenueParams PDA:  ${revenueParamsPDA.toBase58()}\n`);

  // Initialize Treasury
  const treasuryInfo = await connection.getAccountInfo(treasuryPDA);
  if (treasuryInfo) {
    console.log("[1/2] Treasury already initialized — skipping");
  } else {
    console.log("[1/2] Initializing Treasury...");
    try {
      const tx = await program.methods
        .initializeTreasury()
        .accounts({
          treasury: treasuryPDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      console.log(`  TX: ${tx}`);
      console.log(`  Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
      if (err.logs) {
        console.error("  Logs:", err.logs.slice(-5).join("\n  "));
      }
    }
  }

  // Initialize RevenueParams
  const revenueInfo = await connection.getAccountInfo(revenueParamsPDA);
  if (revenueInfo) {
    console.log("[2/2] RevenueParams already initialized — skipping");
  } else {
    console.log("[2/2] Initializing RevenueParams...");
    try {
      const tx = await program.methods
        .initializeRevenueParams()
        .accounts({
          revenueParams: revenueParamsPDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      console.log(`  TX: ${tx}`);
      console.log(`  Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
      if (err.logs) {
        console.error("  Logs:", err.logs.slice(-5).join("\n  "));
      }
    }
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
