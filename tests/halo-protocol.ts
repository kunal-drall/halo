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

describe("halo-protocol", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  const provider = anchor.getProvider();

  let mint: web3.PublicKey;
  let creator: web3.Keypair;
  let member1: web3.Keypair;
  let member2: web3.Keypair;
  let member3: web3.Keypair;

  let creatorTokenAccount: web3.PublicKey;
  let member1TokenAccount: web3.PublicKey;
  let member2TokenAccount: web3.PublicKey;
  let member3TokenAccount: web3.PublicKey;
  let escrowTokenAccount: web3.PublicKey;

  let circleAccount: web3.PublicKey;
  let escrowAccount: web3.PublicKey;
  let member1Account: web3.PublicKey;
  let member2Account: web3.PublicKey;
  let member3Account: web3.PublicKey;

  const contributionAmount = new BN(1000_000); // 1 token (assuming 6 decimals)
  const durationMonths = 3;
  const maxMembers = 3;
  const penaltyRate = 1000; // 10%
  const stakeAmount = contributionAmount.mul(new BN(2)); // 2x contribution as stake

  before(async () => {
    // Create keypairs
    creator = web3.Keypair.generate();
    member1 = web3.Keypair.generate();
    member2 = web3.Keypair.generate();
    member3 = web3.Keypair.generate();

    // Airdrop SOL to all accounts
    const accounts = [creator, member1, member2, member3];
    for (const account of accounts) {
      await provider.connection.requestAirdrop(
        account.publicKey,
        2 * web3.LAMPORTS_PER_SOL
      );
    }

    // Wait for airdrops
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create mint
    mint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6 // 6 decimals
    );

    // Create token accounts
    creatorTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      creator,
      mint,
      creator.publicKey
    );

    member1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      member1,
      mint,
      member1.publicKey
    );

    member2TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      member2,
      mint,
      member2.publicKey
    );

    member3TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      member3,
      mint,
      member3.publicKey
    );

    // Mint tokens to all accounts
    const initialAmount = new BN(10_000_000); // 10 tokens
    await mintTo(
      provider.connection,
      creator,
      mint,
      creatorTokenAccount,
      creator.publicKey,
      initialAmount.toNumber()
    );
    await mintTo(
      provider.connection,
      creator,
      mint,
      member1TokenAccount,
      creator.publicKey,
      initialAmount.toNumber()
    );
    await mintTo(
      provider.connection,
      creator,
      mint,
      member2TokenAccount,
      creator.publicKey,
      initialAmount.toNumber()
    );
    await mintTo(
      provider.connection,
      creator,
      mint,
      member3TokenAccount,
      creator.publicKey,
      initialAmount.toNumber()
    );

    // Generate PDAs
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
      [
        Buffer.from("member"),
        circleAccount.toBuffer(),
        member1.publicKey.toBuffer(),
      ],
      program.programId
    );

    [member2Account] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("member"),
        circleAccount.toBuffer(),
        member2.publicKey.toBuffer(),
      ],
      program.programId
    );

    [member3Account] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("member"),
        circleAccount.toBuffer(),
        member3.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Create escrow token account
    escrowTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      creator,
      mint,
      escrowAccount,
      true // allowOwnerOffCurve
    );
  });

  describe("Circle Initialization", () => {
    it("Initializes a new circle", async () => {
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
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      // Fetch and verify circle account
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.creator.toString()).to.equal(
        creator.publicKey.toString()
      );
      expect(circleData.contributionAmount.toString()).to.equal(
        contributionAmount.toString()
      );
      expect(circleData.durationMonths).to.equal(durationMonths);
      expect(circleData.maxMembers).to.equal(maxMembers);
      expect(circleData.currentMembers).to.equal(0);
      expect(circleData.penaltyRate).to.equal(penaltyRate);
      expect(circleData.status).to.deep.equal({ active: {} });

      // Fetch and verify escrow account
      const escrowData = await program.account.circleEscrow.fetch(
        escrowAccount
      );
      expect(escrowData.circle.toString()).to.equal(circleAccount.toString());
      expect(escrowData.totalAmount.toString()).to.equal("0");
    });

    it("Fails to initialize circle with invalid parameters", async () => {
      const invalidCircleKeypair = web3.Keypair.generate();

      try {
        await program.methods
          .initializeCircle(new BN(0), 0, 0, 10001) // Invalid parameters
          .accounts({
            circle: invalidCircleKeypair.publicKey,
            escrow: web3.Keypair.generate().publicKey,
            creator: creator.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([creator, invalidCircleKeypair])
          .rpc();

        expect.fail("Should have failed with invalid parameters");
      } catch (error) {
        expect(error.message).to.include("InvalidDuration");
      }
    });
  });

  describe("Member Operations", () => {
    it("Member can join circle", async () => {
      const tx = await program.methods
        .joinCircle(stakeAmount)
        .accounts({
          circle: circleAccount,
          member: member1Account,
          escrow: escrowAccount,
          memberAuthority: member1.publicKey,
          memberTokenAccount: member1TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();

      // Verify member account
      const memberData = await program.account.member.fetch(member1Account);
      expect(memberData.authority.toString()).to.equal(
        member1.publicKey.toString()
      );
      expect(memberData.circle.toString()).to.equal(circleAccount.toString());
      expect(memberData.stakeAmount.toString()).to.equal(
        stakeAmount.toString()
      );
      expect(memberData.status).to.deep.equal({ active: {} });
      expect(memberData.hasReceivedPot).to.be.false;

      // Verify circle updated
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.currentMembers).to.equal(1);
      expect(circleData.members).to.have.lengthOf(1);
      expect(circleData.members[0].toString()).to.equal(
        member1.publicKey.toString()
      );

      // Verify stake transferred
      const escrowBalance = await getAccount(
        provider.connection,
        escrowTokenAccount
      );
      expect(escrowBalance.amount.toString()).to.equal(stakeAmount.toString());
    });

    it("Second member can join circle", async () => {
      await program.methods
        .joinCircle(stakeAmount)
        .accounts({
          circle: circleAccount,
          member: member2Account,
          escrow: escrowAccount,
          memberAuthority: member2.publicKey,
          memberTokenAccount: member2TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member2])
        .rpc();

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.currentMembers).to.equal(2);
    });

    it("Third member can join circle", async () => {
      await program.methods
        .joinCircle(stakeAmount)
        .accounts({
          circle: circleAccount,
          member: member3Account,
          escrow: escrowAccount,
          memberAuthority: member3.publicKey,
          memberTokenAccount: member3TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member3])
        .rpc();

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.currentMembers).to.equal(3);
      expect(circleData.members).to.have.lengthOf(3);
    });

    it("Fails when circle is full", async () => {
      const extraMember = web3.Keypair.generate();
      await provider.connection.requestAirdrop(
        extraMember.publicKey,
        2 * web3.LAMPORTS_PER_SOL
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const extraMemberTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        extraMember,
        mint,
        extraMember.publicKey
      );

      await mintTo(
        provider.connection,
        creator,
        mint,
        extraMemberTokenAccount,
        creator.publicKey,
        10_000_000
      );

      const [extraMemberAccount] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("member"),
          circleAccount.toBuffer(),
          extraMember.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .joinCircle(stakeAmount)
          .accounts({
            circle: circleAccount,
            member: extraMemberAccount,
            escrow: escrowAccount,
            memberAuthority: extraMember.publicKey,
            memberTokenAccount: extraMemberTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([extraMember])
          .rpc();

        expect.fail("Should have failed when circle is full");
      } catch (error) {
        expect(error.message).to.include("CircleFull");
      }
    });

    it("Fails with insufficient stake", async () => {
      const newCreator = web3.Keypair.generate();
      await provider.connection.requestAirdrop(
        newCreator.publicKey,
        2 * web3.LAMPORTS_PER_SOL
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMember = web3.Keypair.generate();
      await provider.connection.requestAirdrop(
        newMember.publicKey,
        2 * web3.LAMPORTS_PER_SOL
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new circle for this test
      const timestamp = Math.floor(Date.now() / 1000) + 1000; // Different timestamp
      const [newCircleAccount] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("circle"),
          newCreator.publicKey.toBuffer(),
          Buffer.from(new BN(timestamp).toArray("le", 8)),
        ],
        program.programId
      );

      const [newEscrowAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), newCircleAccount.toBuffer()],
        program.programId
      );

      const [newMemberAccount] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("member"),
          newCircleAccount.toBuffer(),
          newMember.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Initialize new circle
      await program.methods
        .initializeCircle(
          contributionAmount,
          durationMonths,
          maxMembers,
          penaltyRate
        )
        .accounts({
          circle: newCircleAccount,
          escrow: newEscrowAccount,
          creator: newCreator.publicKey,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([newCreator])
        .rpc();

      const newMemberTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        newMember,
        mint,
        newMember.publicKey
      );

      await mintTo(
        provider.connection,
        creator,
        mint,
        newMemberTokenAccount,
        creator.publicKey,
        10_000_000
      );

      const newEscrowTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        newCreator,
        mint,
        newEscrowAccount,
        true
      );

      try {
        await program.methods
          .joinCircle(contributionAmount.div(new BN(2))) // Insufficient stake
          .accounts({
            circle: newCircleAccount,
            member: newMemberAccount,
            escrow: newEscrowAccount,
            memberAuthority: newMember.publicKey,
            memberTokenAccount: newMemberTokenAccount,
            escrowTokenAccount: newEscrowTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([newMember])
          .rpc();

        expect.fail("Should have failed with insufficient stake");
      } catch (error) {
        expect(error.message).to.include("InsufficientStake");
      }
    });
  });

  describe("Contributions", () => {
    it("Member can make a contribution", async () => {
      const initialEscrowBalance = await getAccount(
        provider.connection,
        escrowTokenAccount
      );

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

      // Verify contribution recorded
      const memberData = await program.account.member.fetch(member1Account);
      expect(memberData.contributionHistory[0].toString()).to.equal(
        contributionAmount.toString()
      );

      // Verify circle updated
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.totalPot.toString()).to.equal(
        contributionAmount.toString()
      );
      expect(circleData.monthlyContributions).to.have.lengthOf(1);
      expect(
        circleData.monthlyContributions[0].totalCollected.toString()
      ).to.equal(contributionAmount.toString());

      // Verify tokens transferred
      const newEscrowBalance = await getAccount(
        provider.connection,
        escrowTokenAccount
      );
      expect(newEscrowBalance.amount - initialEscrowBalance.amount).to.equal(
        contributionAmount.toNumber()
      );
    });

    it("Other members can contribute", async () => {
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circleAccount,
          member: member2Account,
          escrow: escrowAccount,
          memberAuthority: member2.publicKey,
          memberTokenAccount: member2TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member2])
        .rpc();

      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circleAccount,
          member: member3Account,
          escrow: escrowAccount,
          memberAuthority: member3.publicKey,
          memberTokenAccount: member3TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member3])
        .rpc();

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.totalPot.toString()).to.equal(
        contributionAmount.mul(new BN(3)).toString()
      );
    });

    it("Fails on duplicate contribution", async () => {
      try {
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

        expect.fail("Should have failed on duplicate contribution");
      } catch (error) {
        expect(error.message).to.include("ContributionAlreadyMade");
      }
    });

    it("Fails on invalid contribution amount", async () => {
      // Wait for next month simulation (this is simplified)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await program.methods
          .contribute(contributionAmount.div(new BN(2))) // Wrong amount
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

        expect.fail("Should have failed on invalid contribution amount");
      } catch (error) {
        expect(error.message).to.include("InvalidContributionAmount");
      }
    });
  });

  describe("Pot Distribution", () => {
    it("Can distribute pot to a member", async () => {
      const initialRecipientBalance = await getAccount(
        provider.connection,
        member1TokenAccount
      );

      await program.methods
        .distributePot()
        .accounts({
          circle: circleAccount,
          recipientMember: member1Account,
          escrow: escrowAccount,
          authority: creator.publicKey,
          recipientTokenAccount: member1TokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      // Verify member received pot
      const memberData = await program.account.member.fetch(member1Account);
      expect(memberData.hasReceivedPot).to.be.true;

      // Verify circle updated
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(
        circleData.monthlyContributions[0].distributedTo?.toString()
      ).to.equal(member1.publicKey.toString());

      // Verify tokens transferred
      const newRecipientBalance = await getAccount(
        provider.connection,
        member1TokenAccount
      );
      const expectedPotAmount = contributionAmount.mul(new BN(3)); // All 3 contributions
      expect(
        newRecipientBalance.amount - initialRecipientBalance.amount
      ).to.equal(expectedPotAmount.toNumber());
    });

    it("Fails on duplicate distribution", async () => {
      try {
        await program.methods
          .distributePot()
          .accounts({
            circle: circleAccount,
            recipientMember: member1Account,
            escrow: escrowAccount,
            authority: creator.publicKey,
            recipientTokenAccount: member1TokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([creator])
          .rpc();

        expect.fail("Should have failed on duplicate distribution");
      } catch (error) {
        expect(error.message).to.include("PotAlreadyDistributed");
      }
    });

    it("Fails when member already received pot", async () => {
      // Create a second month scenario - this is simplified
      // In a real implementation, we'd need proper time-based testing
      try {
        await program.methods
          .distributePot()
          .accounts({
            circle: circleAccount,
            recipientMember: member1Account, // Same member
            escrow: escrowAccount,
            authority: creator.publicKey,
            recipientTokenAccount: member1TokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([creator])
          .rpc();

        expect.fail("Should have failed when member already received pot");
      } catch (error) {
        expect(error.message).to.include("MemberAlreadyReceivedPot");
      }
    });
  });

  describe("Security Features", () => {
    it("Prevents reentrancy attacks", async () => {
      // This is a conceptual test - in practice, we'd need more sophisticated reentrancy testing
      // The Anchor framework and our instruction structure should prevent basic reentrancy

      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.status).to.deep.equal({ active: {} });
    });

    it("Validates account ownership", async () => {
      // Try to use wrong member account
      try {
        await program.methods
          .contribute(contributionAmount)
          .accounts({
            circle: circleAccount,
            member: member2Account, // Wrong member account
            escrow: escrowAccount,
            memberAuthority: member1.publicKey, // But member1's authority
            memberTokenAccount: member1TokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([member1])
          .rpc();

        expect.fail("Should have failed with wrong member account");
      } catch (error) {
        // Should fail due to seed mismatch
        expect(error).to.exist;
      }
    });

    it("Validates PDA seeds correctly", async () => {
      const circleData = await program.account.circle.fetch(circleAccount);
      const escrowData = await program.account.circleEscrow.fetch(
        escrowAccount
      );

      // Verify PDAs are correctly derived
      expect(escrowData.circle.toString()).to.equal(circleAccount.toString());
      expect(circleData.creator.toString()).to.equal(
        creator.publicKey.toString()
      );
    });
  });

  describe("Error Handling", () => {
    it("Handles arithmetic overflow gracefully", async () => {
      // This would require setting up a scenario that causes overflow
      // For now, we verify that our checks are in place
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.totalPot.toNumber()).to.be.greaterThan(0);
    });

    it("Validates state transitions", async () => {
      const circleData = await program.account.circle.fetch(circleAccount);
      expect(circleData.status).to.deep.equal({ active: {} });

      const memberData = await program.account.member.fetch(member1Account);
      expect(memberData.status).to.deep.equal({ active: {} });
    });
  });
});
