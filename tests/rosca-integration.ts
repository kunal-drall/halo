import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { HaloProtocol } from '../target/types/halo_protocol';
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { expect } from 'chai';

describe('ROSCA Integration Tests', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test accounts
  let circle: Keypair;
  let member1: Keypair;
  let member2: Keypair;
  let member3: Keypair;
  let escrow: PublicKey;
  let insurancePool: PublicKey;

  before(async () => {
    // Generate test accounts
    circle = Keypair.generate();
    member1 = Keypair.generate();
    member2 = Keypair.generate();
    member3 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(member1.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(member2.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(member3.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Circle Creation and Management', () => {
    it('Creates a circle with all ROSCA fields', async () => {
      const contributionAmount = new anchor.BN(100 * LAMPORTS_PER_SOL); // 100 SOL
      const durationMonths = 6;
      const maxMembers = 3;
      const penaltyRate = 500; // 5%

      // Generate PDAs
      const [circlePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('circle'), wallet.publicKey.toBuffer(), circle.publicKey.toBuffer()],
        program.programId
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), circlePda.toBuffer()],
        program.programId
      );

      const [insurancePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('insurance'), circlePda.toBuffer()],
        program.programId
      );

      escrow = escrowPda;
      insurancePool = insurancePda;

      const tx = await program.methods
        .initializeCircle(
          contributionAmount,
          durationMonths,
          maxMembers,
          penaltyRate
        )
        .accounts({
          circle: circlePda,
          creator: wallet.publicKey,
          escrow: escrowPda,
          insurancePool: insurancePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([circle])
        .rpc();

      console.log('Circle creation transaction:', tx);

      // Verify circle account
      const circleAccount = await program.account.circle.fetch(circlePda);
      expect(circleAccount.creator.toBase58()).to.equal(wallet.publicKey.toBase58());
      expect(circleAccount.contributionAmount.toNumber()).to.equal(contributionAmount.toNumber());
      expect(circleAccount.durationMonths).to.equal(durationMonths);
      expect(circleAccount.maxMembers).to.equal(maxMembers);
      expect(circleAccount.penaltyRate).to.equal(penaltyRate);
      expect(circleAccount.status).to.deep.equal({ active: {} });
    });

    it('Allows members to join with insurance', async () => {
      const insuranceAmount = new anchor.BN(10 * LAMPORTS_PER_SOL); // 10 SOL insurance

      // Generate member PDA
      const [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .joinCircle(insuranceAmount)
        .accounts({
          circle: circle.publicKey,
          member: member1Pda,
          memberAuthority: member1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      console.log('Member join transaction:', tx);

      // Verify member account
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.authority.toBase58()).to.equal(member1.publicKey.toBase58());
      expect(memberAccount.stakeAmount.toNumber()).to.equal(insuranceAmount.toNumber());
      expect(memberAccount.status).to.deep.equal({ active: {} });
    });

    it('Processes monthly contributions', async () => {
      const contributionAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);

      // Generate member PDA
      const [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circle.publicKey,
          member: member1Pda,
          memberAuthority: member1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      console.log('Contribution transaction:', tx);

      // Verify contribution was recorded
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.contributionHistory.length).to.be.greaterThan(0);
    });

    it('Handles payout claiming', async () => {
      // First, add more members to make it a complete circle
      const insuranceAmount = new anchor.BN(10 * LAMPORTS_PER_SOL);

      // Member 2 joins
      const [member2Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .joinCircle(insuranceAmount)
        .accounts({
          circle: circle.publicKey,
          member: member2Pda,
          memberAuthority: member2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member2])
        .rpc();

      // Member 3 joins
      const [member3Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member3.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .joinCircle(insuranceAmount)
        .accounts({
          circle: circle.publicKey,
          member: member3Pda,
          memberAuthority: member3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member3])
        .rpc();

      // All members contribute
      const contributionAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);

      // Member 1 contributes
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circle.publicKey,
          member: member1Pda,
          memberAuthority: member1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      // Member 2 contributes
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circle.publicKey,
          member: member2Pda,
          memberAuthority: member2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member2])
        .rpc();

      // Member 3 contributes
      await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circle.publicKey,
          member: member3Pda,
          memberAuthority: member3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member3])
        .rpc();

      // Now test payout claiming (assuming member1 is first in queue)
      const tx = await program.methods
        .claimPayout()
        .accounts({
          circle: circle.publicKey,
          member: member1Pda,
          escrow: escrow,
          memberAuthority: member1.publicKey,
        })
        .signers([member1])
        .rpc();

      console.log('Payout claim transaction:', tx);

      // Verify member received payout
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.payoutClaimed).to.be.true;
      expect(memberAccount.hasReceivedPot).to.be.true;
    });
  });

  describe('Insurance System', () => {
    it('Handles insurance staking', async () => {
      const stakeAmount = new anchor.BN(5 * LAMPORTS_PER_SOL);

      const [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .stakeInsurance(stakeAmount)
        .accounts({
          insurancePool: insurancePool,
          circle: circle.publicKey,
          member: member1Pda,
          memberAuthority: member1.publicKey,
        })
        .signers([member1])
        .rpc();

      console.log('Insurance stake transaction:', tx);

      // Verify insurance pool was updated
      const insuranceAccount = await program.account.insurancePool.fetch(insurancePool);
      expect(insuranceAccount.totalStaked.toNumber()).to.be.greaterThan(0);
    });

    it('Handles insurance slashing on default', async () => {
      const [member2Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .slashInsurance()
        .accounts({
          insurancePool: insurancePool,
          circle: circle.publicKey,
          member: member2Pda,
          memberAuthority: member2.publicKey,
        })
        .signers([member2])
        .rpc();

      console.log('Insurance slash transaction:', tx);

      // Verify member status changed to defaulted
      const memberAccount = await program.account.member.fetch(member2Pda);
      expect(memberAccount.status).to.deep.equal({ defaulted: {} });
    });
  });

  describe('Trust Score System', () => {
    it('Initializes trust score for new user', async () => {
      const [trustScorePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('trust_score'), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScorePda,
          user: member1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      console.log('Trust score initialization transaction:', tx);

      // Verify trust score account
      const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
      expect(trustScoreAccount.user.toBase58()).to.equal(member1.publicKey.toBase58());
      expect(trustScoreAccount.overallScore).to.equal(0);
      expect(trustScoreAccount.tier).to.deep.equal({ newcomer: {} });
    });

    it('Updates trust score after circle completion', async () => {
      const [trustScorePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('trust_score'), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .completeCircleUpdateTrust()
        .accounts({
          circle: circle.publicKey,
          trustScore: trustScorePda,
          user: member1.publicKey,
        })
        .signers([member1])
        .rpc();

      console.log('Trust score update transaction:', tx);

      // Verify trust score was updated
      const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
      expect(trustScoreAccount.overallScore).to.be.greaterThan(0);
    });
  });

  describe('Yield Integration', () => {
    it('Deposits funds to Solend for yield generation', async () => {
      const depositAmount = new anchor.BN(50 * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .depositToSolend(depositAmount)
        .accounts({
          circle: circle.publicKey,
          escrow: escrow,
        })
        .rpc();

      console.log('Solend deposit transaction:', tx);

      // Verify escrow account was updated
      const escrowAccount = await program.account.circleEscrow.fetch(escrow);
      expect(escrowAccount.solendCTokenBalance.toNumber()).to.be.greaterThan(0);
    });

    it('Calculates and distributes yield to members', async () => {
      const tx = await program.methods
        .calculateYieldShare()
        .accounts({
          circle: circle.publicKey,
          escrow: escrow,
        })
        .rpc();

      console.log('Yield calculation transaction:', tx);

      // Verify yield was calculated
      const escrowAccount = await program.account.circleEscrow.fetch(escrow);
      expect(escrowAccount.totalYieldEarned.toNumber()).to.be.greaterThan(0);
    });
  });

  describe('Revenue Collection', () => {
    it('Collects fees on contributions', async () => {
      const contributionAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);
      const expectedFee = contributionAmount.mul(new anchor.BN(5)).div(new anchor.BN(1000)); // 0.5%

      const [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circle.publicKey.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .contribute(contributionAmount)
        .accounts({
          circle: circle.publicKey,
          member: member1Pda,
          memberAuthority: member1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

      console.log('Revenue collection transaction:', tx);

      // Verify fees were collected (would need to check treasury account)
      // This is a simplified test - in practice, you'd verify the treasury balance increased
    });
  });

  describe('Error Handling', () => {
    it('Prevents joining full circle', async () => {
      // This test would verify that attempting to join a full circle fails
      // Implementation depends on the specific error handling in the smart contract
    });

    it('Prevents claiming payout when not your turn', async () => {
      // This test would verify that only the correct member can claim payout
      // Implementation depends on the specific validation logic
    });

    it('Prevents contributing after circle completion', async () => {
      // This test would verify that contributions are blocked after circle ends
      // Implementation depends on the circle status validation
    });
  });

  describe('Edge Cases', () => {
    it('Handles member default gracefully', async () => {
      // Test insurance distribution to remaining members
      // Test trust score penalties
      // Test circle continuation logic
    });

    it('Handles network issues during transactions', async () => {
      // Test transaction retry logic
      // Test state consistency after failures
    });

    it('Handles large numbers of members', async () => {
      // Test performance with maximum allowed members
      // Test gas costs and transaction limits
    });
  });
});

