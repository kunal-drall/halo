import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { apiError, apiSuccess, getWalletFromSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const wallet = getWalletFromSession(req);
    if (!wallet) {
      return apiError("Not authenticated", 401);
    }

    let user: Record<string, unknown> | null = null;
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", wallet)
        .single();

      if (!error && data) {
        user = data;
      }
    } catch {
      // Supabase unavailable — proceed with minimal user
    }

    return apiSuccess({
      user: user || {
        wallet_address: wallet,
        trust_score: 0,
        trust_tier: "newcomer",
        is_active: true,
      },
    });
  } catch (err) {
    console.error("Session error:", err);
    return apiError("Internal server error", 500);
  }
}
