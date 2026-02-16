import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/helius";
import { getCached, setCache } from "@/lib/redis";
import { PROGRAM_ID, SEEDS } from "@/lib/constants";
import { getTrustTier } from "@/lib/constants";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";
import type { TrustScoreBreakdown } from "@/types";

// GET /api/trust-score?address=X — get trust score for a wallet
export async function GET(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) return apiError("Missing address parameter");

    // Check cache
    const cacheKey = `trust:${address}`;
    const cached = await getCached<TrustScoreBreakdown>(cacheKey);
    if (cached) return apiSuccess(cached);

    const walletKey = new PublicKey(address);

    // Derive trust score PDA
    const [trustPDA] = PublicKey.findProgramAddressSync(
      [SEEDS.TRUST_SCORE, walletKey.toBuffer()],
      PROGRAM_ID
    );

    // Fetch on-chain account data
    const accountInfo = await connection.getAccountInfo(trustPDA);

    if (!accountInfo) {
      // No trust score initialized yet
      const defaultScore: TrustScoreBreakdown = {
        score: 0,
        tier: "newcomer",
        payment_score: 0,
        completion_score: 0,
        defi_score: 0,
        social_score: 0,
        circles_completed: 0,
        on_time_payments: 0,
        total_payments: 0,
      };
      return apiSuccess(defaultScore);
    }

    // Decode the account data using Anchor deserialization
    // The first 8 bytes are the discriminator, then the struct fields
    const data = accountInfo.data;
    const offset = 8; // Skip discriminator

    // Parse fields in order matching TrustScore struct in state.rs
    const authority = new PublicKey(data.subarray(offset, offset + 32));
    const score = data.readUInt16LE(offset + 32);
    const paymentScore = data.readUInt16LE(offset + 34);
    const completionScore = data.readUInt16LE(offset + 36);
    const defiScore = data.readUInt16LE(offset + 38);
    const socialScore = data.readUInt16LE(offset + 40);
    const onTimePayments = data.readUInt32LE(offset + 42);
    const totalPayments = data.readUInt32LE(offset + 46);
    const circlesCompleted = data.readUInt32LE(offset + 50);

    const tier = getTrustTier(score);

    const breakdown: TrustScoreBreakdown = {
      score,
      tier: tier.label.toLowerCase() as TrustScoreBreakdown["tier"],
      payment_score: paymentScore,
      completion_score: completionScore,
      defi_score: defiScore,
      social_score: socialScore,
      circles_completed: circlesCompleted,
      on_time_payments: onTimePayments,
      total_payments: totalPayments,
    };

    await setCache(cacheKey, breakdown, 600); // 10 min cache
    return apiSuccess(breakdown);
  } catch (err) {
    console.error("Trust score error:", err);
    return apiError("Internal server error", 500);
  }
}
