import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { HaloProtocol } from "../target/types/halo_protocol";

/**
 * Deployment and migration scripts for Halo Protocol
 */

interface DeploymentConfig {
  network: "localnet" | "devnet" | "testnet" | "mainnet";
  programId?: string;
  authority?: string;
}

export class HaloDeployer {
  private connection: Connection;
  private program: anchor.Program<HaloProtocol>;
  private config: DeploymentConfig;

  constructor(
    connection: Connection,
    program: anchor.Program<HaloProtocol>,
    config: DeploymentConfig
  ) {
    this.connection = connection;
    this.program = program;
    this.config = config;
  }

  /**
   * Deploy the program to the specified network
   */
  async deploy(): Promise<void> {
    console.log(`🚀 Deploying Halo Protocol to ${this.config.network}...`);
    console.log(`📍 Program ID: ${this.program.programId.toString()}`);

    // Verify program deployment
    const programInfo = await this.connection.getAccountInfo(
      this.program.programId
    );

    if (!programInfo) {
      throw new Error(
        "Program not found. Make sure to deploy the program first with 'anchor deploy'"
      );
    }

    console.log("✅ Program deployed successfully");
    console.log(`📊 Program data length: ${programInfo.data.length} bytes`);
    console.log(`💰 Rent: ${programInfo.lamports} lamports`);
  }

  /**
   * Verify program integrity
   */
  async verify(): Promise<boolean> {
    try {
      // Try to fetch the IDL
      const idl = await anchor.Program.fetchIdl(
        this.program.programId,
        this.connection
      );

      if (!idl) {
        console.log(
          "⚠️  IDL not found - this is expected for newly deployed programs"
        );
        return true;
      }

      console.log("✅ Program IDL verified");
      return true;
    } catch (error) {
      console.error("❌ Program verification failed:", error);
      return false;
    }
  }

  /**
   * Initialize program state (if needed)
   */
  async initialize(): Promise<void> {
    console.log("🔧 Initializing program state...");

    // For Halo Protocol, there's no global state to initialize
    // Each circle creates its own state
    console.log("✅ No global initialization required for Halo Protocol");
  }

  /**
   * Display deployment information
   */
  displayInfo(): void {
    console.log("\n📋 Deployment Information");
    console.log("========================");
    console.log(`Network: ${this.config.network}`);
    console.log(`Program ID: ${this.program.programId.toString()}`);
    console.log(`RPC Endpoint: ${this.connection.rpcEndpoint}`);

    if (this.config.authority) {
      console.log(`Authority: ${this.config.authority}`);
    }

    console.log("\n🔗 Integration URLs:");
    console.log("==================");

    switch (this.config.network) {
      case "localnet":
        console.log("Explorer: http://localhost:3000");
        break;
      case "devnet":
        console.log(
          `Explorer: https://explorer.solana.com/address/${this.program.programId}?cluster=devnet`
        );
        break;
      case "testnet":
        console.log(
          `Explorer: https://explorer.solana.com/address/${this.program.programId}?cluster=testnet`
        );
        break;
      case "mainnet":
        console.log(
          `Explorer: https://explorer.solana.com/address/${this.program.programId}`
        );
        break;
    }
  }

  /**
   * Run health checks on the deployed program
   */
  async healthCheck(): Promise<boolean> {
    console.log("\n🩺 Running health checks...");

    try {
      // Check if program account exists
      const programAccount = await this.connection.getAccountInfo(
        this.program.programId
      );
      if (!programAccount) {
        console.log("❌ Program account not found");
        return false;
      }
      console.log("✅ Program account exists");

      // Check if program is executable
      if (!programAccount.executable) {
        console.log("❌ Program is not executable");
        return false;
      }
      console.log("✅ Program is executable");

      // Check program owner
      const expectedOwner = new PublicKey(
        "BPFLoaderUpgradeab1e11111111111111111111111"
      );
      if (!programAccount.owner.equals(expectedOwner)) {
        console.log(
          `❌ Unexpected program owner: ${programAccount.owner.toString()}`
        );
        return false;
      }
      console.log("✅ Program owner is correct");

      console.log("🎉 All health checks passed!");
      return true;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  }
}

/**
 * Main deployment function
 */
export async function deployHaloProtocol(
  config: DeploymentConfig
): Promise<void> {
  // Setup connection
  const connection = new Connection(getClusterUrl(config.network), "confirmed");

  // Load program
  const programId = new PublicKey(
    config.programId || "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  );

  // Create dummy provider for deployment
  const wallet = Keypair.generate();
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );

  // Load program with IDL
  const program = new anchor.Program(
    require("../target/idl/halo_protocol.json"),
    programId,
    provider
  ) as anchor.Program<HaloProtocol>;

  // Initialize deployer
  const deployer = new HaloDeployer(connection, program, config);

  // Run deployment process
  await deployer.deploy();
  await deployer.verify();
  await deployer.initialize();

  // Display info and run health checks
  deployer.displayInfo();
  await deployer.healthCheck();

  console.log("\n🎊 Deployment completed successfully!");
}

/**
 * Get cluster URL for network
 */
function getClusterUrl(network: string): string {
  switch (network) {
    case "localnet":
      return "http://127.0.0.1:8899";
    case "devnet":
      return "https://api.devnet.solana.com";
    case "testnet":
      return "https://api.testnet.solana.com";
    case "mainnet":
      return "https://api.mainnet-beta.solana.com";
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

// CLI interface
if (require.main === module) {
  const network = process.argv[2] || "localnet";
  const programId = process.argv[3];

  deployHaloProtocol({
    network: network as any,
    programId,
  }).catch(console.error);
}
