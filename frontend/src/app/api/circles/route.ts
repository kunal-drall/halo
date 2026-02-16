import { NextRequest } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getServiceClient } from "@/lib/supabase";
import { getConnection } from "@/lib/helius";
import { getCached, setCache } from "@/lib/redis";
import { getServerProgram } from "@/lib/solana-client";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  validateFields,
  requireAuth,
  getUserIdFromWallet,
} from "@/lib/api-utils";
import { PROGRAM_ID, SEEDS } from "@/lib/constants";

// GET /api/circles — list circles
export async function GET(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "available";
    const wallet = searchParams.get("wallet");
    const status = searchParams.get("status");
    const minTrustTier = searchParams.get("min_trust_tier");

    if (type === "my" && wallet) {
      const cacheKey = `circles:my:${wallet}`;
      const cached = await getCached(cacheKey);
      if (cached) return apiSuccess(cached);

      try {
        const supabase = getServiceClient();

        // Resolve wallet to UUID for the query
        const userId = await getUserIdFromWallet(wallet);
        if (!userId) return apiSuccess([]);

        const { data: memberships } = await supabase
          .from("circle_members")
          .select("circle_id")
          .eq("user_id", userId);

        if (!memberships || memberships.length === 0) {
          return apiSuccess([]);
        }

        const circleIds = memberships.map((m) => m.circle_id);
        const { data: circles, error } = await supabase
          .from("circles")
          .select("*")
          .in("id", circleIds)
          .order("updated_at", { ascending: false });

        if (error) return apiSuccess([]);

        await setCache(cacheKey, circles, 300);
        return apiSuccess(circles);
      } catch {
        console.warn("Supabase unavailable for my circles, returning empty");
        return apiSuccess([]);
      }
    }

    // Available circles (public, forming/active)
    const cacheKey = `circles:available:${status || "all"}:${minTrustTier || "all"}`;
    const cached = await getCached(cacheKey);
    if (cached) return apiSuccess(cached);

    try {
      const supabase = getServiceClient();

      let query = supabase
        .from("circles")
        .select("*")
        .eq("is_public", true)
        .in("status", ["forming", "active"])
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }
      if (minTrustTier) {
        query = query.eq("min_trust_tier", minTrustTier);
      }

      const { data: circles, error } = await query.limit(50);
      if (error) return apiSuccess([]);

      await setCache(cacheKey, circles, 300);
      return apiSuccess(circles);
    } catch {
      console.warn("Supabase unavailable for available circles, returning empty");
      return apiSuccess([]);
    }
  } catch (err) {
    console.error("List circles error:", err);
    return apiError("Internal server error", 500);
  }
}

// POST /api/circles — create a new circle (returns unsigned transaction)
export async function POST(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const missing = validateFields(body, [
      "wallet",
      "name",
      "contribution_amount",
      "duration_months",
      "max_members",
    ]);
    if (missing) return apiError(missing);

    if (body.wallet !== auth.wallet) {
      return apiError("Wallet mismatch", 403);
    }

    // Resolve wallet to Supabase UUID
    const userId = await getUserIdFromWallet(auth.wallet);
    if (!userId) {
      return apiError("User not found. Connect wallet first.", 401);
    }

    const {
      wallet,
      name,
      description,
      contribution_amount,
      duration_months,
      max_members,
      penalty_rate = 10,
      payout_method = "fixed_rotation",
      min_trust_tier = "newcomer",
      is_public = true,
    } = body;

    const creatorKey = new PublicKey(wallet);

    // Use seconds (matches on-chain Clock::unix_timestamp)
    const circleIdNum = Math.floor(Date.now() / 1000);
    const circleId = Buffer.alloc(8);
    circleId.writeBigUInt64LE(BigInt(circleIdNum));

    // Derive PDAs
    const [circlePDA] = PublicKey.findProgramAddressSync(
      [SEEDS.CIRCLE, creatorKey.toBuffer(), circleId],
      PROGRAM_ID
    );
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.ESCROW, circlePDA.toBuffer()],
      PROGRAM_ID
    );

    // Build Anchor instruction
    const program = getServerProgram(getConnection());
    const ix = await program.methods
      .initializeCircle(
        new BN(circleIdNum),
        new BN(contribution_amount),
        duration_months,
        max_members,
        penalty_rate
      )
      .accounts({
        circle: circlePDA,
        escrow: escrowPDA,
        creator: creatorKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const tx = new Transaction();
    tx.add(ix);
    const recentBlockhash = await getConnection().getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = creatorKey;

    // Store circle metadata in Supabase (will be confirmed via webhook)
    const supabase = getServiceClient();
    await supabase.from("circles").insert({
      on_chain_pubkey: circlePDA.toBase58(),
      creator_id: userId,
      name,
      description: description || null,
      contribution_amount,
      token_mint: process.env.NEXT_PUBLIC_USDC_MINT || "",
      duration_months,
      max_members,
      penalty_rate,
      payout_method,
      min_trust_tier,
      is_public,
      status: "forming",
      escrow_pubkey: escrowPDA.toBase58(),
    });

    const serializedTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    return apiSuccess({
      transaction: serializedTx,
      pdaAddress: circlePDA.toBase58(),
      escrowAddress: escrowPDA.toBase58(),
    });
  } catch (err) {
    console.error("Create circle error:", err);
    return apiError("Internal server error", 500);
  }
}
