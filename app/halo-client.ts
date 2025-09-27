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

// Mock type for the Halo Protocol since we don't have the actual types
interface HaloProtocol {
  // Add minimal type definitions as needed
}

/**
 * Utility functions for interacting with the Halo Protocol with Solend integration
 */

export class HaloProtocolClient {
  private program: Program<HaloProtocol>;
  private provider: anchor.AnchorProvider;
  private solendService: SolendService | null = null;

  constructor(program: Program<HaloProtocol>) {
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
