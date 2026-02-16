import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PROGRAM_ID, SEEDS } from "./constants";
import idl from "../../public/halo_protocol.json";

let _program: Program | null = null;

export function getProgram(provider: AnchorProvider): Program {
  if (!_program || _program.provider !== provider) {
    _program = new Program(idl as any, provider);
  }
  return _program;
}

// Server-side program factory (no wallet needed — for building unsigned txs)
export function getServerProgram(conn: Connection): Program {
  const provider = new AnchorProvider(conn, {} as any, {
    commitment: "confirmed",
  });
  return new Program(idl as any, provider);
}

export function getConnection(): Connection {
  return new Connection(
    process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
      "https://api.devnet.solana.com",
    "confirmed"
  );
}

// PDA derivation helpers

export function deriveCirclePDA(
  creator: PublicKey,
  circleId: Buffer
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.CIRCLE, creator.toBuffer(), circleId],
    PROGRAM_ID
  );
}

export function deriveEscrowPDA(
  circleKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.ESCROW, circleKey.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveMemberPDA(
  circleKey: PublicKey,
  authority: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.MEMBER, circleKey.toBuffer(), authority.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveTrustScorePDA(
  authority: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.TRUST_SCORE, authority.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveInsurancePDA(
  circleKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.INSURANCE, circleKey.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.TREASURY],
    PROGRAM_ID
  );
}

export function deriveRevenueParamsPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.REVENUE_PARAMS],
    PROGRAM_ID
  );
}

export function deriveProposalPDA(
  circleKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.PROPOSAL, circleKey.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveVotePDA(
  proposalKey: PublicKey,
  voterKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.VOTE, proposalKey.toBuffer(), voterKey.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveAuctionPDA(
  circleKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.AUCTION, circleKey.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveBidPDA(
  auctionKey: PublicKey,
  bidderKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.BID, auctionKey.toBuffer(), bidderKey.toBuffer()],
    PROGRAM_ID
  );
}

// Serialize transaction for client-side signing
export function serializeTransaction(tx: Transaction): string {
  return tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");
}

// Deserialize transaction from base64
export function deserializeTransaction(base64: string): Transaction {
  return Transaction.from(Buffer.from(base64, "base64"));
}
