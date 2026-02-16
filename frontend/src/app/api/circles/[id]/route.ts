import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getCached, setCache } from "@/lib/redis";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";

// GET /api/circles/[id] — circle detail with members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { id } = params;

    // Check cache
    const cacheKey = `circle:${id}`;
    const cached = await getCached(cacheKey);
    if (cached) return apiSuccess(cached);

    const supabase = getServiceClient();

    // Fetch circle
    const { data: circle, error: circleError } = await supabase
      .from("circles")
      .select("*")
      .eq("id", id)
      .single();

    if (circleError || !circle) {
      return apiError("Circle not found", 404);
    }

    // Fetch members with user info
    const { data: members } = await supabase
      .from("circle_members")
      .select(
        `
        *,
        user:users(id, wallet_address, display_name, avatar_url, trust_score, trust_tier)
      `
      )
      .eq("circle_id", id)
      .order("payout_position", { ascending: true });

    // Fetch recent contributions
    const { data: contributions } = await supabase
      .from("contributions")
      .select("*")
      .eq("circle_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch payouts
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .eq("circle_id", id)
      .order("month", { ascending: true });

    const result = {
      ...circle,
      members: members || [],
      contributions: contributions || [],
      payouts: payouts || [],
    };

    await setCache(cacheKey, result, 60); // 1 min cache for detail views
    return apiSuccess(result);
  } catch (err) {
    console.error("Circle detail error:", err);
    return apiError("Internal server error", 500);
  }
}
