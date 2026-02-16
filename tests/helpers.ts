import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Program ID from Anchor.toml
export const PROGRAM_ID = new web3.PublicKey(
  "25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5"
);

// ---------------------------------------------------------------------------
// Airdrop helper
// ---------------------------------------------------------------------------

export async function airdropSol(
  connection: web3.Connection,
  publicKey: web3.PublicKey,
  amount: number = 10 * web3.LAMPORTS_PER_SOL
): Promise<void> {
  const sig = await connection.requestAirdrop(publicKey, amount);
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: sig,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
}

// ---------------------------------------------------------------------------
// SPL Token helpers
// ---------------------------------------------------------------------------

export async function createTestMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  decimals: number = 6
): Promise<web3.PublicKey> {
  return await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    null, // freeze authority
    decimals
  );
}

export async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
): Promise<web3.PublicKey> {
  return await createAccount(connection, payer, mint, owner);
}

export async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  amount: number | bigint
): Promise<void> {
  await mintTo(
    connection,
    payer,
    mint,
    destination,
    payer, // mint authority
    amount
  );
}

// ---------------------------------------------------------------------------
// PDA derivation helpers
// ---------------------------------------------------------------------------

/**
 * Derive the Circle PDA.
 *
 * Seeds: [b"circle", creator.key().as_ref(), &id.to_le_bytes()]
 * where id = Clock::get().unix_timestamp at creation time.
 */
export function findCirclePDA(
  creator: web3.PublicKey,
  id: BN
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("circle"),
      creator.toBuffer(),
      id.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );
}

/**
 * Derive the Escrow PDA.
 *
 * Seeds: [b"escrow", circle.key().as_ref()]
 */
export function findEscrowPDA(
  circle: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), circle.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Member PDA.
 *
 * Seeds: [b"member", circle.key().as_ref(), member_authority.key().as_ref()]
 */
export function findMemberPDA(
  circle: web3.PublicKey,
  memberAuthority: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("member"), circle.toBuffer(), memberAuthority.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the TrustScore PDA.
 *
 * Seeds: [b"trust_score", authority.key().as_ref()]
 */
export function findTrustScorePDA(
  authority: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("trust_score"), authority.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the InsurancePool PDA.
 *
 * Seeds: [b"insurance", circle.key().as_ref()]
 */
export function findInsurancePoolPDA(
  circle: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("insurance"), circle.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Treasury PDA.
 *
 * Seeds: [b"treasury"]
 */
export function findTreasuryPDA(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    PROGRAM_ID
  );
}

/**
 * Derive the RevenueParams PDA.
 *
 * Seeds: [b"revenue_params"]
 */
export function findRevenueParamsPDA(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("revenue_params")],
    PROGRAM_ID
  );
}

/**
 * Derive the GovernanceProposal PDA.
 *
 * Seeds: [b"proposal", circle.key().as_ref()]
 */
export function findProposalPDA(
  circle: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), circle.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Vote PDA.
 *
 * Seeds: [b"vote", proposal.key().as_ref(), voter.key().as_ref()]
 */
export function findVotePDA(
  proposal: web3.PublicKey,
  voter: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposal.toBuffer(), voter.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Auction PDA.
 *
 * Seeds: [b"auction", circle.key().as_ref()]
 */
export function findAuctionPDA(
  circle: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), circle.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Bid PDA.
 *
 * Seeds: [b"bid", auction.key().as_ref(), bidder.key().as_ref()]
 */
export function findBidPDA(
  auction: web3.PublicKey,
  bidder: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bid"), auction.toBuffer(), bidder.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the RevenueReport PDA.
 *
 * Seeds: [b"revenue_report", period_start.to_le_bytes(), period_end.to_le_bytes()]
 */
export function findRevenueReportPDA(
  periodStart: BN,
  periodEnd: BN
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("revenue_report"),
      periodStart.toArrayLike(Buffer, "le", 8),
      periodEnd.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );
}

/**
 * Derive the AutomationState PDA.
 *
 * Seeds: [b"automation_state"]
 */
export function findAutomationStatePDA(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("automation_state")],
    PROGRAM_ID
  );
}

/**
 * Derive the CircleAutomation PDA.
 *
 * Seeds: [b"circle_automation", circle.key().as_ref()]
 */
export function findCircleAutomationPDA(
  circle: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("circle_automation"), circle.toBuffer()],
    PROGRAM_ID
  );
}

// ---------------------------------------------------------------------------
// High-level test helpers
// ---------------------------------------------------------------------------

/**
 * Context object returned by initializeCircle helper so callers have all the
 * keys needed for subsequent instructions.
 */
export interface CircleContext {
  circleKey: web3.PublicKey;
  circleBump: number;
  escrowKey: web3.PublicKey;
  escrowBump: number;
  creator: web3.Keypair;
  mint: web3.PublicKey;
  escrowTokenAccount: web3.PublicKey;
  circleId: BN;
}

/**
 * Initialize a circle with sensible default parameters.
 *
 * Because the circle PDA uses the Clock unix_timestamp as the `id` seed, and
 * we cannot know it ahead of time in a test, we derive the PDA *after* the
 * transaction by fetching the created accounts.
 *
 * However, Anchor requires us to compute the PDA client-side before sending
 * the instruction. The recommended pattern is to fetch the clock slot, compute
 * the expected timestamp, and derive from that. In localnet tests the timestamp
 * is predictable enough. Alternatively we send the tx and catch the returned
 * circle address from logs.
 *
 * For simplicity we use the approach of fetching clock first.
 */
export async function initializeCircle(
  program: Program<any>,
  creator: web3.Keypair,
  mint: web3.PublicKey,
  params?: {
    contributionAmount?: BN;
    durationMonths?: number;
    maxMembers?: number;
    penaltyRate?: number;
  }
): Promise<CircleContext> {
  const connection = program.provider.connection;

  const contributionAmount = params?.contributionAmount ?? new BN(1_000_000); // 1 USDC
  const durationMonths = params?.durationMonths ?? 6;
  const maxMembers = params?.maxMembers ?? 5;
  const penaltyRate = params?.penaltyRate ?? 500; // 5%

  // Fetch current clock to derive the PDA
  const slot = await connection.getSlot();
  const clockTimestamp = await connection.getBlockTime(slot);
  if (clockTimestamp === null) {
    throw new Error("Could not fetch block time for PDA derivation");
  }
  const circleId = new BN(clockTimestamp);

  const [circleKey, circleBump] = findCirclePDA(creator.publicKey, circleId);
  const [escrowKey, escrowBump] = findEscrowPDA(circleKey);

  // Create a token account owned by the escrow PDA to hold escrowed tokens
  const escrowTokenAccount = await createTokenAccount(
    connection,
    creator,
    mint,
    escrowKey
  );

  await program.methods
    .initializeCircle(contributionAmount, durationMonths, maxMembers, penaltyRate)
    .accounts({
      circle: circleKey,
      escrow: escrowKey,
      creator: creator.publicKey,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([creator])
    .rpc();

  return {
    circleKey,
    circleBump,
    escrowKey,
    escrowBump,
    creator,
    mint,
    escrowTokenAccount,
    circleId,
  };
}

/**
 * Join a circle as a new member. Creates a member token account and funds it
 * before calling join_circle.
 */
export async function joinCircle(
  program: Program<any>,
  circleCtx: CircleContext,
  memberAuthority: web3.Keypair,
  stakeAmount: BN,
  trustScoreKey?: web3.PublicKey
): Promise<{
  memberKey: web3.PublicKey;
  memberBump: number;
  memberTokenAccount: web3.PublicKey;
}> {
  const connection = program.provider.connection;

  const [memberKey, memberBump] = findMemberPDA(
    circleCtx.circleKey,
    memberAuthority.publicKey
  );

  // Create and fund the member's token account
  const memberTokenAccount = await createTokenAccount(
    connection,
    circleCtx.creator, // payer
    circleCtx.mint,
    memberAuthority.publicKey
  );

  // Mint tokens so the member can stake
  await mintTokens(
    connection,
    circleCtx.creator,
    circleCtx.mint,
    memberTokenAccount,
    stakeAmount.toNumber() * 2 // mint extra so we have room for contributions
  );

  const remainingAccounts = trustScoreKey
    ? [{ pubkey: trustScoreKey, isSigner: false, isWritable: false }]
    : [];

  await program.methods
    .joinCircle(stakeAmount)
    .accounts({
      circle: circleCtx.circleKey,
      member: memberKey,
      escrow: circleCtx.escrowKey,
      memberAuthority: memberAuthority.publicKey,
      trustScore: trustScoreKey ?? null,
      memberTokenAccount: memberTokenAccount,
      escrowTokenAccount: circleCtx.escrowTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([memberAuthority])
    .rpc();

  return { memberKey, memberBump, memberTokenAccount };
}

/**
 * Initialize the treasury and revenue params. Many instructions (distribute_pot
 * etc.) require these accounts to exist.
 */
export async function initializeRevenueAccounts(
  program: Program<any>,
  authority: web3.Keypair
): Promise<{
  treasuryKey: web3.PublicKey;
  revenueParamsKey: web3.PublicKey;
}> {
  const [treasuryKey] = findTreasuryPDA();
  const [revenueParamsKey] = findRevenueParamsPDA();

  await program.methods
    .initializeTreasury()
    .accounts({
      treasury: treasuryKey,
      authority: authority.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  await program.methods
    .initializeRevenueParams()
    .accounts({
      revenueParams: revenueParamsKey,
      authority: authority.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  return { treasuryKey, revenueParamsKey };
}

// ---------------------------------------------------------------------------
// Error assertion helpers
// ---------------------------------------------------------------------------

/**
 * Assert that a transaction fails with a specific Anchor error code name.
 *
 * Usage:
 *   await expectError(
 *     program.methods.someIx().accounts({...}).signers([]).rpc(),
 *     "CircleFull"
 *   );
 */
export async function expectError(
  promise: Promise<any>,
  expectedErrorCodeOrMsg: string
): Promise<void> {
  try {
    await promise;
    throw new Error(`Expected transaction to fail with "${expectedErrorCodeOrMsg}" but it succeeded`);
  } catch (err: any) {
    const errStr = err.toString();
    if (
      !errStr.includes(expectedErrorCodeOrMsg) &&
      !(err.error && err.error.errorCode && err.error.errorCode.code === expectedErrorCodeOrMsg)
    ) {
      throw new Error(
        `Expected error to contain "${expectedErrorCodeOrMsg}" but got: ${errStr}`
      );
    }
  }
}
