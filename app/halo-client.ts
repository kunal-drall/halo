import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HaloProtocol } from "../target/types/halo_protocol";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

/**
 * Utility functions for interacting with the Halo Protocol
 */

export class HaloProtocolClient {
  private program: Program<HaloProtocol>;
  private provider: anchor.AnchorProvider;

  constructor(program: Program<HaloProtocol>) {
    this.program = program;
    this.provider = program.provider as anchor.AnchorProvider;
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

    const tx = await this.program.methods
      .joinCircle(new anchor.BN(stakeAmount))
      .accounts({
        circle: circleAccount,
        member: memberAccount,
        escrow: escrowAccount,
        memberAuthority: member.publicKey,
        memberTokenAccount: memberTokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
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
    const tx = await this.program.methods
      .contribute(new anchor.BN(amount))
      .accounts({
        circle: circleAccount,
        member: memberAccount,
        escrow: escrowAccount,
        memberAuthority: member.publicKey,
        memberTokenAccount: memberTokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
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
