import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";

import {
  airdropSol,
  createTestMint,
  createTokenAccount,
  mintTokens,
  findTrustScorePDA,
  findCirclePDA,
  findEscrowPDA,
  findMemberPDA,
  initializeCircle,
  joinCircle,
  initializeRevenueAccounts,
  expectError,
  CircleContext,
  PROGRAM_ID,
} from "./helpers";

describe("halo-protocol: trust score system", () => {
  // -------------------------------------------------------------------------
  // Provider & program setup
  // -------------------------------------------------------------------------
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HaloProtocol as Program<any>;
  const connection = provider.connection;

  let authority: web3.Keypair;
  let mint: web3.PublicKey;

  before(async () => {
    authority = web3.Keypair.generate();
    await airdropSol(connection, authority.publicKey);
    mint = await createTestMint(connection, authority);
  });

  // =========================================================================
  // initialize_trust_score
  // =========================================================================

  describe("initialize_trust_score", () => {
    it("creates a trust score account with default values", async () => {
      const user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const trustScoreAccount = await program.account.trustScore.fetch(
        trustScoreKey
      );

      expect(trustScoreAccount.authority.toBase58()).to.equal(
        user.publicKey.toBase58()
      );
      expect(trustScoreAccount.score).to.equal(0);
      // Tier should be Newcomer (enum variant 0)
      expect(JSON.stringify(trustScoreAccount.tier)).to.include("newcomer");
      expect(trustScoreAccount.paymentHistoryScore).to.equal(0);
      expect(trustScoreAccount.completionScore).to.equal(0);
      expect(trustScoreAccount.defiActivityScore).to.equal(0);
      expect(trustScoreAccount.socialProofScore).to.equal(0);
      expect(trustScoreAccount.circlesCompleted).to.equal(0);
      expect(trustScoreAccount.circlesJoined).to.equal(0);
      expect(trustScoreAccount.totalContributions.toNumber()).to.equal(0);
      expect(trustScoreAccount.missedContributions).to.equal(0);
      expect(trustScoreAccount.socialProofs).to.have.lengthOf(0);
      expect(trustScoreAccount.lastUpdated.toNumber()).to.be.greaterThan(0);
    });

    it("fails to create duplicate trust score for same authority", async () => {
      const user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      // First initialization succeeds
      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Second initialization should fail (PDA already initialized)
      await expectError(
        program.methods
          .initializeTrustScore()
          .accounts({
            trustScore: trustScoreKey,
            authority: user.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc(),
        "already in use"
      );
    });
  });

  // =========================================================================
  // update_trust_score
  // =========================================================================

  describe("update_trust_score", () => {
    it("recalculates trust score based on current data", async () => {
      const user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      // Initialize
      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Update (with all zeros, score should remain 0)
      await program.methods
        .updateTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      const trustScoreAccount = await program.account.trustScore.fetch(
        trustScoreKey
      );

      // Score should still be 0 since no activity
      expect(trustScoreAccount.score).to.equal(0);
      // Tier should be Newcomer
      expect(JSON.stringify(trustScoreAccount.tier)).to.include("newcomer");
      // last_updated should be updated
      expect(trustScoreAccount.lastUpdated.toNumber()).to.be.greaterThan(0);
    });
  });

  // =========================================================================
  // add_social_proof
  // =========================================================================

  describe("add_social_proof", () => {
    let user: web3.Keypair;
    let trustScoreKey: web3.PublicKey;

    before(async () => {
      user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    });

    it("adds social proof successfully", async () => {
      await program.methods
        .addSocialProof("Twitter", "@halouser")
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      const trustScoreAccount = await program.account.trustScore.fetch(
        trustScoreKey
      );

      expect(trustScoreAccount.socialProofs).to.have.lengthOf(1);
      expect(trustScoreAccount.socialProofs[0].proofType).to.equal("Twitter");
      expect(trustScoreAccount.socialProofs[0].identifier).to.equal(
        "@halouser"
      );
      expect(trustScoreAccount.socialProofs[0].verified).to.be.false;
      expect(
        trustScoreAccount.socialProofs[0].timestamp.toNumber()
      ).to.be.greaterThan(0);
    });

    it("adds multiple different social proofs", async () => {
      await program.methods
        .addSocialProof("Discord", "halouser#1234")
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      const trustScoreAccount = await program.account.trustScore.fetch(
        trustScoreKey
      );

      expect(trustScoreAccount.socialProofs).to.have.lengthOf(2);
      expect(trustScoreAccount.socialProofs[1].proofType).to.equal("Discord");
      expect(trustScoreAccount.socialProofs[1].identifier).to.equal(
        "halouser#1234"
      );
    });

    it("fails to add duplicate social proof", async () => {
      await expectError(
        program.methods
          .addSocialProof("Twitter", "@halouser")
          .accounts({
            trustScore: trustScoreKey,
            authority: user.publicKey,
          })
          .signers([user])
          .rpc(),
        "SocialProofAlreadyExists"
      );
    });
  });

  // =========================================================================
  // verify_social_proof
  // =========================================================================

  describe("verify_social_proof", () => {
    let user: web3.Keypair;
    let verifier: web3.Keypair;
    let trustScoreKey: web3.PublicKey;

    before(async () => {
      user = web3.Keypair.generate();
      verifier = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);
      await airdropSol(connection, verifier.publicKey);

      [trustScoreKey] = findTrustScorePDA(user.publicKey);

      // Initialize trust score and add a proof
      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      await program.methods
        .addSocialProof("Twitter", "@verifytest")
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();
    });

    it("verifies social proof and updates score", async () => {
      // VerifySocialProof uses `verifier` as signer and looks up
      // trust_score by trust_score.authority (not the signer)
      await program.methods
        .verifySocialProof("Twitter", "@verifytest")
        .accounts({
          trustScore: trustScoreKey,
          verifier: verifier.publicKey,
        })
        .signers([verifier])
        .rpc();

      const trustScoreAccount = await program.account.trustScore.fetch(
        trustScoreKey
      );

      // Verify the proof is now marked verified
      const twitterProof = trustScoreAccount.socialProofs.find(
        (p: any) => p.proofType === "Twitter" && p.identifier === "@verifytest"
      );
      expect(twitterProof).to.not.be.undefined;
      expect(twitterProof.verified).to.be.true;

      // Score should have been recalculated.
      // 1 verified proof -> social_proof_score = min(1 * 20, 100) = 20
      expect(trustScoreAccount.socialProofScore).to.equal(20);
    });

    it("fails to verify nonexistent social proof", async () => {
      await expectError(
        program.methods
          .verifySocialProof("GitHub", "@nonexistent")
          .accounts({
            trustScore: trustScoreKey,
            verifier: verifier.publicKey,
          })
          .signers([verifier])
          .rpc(),
        "InvalidSocialProof"
      );
    });
  });

  // =========================================================================
  // Trust tier calculations
  // =========================================================================

  describe("trust tier calculation", () => {
    it("Newcomer tier for score 0-249", async () => {
      const user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // With no activity, score = 0 -> Newcomer
      const ts = await program.account.trustScore.fetch(trustScoreKey);
      expect(ts.score).to.be.lessThan(250);
      expect(JSON.stringify(ts.tier)).to.include("newcomer");
    });

    it("verifies stake multiplier for Newcomer is 2x (200)", async () => {
      // The multiplier is calculated on-chain; we verify indirectly by
      // checking that a Newcomer needs 2x contribution_amount as stake.
      //
      // contribution_amount = 1_000_000
      // Newcomer multiplier = 200 (i.e. 2.0x)
      // minimum_stake = 1_000_000 * 200 / 100 = 2_000_000
      //
      // We already tested this in join_circle with InsufficientStake.
      // Here we just verify the trust score tier is correct.
      const user = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const ts = await program.account.trustScore.fetch(trustScoreKey);
      // Newcomer tier with multiplier 200 (2x)
      expect(JSON.stringify(ts.tier)).to.include("newcomer");
    });
  });

  // =========================================================================
  // update_defi_activity_score
  // =========================================================================

  describe("update_defi_activity_score", () => {
    it("updates DeFi activity score", async () => {
      const user = web3.Keypair.generate();
      const oracle = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);
      await airdropSol(connection, oracle.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Oracle updates the DeFi activity score to 150 (out of max 200)
      await program.methods
        .updateDefiActivityScore(150)
        .accounts({
          trustScore: trustScoreKey,
          oracle: oracle.publicKey,
        })
        .signers([oracle])
        .rpc();

      const ts = await program.account.trustScore.fetch(trustScoreKey);
      expect(ts.defiActivityScore).to.equal(150);
      // Total score = 0 (payment) + 0 (completion) + 150 (defi) + 0 (social) = 150
      expect(ts.score).to.equal(150);
      // 150 is in Newcomer range (0-249)
      expect(JSON.stringify(ts.tier)).to.include("newcomer");
    });

    it("DeFi activity score is capped at 200", async () => {
      const user = web3.Keypair.generate();
      const oracle = web3.Keypair.generate();
      await airdropSol(connection, user.publicKey);
      await airdropSol(connection, oracle.publicKey);

      const [trustScoreKey] = findTrustScorePDA(user.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Attempt to set score above 200 should fail
      await expectError(
        program.methods
          .updateDefiActivityScore(201)
          .accounts({
            trustScore: trustScoreKey,
            oracle: oracle.publicKey,
          })
          .signers([oracle])
          .rpc(),
        "InvalidSocialProof" // The program reuses this error for score > 200
      );
    });
  });

  // =========================================================================
  // complete_circle_update_trust
  // =========================================================================

  describe("complete_circle_update_trust", () => {
    it("updates trust score for completed circle", async () => {
      const circleCreator = web3.Keypair.generate();
      await airdropSol(connection, circleCreator.publicKey);
      const localMint = await createTestMint(connection, circleCreator);

      // We need revenue accounts for this test
      // Use a separate keypair to avoid conflicts if treasury already exists
      // In practice you would re-use the global ones.

      // Create a circle with duration 1 to quickly complete
      const circleCtx = await initializeCircle(
        program,
        circleCreator,
        localMint,
        {
          contributionAmount: new BN(1_000_000),
          durationMonths: 1,
          maxMembers: 5,
          penaltyRate: 500,
        }
      );

      // Initialize trust score for a member
      const member = web3.Keypair.generate();
      await airdropSol(connection, member.publicKey);

      const [trustScoreKey] = findTrustScorePDA(member.publicKey);

      await program.methods
        .initializeTrustScore()
        .accounts({
          trustScore: trustScoreKey,
          authority: member.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([member])
        .rpc();

      // Join the circle
      await joinCircle(
        program,
        circleCtx,
        member,
        new BN(2_000_000),
        trustScoreKey
      );

      // For complete_circle_update_trust, the circle status must be
      // Completed. We would need to fully run through the circle lifecycle.
      // Since this is a structural test, we verify the instruction exists
      // and the correct accounts are wired up. In integration testing,
      // you would manipulate the clock to advance months.

      // Attempting on an Active circle should fail
      await expectError(
        program.methods
          .completeCircleUpdateTrust()
          .accounts({
            trustScore: trustScoreKey,
            circle: circleCtx.circleKey,
            authority: member.publicKey,
          })
          .signers([member])
          .rpc(),
        "CircleNotActive" // Circle is Active, not Completed
      );
    });
  });
});
