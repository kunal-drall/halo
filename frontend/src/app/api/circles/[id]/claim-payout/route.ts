import { NextRequest } from "next/server";
import { PublicKey, Transaction } from "@solana/web3.js";
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

// POST /api/circles/[id]/claim-payout — claim payout (returns unsigned tx)
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
    const missing = validateFields(body, ["wallet"]);
    if (missing) return apiError(missing);

    if (body.wallet !== auth.wallet) {
      return apiError("Wallet mismatch", 403);
    }

    // Resolve wallet to UUID
    const userId = await getUserIdFromWallet(auth.wallet);
    if (!userId) {
      return apiError("User not found. Connect wallet first.", 401);
    }

    const { wallet } = body;
    const { id: circleId } = params;

    const supabase = getServiceClient();

    // Verify circle
    const { data: circle, error } = await supabase
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    if (error || !circle) return apiError("Circle not found", 404);
    if (circle.status !== "active" && circle.status !== "distributing") {
      return apiError("Circle is not in payout phase");
    }

    // Verify membership and eligibility
    const { data: member } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .single();

    if (!member) return apiError("Not a member of this circle");
    if (member.has_received_pot) {
      return apiError("Already received payout");
    }

    const claimerKey = new PublicKey(wallet);
    const circleKey = new PublicKey(circle.on_chain_pubkey);
    const escrowKey = new PublicKey(circle.escrow_pubkey);

    // Derive PDAs
    const [memberPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.MEMBER, circleKey.toBuffer(), claimerKey.toBuffer()],
      PROGRAM_ID
    );

    // Token accounts
    const memberTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      claimerKey
    );
    const escrowTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      escrowKey,
      true
    );

    // Build Anchor claim_payout instruction
    const program = getServerProgram(getConnection());
    const ix = await program.methods
      .claimPayout()
      .accounts({
        circle: circleKey,
        member: memberPDA,
        escrow: escrowKey,
        memberAuthority: claimerKey,
        memberTokenAccount,
        escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const tx = new Transaction();
    tx.add(ix);
    const recentBlockhash = await getConnection().getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = claimerKey;

    const serializedTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    return apiSuccess({ transaction: serializedTx });
  } catch (err) {
    console.error("Claim payout error:", err);
    return apiError("Internal server error", 500);
  }
}
