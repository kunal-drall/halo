import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";

// GET /api/users/[address]/notifications — get user notifications
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { address } = params;
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const supabase = getServiceClient();

    // Find user
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", address)
      .single();

    if (!user) return apiError("User not found", 404);

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, error } = await query;
    if (error) return apiError("Database error", 500);

    return apiSuccess(notifications || []);
  } catch (err) {
    console.error("Notifications error:", err);
    return apiError("Internal server error", 500);
  }
}
