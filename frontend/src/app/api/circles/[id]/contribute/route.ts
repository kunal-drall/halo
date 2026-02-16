import { NextRequest } from "next/server";
import { PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
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

// POST /api/circles/[id]/contribute — make a contribution (returns unsigned tx)
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
    const missing = validateFields(body, ["wallet", "amount"]);
    if (missing) return apiError(missing);

    if (body.wallet !== auth.wallet) {
      return apiError("Wallet mismatch", 403);
    }

    // Resolve wallet to UUID
    const userId = await getUserIdFromWallet(auth.wallet);
    if (!userId) {
      return apiError("User not found. Connect wallet first.", 401);
    }

    const { wallet, amount } = body;
    const { id: circleId } = params;

    const supabase = getServiceClient();

    // Verify circle exists and is active
    const { data: circle, error } = await supabase
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    if (error || !circle) return apiError("Circle not found", 404);
    if (circle.status !== "active") {
      return apiError("Circle is not active");
    }

    // Verify amount matches contribution_amount
    if (amount !== circle.contribution_amount) {
      return apiError(
        `Contribution must be exactly ${circle.contribution_amount}`
      );
    }

    // Verify membership
    const { data: member } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .single();

    if (!member) return apiError("Not a member of this circle");

    // Check for duplicate contribution this month
    const { data: existingContrib } = await supabase
      .from("contributions")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .eq("month", circle.current_month)
      .single();

    if (existingContrib) {
      return apiError("Already contributed for this month");
    }

    const contributorKey = new PublicKey(wallet);
    const circleKey = new PublicKey(circle.on_chain_pubkey);
    const escrowKey = new PublicKey(circle.escrow_pubkey);

    // Derive PDAs
    const [memberPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.MEMBER, circleKey.toBuffer(), contributorKey.toBuffer()],
      PROGRAM_ID
    );
    const [trustPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.TRUST_SCORE, contributorKey.toBuffer()],
      PROGRAM_ID
    );

    // Token accounts
    const memberTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      contributorKey
    );
    const escrowTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      escrowKey,
      true
    );

    // Check if trust score exists
    const trustExists = await getConnection().getAccountInfo(trustPDA);

    // Build Anchor contribute instruction
    const program = getServerProgram(getConnection());
    const accounts: Record<string, PublicKey> = {
      circle: circleKey,
      member: memberPDA,
      escrow: escrowKey,
      memberAuthority: contributorKey,
      memberTokenAccount,
      escrowTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    };
    if (trustExists) {
      accounts.trustScore = trustPDA;
    }
    const ix = await program.methods
      .contribute(new BN(amount))
      .accounts(accounts)
      .instruction();

    const tx = new Transaction();
    tx.add(ix);
    const recentBlockhash = await getConnection().getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = contributorKey;

    const serializedTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    return apiSuccess({ transaction: serializedTx });
  } catch (err) {
    console.error("Contribute error:", err);
    return apiError("Internal server error", 500);
  }
}
