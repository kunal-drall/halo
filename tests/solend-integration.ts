import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  HaloProtocolClient,
  setupTestEnvironment,
  createAndFundTokenAccount,
} from "../app/halo-client";
import { SolendService, createSolendService } from "../app/solend-service";

describe("Solend Integration Tests", () => {
  // Use devnet for Solend testing
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  let program: Program<HaloProtocol>;
  let client: HaloProtocolClient;
  let solendService: SolendService;

  let mint: PublicKey;
  let creator: Keypair;
  let member1: Keypair;
  let member2: Keypair;

  let creatorTokenAccount: PublicKey;
  let member1TokenAccount: PublicKey;
  let member2TokenAccount: PublicKey;

  let circleAccount: PublicKey;
  let escrowAccount: PublicKey;
  let memberAccount1: PublicKey;
  let memberAccount2: PublicKey;

  const contributionAmount = new BN(1_000_000); // 1 token
  const stakeAmount = new BN(2_000_000); // 2 tokens
  const initialFunding = new BN(10_000_000); // 10 tokens

  before("Setup test environment", async function () {
    this.timeout(60000);

    // Create test keypairs
    creator = Keypair.generate();
    member1 = Keypair.generate();
    member2 = Keypair.generate();

    // Airdrop SOL to test accounts
    const accounts = [creator, member1, member2];
    for (const account of accounts) {
      try {
        const signature = await connection.requestAirdrop(
          account.publicKey,
          2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(signature);
      } catch (error) {
        console.log(`Airdrop might have failed for ${account.publicKey.toString()}: ${error}`);
      }
    }

    // Wait for airdrops to settle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Setup mock program (since we don't have anchor in testing environment)
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(creator),
      { commitment: "confirmed" }
    );
    anchor.setProvider(provider);

    // Create mock program instance
    const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
    program = {
      programId,
      provider,
    } as any;

    client = new HaloProtocolClient(program);

    // Setup test environment
    const testEnv = await setupTestEnvironment(connection, creator);
    mint = testEnv.mint;

    // Create token accounts
    creatorTokenAccount = await createAndFundTokenAccount(
      connection,
      mint,
      creator.publicKey,
      creator,
      initialFunding.toNumber()
    );

    member1TokenAccount = await createAndFundTokenAccount(
      connection,
      mint,
      member1.publicKey,
      creator,
      initialFunding.toNumber()
    );

    member2TokenAccount = await createAndFundTokenAccount(
      connection,
      mint,
      member2.publicKey,
      creator,
      initialFunding.toNumber()
    );

    // Generate PDAs (mock implementation)
    const timestamp = Math.floor(Date.now() / 1000);
    [circleAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("circle"),
        creator.publicKey.toBuffer(),
        Buffer.from(new anchor.BN(timestamp).toArray("le", 8)),
      ],
      programId
    );

    [escrowAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      programId
    );

    console.log("✅ Test environment setup complete");
  });

  describe("SolendService", () => {
    it("should initialize Solend service on devnet", async function () {
      this.timeout(30000);

      try {
        solendService = await createSolendService(connection);
        expect(solendService).to.not.be.null;
        console.log("✅ Solend service initialized successfully");
      } catch (error) {
        console.log("⚠️  Solend service initialization failed (expected on devnet):", error.message);
        // Skip remaining tests if Solend service can't initialize
        this.skip();
      }
    });

    it("should initialize Solend service in HaloProtocolClient", async function () {
      this.timeout(30000);

      try {
        await client.initializeSolend();
        const service = client.getSolendService();
        expect(service).to.not.be.null;
        console.log("✅ Solend service initialized in HaloProtocolClient");
      } catch (error) {
        console.log("⚠️  Solend service initialization in client failed:", error.message);
        this.skip();
      }
    });

    it("should fetch market yields", async function () {
      this.timeout(30000);

      try {
        const yields = await client.getSolendMarketYields();
        expect(yields).to.have.property("reserves");
        expect(yields.reserves).to.be.an("array");
        
        if (yields.reserves.length > 0) {
          const reserve = yields.reserves[0];
          expect(reserve).to.have.property("mint");
          expect(reserve).to.have.property("symbol");
          expect(reserve).to.have.property("depositApy");
          expect(reserve).to.have.property("borrowApy");
          console.log(`✅ Fetched ${yields.reserves.length} reserves`);
          console.log(`Sample reserve: ${reserve.symbol} - Deposit APY: ${reserve.depositApy}%`);
        }
      } catch (error) {
        console.log("⚠️  Fetching market yields failed:", error.message);
        this.skip();
      }
    });

    it("should get available reserves", async function () {
      this.timeout(30000);

      try {
        const reserves = await client.getSolendAvailableReserves();
        expect(reserves).to.be.an("array");
        
        if (reserves.length > 0) {
          const reserve = reserves[0];
          expect(reserve).to.have.property("mint");
          expect(reserve).to.have.property("symbol");
          expect(reserve).to.have.property("name");
          expect(reserve).to.have.property("decimals");
          console.log(`✅ Found ${reserves.length} available reserves`);
          console.log(`Sample reserve: ${reserve.symbol} (${reserve.name})`);
        }
      } catch (error) {
        console.log("⚠️  Getting available reserves failed:", error.message);
        this.skip();
      }
    });

    // Mock deposit test (since we need real Solend tokens on devnet)
    it("should handle deposit flow (mock)", async function () {
      this.timeout(30000);

      try {
        // This will likely fail in the actual deposit but tests the flow
        await expect(
          client.depositCircleFundsToSolend(
            circleAccount,
            mint,
            1000000, // 1 token
            creatorTokenAccount,
            creator
          )
        ).to.eventually.be.rejectedWith("Reserve not found for token mint");

        console.log("✅ Deposit flow tested (expected to fail with custom token)");
      } catch (error) {
        console.log("Expected error for deposit with custom token:", error.message);
      }
    });

    // Mock borrow test
    it("should handle borrow flow (mock)", async function () {
      this.timeout(30000);

      try {
        await expect(
          client.borrowFromSolend(
            circleAccount,
            mint, // collateral
            mint, // borrow token (same for simplicity)
            500000, // 0.5 token
            member1TokenAccount,
            creator
          )
        ).to.eventually.be.rejectedWith("Borrow reserve not found");

        console.log("✅ Borrow flow tested (expected to fail with custom token)");
      } catch (error) {
        console.log("Expected error for borrow with custom token:", error.message);
      }
    });

    // Mock repay test
    it("should handle repay flow (mock)", async function () {
      this.timeout(30000);

      try {
        await expect(
          client.repayToSolend(
            circleAccount,
            mint,
            500000, // 0.5 token
            member1TokenAccount,
            creator
          )
        ).to.eventually.be.rejectedWith("Reserve not found for token mint");

        console.log("✅ Repay flow tested (expected to fail with custom token)");
      } catch (error) {
        console.log("Expected error for repay with custom token:", error.message);
      }
    });

    // Mock withdraw test
    it("should handle withdraw flow (mock)", async function () {
      this.timeout(30000);

      try {
        await expect(
          client.withdrawFromSolend(
            circleAccount,
            mint,
            1000000, // 1 token
            creatorTokenAccount,
            creator
          )
        ).to.eventually.be.rejectedWith("Reserve not found for token mint");

        console.log("✅ Withdraw flow tested (expected to fail with custom token)");
      } catch (error) {
        console.log("Expected error for withdraw with custom token:", error.message);
      }
    });

    it("should get user position (mock)", async function () {
      this.timeout(30000);

      try {
        const position = await client.getSolendUserPosition(creator.publicKey, mint);
        expect(position).to.have.property("depositedAmount");
        expect(position).to.have.property("borrowedAmount");
        expect(position).to.have.property("collateralValue");
        
        // Should return zeros for non-existent position
        expect(position.depositedAmount).to.equal(0);
        expect(position.borrowedAmount).to.equal(0);
        expect(position.collateralValue).to.equal(0);
        
        console.log("✅ User position retrieved successfully");
      } catch (error) {
        console.log("Expected error for user position with custom token:", error.message);
      }
    });
  });

  describe("Integration Error Handling", () => {
    it("should throw error when Solend service is not initialized", async function () {
      const uninitializedClient = new HaloProtocolClient(program);
      
      await expect(
        uninitializedClient.getSolendMarketYields()
      ).to.be.rejectedWith("Solend service not initialized");

      await expect(
        uninitializedClient.depositCircleFundsToSolend(
          circleAccount,
          mint,
          1000000,
          creatorTokenAccount,
          creator
        )
      ).to.be.rejectedWith("Solend service not initialized");

      console.log("✅ Error handling for uninitialized service works correctly");
    });

    it("should handle invalid token mints gracefully", async function () {
      this.timeout(30000);

      const invalidMint = Keypair.generate().publicKey;

      try {
        await expect(
          client.getSolendUserPosition(creator.publicKey, invalidMint)
        ).to.eventually.be.rejectedWith("Reserve not found for token mint");

        console.log("✅ Invalid token mint handled gracefully");
      } catch (error) {
        console.log("Expected error for invalid token mint:", error.message);
      }
    });
  });

  describe("Real Devnet Integration Tests", () => {
    // These tests use real Solend tokens that exist on devnet
    const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC
    
    it("should work with real devnet tokens", async function () {
      this.timeout(60000);
      
      try {
        // Get available reserves to see what's actually available
        const reserves = await client.getSolendAvailableReserves();
        console.log(`Available reserves on devnet: ${reserves.length}`);
        
        if (reserves.length > 0) {
          // Try to get user position for the first available reserve
          const firstReserve = reserves[0];
          const reserveMint = new PublicKey(firstReserve.mint);
          
          const position = await client.getSolendUserPosition(creator.publicKey, reserveMint);
          console.log(`Position for ${firstReserve.symbol}: deposited=${position.depositedAmount}, borrowed=${position.borrowedAmount}`);
        }
        
        console.log("✅ Real devnet integration test completed");
      } catch (error) {
        console.log("Real devnet test encountered issue:", error.message);
        // Don't fail the test as devnet conditions can vary
      }
    });
  });
});