import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("Revenue Module", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  const provider = anchor.getProvider();

  let mint: web3.PublicKey;
  let authority: web3.Keypair;
  let treasury: web3.PublicKey;
  let revenueParams: web3.PublicKey;
  let treasuryTokenAccount: web3.PublicKey;
  let authorityTokenAccount: web3.PublicKey;

  // Test circle and member setup
  let creator: web3.Keypair;
  let member1: web3.Keypair;
  let circleAccount: web3.PublicKey;
  let escrowAccount: web3.PublicKey;
  let member1Account: web3.PublicKey;
  let creatorTokenAccount: web3.PublicKey;
  let member1TokenAccount: web3.PublicKey;
  let escrowTokenAccount: web3.PublicKey;

  const contributionAmount = new BN(1000_000); // 1 token
  const durationMonths = 3;
  const maxMembers = 3;
  const penaltyRate = 1000; // 10%
  const stakeAmount = contributionAmount.mul(new BN(2));

  before(async () => {
    // Create keypairs
    authority = web3.Keypair.generate();
    creator = web3.Keypair.generate();
    member1 = web3.Keypair.generate();

    // Airdrop SOL to test accounts
    const accounts = [authority, creator, member1];
    for (const account of accounts) {
      try {
        const signature = await provider.connection.requestAirdrop(
          account.publicKey,
          2 * web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);
      } catch (error) {
        console.log(`Airdrop failed for ${account.publicKey.toString()}: ${error.message}`);
        // Continue even if airdrop fails (might be rate limited)
      }
    }

    // Create mint
    mint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6 // USDC-like decimals
    );

    // Create token accounts
    authorityTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      authority.publicKey
    );

    creatorTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      creator.publicKey
    );

    member1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      member1.publicKey
    );

    // Mint tokens to test accounts
    const mintAmount = new BN(100_000_000); // 100 tokens
    await mintTo(
      provider.connection,
      authority,
      mint,
      authorityTokenAccount,
      authority,
      mintAmount.toNumber()
    );

    await mintTo(
      provider.connection,
      authority,
      mint,
      creatorTokenAccount,
      authority,
      mintAmount.toNumber()
    );

    await mintTo(
      provider.connection,
      authority,
      mint,
      member1TokenAccount,
      authority,
      mintAmount.toNumber()
    );

    // Generate PDAs
    [treasury] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );

    [revenueParams] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("revenue_params")],
      program.programId
    );

    // Create treasury token account
    treasuryTokenAccount = await createAccount(
      provider.connection,
      authority,
      mint,
      treasury,
      authority
    );

    // Setup circle for testing distribution fees
    const timestamp = Math.floor(Date.now() / 1000);
    [circleAccount] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("circle"),
        creator.publicKey.toBuffer(),
        Buffer.from(new BN(timestamp).toArray("le", 8)),
      ],
      program.programId
    );

    [escrowAccount] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      program.programId
    );

    [member1Account] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("member"), circleAccount.toBuffer(), member1.publicKey.toBuffer()],
      program.programId
    );

    escrowTokenAccount = await createAccount(
      provider.connection,
      authority,
      mint,
      escrowAccount,
      authority
    );
  });

  describe("Initialization", () => {
    it("should initialize treasury", async () => {
      await program.methods
        .initializeTreasury()
        .accounts({
          treasury: treasury,
          authority: authority.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const treasuryData = await program.account.treasury.fetch(treasury);
      expect(treasuryData.authority.toString()).to.equal(authority.publicKey.toString());
      expect(treasuryData.totalFeesCollected.toString()).to.equal("0");
      expect(treasuryData.distributionFees.toString()).to.equal("0");
      expect(treasuryData.yieldFees.toString()).to.equal("0");
      expect(treasuryData.managementFees.toString()).to.equal("0");
    });

    it("should initialize revenue parameters with defaults", async () => {
      await program.methods
        .initializeRevenueParams()
        .accounts({
          revenueParams: revenueParams,
          authority: authority.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const paramsData = await program.account.revenueParams.fetch(revenueParams);
      expect(paramsData.authority.toString()).to.equal(authority.publicKey.toString());
      expect(paramsData.distributionFeeRate).to.equal(50); // 0.5%
      expect(paramsData.yieldFeeRate).to.equal(25); // 0.25%
      expect(paramsData.managementFeeRate).to.equal(200); // 2%
      expect(paramsData.managementFeeInterval.toString()).to.equal((30 * 24 * 60 * 60).toString()); // 30 days
    });
  });

  describe("Governance", () => {
    it("should update revenue parameters", async () => {
      const newDistributionFee = 75; // 0.75%
      const newYieldFee = 50; // 0.5%
      const newManagementFee = 300; // 3%
      const newInterval = new BN(15 * 24 * 60 * 60); // 15 days

      await program.methods
        .updateRevenueParams(
          newDistributionFee,
          newYieldFee,
          newManagementFee,
          newInterval
        )
        .accounts({
          revenueParams: revenueParams,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const paramsData = await program.account.revenueParams.fetch(revenueParams);
      expect(paramsData.distributionFeeRate).to.equal(newDistributionFee);
      expect(paramsData.yieldFeeRate).to.equal(newYieldFee);
      expect(paramsData.managementFeeRate).to.equal(newManagementFee);
      expect(paramsData.managementFeeInterval.toString()).to.equal(newInterval.toString());
    });

    it("should reject invalid fee rates", async () => {
      try {
        await program.methods
          .updateRevenueParams(
            1500, // 15% - too high
            null,
            null,
            null
          )
          .accounts({
            revenueParams: revenueParams,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        expect.fail("Should have failed with invalid fee rate");
      } catch (error) {
        expect(error.message).to.include("InvalidFeeRate");
      }
    });

    it("should reject unauthorized parameter updates", async () => {
      const unauthorizedUser = web3.Keypair.generate();
      
      // Airdrop SOL to unauthorized user
      try {
        const signature = await provider.connection.requestAirdrop(
          unauthorizedUser.publicKey,
          web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);
      } catch (error) {
        console.log("Airdrop failed for unauthorized user");
      }

      try {
        await program.methods
          .updateRevenueParams(100, null, null, null)
          .accounts({
            revenueParams: revenueParams,
            authority: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
        expect.fail("Should have failed with unauthorized access");
      } catch (error) {
        expect(error.message).to.include("UnauthorizedRevenueOperation");
      }
    });
  });

  describe("Fee Collection", () => {
    before(async () => {
      // Create a test circle for distribution fee testing
      await program.methods
        .initializeCircle(contributionAmount, durationMonths, maxMembers, penaltyRate)
        .accounts({
          circle: circleAccount,
          escrow: escrowAccount,
          creator: creator.publicKey,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      // Add member to circle
      await program.methods
        .joinCircle(stakeAmount)
        .accounts({
          circle: circleAccount,
          member: member1Account,
          escrow: escrowAccount,
          memberAuthority: member1.publicKey,
          memberTokenAccount: member1TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();

      // Make a contribution to set up distribution
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circleAccount,
          member: member1Account,  
          escrow: escrowAccount,
          memberAuthority: member1.publicKey,
          memberTokenAccount: member1TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();
    });

    it("should collect distribution fees on pot distribution", async () => {
      const initialTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
      const initialRecipientBalance = (await getAccount(provider.connection, member1TokenAccount)).amount;
      
      // Reset revenue params to default values for predictable testing
      await program.methods
        .updateRevenueParams(50, 25, 200, new BN(30 * 24 * 60 * 60)) // Reset to defaults
        .accounts({
          revenueParams: revenueParams,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Distribute pot (should collect 0.5% fee)
      await program.methods
        .distributePot()
        .accounts({
          circle: circleAccount,
          recipientMember: member1Account,
          escrow: escrowAccount,
          treasury: treasury,
          revenueParams: revenueParams,
          authority: creator.publicKey,
          recipientTokenAccount: member1TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      // Check treasury received distribution fee
      const newTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
      const treasuryData = await program.account.treasury.fetch(treasury);
      
      const expectedFee = contributionAmount.toNumber() * 50 / 10000; // 0.5%
      const feeCollected = Number(newTreasuryBalance - initialTreasuryBalance);
      
      expect(feeCollected).to.equal(expectedFee);
      expect(treasuryData.distributionFees.toNumber()).to.equal(expectedFee);
      expect(treasuryData.totalFeesCollected.toNumber()).to.equal(expectedFee);

      // Check recipient received net amount (total - fee)
      const newRecipientBalance = (await getAccount(provider.connection, member1TokenAccount)).amount;
      const netReceived = Number(newRecipientBalance - initialRecipientBalance);
      expect(netReceived).to.equal(contributionAmount.toNumber() - expectedFee);
    });

    it("should collect yield fees on yield distribution", async () => {
      const yieldAmount = new BN(500_000); // 0.5 tokens yield
      const initialTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
      const initialRecipientBalance = (await getAccount(provider.connection, member1TokenAccount)).amount;
      
      // Mint yield amount to authority for testing
      await mintTo(
        provider.connection,
        authority,
        mint,
        authorityTokenAccount,
        authority,
        yieldAmount.toNumber()
      );

      // Distribute yield (should collect 0.25% fee by default)
      await program.methods
        .distributeYield(yieldAmount)
        .accounts({
          treasury: treasury,
          revenueParams: revenueParams,
          authority: authority.publicKey,
          sourceTokenAccount: authorityTokenAccount,
          recipientTokenAccount: member1TokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      // Check treasury received yield fee
      const newTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
      const treasuryData = await program.account.treasury.fetch(treasury);
      
      const expectedYieldFee = yieldAmount.toNumber() * 25 / 10000; // 0.25%
      const yieldFeeCollected = Number(newTreasuryBalance - initialTreasuryBalance);
      
      expect(yieldFeeCollected).to.equal(expectedYieldFee);
      expect(treasuryData.yieldFees.toNumber()).to.equal(expectedYieldFee);

      // Check recipient received net yield (total - fee)
      const newRecipientBalance = (await getAccount(provider.connection, member1TokenAccount)).amount;
      const netYieldReceived = Number(newRecipientBalance - initialRecipientBalance);
      expect(netYieldReceived).to.equal(yieldAmount.toNumber() - expectedYieldFee);
    });

    it("should collect management fees", async () => {
      // First, let's check the current escrow balance
      const escrowBalance = (await getAccount(provider.connection, escrowTokenAccount)).amount;
      console.log("Current escrow balance:", escrowBalance.toString());
      
      if (escrowBalance > 0) {
        const initialTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
        
        await program.methods
          .collectManagementFees()
          .accounts({
            treasury: treasury,
            revenueParams: revenueParams,
            circle: circleAccount,
            escrow: escrowAccount,
            escrowTokenAccount: escrowTokenAccount,
            treasuryTokenAccount: treasuryTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        const newTreasuryBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
        const treasuryData = await program.account.treasury.fetch(treasury);
        
        // Management fee should be calculated based on time elapsed and 2% annual rate
        const managementFeeCollected = Number(newTreasuryBalance - initialTreasuryBalance);
        expect(managementFeeCollected).to.be.greaterThan(0);
        expect(treasuryData.managementFees.toNumber()).to.be.greaterThan(0);
        
        console.log("Management fee collected:", managementFeeCollected);
      } else {
        console.log("Skipping management fee test - no escrow balance");
      }
    });

    it("should prevent frequent management fee collection", async () => {
      try {
        // Try to collect management fees again immediately
        await program.methods
          .collectManagementFees()
          .accounts({
            treasury: treasury,
            revenueParams: revenueParams,
            circle: circleAccount,
            escrow: escrowAccount,
            escrowTokenAccount: escrowTokenAccount,
            treasuryTokenAccount: treasuryTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        expect.fail("Should have failed with too frequent collection");
      } catch (error) {
        expect(error.message).to.include("RevenueCollectionTooFrequent");
      }
    });
  });

  describe("Revenue Reporting", () => {
    it("should create revenue report", async () => {
      const periodStart = new BN(Math.floor(Date.now() / 1000) - 86400); // 24 hours ago
      const periodEnd = new BN(Math.floor(Date.now() / 1000));
      
      const [revenueReport] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("revenue_report"),
          periodStart.toArray("le", 8),
          periodEnd.toArray("le", 8),
        ],
        program.programId
      );

      await program.methods
        .createRevenueReport(periodStart, periodEnd)
        .accounts({
          revenueReport: revenueReport,
          treasury: treasury,
          authority: authority.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const reportData = await program.account.revenueReport.fetch(revenueReport);
      expect(reportData.periodStart.toString()).to.equal(periodStart.toString());
      expect(reportData.periodEnd.toString()).to.equal(periodEnd.toString());
      expect(reportData.totalPeriodFees.toNumber()).to.be.greaterThan(0);
    });

    it("should reject invalid report periods", async () => {
      const periodStart = new BN(Math.floor(Date.now() / 1000));
      const periodEnd = new BN(Math.floor(Date.now() / 1000) - 86400); // End before start
      
      const [revenueReport] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("revenue_report"),
          periodStart.toArray("le", 8),
          periodEnd.toArray("le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createRevenueReport(periodStart, periodEnd)
          .accounts({
            revenueReport: revenueReport,
            treasury: treasury,
            authority: authority.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        expect.fail("Should have failed with invalid period");
      } catch (error) {
        expect(error.message).to.include("InvalidRevenueReportPeriod");
      }
    });
  });

  describe("Treasury Accounting", () => {
    it("should accurately track total fees across different categories", async () => {
      const treasuryData = await program.account.treasury.fetch(treasury);
      
      const expectedTotal = treasuryData.distributionFees.toNumber() + 
                           treasuryData.yieldFees.toNumber() + 
                           treasuryData.managementFees.toNumber();
      
      expect(treasuryData.totalFeesCollected.toNumber()).to.equal(expectedTotal);
    });

    it("should maintain accurate token balance", async () => {
      const treasuryData = await program.account.treasury.fetch(treasury);
      const tokenBalance = (await getAccount(provider.connection, treasuryTokenAccount)).amount;
      
      // Token balance should match total fees collected
      expect(Number(tokenBalance)).to.equal(treasuryData.totalFeesCollected.toNumber());
    });
  });
});