import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import { HaloProtocolClient } from "../app/halo-client";

describe("Trust Scoring System", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.HaloProtocol as Program<HaloProtocol>;
  const provider = anchor.getProvider();
  const client = new HaloProtocolClient(program);

  let mint: web3.PublicKey;
  let user1: web3.Keypair;
  let user2: web3.Keypair;
  let verifier: web3.Keypair; // Oracle/verifier for social proofs
  let oracle: web3.Keypair;   // Oracle for DeFi activity scores

  let user1TokenAccount: web3.PublicKey;
  let user2TokenAccount: web3.PublicKey;

  const contributionAmount = new BN(1000_000); // 1 token

  before(async () => {
    // Create keypairs
    user1 = web3.Keypair.generate();
    user2 = web3.Keypair.generate();
    verifier = web3.Keypair.generate();
    oracle = web3.Keypair.generate();

    // Airdrop SOL
    const users = [user1, user2, verifier, oracle];
    for (const user of users) {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          user.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        )
      );
    }

    // Create mint
    mint = await createMint(
      provider.connection,
      user1,
      user1.publicKey,
      null,
      6
    );

    // Create token accounts
    user1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user1,
      mint,
      user1.publicKey
    );

    user2TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user2,
      mint,
      user2.publicKey
    );

    // Mint tokens
    await mintTo(
      provider.connection,
      user1,
      mint,
      user1TokenAccount,
      user1.publicKey,
      10_000_000 // 10 tokens
    );

    await mintTo(
      provider.connection,
      user1,
      mint,
      user2TokenAccount,
      user1.publicKey,
      10_000_000 // 10 tokens
    );
  });

  describe("Trust Score Initialization", () => {
    it("Should initialize trust score for a new user", async () => {
      const { trustScoreAccount } = await client.initializeTrustScore(user1);

      // Fetch and verify trust score account
      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      
      expect(trustScoreData.authority.toString()).to.equal(user1.publicKey.toString());
      expect(trustScoreData.score).to.equal(0);
      expect(trustScoreData.tier).to.deep.equal({ newcomer: {} });
      expect(trustScoreData.paymentHistoryScore).to.equal(0);
      expect(trustScoreData.completionScore).to.equal(0);
      expect(trustScoreData.defiActivityScore).to.equal(0);
      expect(trustScoreData.socialProofScore).to.equal(0);
      expect(trustScoreData.circlesCompleted).to.equal(0);
      expect(trustScoreData.circlesJoined).to.equal(0);
      expect(trustScoreData.totalContributions.toString()).to.equal("0");
      expect(trustScoreData.missedContributions).to.equal(0);
      expect(trustScoreData.socialProofs).to.have.length(0);
    });

    it("Should calculate minimum stake requirements for newcomer", async () => {
      const baseAmount = 1000_000;
      const minStake = await client.getMinimumStakeRequirement(
        user1.publicKey, 
        baseAmount
      );
      
      // Newcomer tier should require 2x base stake
      expect(minStake).to.equal(baseAmount * 2);
    });

    it("Should return tier name correctly", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      const trustScore = await client.getTrustScoreInfo(trustScoreAccount);
      
      const tierName = client.getTierName(trustScore.tier);
      expect(tierName).to.equal("Newcomer");
    });
  });

  describe("Social Proof System", () => {
    it("Should add social proof", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      
      await client.addSocialProof(user1, "Twitter", "@user1_handle");

      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.socialProofs).to.have.length(1);
      expect(trustScoreData.socialProofs[0].proofType).to.equal("Twitter");
      expect(trustScoreData.socialProofs[0].identifier).to.equal("@user1_handle");
      expect(trustScoreData.socialProofs[0].verified).to.equal(false);
    });

    it("Should verify social proof and update score", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      
      await client.verifySocialProof(
        user1.publicKey, 
        verifier, 
        "Twitter", 
        "@user1_handle"
      );

      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.socialProofs[0].verified).to.equal(true);
      expect(trustScoreData.socialProofScore).to.equal(20); // 1 verified proof * 20 points
      expect(trustScoreData.score).to.equal(20); // Only social proof score
    });

    it("Should handle multiple social proofs", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      
      await client.addSocialProof(user1, "Discord", "user1#1234");
      await client.verifySocialProof(
        user1.publicKey, 
        verifier, 
        "Discord", 
        "user1#1234"
      );

      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.socialProofs).to.have.length(2);
      expect(trustScoreData.socialProofScore).to.equal(40); // 2 verified proofs * 20 points
      expect(trustScoreData.score).to.equal(40);
    });

    it("Should prevent duplicate social proofs", async () => {
      try {
        await client.addSocialProof(user1, "Twitter", "@user1_handle");
        expect.fail("Should have thrown error for duplicate social proof");
      } catch (error) {
        expect(error.message).to.include("SocialProofAlreadyExists");
      }
    });
  });

  describe("DeFi Activity Scoring", () => {
    it("Should update DeFi activity score", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      
      await client.updateDefiActivityScore(user1.publicKey, oracle, 150);

      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.defiActivityScore).to.equal(150);
      // Total should be social proof (40) + DeFi activity (150) = 190
      expect(trustScoreData.score).to.equal(190);
    });

    it("Should cap DeFi activity score at maximum", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      
      await client.updateDefiActivityScore(user1.publicKey, oracle, 200); // Max for 20%

      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.defiActivityScore).to.equal(200);
    });

    it("Should reject DeFi activity score above maximum", async () => {
      try {
        await client.updateDefiActivityScore(user1.publicKey, oracle, 250);
        expect.fail("Should have thrown error for score above maximum");
      } catch (error) {
        expect(error.message).to.include("InvalidSocialProof");
      }
    });
  });

  describe("Trust Score Updates", () => {
    it("Should manually update trust score", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user1.publicKey);
      const beforeUpdate = await client.getTrustScoreInfo(trustScoreAccount);
      
      await client.updateTrustScore(user1);
      
      const afterUpdate = await client.getTrustScoreInfo(trustScoreAccount);
      expect(afterUpdate.lastUpdated).to.be.greaterThan(beforeUpdate.lastUpdated);
    });
  });

  describe("Trust Tier Progression", () => {
    it("Should progress to Silver tier", async () => {
      const trustScoreAccount = client.getTrustScorePDA(user2.publicKey);
      
      // Initialize trust score for user2
      await client.initializeTrustScore(user2);
      
      // Add enough social proofs to get to Silver tier (need 250+ points)
      for (let i = 0; i < 5; i++) {
        await client.addSocialProof(user2, `Platform${i}`, `user2_${i}`);
        await client.verifySocialProof(
          user2.publicKey, 
          verifier, 
          `Platform${i}`, 
          `user2_${i}`
        );
      }
      
      // Add DeFi activity score to reach 250+ points
      await client.updateDefiActivityScore(user2.publicKey, oracle, 200);
      
      const trustScoreData = await client.getTrustScoreInfo(trustScoreAccount);
      expect(trustScoreData.score).to.be.at.least(250);
      expect(trustScoreData.tier).to.deep.equal({ silver: {} });
      
      const tierName = client.getTierName(trustScoreData.tier);
      expect(tierName).to.equal("Silver");
    });

    it("Should have different stake requirements for Silver tier", async () => {
      const baseAmount = 1000_000;
      const minStake = await client.getMinimumStakeRequirement(
        user2.publicKey, 
        baseAmount
      );
      
      // Silver tier should require 1.5x base stake
      expect(minStake).to.equal(Math.floor(baseAmount * 1.5));
    });
  });

  describe("Trust Score Integration with Circles", () => {
    let circleAccount: web3.PublicKey;
    let escrowAccount: web3.PublicKey;
    let escrowTokenAccount: web3.PublicKey;

    it("Should create circle and join with trust score considerations", async () => {
      // Create circle
      const { circleAccount: circle, escrowAccount: escrow } = 
        await client.createCircle(
          user2, // Silver tier user
          contributionAmount.toNumber(),
          3, // duration months
          3, // max members
          1000 // penalty rate
        );
      
      circleAccount = circle;
      escrowAccount = escrow;

      // Create escrow token account
      escrowTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        user2,
        mint,
        escrowAccount,
        true // allowOwnerOffCurve
      );

      // Calculate required stake for Silver tier user
      const requiredStake = await client.getMinimumStakeRequirement(
        user2.publicKey,
        contributionAmount.toNumber()
      );

      // Join circle with appropriate stake amount
      await client.joinCircle(
        user2,
        circleAccount,
        escrowAccount,
        user2TokenAccount,
        escrowTokenAccount,
        requiredStake
      );

      // Verify member was added with correct trust info
      const memberAccount = client.getMemberPDA(circleAccount, user2.publicKey);
      const memberData = await client.getMemberInfo(memberAccount);
      
      expect(memberData.authority.toString()).to.equal(user2.publicKey.toString());
      expect(memberData.trustTier).to.deep.equal({ silver: {} });
      expect(memberData.trustScore).to.be.at.least(250);
    });

    it("Should update trust score when making contributions", async () => {
      const memberAccount = client.getMemberPDA(circleAccount, user2.publicKey);
      const trustScoreAccount = client.getTrustScorePDA(user2.publicKey);
      
      const trustScoreBefore = await client.getTrustScoreInfo(trustScoreAccount);
      
      // Make contribution
      await client.contribute(
        user2,
        circleAccount,
        memberAccount,
        escrowAccount,
        user2TokenAccount,
        escrowTokenAccount,
        contributionAmount.toNumber()
      );
      
      const trustScoreAfter = await client.getTrustScoreInfo(trustScoreAccount);
      
      // Total contributions should increase
      expect(
        trustScoreAfter.totalContributions.toString()
      ).to.equal(contributionAmount.toString());
      
      // Should be greater due to contribution tracking
      expect(trustScoreAfter.lastUpdated).to.be.greaterThan(trustScoreBefore.lastUpdated);
    });
  });
});