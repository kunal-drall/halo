import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/helius";
import { PROGRAM_ID, SEEDS } from "@/lib/constants";
import { getTrustTier } from "@/lib/constants";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";
import type { TrustScoreBreakdown } from "@/types";

// POST /api/trust-score/batch — batch fetch trust scores (max 100)
export async function POST(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return apiError("Missing addresses array");
    }
    if (addresses.length > 100) {
      return apiError("Maximum 100 addresses per batch");
    }

    // Derive all trust score PDAs
    const pdas = addresses.map((addr: string) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [SEEDS.TRUST_SCORE, new PublicKey(addr).toBuffer()],
        PROGRAM_ID
      );
      return pda;
    });

    // Batch fetch account info
    const accounts = await connection.getMultipleAccountsInfo(pdas);

    const results: Record<string, TrustScoreBreakdown> = {};

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const accountInfo = accounts[i];

      if (!accountInfo) {
        results[addr] = {
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
        continue;
      }

      const data = accountInfo.data;
      const offset = 8;

      const score = data.readUInt16LE(offset + 32);
      const paymentScore = data.readUInt16LE(offset + 34);
      const completionScore = data.readUInt16LE(offset + 36);
      const defiScore = data.readUInt16LE(offset + 38);
      const socialScore = data.readUInt16LE(offset + 40);
      const onTimePayments = data.readUInt32LE(offset + 42);
      const totalPayments = data.readUInt32LE(offset + 46);
      const circlesCompleted = data.readUInt32LE(offset + 50);

      const tier = getTrustTier(score);

      results[addr] = {
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
    }

    return apiSuccess(results);
  } catch (err) {
    console.error("Batch trust score error:", err);
    return apiError("Internal server error", 500);
  }
}
