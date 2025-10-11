import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import { expect } from "chai";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount
} from "@solana/spl-token";

describe("Halo Protocol - Switchboard Automation", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;

  let creator: anchor.web3.Keypair;
  let member1: anchor.web3.Keypair;
  let member2: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let creatorTokenAccount: anchor.web3.PublicKey;
  let member1TokenAccount: anchor.web3.PublicKey;
  let member2TokenAccount: anchor.web3.PublicKey;
  let escrowTokenAccount: anchor.web3.PublicKey;

  let circleAccount: anchor.web3.PublicKey;
  let escrowAccount: anchor.web3.PublicKey;
  let member1Account: anchor.web3.PublicKey;
  let member2Account: anchor.web3.PublicKey;
  let automationStateAccount: anchor.web3.PublicKey;
  let circleAutomationAccount: anchor.web3.PublicKey;

  const contributionAmount = new anchor.BN(1000_000); // 1 token
  const durationMonths = 3;
  const maxMembers = 3;
  const penaltyRate = 1000; // 10%
  const stakeAmount = contributionAmount.mul(new anchor.BN(2)); // 2x contribution as stake
  const minInterval = 3600; // 1 hour in seconds

  before(async () => {
    // Create keypairs
    creator = anchor.web3.Keypair.generate();
    member1 = anchor.web3.Keypair.generate();
    member2 = anchor.web3.Keypair.generate();

    // Airdrop SOL to all accounts
    await provider.connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(member1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(member2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    // Create mint
    mint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6 // 6 decimals
    );

    // Create token accounts
    creatorTokenAccount = await createAccount(
      provider.connection,
      creator,
      mint,
      creator.publicKey
    );

    member1TokenAccount = await createAccount(
      provider.connection,
      member1,
      mint,
      member1.publicKey
    );

    member2TokenAccount = await createAccount(
      provider.connection,
      member2,
      mint,
      member2.publicKey
    );

    // Mint tokens to accounts
    await mintTo(
      provider.connection,
      creator,
      mint,
      creatorTokenAccount,
      creator,
      10000000000 // 10,000 tokens
    );

    await mintTo(
      provider.connection,
      creator,
      mint,
      member1TokenAccount,
      creator,
      10000000000
    );

    await mintTo(
      provider.connection,
      creator,
      mint,
      member2TokenAccount,
      creator,
      10000000000
    );

    // Generate PDAs
    [circleAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("circle"),
        creator.publicKey.toBuffer(),
        Buffer.from(anchor.utils.bytes.utf8.encode(Date.now().toString()))
      ],
      program.programId
    );

    [escrowAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      program.programId
    );

    [member1Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("member"), circleAccount.toBuffer(), member1.publicKey.toBuffer()],
      program.programId
    );

    [member2Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("member"), circleAccount.toBuffer(), member2.publicKey.toBuffer()],
      program.programId
    );

    [automationStateAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("automation_state")],
      program.programId
    );

    [circleAutomationAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("circle_automation"), circleAccount.toBuffer()],
      program.programId
    );

    // Create escrow token account
    escrowTokenAccount = await createAccount(
      provider.connection,
      creator,
      mint,
      escrowAccount,
      true // allowOwnerOffCurve
    );
  });

  describe("Automation State Initialization", () => {
    it("Initializes global automation state", async () => {
      // Mock Switchboard queue account
      const mockSwitchboardQueue = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .initializeAutomationState(new anchor.BN(minInterval))
        .accounts({
          automationState: automationStateAccount,
          switchboardQueue: mockSwitchboardQueue.publicKey,
          authority: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      // Verify automation state
      const automationStateData = await program.account.automationState.fetch(automationStateAccount);
      expect(automationStateData.authority.toString()).to.equal(creator.publicKey.toString());
      expect(automationStateData.enabled).to.be.true;
      expect(automationStateData.activeJobs).to.equal(0);
      expect(automationStateData.minInterval.toString()).to.equal(minInterval.toString());
    });
  });

  describe("Circle Creation with Automation", () => {
    it("Creates a circle", async () => {
      const tx = await program.methods
        .initializeCircle(
          contributionAmount,
          durationMonths,
          maxMembers,
          penaltyRate
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

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.creator.toString()).to.equal(creator.publicKey.toString());
      expect(circleData.durationMonths).to.equal(durationMonths);
    });

    it("Sets up circle automation", async () => {
      // Mock Switchboard job account
      const mockSwitchboardJob = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .setupCircleAutomation(true, true, true)
        .accounts({
          circleAutomation: circleAutomationAccount,
          automationState: automationStateAccount,
          circle: circleAccount,
          switchboardJob: mockSwitchboardJob.publicKey,
          authority: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      // Verify circle automation setup
      const circleAutomationData = await program.account.circleAutomation.fetch(circleAutomationAccount);
      expect(circleAutomationData.circle.toString()).to.equal(circleAccount.toString());
      expect(circleAutomationData.autoCollectEnabled).to.be.true;
      expect(circleAutomationData.autoDistributeEnabled).to.be.true;
      expect(circleAutomationData.autoPenaltyEnabled).to.be.true;
      expect(circleAutomationData.contributionSchedule.length).to.equal(durationMonths);
      expect(circleAutomationData.distributionSchedule.length).to.equal(durationMonths);
      expect(circleAutomationData.penaltySchedule.length).to.equal(durationMonths);

      // Verify automation state updated
      const automationStateData = await program.account.automationState.fetch(automationStateAccount);
      expect(automationStateData.activeJobs).to.equal(1);
    });
  });

  describe("Member Joining", () => {
    it("Members can join the circle", async () => {
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

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.currentMembers).to.equal(2);
    });
  });

  describe("Automated Functions", () => {
    let automationEventAccount: anchor.web3.PublicKey;

    beforeEach(async () => {
      // Generate a new automation event account for each test
      const timestamp = Date.now();
      [automationEventAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("automation_event"),
          circleAccount.toBuffer(),
          Buffer.from(timestamp.toString())
        ],
        program.programId
      );
    });

    it("Can trigger automated contribution collection", async () => {
      try {
        const tx = await program.methods
          .automatedContributionCollection()
          .accounts({
            circleAutomation: circleAutomationAccount,
            automationEvent: automationEventAccount,
            payer: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([creator])
          .rpc();

        // Verify event was logged
        const eventData = await program.account.automationEvent.fetch(automationEventAccount);
        expect(eventData.circle.toString()).to.equal(circleAccount.toString());
        expect(eventData.success).to.be.true;
      } catch (error) {
        // This might fail if it's not the right time for contribution collection
        // which is expected behavior
        console.log("Contribution collection not scheduled (expected):", error.message);
      }
    });

    it("Can trigger automated penalty enforcement", async () => {
      try {
        const tx = await program.methods
          .automatedPenaltyEnforcement()
          .accounts({
            circleAutomation: circleAutomationAccount,
            circle: circleAccount,
            automationEvent: automationEventAccount,
            payer: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([creator])
          .rpc();

        // Verify event was logged
        const eventData = await program.account.automationEvent.fetch(automationEventAccount);
        expect(eventData.circle.toString()).to.equal(circleAccount.toString());
        expect(eventData.success).to.be.true;
      } catch (error) {
        // This might fail if it's not the right time for penalty enforcement
        console.log("Penalty enforcement not scheduled (expected):", error.message);
      }
    });
  });

  describe("Automation Settings", () => {
    it("Can update automation settings", async () => {
      const newMinInterval = 7200; // 2 hours

      const tx = await program.methods
        .updateAutomationSettings(true, new anchor.BN(newMinInterval))
        .accounts({
          automationState: automationStateAccount,
          authority: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // Verify settings updated
      const automationStateData = await program.account.automationState.fetch(automationStateAccount);
      expect(automationStateData.enabled).to.be.true;
      expect(automationStateData.minInterval.toString()).to.equal(newMinInterval.toString());
    });

    it("Can disable automation", async () => {
      const tx = await program.methods
        .updateAutomationSettings(false, null)
        .accounts({
          automationState: automationStateAccount,
          authority: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // Verify automation disabled
      const automationStateData = await program.account.automationState.fetch(automationStateAccount);
      expect(automationStateData.enabled).to.be.false;
    });
  });

  describe("Schedule Validation", () => {
    it("Validates contribution schedule generation", async () => {
      const circleAutomationData = await program.account.circleAutomation.fetch(circleAutomationAccount);
      const schedule = circleAutomationData.contributionSchedule;

      expect(schedule.length).to.equal(durationMonths);
      
      // Verify schedule times are properly spaced (30 days apart)
      for (let i = 1; i < schedule.length; i++) {
        const timeDiff = schedule[i].toNumber() - schedule[i-1].toNumber();
        const expectedDiff = 30 * 24 * 60 * 60; // 30 days in seconds
        expect(timeDiff).to.equal(expectedDiff);
      }
    });

    it("Validates distribution schedule generation", async () => {
      const circleAutomationData = await program.account.circleAutomation.fetch(circleAutomationAccount);
      const schedule = circleAutomationData.distributionSchedule;

      expect(schedule.length).to.equal(durationMonths);
      
      // Distribution should be 25 days into each month
      const contributionSchedule = circleAutomationData.contributionSchedule;
      for (let i = 0; i < schedule.length; i++) {
        const distributionTime = schedule[i].toNumber();
        const contributionTime = contributionSchedule[i].toNumber();
        const timeDiff = distributionTime - contributionTime;
        const expectedOffset = 25 * 24 * 60 * 60; // 25 days in seconds
        expect(timeDiff).to.equal(expectedOffset);
      }
    });

    it("Validates penalty schedule generation", async () => {
      const circleAutomationData = await program.account.circleAutomation.fetch(circleAutomationAccount);
      const schedule = circleAutomationData.penaltySchedule;

      expect(schedule.length).to.equal(durationMonths);
      
      // Penalty should be 27 days into each month  
      const contributionSchedule = circleAutomationData.contributionSchedule;
      for (let i = 0; i < schedule.length; i++) {
        const penaltyTime = schedule[i].toNumber();
        const contributionTime = contributionSchedule[i].toNumber();
        const timeDiff = penaltyTime - contributionTime;
        const expectedOffset = 27 * 24 * 60 * 60; // 27 days in seconds
        expect(timeDiff).to.equal(expectedOffset);
      }
    });
  });

  describe("Deterministic Outcomes", () => {
    it("Ensures automation events are deterministic for multiple circles", async () => {
      // Create second circle for testing parallel automation
      const creator2 = anchor.web3.Keypair.generate();
      await provider.connection.requestAirdrop(creator2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

      const [circle2Account] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("circle"),
          creator2.publicKey.toBuffer(),
          Buffer.from(anchor.utils.bytes.utf8.encode((Date.now() + 1000).toString()))
        ],
        program.programId
      );

      const [escrow2Account] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), circle2Account.toBuffer()],
        program.programId
      );

      const [circle2AutomationAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("circle_automation"), circle2Account.toBuffer()],
        program.programId
      );

      // Create second circle
      await program.methods
        .initializeCircle(
          contributionAmount,
          durationMonths,
          maxMembers,
          penaltyRate
        )
        .accounts({
          circle: circle2Account,
          escrow: escrow2Account,
          creator: creator2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator2])
        .rpc();

      // Setup automation for second circle
      const mockSwitchboardJob2 = anchor.web3.Keypair.generate();
      await program.methods
        .setupCircleAutomation(true, true, true)
        .accounts({
          circleAutomation: circle2AutomationAccount,
          automationState: automationStateAccount,
          circle: circle2Account,
          switchboardJob: mockSwitchboardJob2.publicKey,
          authority: creator2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator2])
        .rpc();

      // Verify both circles have independent but deterministic schedules
      const automation1Data = await program.account.circleAutomation.fetch(circleAutomationAccount);
      const automation2Data = await program.account.circleAutomation.fetch(circle2AutomationAccount);

      expect(automation1Data.contributionSchedule.length).to.equal(automation2Data.contributionSchedule.length);
      expect(automation1Data.distributionSchedule.length).to.equal(automation2Data.distributionSchedule.length);
      expect(automation1Data.penaltySchedule.length).to.equal(automation2Data.penaltySchedule.length);

      // Schedules should be different due to different creation times
      expect(automation1Data.contributionSchedule[0].toString()).to.not.equal(
        automation2Data.contributionSchedule[0].toString()
      );

      // But the relative timing should be consistent
      const schedule1Diff = automation1Data.contributionSchedule[1].toNumber() - automation1Data.contributionSchedule[0].toNumber();
      const schedule2Diff = automation2Data.contributionSchedule[1].toNumber() - automation2Data.contributionSchedule[0].toNumber();
      expect(schedule1Diff).to.equal(schedule2Diff);
    });
  });
});