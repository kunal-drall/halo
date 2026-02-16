import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-utils";

// PATCH /api/users/[address]/notifications/[id] — mark notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { address: string; id: string } }
) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const { id } = params;

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return apiError("Notification not found", 404);

    return apiSuccess(data);
  } catch (err) {
    console.error("Mark notification read error:", err);
    return apiError("Internal server error", 500);
  }
}
