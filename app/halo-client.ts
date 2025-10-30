import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SolendService, createSolendService } from "./solend-service";
import { HaloProtocolProgram, ProgramId } from "../target/types/halo_protocol";
import ArciumPrivacyService, { PrivacyMode, TrustScoreData, LoanData, BidData } from "./arcium-service";
import ReflectYieldService, { ReflectTokenType, YieldBreakdown } from "./reflect-service";

/**
 * Utility functions for interacting with the Halo Protocol with Solend integration
 */

export class HaloProtocolClient {
  private program: Program<HaloProtocolProgram>;
  private provider: anchor.AnchorProvider;
  private solendService: SolendService | null = null;
  private arciumService: ArciumPrivacyService | null = null;
  private reflectService: ReflectYieldService | null = null;

  constructor(program: Program<HaloProtocolProgram>) {
    this.program = program;
    this.provider = program.provider as anchor.AnchorProvider;
  }

  /**
   * Initialize Solend service for yield generation and borrowing
   */
  async initializeSolend(): Promise<void> {
    try {
      this.solendService = await createSolendService(this.provider.connection);
      console.log("✅ Solend service initialized");
    } catch (error) {
      console.error("Failed to initialize Solend service:", error);
      throw error;
    }
  }

  /**
   * Get Solend service instance
   */
  getSolendService(): SolendService {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }
    return this.solendService;
  }

  /**
   * Create a new ROSCA circle
   */
  async createCircle(
    creator: Keypair,
    contributionAmount: number,
    durationMonths: number,
    maxMembers: number,
    penaltyRate: number
  ) {
    const timestamp = Math.floor(Date.now() / 1000);
    const [circleAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("circle"),
        creator.publicKey.toBuffer(),
        Buffer.from(new anchor.BN(timestamp).toArray("le", 8)),
      ],
      this.program.programId
    );

    const [escrowAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .initializeCircle(
        new anchor.BN(contributionAmount),
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

    return {
      circleAccount,
      escrowAccount,
      transaction: tx,
    };
  }

  /**
   * Join an existing circle
   */
  async joinCircle(
    member: Keypair,
    circleAccount: PublicKey,
    escrowAccount: PublicKey,
    memberTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey,
    stakeAmount: number
  ) {
    const [memberAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("member"),
        circleAccount.toBuffer(),
        member.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    // Check if user has trust score
    const trustScoreAccount = this.getTrustScorePDA(member.publicKey);
    let trustScoreExists = true;
    try {
      await this.getTrustScoreInfo(trustScoreAccount);
    } catch (error) {
      trustScoreExists = false;
    }

    const accounts = {
      circle: circleAccount,
      member: memberAccount,
      escrow: escrowAccount,
      memberAuthority: member.publicKey,
      memberTokenAccount: memberTokenAccount,
      escrowTokenAccount: escrowTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any;

    // Only include trust score account if it exists
    if (trustScoreExists) {
      accounts.trustScore = trustScoreAccount;
    }

    const tx = await this.program.methods
      .joinCircle(new anchor.BN(stakeAmount))
      .accounts(accounts)
      .signers([member])
      .rpc();

    return {
      memberAccount,
      transaction: tx,
    };
  }

  /**
   * Make a contribution to the circle
   */
  async contribute(
    member: Keypair,
    circleAccount: PublicKey,
    memberAccount: PublicKey,
    escrowAccount: PublicKey,
    memberTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey,
    amount: number
  ) {
    // Check if user has trust score
    const trustScoreAccount = this.getTrustScorePDA(member.publicKey);
    let trustScoreExists = true;
    try {
      await this.getTrustScoreInfo(trustScoreAccount);
    } catch (error) {
      trustScoreExists = false;
    }

    const accounts = {
      circle: circleAccount,
      member: memberAccount,
      escrow: escrowAccount,
      memberAuthority: member.publicKey,
      memberTokenAccount: memberTokenAccount,
      escrowTokenAccount: escrowTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any;

    // Only include trust score account if it exists
    if (trustScoreExists) {
      accounts.trustScore = trustScoreAccount;
    }

    const tx = await this.program.methods
      .contribute(new anchor.BN(amount))
      .accounts(accounts)
      .signers([member])
      .rpc();

    return tx;
  }

  /**
   * Distribute the monthly pot
   */
  async distributePot(
    authority: Keypair,
    circleAccount: PublicKey,
    recipientMemberAccount: PublicKey,
    escrowAccount: PublicKey,
    recipientTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey
  ) {
    const tx = await this.program.methods
      .distributePot()
      .accounts({
        circle: circleAccount,
        recipientMember: recipientMemberAccount,
        escrow: escrowAccount,
        authority: authority.publicKey,
        recipientTokenAccount: recipientTokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([authority])
      .rpc();

    return tx;
  }

  /**
   * Get circle information
   */
  async getCircleInfo(circleAccount: PublicKey) {
    return await this.program.account.circle.fetch(circleAccount);
  }

  /**
   * Get member information
   */
  async getMemberInfo(memberAccount: PublicKey) {
    return await this.program.account.member.fetch(memberAccount);
  }

  /**
   * Get escrow information
   */
  async getEscrowInfo(escrowAccount: PublicKey) {
    return await this.program.account.circleEscrow.fetch(escrowAccount);
  }

  /**
   * Generate PDA addresses for a circle
   */
  getCirclePDAs(creatorPublicKey: PublicKey, timestamp: number) {
    const [circleAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("circle"),
        creatorPublicKey.toBuffer(),
        Buffer.from(new anchor.BN(timestamp).toArray("le", 8)),
      ],
      this.program.programId
    );

    const [escrowAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      this.program.programId
    );

    return { circleAccount, escrowAccount };
  }

  /**
   * Generate member PDA
   */
  getMemberPDA(circleAccount: PublicKey, memberPublicKey: PublicKey) {
    const [memberAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("member"),
        circleAccount.toBuffer(),
        memberPublicKey.toBuffer(),
      ],
      this.program.programId
    );

    return memberAccount;
  }

  /**
   * Generate trust score PDA
   */
  getTrustScorePDA(userPublicKey: PublicKey) {
    const [trustScoreAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), userPublicKey.toBuffer()],
      this.program.programId
    );

    return trustScoreAccount;
  }

  /**
   * Initialize trust score for a user
   */
  async initializeTrustScore(user: anchor.web3.Keypair) {
    const trustScoreAccount = this.getTrustScorePDA(user.publicKey);

    const tx = await this.program.methods
      .initializeTrustScore()
      .accounts({
        trustScore: trustScoreAccount,
        authority: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    return {
      trustScoreAccount,
      transaction: tx,
    };
  }

  /**
   * Update trust score for a user
   */
  async updateTrustScore(user: anchor.web3.Keypair) {
    const trustScoreAccount = this.getTrustScorePDA(user.publicKey);

    const tx = await this.program.methods
      .updateTrustScore()
      .accounts({
        trustScore: trustScoreAccount,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();

    return tx;
  }

  /**
   * Add social proof to trust score
   */
  async addSocialProof(
    user: anchor.web3.Keypair,
    proofType: string,
    identifier: string
  ) {
    const trustScoreAccount = this.getTrustScorePDA(user.publicKey);

    const tx = await this.program.methods
      .addSocialProof(proofType, identifier)
      .accounts({
        trustScore: trustScoreAccount,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();

    return tx;
  }

  /**
   * Verify social proof (requires verifier authority)
   */
  async verifySocialProof(
    userPublicKey: PublicKey,
    verifier: anchor.web3.Keypair,
    proofType: string,
    identifier: string
  ) {
    const trustScoreAccount = this.getTrustScorePDA(userPublicKey);

    const tx = await this.program.methods
      .verifySocialProof(proofType, identifier)
      .accounts({
        trustScore: trustScoreAccount,
        verifier: verifier.publicKey,
      })
      .signers([verifier])
      .rpc();

    return tx;
  }

  /**
   * Update DeFi activity score (requires oracle authority)
   */
  async updateDefiActivityScore(
    userPublicKey: PublicKey,
    oracle: anchor.web3.Keypair,
    activityScore: number
  ) {
    const trustScoreAccount = this.getTrustScorePDA(userPublicKey);

    const tx = await this.program.methods
      .updateDefiActivityScore(activityScore)
      .accounts({
        trustScore: trustScoreAccount,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();

    return tx;
  }

  /**
   * Get trust score information
   */
  async getTrustScoreInfo(trustScoreAccount: PublicKey) {
    return await this.program.account.trustScore.fetch(trustScoreAccount);
  }

  /**
   * Calculate minimum stake requirement for a user based on trust tier
   */
  async getMinimumStakeRequirement(
    userPublicKey: PublicKey,
    baseContributionAmount: number
  ) {
    try {
      const trustScoreAccount = this.getTrustScorePDA(userPublicKey);
      const trustScore = await this.getTrustScoreInfo(trustScoreAccount);
      
      const multiplier = this.getTierStakeMultiplier(trustScore.tier);
      return Math.floor((baseContributionAmount * multiplier) / 100);
    } catch (error) {
      // If trust score doesn't exist, return newcomer requirement (2x)
      return baseContributionAmount * 2;
    }
  }

  /**
   * Get stake multiplier for trust tier
   */
  getTierStakeMultiplier(tier: any): number {
    if (tier.newcomer) return 200; // 2x
    if (tier.silver) return 150;   // 1.5x
    if (tier.gold) return 100;     // 1x
    if (tier.platinum) return 75;  // 0.75x
    return 200; // Default to newcomer
  }

  /**
   * Update trust score after circle completion
   */
  async completeCircleUpdateTrust(
    userPublicKey: PublicKey,
    circleAccount: PublicKey,
    authority: anchor.web3.Keypair
  ) {
    const trustScoreAccount = this.getTrustScorePDA(userPublicKey);

    const tx = await this.program.methods
      .completeCircleUpdateTrust()
      .accounts({
        trustScore: trustScoreAccount,
        circle: circleAccount,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    return tx;
  }

  /**
   * Get trust tier name as string
   */
  getTierName(tier: any): string {
    if (tier.newcomer) return "Newcomer";
    if (tier.silver) return "Silver";
    if (tier.gold) return "Gold";
    if (tier.platinum) return "Platinum";
    return "Newcomer";
  }

  // =============================================================================
  // Dashboard Query Methods for Frontend Integration
  // =============================================================================

  /**
   * Get comprehensive trust score data formatted for dashboard consumption
   */
  async getDashboardTrustScore(userPublicKey: PublicKey) {
    try {
      const trustScoreAccount = this.getTrustScorePDA(userPublicKey);
      const trustScoreData = await this.getTrustScoreInfo(trustScoreAccount);

      // Format data for dashboard
      const dashboardData = {
        user: userPublicKey.toString(),
        score: trustScoreData.score,
        tier: this.getTierName(trustScoreData.tier),
        stakeMultiplier: this.getTierStakeMultiplier(trustScoreData.tier),
        breakdown: {
          paymentHistory: {
            score: trustScoreData.paymentHistoryScore,
            maxScore: 400,
            weight: 40,
            percentage: Math.round((trustScoreData.paymentHistoryScore / 400) * 100)
          },
          circleCompletions: {
            score: trustScoreData.completionScore,
            maxScore: 300,
            weight: 30,
            percentage: Math.round((trustScoreData.completionScore / 300) * 100)
          },
          defiActivity: {
            score: trustScoreData.defiActivityScore,
            maxScore: 200,
            weight: 20,
            percentage: Math.round((trustScoreData.defiActivityScore / 200) * 100)
          },
          socialProofs: {
            score: trustScoreData.socialProofScore,
            maxScore: 100,
            weight: 10,
            percentage: Math.round((trustScoreData.socialProofScore / 100) * 100)
          }
        },
        metadata: {
          circlesCompleted: trustScoreData.circlesCompleted,
          circlesJoined: trustScoreData.circlesJoined,
          totalContributions: trustScoreData.totalContributions.toString(),
          missedContributions: trustScoreData.missedContributions,
          socialProofs: trustScoreData.socialProofs.map(proof => ({
            type: proof.proofType,
            identifier: proof.identifier,
            verified: proof.verified,
            timestamp: proof.timestamp.toString()
          })),
          lastUpdated: trustScoreData.lastUpdated.toString()
        }
      };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard trust score:', error);
      throw new Error(`Failed to fetch trust score for user ${userPublicKey.toString()}: ${error}`);
    }
  }

  /**
   * Get trust scores for multiple users (batch query)
   * Useful for displaying leaderboards, circle member lists, etc.
   */
  async getBatchTrustScores(userPublicKeys: PublicKey[], includeErrors = false) {
    const results = [];

    for (const publicKey of userPublicKeys) {
      try {
        const trustScore = await this.getDashboardTrustScore(publicKey);
        results.push(trustScore);
      } catch (error) {
        if (includeErrors) {
          results.push({
            user: publicKey.toString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        // If not including errors, just skip failed ones
      }
    }

    return results;
  }

  /**
   * Get trust score rankings/leaderboard
   * Returns top users by score, with optional filtering by tier
   */
  async getTrustScoreLeaderboard(limit = 50, tier?: string, circleId?: PublicKey) {
    // Note: This would require indexing in production
    // For now, we'll return a mock implementation
    throw new Error('Leaderboard functionality requires blockchain indexing service');
  }

  /**
   * Get trust score analytics for dashboard insights
   */
  async getTrustScoreAnalytics(period = '30d') {
    // Note: This would require historical data indexing in production
    // For now, we'll return a mock implementation
    throw new Error('Analytics functionality requires historical data indexing service');
  }

  /**
   * Validate if a user meets minimum trust requirements for joining a circle
   */
  async validateCircleEligibility(
    userPublicKey: PublicKey, 
    circleAccount: PublicKey,
    requiredContributionAmount: number
  ) {
    try {
      const trustScoreAccount = this.getTrustScorePDA(userPublicKey);
      const trustScore = await this.getTrustScoreInfo(trustScoreAccount);
      const circle = await this.program.account.circle.fetch(circleAccount);

      const requiredStake = await this.getMinimumStakeRequirement(
        userPublicKey, 
        requiredContributionAmount
      );

      return {
        eligible: true, // Basic check - could add more sophisticated rules
        userScore: trustScore.score,
        userTier: this.getTierName(trustScore.tier),
        requiredStake,
        stakeMultiplier: this.getTierStakeMultiplier(trustScore.tier),
        recommendations: this.generateEligibilityRecommendations(trustScore)
      };
    } catch (error) {
      // User doesn't have trust score yet
      return {
        eligible: true, // Allow newcomers
        userScore: 0,
        userTier: 'Newcomer',
        requiredStake: requiredContributionAmount * 2, // 2x for newcomers
        stakeMultiplier: 200,
        recommendations: [
          'Complete trust score initialization',
          'Add and verify social proofs',
          'Consider starting with smaller circles'
        ]
      };
    }
  }

  /**
   * Generate recommendations for improving trust score
   */
  private generateEligibilityRecommendations(trustScore: any): string[] {
    const recommendations = [];

    if (trustScore.paymentHistoryScore < 200) {
      recommendations.push('Maintain consistent payment history in circles');
    }

    if (trustScore.completionScore < 150) {
      recommendations.push('Complete more circles to improve completion score');
    }

    if (trustScore.defiActivityScore < 100) {
      recommendations.push('Increase DeFi activity through Solend lending/borrowing');
    }

    if (trustScore.socialProofScore < 50) {
      recommendations.push('Add and verify more social proof credentials');
    }

    if (trustScore.score >= 750) {
      recommendations.push('Excellent trust score! You qualify for premium benefits');
    }

    return recommendations;
  }

  // =============================================================================
  // Automation Methods  
  // =============================================================================

  /**
   * Get automation state PDA
   */
  getAutomationStatePDA(): PublicKey {
    const [automationStateAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("automation_state")],
      this.program.programId
    );
    return automationStateAccount;
  }

  /**
   * Get circle automation PDA
   */
  getCircleAutomationPDA(circleAccount: PublicKey): PublicKey {
    const [circleAutomationAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("circle_automation"), circleAccount.toBuffer()],
      this.program.programId
    );
    return circleAutomationAccount;
  }

  /**
   * Get automation event PDA
   */
  getAutomationEventPDA(circleAccount: PublicKey, timestamp: number): PublicKey {
    const [automationEventAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("automation_event"),
        circleAccount.toBuffer(),
        Buffer.from(timestamp.toString())
      ],
      this.program.programId
    );
    return automationEventAccount;
  }

  /**
   * Initialize global automation state
   */
  async initializeAutomationState(
    authority: anchor.web3.Keypair,
    switchboardQueue: PublicKey,
    minInterval: number
  ) {
    const automationStateAccount = this.getAutomationStatePDA();

    const tx = await this.program.methods
      .initializeAutomationState(new anchor.BN(minInterval))
      .accounts({
        automationState: automationStateAccount,
        switchboardQueue: switchboardQueue,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return { tx, automationStateAccount };
  }

  /**
   * Setup automation for a circle
   */
  async setupCircleAutomation(
    circleAccount: PublicKey,
    authority: anchor.web3.Keypair,
    switchboardJob: PublicKey,
    autoCollect: boolean = true,
    autoDistribute: boolean = true,
    autoPenalty: boolean = true
  ) {
    const automationStateAccount = this.getAutomationStatePDA();
    const circleAutomationAccount = this.getCircleAutomationPDA(circleAccount);

    const tx = await this.program.methods
      .setupCircleAutomation(autoCollect, autoDistribute, autoPenalty)
      .accounts({
        circleAutomation: circleAutomationAccount,
        automationState: automationStateAccount,
        circle: circleAccount,
        switchboardJob: switchboardJob,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return { tx, circleAutomationAccount };
  }

  /**
   * Trigger automated contribution collection
   */
  async triggerAutomatedContributionCollection(
    circleAccount: PublicKey,
    payer: anchor.web3.Keypair
  ) {
    const circleAutomationAccount = this.getCircleAutomationPDA(circleAccount);
    const timestamp = Date.now();
    const automationEventAccount = this.getAutomationEventPDA(circleAccount, timestamp);

    const tx = await this.program.methods
      .automatedContributionCollection()
      .accounts({
        circleAutomation: circleAutomationAccount,
        automationEvent: automationEventAccount,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    return { tx, automationEventAccount };
  }

  /**
   * Trigger automated payout distribution
   */
  async triggerAutomatedPayoutDistribution(
    circleAccount: PublicKey,
    recipient: PublicKey,
    distributePotAccounts: any, // DistributePot account struct
    payer: anchor.web3.Keypair
  ) {
    const circleAutomationAccount = this.getCircleAutomationPDA(circleAccount);
    const timestamp = Date.now();
    const automationEventAccount = this.getAutomationEventPDA(circleAccount, timestamp);

    const tx = await this.program.methods
      .automatedPayoutDistribution(recipient)
      .accounts({
        circleAutomation: circleAutomationAccount,
        automationEvent: automationEventAccount,
        distributePotAccounts: distributePotAccounts,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    return { tx, automationEventAccount };
  }

  /**
   * Trigger automated penalty enforcement
   */
  async triggerAutomatedPenaltyEnforcement(
    circleAccount: PublicKey,
    payer: anchor.web3.Keypair
  ) {
    const circleAutomationAccount = this.getCircleAutomationPDA(circleAccount);
    const timestamp = Date.now();
    const automationEventAccount = this.getAutomationEventPDA(circleAccount, timestamp);

    const tx = await this.program.methods
      .automatedPenaltyEnforcement()
      .accounts({
        circleAutomation: circleAutomationAccount,
        circle: circleAccount,
        automationEvent: automationEventAccount,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    return { tx, automationEventAccount };
  }

  /**
   * Update automation settings
   */
  async updateAutomationSettings(
    authority: anchor.web3.Keypair,
    enabled: boolean,
    minInterval?: number
  ) {
    const automationStateAccount = this.getAutomationStatePDA();

    const tx = await this.program.methods
      .updateAutomationSettings(enabled, minInterval ? new anchor.BN(minInterval) : null)
      .accounts({
        automationState: automationStateAccount,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    return tx;
  }

  /**
   * Execute Switchboard automation callback
   */
  async executeSwitchboardCallback(
    switchboardFeed: PublicKey,
    payer: anchor.web3.Keypair
  ) {
    const automationStateAccount = this.getAutomationStatePDA();

    const tx = await this.program.methods
      .switchboardAutomationCallback()
      .accounts({
        automationState: automationStateAccount,
        switchboardFeed: switchboardFeed,
      })
      .signers([payer])
      .rpc();

    return tx;
  }

  /**
   * Get automation state information
   */
  async getAutomationState() {
    const automationStateAccount = this.getAutomationStatePDA();
    return await this.program.account.automationState.fetch(automationStateAccount);
  }

  /**
   * Get circle automation information
   */
  async getCircleAutomation(circleAccount: PublicKey) {
    const circleAutomationAccount = this.getCircleAutomationPDA(circleAccount);
    return await this.program.account.circleAutomation.fetch(circleAutomationAccount);
  }

  /**
   * Get automation event information
   */
  async getAutomationEvent(automationEventAccount: PublicKey) {
    return await this.program.account.automationEvent.fetch(automationEventAccount);
  }

  /**
   * Check if it's time for contribution collection
   */
  async isTimeForContributionCollection(circleAccount: PublicKey): Promise<boolean> {
    try {
      const automation = await this.getCircleAutomation(circleAccount);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return automation.autoCollectEnabled && 
             automation.contributionSchedule.some((scheduledTime: any) => 
               currentTime >= scheduledTime.toNumber() && 
               automation.lastContributionCheck.toNumber() < scheduledTime.toNumber()
             );
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if it's time for payout distribution
   */
  async isTimeForPayoutDistribution(circleAccount: PublicKey): Promise<boolean> {
    try {
      const automation = await this.getCircleAutomation(circleAccount);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return automation.autoDistributeEnabled && 
             automation.distributionSchedule.some((scheduledTime: any) => 
               currentTime >= scheduledTime.toNumber() && 
               automation.lastDistributionCheck.toNumber() < scheduledTime.toNumber()
             );
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if it's time for penalty enforcement
   */
  async isTimeForPenaltyEnforcement(circleAccount: PublicKey): Promise<boolean> {
    try {
      const automation = await this.getCircleAutomation(circleAccount);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return automation.autoPenaltyEnabled && 
             automation.penaltySchedule.some((scheduledTime: any) => 
               currentTime >= scheduledTime.toNumber() && 
               automation.lastPenaltyCheck.toNumber() < scheduledTime.toNumber()
             );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get next scheduled automation events for a circle
   */
  async getNextAutomationEvents(circleAccount: PublicKey) {
    try {
      const automation = await this.getCircleAutomation(circleAccount);
      const currentTime = Math.floor(Date.now() / 1000);

      const nextContribution = automation.contributionSchedule
        .map((time: any) => time.toNumber())
        .find((time: number) => time > currentTime);

      const nextDistribution = automation.distributionSchedule
        .map((time: any) => time.toNumber())
        .find((time: number) => time > currentTime);

      const nextPenalty = automation.penaltySchedule
        .map((time: any) => time.toNumber())
        .find((time: number) => time > currentTime);

      return {
        nextContribution: nextContribution || null,
        nextDistribution: nextDistribution || null,
        nextPenalty: nextPenalty || null,
      };
    } catch (error) {
      return {
        nextContribution: null,
        nextDistribution: null,
        nextPenalty: null,
      };
    }
  }

  // =============================================================================
  // Solend Integration Methods
  // =============================================================================

  /**
   * Deposit circle funds into Solend for yield generation
   * @param circleAccount - The circle account
   * @param tokenMint - Token mint address
   * @param amount - Amount to deposit
   * @param sourceTokenAccount - Source token account (escrow account)
   * @param authority - Circle authority that can sign for escrow
   * @returns Transaction signature
   */
  async depositCircleFundsToSolend(
    circleAccount: PublicKey,
    tokenMint: PublicKey,
    amount: number,
    sourceTokenAccount: PublicKey,
    authority: Keypair
  ): Promise<string> {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const signature = await this.solendService.depositCircleFunds(
        authority,
        tokenMint,
        amount,
        sourceTokenAccount
      );

      console.log(`✅ Deposited ${amount} tokens to Solend for circle ${circleAccount.toString()}`);
      return signature;
    } catch (error) {
      console.error("Failed to deposit circle funds to Solend:", error);
      throw error;
    }
  }

  /**
   * Borrow against circle collateral from Solend
   * @param circleAccount - The circle account
   * @param collateralMint - Collateral token mint
   * @param borrowMint - Token to borrow mint
   * @param borrowAmount - Amount to borrow
   * @param destinationTokenAccount - Destination for borrowed tokens
   * @param authority - Circle authority
   * @returns Transaction signature
   */
  async borrowFromSolend(
    circleAccount: PublicKey,
    collateralMint: PublicKey,
    borrowMint: PublicKey,
    borrowAmount: number,
    destinationTokenAccount: PublicKey,
    authority: Keypair
  ): Promise<string> {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const signature = await this.solendService.borrowAgainstCollateral(
        authority,
        collateralMint,
        borrowMint,
        borrowAmount,
        destinationTokenAccount
      );

      console.log(`✅ Borrowed ${borrowAmount} tokens from Solend for circle ${circleAccount.toString()}`);
      return signature;
    } catch (error) {
      console.error("Failed to borrow from Solend:", error);
      throw error;
    }
  }

  /**
   * Repay loan to Solend
   * @param circleAccount - The circle account
   * @param tokenMint - Token mint to repay
   * @param repayAmount - Amount to repay
   * @param sourceTokenAccount - Source token account for repayment
   * @param authority - Circle authority
   * @returns Transaction signature
   */
  async repayToSolend(
    circleAccount: PublicKey,
    tokenMint: PublicKey,
    repayAmount: number,
    sourceTokenAccount: PublicKey,
    authority: Keypair
  ): Promise<string> {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const signature = await this.solendService.repayLoan(
        authority,
        tokenMint,
        repayAmount,
        sourceTokenAccount
      );

      console.log(`✅ Repaid ${repayAmount} tokens to Solend for circle ${circleAccount.toString()}`);
      return signature;
    } catch (error) {
      console.error("Failed to repay to Solend:", error);
      throw error;
    }
  }

  /**
   * Withdraw funds from Solend
   * @param circleAccount - The circle account
   * @param tokenMint - Token mint to withdraw
   * @param withdrawAmount - Amount to withdraw
   * @param destinationTokenAccount - Destination token account
   * @param authority - Circle authority
   * @returns Transaction signature
   */
  async withdrawFromSolend(
    circleAccount: PublicKey,
    tokenMint: PublicKey,
    withdrawAmount: number,
    destinationTokenAccount: PublicKey,
    authority: Keypair
  ): Promise<string> {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const signature = await this.solendService.withdrawFunds(
        authority,
        tokenMint,
        withdrawAmount,
        destinationTokenAccount
      );

      console.log(`✅ Withdrew ${withdrawAmount} tokens from Solend for circle ${circleAccount.toString()}`);
      return signature;
    } catch (error) {
      console.error("Failed to withdraw from Solend:", error);
      throw error;
    }
  }

  /**
   * Get current Solend market yields and information
   * @returns Market yields data
   */
  async getSolendMarketYields() {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const yields = await this.solendService.fetchMarketYields();
      console.log(`✅ Fetched yields for ${yields.reserves.length} reserves`);
      return yields;
    } catch (error) {
      console.error("Failed to fetch Solend market yields:", error);
      throw error;
    }
  }

  /**
   * Get user position in Solend for a specific token
   * @param userPublicKey - User's public key
   * @param tokenMint - Token mint address
   * @returns User position information
   */
  async getSolendUserPosition(userPublicKey: PublicKey, tokenMint: PublicKey) {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const position = await this.solendService.getUserPosition(userPublicKey, tokenMint);
      return position;
    } catch (error) {
      console.error("Failed to get Solend user position:", error);
      throw error;
    }
  }

  /**
   * Get available Solend reserves
   * @returns List of available reserves
   */
  async getSolendAvailableReserves() {
    if (!this.solendService) {
      throw new Error("Solend service not initialized. Call initializeSolend() first.");
    }

    try {
      const reserves = await this.solendService.getAvailableReserves();
      return reserves;
    } catch (error) {
      console.error("Failed to get Solend available reserves:", error);
      throw error;
    }
  }

  // ============================================================================
  // ARCIUM PRIVACY INTEGRATION
  // ============================================================================

  /**
   * Initialize Arcium privacy service for encrypted operations
   */
  async initializeArcium(): Promise<void> {
    try {
      this.arciumService = new ArciumPrivacyService(this.provider.connection);
      await this.arciumService.initialize();
      console.log("✅ Arcium privacy service initialized");
    } catch (error) {
      console.error("Failed to initialize Arcium service:", error);
      throw error;
    }
  }

  /**
   * Get Arcium service instance
   */
  getArciumService(): ArciumPrivacyService {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }
    return this.arciumService;
  }

  /**
   * Create a private circle with Arcium privacy features
   */
  async createPrivateCircle(
    creator: Keypair,
    contributionAmount: number,
    durationMonths: number,
    maxMembers: number,
    privacyMode: 'public' | 'anonymous' | 'fully_encrypted'
  ) {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }

    console.log(`Creating ${privacyMode} circle...`);

    // Setup privacy configuration
    const privacySettings = await this.arciumService.setupCirclePrivacy(
      creator.publicKey,
      privacyMode === 'public' ? PrivacyMode.Public :
      privacyMode === 'anonymous' ? PrivacyMode.Anonymous :
      PrivacyMode.FullyEncrypted
    );

    // Create the circle (use existing createCircle method)
    const circleAccount = await this.createCircle(
      creator,
      contributionAmount,
      durationMonths,
      maxMembers,
      100 // default penalty rate
    );

    console.log(`✅ Private circle created with ${privacyMode} mode`);
    console.log("Circle account:", circleAccount.circleAccount.toBase58());

    return { circleAccount, privacySettings };
  }

  /**
   * Encrypt trust score calculation using Arcium MPC
   */
  async encryptTrustScore(trustData: TrustScoreData) {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }

    return await this.arciumService.encryptTrustScore(trustData);
  }

  /**
   * Create encrypted loan terms for private borrowing
   */
  async createPrivateLoan(loanData: LoanData) {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }

    return await this.arciumService.encryptLoanTerms(loanData);
  }

  /**
   * Place sealed bid in auction (encrypted until reveal)
   */
  async placeSealedBid(bidData: BidData) {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }

    return await this.arciumService.encryptBid(bidData);
  }

  /**
   * Anonymize member in a private circle
   */
  async anonymizeMember(
    memberWallet: PublicKey,
    memberId: number,
    stakeAmount?: number
  ) {
    if (!this.arciumService) {
      throw new Error("Arcium service not initialized. Call initializeArcium() first.");
    }

    return await this.arciumService.anonymizeMember(
      memberWallet,
      memberId,
      stakeAmount
    );
  }

  // ============================================================================
  // REFLECT YIELD INTEGRATION
  // ============================================================================

  /**
   * Initialize Reflect yield service for dual yield generation
   */
  async initializeReflect(): Promise<void> {
    try {
      this.reflectService = new ReflectYieldService(this.provider.connection);
      await this.reflectService.initialize();
      console.log("✅ Reflect yield service initialized");
    } catch (error) {
      console.error("Failed to initialize Reflect service:", error);
      throw error;
    }
  }

  /**
   * Get Reflect service instance
   */
  getReflectService(): ReflectYieldService {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }
    return this.reflectService;
  }

  /**
   * Stake funds to Reflect's USDC+ or USDJ
   */
  async stakeWithReflect(
    amount: number,
    tokenType: 'USDC+' | 'USDJ',
    destination: PublicKey,
    userWallet: PublicKey
  ): Promise<string> {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }

    console.log(`Staking ${amount} to ${tokenType}...`);

    if (tokenType === 'USDC+') {
      return await this.reflectService.stakeUSDCPlus(amount, destination, userWallet);
    } else {
      return await this.reflectService.stakeUSDJ(amount, userWallet);
    }
  }

  /**
   * Get dual yield breakdown (Reflect + Solend)
   */
  async getDualYieldBreakdown(
    amount: number,
    tokenType: 'USDC+' | 'USDJ' = 'USDC+'
  ): Promise<YieldBreakdown> {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }

    // Get Solend APY if available
    let solendAPY: number | undefined;
    if (this.solendService) {
      try {
        const reserves = await this.solendService.getReserveStats();
        const usdcReserve = reserves.find(r => r.symbol === 'USDC');
        solendAPY = usdcReserve?.supplyAPY || 3.2;
      } catch (error) {
        console.warn("Could not fetch Solend APY, using default");
        solendAPY = 3.2;
      }
    }

    const reflectTokenType = tokenType === 'USDC+'
      ? ReflectTokenType.USDCPlus
      : ReflectTokenType.USDJ;

    return await this.reflectService.getYieldBreakdown(
      amount,
      reflectTokenType,
      solendAPY
    );
  }

  /**
   * Get price appreciation for Reflect tokens
   */
  async getReflectPriceAppreciation(
    token: 'USDC+' | 'USDJ',
    period: '24h' | '7d' | '30d' | '1y'
  ) {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }

    const tokenType = token === 'USDC+' ? ReflectTokenType.USDCPlus : ReflectTokenType.USDJ;
    return await this.reflectService.getPriceAppreciation(tokenType, period);
  }

  /**
   * Get available dual yield strategies
   */
  async getReflectStrategies() {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }

    return await this.reflectService.getAvailableStrategies();
  }

  /**
   * Get recommended Reflect strategy based on user profile
   */
  async getRecommendedReflectStrategy(params: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentPeriod: 'short' | 'medium' | 'long';
    amount: number;
  }) {
    if (!this.reflectService) {
      throw new Error("Reflect service not initialized. Call initializeReflect() first.");
    }

    return await this.reflectService.recommendStrategy(params);
  }

  /**
   * Initialize all services (Solend, Arcium, Reflect)
   */
  async initializeAllServices(): Promise<void> {
    console.log("Initializing all Halo Protocol services...");

    await this.initializeSolend();
    await this.initializeArcium();
    await this.initializeReflect();

    console.log("✅ All services initialized successfully");
  }

  /**
   * Get comprehensive circle analytics including dual yields
   */
  async getCircleAnalytics(circleAccount: PublicKey) {
    const circle = await this.program.account.circle.fetch(circleAccount);

    // Get escrow account
    const [escrowAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), circleAccount.toBuffer()],
      this.program.programId
    );

    const escrow = await this.program.account.circleEscrow.fetch(escrowAccount);

    // Calculate dual yields if Reflect is enabled
    let yieldBreakdown: YieldBreakdown | null = null;
    if (this.reflectService) {
      yieldBreakdown = await this.getDualYieldBreakdown(
        escrow.totalAmount.toNumber()
      );
    }

    return {
      circle,
      escrow,
      yieldBreakdown,
      totalYield: escrow.totalYieldEarned.toNumber(),
      reflectYield: escrow.reflectYieldEarned?.toNumber() || 0,
      solendYield: escrow.solendYieldEarned?.toNumber() || 0
    };
  }
}

/**
 * Helper function to setup test environment with tokens
 */
export async function setupTestEnvironment(
  connection: Connection,
  payer: Keypair
) {
  // Create mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // 6 decimals
  );

  return { mint };
}

/**
 * Helper function to create and fund token accounts
 */
export async function createAndFundTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: Keypair,
  amount: number
) {
  const tokenAccount = await createAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  await mintTo(connection, payer, mint, tokenAccount, payer.publicKey, amount);

  return tokenAccount;
}
