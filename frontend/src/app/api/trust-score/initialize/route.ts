import { NextRequest } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getConnection } from "@/lib/helius";
import { PROGRAM_ID, SEEDS } from "@/lib/constants";
import { getServerProgram } from "@/lib/solana-client";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  validateFields,
  requireAuth,
} from "@/lib/api-utils";

// POST /api/trust-score/initialize — initialize trust score PDA
export async function POST(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const missing = validateFields(body, ["wallet"]);
    if (missing) return apiError(missing);

    if (body.wallet !== auth.wallet) {
      return apiError("Wallet mismatch", 403);
    }

    const { wallet } = body;
    const walletKey = new PublicKey(wallet);

    // Derive trust score PDA
    const [trustPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.TRUST_SCORE, walletKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if already initialized
    const existing = await getConnection().getAccountInfo(trustPDA);
    if (existing) {
      return apiError("Trust score already initialized");
    }

    // Build Anchor instruction
    const program = getServerProgram(getConnection());
    const ix = await program.methods
      .initializeTrustScore()
      .accounts({
        trustScore: trustPDA,
        authority: walletKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const tx = new Transaction();
    tx.add(ix);
    const recentBlockhash = await getConnection().getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = walletKey;

    const serializedTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    return apiSuccess({
      transaction: serializedTx,
      trustScorePDA: trustPDA.toBase58(),
    });
  } catch (err) {
    console.error("Initialize trust score error:", err);
    return apiError("Internal server error", 500);
  }
}
