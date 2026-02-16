import { NextRequest } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { getServiceClient } from "@/lib/supabase";
import { getConnection } from "@/lib/helius";
import { PROGRAM_ID, SEEDS, USDC_MINT } from "@/lib/constants";
import { getServerProgram } from "@/lib/solana-client";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  validateFields,
  requireAuth,
  getUserIdFromWallet,
} from "@/lib/api-utils";

// POST /api/circles/[id]/join — join a circle (returns unsigned transaction)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const missing = validateFields(body, ["wallet", "stake_amount"]);
    if (missing) return apiError(missing);

    if (body.wallet !== auth.wallet) {
      return apiError("Wallet mismatch", 403);
    }

    // Resolve wallet to UUID
    const userId = await getUserIdFromWallet(auth.wallet);
    if (!userId) {
      return apiError("User not found. Connect wallet first.", 401);
    }

    const { wallet, stake_amount } = body;
    const { id: circleId } = params;

    const supabase = getServiceClient();

    // Fetch circle
    const { data: circle, error } = await supabase
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    if (error || !circle) return apiError("Circle not found", 404);
    if (circle.status !== "forming" && circle.status !== "active") {
      return apiError("Circle is not accepting new members");
    }
    if (circle.current_members >= circle.max_members) {
      return apiError("Circle is full");
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("circle_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .single();

    if (existing) return apiError("Already a member of this circle");

    const memberKey = new PublicKey(wallet);
    const circleKey = new PublicKey(circle.on_chain_pubkey);
    const escrowKey = new PublicKey(circle.escrow_pubkey);

    // Derive PDAs
    const [memberPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.MEMBER, circleKey.toBuffer(), memberKey.toBuffer()],
      PROGRAM_ID
    );
    const [trustPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.TRUST_SCORE, memberKey.toBuffer()],
      PROGRAM_ID
    );

    // Token accounts
    const memberTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      memberKey
    );
    const escrowTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      escrowKey,
      true // allowOwnerOffCurve — escrow is a PDA
    );

    const tx = new Transaction();

    // Ensure escrow ATA exists (idempotent — safe to call even if it exists)
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        memberKey, // payer
        escrowTokenAccount,
        escrowKey, // owner
        USDC_MINT
      )
    );

    // Check if trust score exists on-chain
    const trustExists = await getConnection().getAccountInfo(trustPDA);

    // Build Anchor join_circle instruction
    const program = getServerProgram(getConnection());
    const accounts: Record<string, PublicKey> = {
      circle: circleKey,
      member: memberPDA,
      escrow: escrowKey,
      memberAuthority: memberKey,
      memberTokenAccount,
      escrowTokenAccount,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };
    if (trustExists) {
      accounts.trustScore = trustPDA;
    }
    const ix = await program.methods
      .joinCircle(new BN(stake_amount))
      .accounts(accounts)
      .instruction();

    tx.add(ix);

    const recentBlockhash = await getConnection().getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = memberKey;

    const serializedTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    return apiSuccess({
      transaction: serializedTx,
      memberPDA: memberPDA.toBase58(),
    });
  } catch (err) {
    console.error("Join circle error:", err);
    return apiError("Internal server error", 500);
  }
}
