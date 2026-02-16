import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";

import {
  airdropSol,
  createTestMint,
  createTokenAccount,
  mintTokens,
  findCirclePDA,
  findEscrowPDA,
  findMemberPDA,
  findTrustScorePDA,
  findTreasuryPDA,
  findRevenueParamsPDA,
  initializeCircle,
  joinCircle,
  initializeRevenueAccounts,
  expectError,
  CircleContext,
  PROGRAM_ID,
} from "./helpers";

describe("halo-protocol: circle lifecycle", () => {
  // -------------------------------------------------------------------------
  // Provider & program setup
  // -------------------------------------------------------------------------
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HaloProtocol as Program<any>;
  const connection = provider.connection;

  // Reusable keypairs
  let creator: web3.Keypair;
  let mint: web3.PublicKey;
  let circleCtx: CircleContext;

  // Revenue accounts (needed for distribute_pot)
  let treasuryKey: web3.PublicKey;
  let revenueParamsKey: web3.PublicKey;
  let treasuryTokenAccount: web3.PublicKey;

  // -------------------------------------------------------------------------
  // Global before hook: fund wallets, create mint, set up revenue accounts
  // -------------------------------------------------------------------------
  before(async () => {
    creator = web3.Keypair.generate();
    await airdropSol(connection, creator.publicKey);

    mint = await createTestMint(connection, creator);

    // Initialize treasury + revenue params (many instructions depend on these)
    const revenueAccounts = await initializeRevenueAccounts(program, creator);
    treasuryKey = revenueAccounts.treasuryKey;
    revenueParamsKey = revenueAccounts.revenueParamsKey;

    // Create treasury token account
    treasuryTokenAccount = await createTokenAccount(
      connection,
      creator,
      mint,
      treasuryKey
    );
  });

  // =========================================================================
  // initialize_circle
  // =========================================================================

  describe("initialize_circle", () => {
    it("creates a circle with valid parameters", async () => {
      const contributionAmount = new BN(1_000_000);
      const durationMonths = 6;
      const maxMembers = 5;
      const penaltyRate = 500;

      circleCtx = await initializeCircle(program, creator, mint, {
        contributionAmount,
        durationMonths,
        maxMembers,
        penaltyRate,
      });

      // Fetch the circle account and verify fields
      const circleAccount = await program.account.circle.fetch(
        circleCtx.circleKey
      );

      expect(circleAccount.creator.toBase58()).to.equal(
        creator.publicKey.toBase58()
      );
      expect(circleAccount.contributionAmount.toNumber()).to.equal(
        contributionAmount.toNumber()
      );
      expect(circleAccount.durationMonths).to.equal(durationMonths);
      expect(circleAccount.maxMembers).to.equal(maxMembers);
      expect(circleAccount.currentMembers).to.equal(0);
      expect(circleAccount.currentMonth).to.equal(0);
      expect(circleAccount.penaltyRate).to.equal(penaltyRate);
      expect(circleAccount.totalPot.toNumber()).to.equal(0);
      expect(circleAccount.members).to.have.lengthOf(0);
      expect(circleAccount.isPublic).to.be.true;

      // Verify escrow was initialized
      const escrowAccount = await program.account.circleEscrow.fetch(
        circleCtx.escrowKey
      );
      expect(escrowAccount.circle.toBase58()).to.equal(
        circleCtx.circleKey.toBase58()
      );
      expect(escrowAccount.totalAmount.toNumber()).to.equal(0);
      expect(escrowAccount.monthlyPots).to.have.lengthOf(durationMonths);
    });

    it("fails with invalid duration (0)", async () => {
      const badCreator = web3.Keypair.generate();
      await airdropSol(connection, badCreator.publicKey);

      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      const id = new BN(ts!);
      const [circleKey] = findCirclePDA(badCreator.publicKey, id);
      const [escrowKey] = findEscrowPDA(circleKey);

      await expectError(
        program.methods
          .initializeCircle(new BN(1_000_000), 0, 5, 500)
          .accounts({
            circle: circleKey,
            escrow: escrowKey,
            creator: badCreator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([badCreator])
          .rpc(),
        "InvalidDuration"
      );
    });

    it("fails with invalid duration (>24)", async () => {
      const badCreator = web3.Keypair.generate();
      await airdropSol(connection, badCreator.publicKey);

      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      const id = new BN(ts!);
      const [circleKey] = findCirclePDA(badCreator.publicKey, id);
      const [escrowKey] = findEscrowPDA(circleKey);

      await expectError(
        program.methods
          .initializeCircle(new BN(1_000_000), 25, 5, 500)
          .accounts({
            circle: circleKey,
            escrow: escrowKey,
            creator: badCreator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([badCreator])
          .rpc(),
        "InvalidDuration"
      );
    });

    it("fails with invalid max_members (0)", async () => {
      const badCreator = web3.Keypair.generate();
      await airdropSol(connection, badCreator.publicKey);

      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      const id = new BN(ts!);
      const [circleKey] = findCirclePDA(badCreator.publicKey, id);
      const [escrowKey] = findEscrowPDA(circleKey);

      await expectError(
        program.methods
          .initializeCircle(new BN(1_000_000), 6, 0, 500)
          .accounts({
            circle: circleKey,
            escrow: escrowKey,
            creator: badCreator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([badCreator])
          .rpc(),
        "InvalidMaxMembers"
      );
    });

    it("fails with invalid max_members (>20)", async () => {
      const badCreator = web3.Keypair.generate();
      await airdropSol(connection, badCreator.publicKey);

      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      const id = new BN(ts!);
      const [circleKey] = findCirclePDA(badCreator.publicKey, id);
      const [escrowKey] = findEscrowPDA(circleKey);

      await expectError(
        program.methods
          .initializeCircle(new BN(1_000_000), 6, 21, 500)
          .accounts({
            circle: circleKey,
            escrow: escrowKey,
            creator: badCreator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([badCreator])
          .rpc(),
        "InvalidMaxMembers"
      );
    });

    it("fails with 0 contribution amount", async () => {
      const badCreator = web3.Keypair.generate();
      await airdropSol(connection, badCreator.publicKey);

      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      const id = new BN(ts!);
      const [circleKey] = findCirclePDA(badCreator.publicKey, id);
      const [escrowKey] = findEscrowPDA(circleKey);

      await expectError(
        program.methods
          .initializeCircle(new BN(0), 6, 5, 500)
          .accounts({
            circle: circleKey,
            escrow: escrowKey,
            creator: badCreator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([badCreator])
          .rpc(),
        "InvalidContributionAmount"
      );
    });
  });

  // =========================================================================
  // join_circle
  // =========================================================================

  describe("join_circle", () => {
    let freshCircle: CircleContext;

    before(async () => {
      // Create a fresh circle with max 2 members for capacity testing
      freshCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 2,
        penaltyRate: 500,
      });
    });

    it("member joins successfully and stake is transferred", async () => {
      const member1 = web3.Keypair.generate();
      await airdropSol(connection, member1.publicKey);

      // Newcomer with no trust score -> 2x stake required
      // contribution_amount = 1_000_000, so min stake = 2_000_000
      const stakeAmount = new BN(2_000_000);

      const result = await joinCircle(
        program,
        freshCircle,
        member1,
        stakeAmount
      );

      // Verify member account
      const memberAccount = await program.account.member.fetch(result.memberKey);
      expect(memberAccount.authority.toBase58()).to.equal(
        member1.publicKey.toBase58()
      );
      expect(memberAccount.circle.toBase58()).to.equal(
        freshCircle.circleKey.toBase58()
      );
      expect(memberAccount.stakeAmount.toNumber()).to.equal(
        stakeAmount.toNumber()
      );
      expect(memberAccount.hasReceivedPot).to.be.false;
      expect(memberAccount.penalties.toNumber()).to.equal(0);
      expect(memberAccount.payoutClaimed).to.be.false;

      // Verify circle updated
      const circleAccount = await program.account.circle.fetch(
        freshCircle.circleKey
      );
      expect(circleAccount.currentMembers).to.equal(1);
      expect(circleAccount.members).to.have.lengthOf(1);
      expect(circleAccount.members[0].toBase58()).to.equal(
        member1.publicKey.toBase58()
      );

      // Verify escrow updated
      const escrowAccount = await program.account.circleEscrow.fetch(
        freshCircle.escrowKey
      );
      expect(escrowAccount.totalAmount.toNumber()).to.equal(
        stakeAmount.toNumber()
      );
    });

    it("fails when circle is full", async () => {
      // Add second member to fill the circle (max_members = 2)
      const member2 = web3.Keypair.generate();
      await airdropSol(connection, member2.publicKey);
      await joinCircle(program, freshCircle, member2, new BN(2_000_000));

      // Third member should be rejected
      const member3 = web3.Keypair.generate();
      await airdropSol(connection, member3.publicKey);

      const stakeAmount = new BN(2_000_000);
      const [memberKey] = findMemberPDA(
        freshCircle.circleKey,
        member3.publicKey
      );

      const memberTokenAccount = await createTokenAccount(
        connection,
        creator,
        mint,
        member3.publicKey
      );
      await mintTokens(
        connection,
        creator,
        mint,
        memberTokenAccount,
        stakeAmount.toNumber() * 2
      );

      await expectError(
        program.methods
          .joinCircle(stakeAmount)
          .accounts({
            circle: freshCircle.circleKey,
            member: memberKey,
            escrow: freshCircle.escrowKey,
            memberAuthority: member3.publicKey,
            trustScore: null,
            memberTokenAccount: memberTokenAccount,
            escrowTokenAccount: freshCircle.escrowTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([member3])
          .rpc(),
        "CircleFull"
      );
    });

    it("fails with insufficient stake", async () => {
      // Create a new circle so it is not full
      const stakeCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const poorMember = web3.Keypair.generate();
      await airdropSol(connection, poorMember.publicKey);

      // Newcomer needs 2x stake -> 2_000_000. Provide only 500_000.
      const insufficientStake = new BN(500_000);
      const [memberKey] = findMemberPDA(
        stakeCircle.circleKey,
        poorMember.publicKey
      );

      const memberTokenAccount = await createTokenAccount(
        connection,
        creator,
        mint,
        poorMember.publicKey
      );
      await mintTokens(
        connection,
        creator,
        mint,
        memberTokenAccount,
        1_000_000 // enough tokens to try, but stake amount too low
      );

      await expectError(
        program.methods
          .joinCircle(insufficientStake)
          .accounts({
            circle: stakeCircle.circleKey,
            member: memberKey,
            escrow: stakeCircle.escrowKey,
            memberAuthority: poorMember.publicKey,
            trustScore: null,
            memberTokenAccount: memberTokenAccount,
            escrowTokenAccount: stakeCircle.escrowTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([poorMember])
          .rpc(),
        "InsufficientStake"
      );
    });

    it("fails if member already exists", async () => {
      // Create circle and join once
      const dupeCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const dupeUser = web3.Keypair.generate();
      await airdropSol(connection, dupeUser.publicKey);
      await joinCircle(program, dupeCircle, dupeUser, new BN(2_000_000));

      // Attempt to join again -- the member PDA already exists so Anchor will
      // fail at account init (the account is already initialized).
      const [memberKey] = findMemberPDA(
        dupeCircle.circleKey,
        dupeUser.publicKey
      );

      const memberTokenAccount2 = await createTokenAccount(
        connection,
        creator,
        mint,
        dupeUser.publicKey
      );
      await mintTokens(
        connection,
        creator,
        mint,
        memberTokenAccount2,
        4_000_000
      );

      await expectError(
        program.methods
          .joinCircle(new BN(2_000_000))
          .accounts({
            circle: dupeCircle.circleKey,
            member: memberKey,
            escrow: dupeCircle.escrowKey,
            memberAuthority: dupeUser.publicKey,
            trustScore: null,
            memberTokenAccount: memberTokenAccount2,
            escrowTokenAccount: dupeCircle.escrowTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([dupeUser])
          .rpc(),
        // Anchor throws because the PDA account already exists
        "already in use"
      );
    });
  });

  // =========================================================================
  // contribute
  // =========================================================================

  describe("contribute", () => {
    let contribCircle: CircleContext;
    let memberKp: web3.Keypair;
    let memberKey: web3.PublicKey;
    let memberTokenAccount: web3.PublicKey;

    before(async () => {
      contribCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      memberKp = web3.Keypair.generate();
      await airdropSol(connection, memberKp.publicKey);

      const joinResult = await joinCircle(
        program,
        contribCircle,
        memberKp,
        new BN(2_000_000)
      );
      memberKey = joinResult.memberKey;
      memberTokenAccount = joinResult.memberTokenAccount;
    });

    it("member contributes successfully", async () => {
      const amount = new BN(1_000_000);

      await program.methods
        .contribute(amount)
        .accounts({
          circle: contribCircle.circleKey,
          member: memberKey,
          escrow: contribCircle.escrowKey,
          memberAuthority: memberKp.publicKey,
          trustScore: null,
          memberTokenAccount: memberTokenAccount,
          escrowTokenAccount: contribCircle.escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([memberKp])
        .rpc();

      // Verify member contribution recorded
      const memberAccount = await program.account.member.fetch(memberKey);
      expect(memberAccount.contributionHistory[0].toNumber()).to.equal(
        amount.toNumber()
      );

      // Verify circle total pot updated
      const circleAccount = await program.account.circle.fetch(
        contribCircle.circleKey
      );
      expect(circleAccount.totalPot.toNumber()).to.equal(amount.toNumber());

      // Verify escrow total updated
      const escrowAccount = await program.account.circleEscrow.fetch(
        contribCircle.escrowKey
      );
      // escrow total = initial stake (2_000_000) + contribution (1_000_000)
      expect(escrowAccount.totalAmount.toNumber()).to.equal(3_000_000);
    });

    it("fails if not a member (wrong member PDA)", async () => {
      const nonMember = web3.Keypair.generate();
      await airdropSol(connection, nonMember.publicKey);

      // Derive a member PDA for this user -- it does not exist on chain
      const [fakeMemberKey] = findMemberPDA(
        contribCircle.circleKey,
        nonMember.publicKey
      );

      const nonMemberToken = await createTokenAccount(
        connection,
        creator,
        mint,
        nonMember.publicKey
      );
      await mintTokens(connection, creator, mint, nonMemberToken, 2_000_000);

      await expectError(
        program.methods
          .contribute(new BN(1_000_000))
          .accounts({
            circle: contribCircle.circleKey,
            member: fakeMemberKey,
            escrow: contribCircle.escrowKey,
            memberAuthority: nonMember.publicKey,
            trustScore: null,
            memberTokenAccount: nonMemberToken,
            escrowTokenAccount: contribCircle.escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([nonMember])
          .rpc(),
        // The member PDA account does not exist, so Anchor will error
        "AccountNotInitialized"
      );
    });
  });

  // =========================================================================
  // leave_circle
  // =========================================================================

  describe("leave_circle", () => {
    it("member exits and stake is returned (month 0)", async () => {
      // Create a circle and join
      const leaveCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      const leavingMember = web3.Keypair.generate();
      await airdropSol(connection, leavingMember.publicKey);

      const stakeAmount = new BN(2_000_000);
      const joinResult = await joinCircle(
        program,
        leaveCircle,
        leavingMember,
        stakeAmount
      );

      // Leave immediately (month 0 -- allowed)
      await program.methods
        .leaveCircle()
        .accounts({
          circle: leaveCircle.circleKey,
          member: joinResult.memberKey,
          escrow: leaveCircle.escrowKey,
          memberAuthority: leavingMember.publicKey,
          memberTokenAccount: joinResult.memberTokenAccount,
          escrowTokenAccount: leaveCircle.escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([leavingMember])
        .rpc();

      // Verify member status changed to Exited
      const memberAccount = await program.account.member.fetch(
        joinResult.memberKey
      );
      expect(JSON.stringify(memberAccount.status)).to.include("exited");

      // Verify circle membership updated
      const circleAccount = await program.account.circle.fetch(
        leaveCircle.circleKey
      );
      expect(circleAccount.currentMembers).to.equal(0);
      expect(circleAccount.members).to.have.lengthOf(0);

      // Verify escrow balance reduced
      const escrowAccount = await program.account.circleEscrow.fetch(
        leaveCircle.escrowKey
      );
      expect(escrowAccount.totalAmount.toNumber()).to.equal(0);
    });
  });

  // =========================================================================
  // distribute_pot
  // =========================================================================

  describe("distribute_pot", () => {
    it("distributes pot to correct member", async () => {
      // Create circle
      const distCircle = await initializeCircle(program, creator, mint, {
        contributionAmount: new BN(1_000_000),
        durationMonths: 3,
        maxMembers: 5,
        penaltyRate: 500,
      });

      // Join two members
      const member1 = web3.Keypair.generate();
      await airdropSol(connection, member1.publicKey);
      const join1 = await joinCircle(
        program,
        distCircle,
        member1,
        new BN(2_000_000)
      );

      const member2 = web3.Keypair.generate();
      await airdropSol(connection, member2.publicKey);
      const join2 = await joinCircle(
        program,
        distCircle,
        member2,
        new BN(2_000_000)
      );

      // Both members contribute
      await program.methods
        .contribute(new BN(1_000_000))
        .accounts({
          circle: distCircle.circleKey,
          member: join1.memberKey,
          escrow: distCircle.escrowKey,
          memberAuthority: member1.publicKey,
          trustScore: null,
          memberTokenAccount: join1.memberTokenAccount,
          escrowTokenAccount: distCircle.escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();

      await program.methods
        .contribute(new BN(1_000_000))
        .accounts({
          circle: distCircle.circleKey,
          member: join2.memberKey,
          escrow: distCircle.escrowKey,
          memberAuthority: member2.publicKey,
          trustScore: null,
          memberTokenAccount: join2.memberTokenAccount,
          escrowTokenAccount: distCircle.escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member2])
        .rpc();

      // Create recipient token account for member1
      const recipientTokenAccount = join1.memberTokenAccount;

      // Distribute pot to member1
      await program.methods
        .distributePot()
        .accounts({
          circle: distCircle.circleKey,
          recipientMember: join1.memberKey,
          escrow: distCircle.escrowKey,
          treasury: treasuryKey,
          revenueParams: revenueParamsKey,
          authority: creator.publicKey,
          recipientTokenAccount: recipientTokenAccount,
          escrowTokenAccount: distCircle.escrowTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      // Verify member marked as received pot
      const memberAccount = await program.account.member.fetch(
        join1.memberKey
      );
      expect(memberAccount.hasReceivedPot).to.be.true;
    });
  });
});
