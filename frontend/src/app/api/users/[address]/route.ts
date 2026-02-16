import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getCached, setCache } from "@/lib/redis";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";

// GET /api/users/[address] — user profile and stats
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { address } = params;

    // Check cache
    const cacheKey = `user:${address}`;
    const cached = await getCached(cacheKey);
    if (cached) return apiSuccess(cached);

    // Default fallback for when Supabase is unavailable
    const fallback = {
      user: { wallet_address: address, trust_score: 0, trust_tier: "newcomer", is_active: true },
      stats: {
        active_circles: 0,
        total_contributed: 0,
        total_received: 0,
        total_yield_earned: 0,
        trust_score: 0,
        trust_tier: "newcomer",
      },
    };

    let result = fallback;

    try {
      const supabase = getServiceClient();

      // Fetch user
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (error || !user) return apiSuccess(fallback);

      // Fetch user stats
      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id, stake_amount, has_received_pot, status")
        .eq("user_id", user.id);

      const activeCircles =
        memberships?.filter((m) => m.status === "active").length || 0;

      // Aggregate contributions
      const { data: contribs } = await supabase
        .from("contributions")
        .select("amount")
        .eq("user_id", user.id);

      const totalContributed =
        contribs?.reduce((sum, c) => sum + c.amount, 0) || 0;

      // Aggregate payouts
      const { data: pays } = await supabase
        .from("payouts")
        .select("net_amount, yield_share")
        .eq("recipient_id", user.id);

      const totalReceived = pays?.reduce((sum, p) => sum + p.net_amount, 0) || 0;
      const totalYield = pays?.reduce((sum, p) => sum + p.yield_share, 0) || 0;

      result = {
        user,
        stats: {
          active_circles: activeCircles,
          total_contributed: totalContributed,
          total_received: totalReceived,
          total_yield_earned: totalYield,
          trust_score: user.trust_score,
          trust_tier: user.trust_tier,
        },
      };
    } catch {
      // Supabase unavailable — return fallback
      console.warn("Supabase unavailable for user profile, returning defaults");
    }

    await setCache(cacheKey, result, 300);
    return apiSuccess(result);
  } catch (err) {
    console.error("User profile error:", err);
    return apiError("Internal server error", 500);
  }
}
