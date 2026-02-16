import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { getServiceClient } from "@/lib/supabase";
import {
  apiError,
  checkRateLimit,
  validateFields,
  generateSessionToken,
} from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const rateLimited = await checkRateLimit(req);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const missing = validateFields(body, [
      "wallet_address",
      "message",
      "signature",
    ]);
    if (missing) return apiError(missing);

    const { wallet_address, message, signature, timestamp } = body;

    // Validate timestamp is within 5 minutes
    if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
      return apiError("Signature expired", 401);
    }

    // Verify the signature
    const publicKey = new PublicKey(wallet_address);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, "base64");

    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (!verified) {
      return apiError("Invalid signature", 401);
    }

    // Try Supabase upsert (optional — devnet works without it)
    let user: Record<string, unknown> | null = null;
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            wallet_address,
            last_login: new Date().toISOString(),
            is_active: true,
          },
          { onConflict: "wallet_address" }
        )
        .select()
        .single();

      if (!error && data) {
        user = data;
      } else {
        console.warn("Supabase upsert failed (non-fatal):", error?.message);
      }
    } catch (e) {
      console.warn("Supabase unavailable, proceeding without user record");
    }

    // Always create session — only needs wallet address
    const sessionToken = generateSessionToken(wallet_address);

    const response = NextResponse.json({
      user: user || {
        wallet_address,
        trust_score: 0,
        trust_tier: "newcomer",
        is_active: true,
      },
    });
    response.cookies.set("halo_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth connect error:", err);
    return apiError("Internal server error", 500);
  }
}
