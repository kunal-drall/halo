const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const { PublicKey } = require("@solana/web3.js");

async function initIdl() {
  // Load the IDL
  const idl = JSON.parse(fs.readFileSync("target/idl/halo_protocol.json", "utf8"));
  
  // Set up provider with explicit configuration
  const connection = new anchor.web3.Connection("https://api.devnet.solana.com");
  const wallet = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf8")))
  ));
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);
  
  const programId = new PublicKey("7KZ32HfH5Bj2YJVg4VRhYpTnMFHKx1iew4Rhy8nhQNiZ");
  
  try {
    console.log("Initializing IDL on-chain...");
    
    // Create the IDL account using the correct method
    const idlAccount = await anchor.Program.createIdlAccount(
      provider.connection,
      provider.wallet,
      programId,
      idl
    );
    
    console.log("IDL account created:", idlAccount.toString());
    console.log("IDL successfully initialized on-chain!");
    
  } catch (error) {
    console.error("Error initializing IDL:", error);
    
    // Try alternative approach
    try {
      console.log("Trying alternative approach...");
      const program = new anchor.Program(idl, programId, provider);
      const idlAccount = await program.methods
        .initializeIdl()
        .rpc();
      
      console.log("IDL account created:", idlAccount.toString());
      console.log("IDL successfully initialized on-chain!");
    } catch (altError) {
      console.error("Alternative approach also failed:", altError);
    }
  }
}

initIdl().catch(console.error);
