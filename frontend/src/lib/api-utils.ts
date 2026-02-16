import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { rateLimiter } from "./redis";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
if (!SESSION_SECRET && typeof window === "undefined") {
  console.warn("WARNING: SESSION_SECRET is not set. Sessions will be insecure.");
}

function getSessionSecret(): string {
  if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return SESSION_SECRET;
}

// Standard API error response
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Standard API success response
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Rate limit check — returns error response if exceeded, null if OK
export async function checkRateLimit(
  req: NextRequest
): Promise<NextResponse | null> {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const { success, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }
  } catch {
    // If Redis is unavailable, allow the request through but log
    console.warn("Rate limiter unavailable — request allowed without limit");
  }

  return null;
}

// Validate required fields in a JSON body
export function validateFields(
  body: Record<string, unknown>,
  required: string[]
): string | null {
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// HMAC-sign a payload for session tokens
function hmacSign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

// Generate HMAC-signed session token
export function generateSessionToken(walletAddress: string): string {
  const payload = {
    wallet: walletAddress,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = hmacSign(data);
  return `${data}.${sig}`;
}

// Parse and verify HMAC-signed session token
export function parseSessionToken(
  token: string
): { wallet: string; exp: number } | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;

    const expectedSig = hmacSign(data);
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return { wallet: payload.wallet, exp: payload.exp };
  } catch {
    return null;
  }
}

// Extract wallet from session cookie
export function getWalletFromSession(req: NextRequest): string | null {
  const token = req.cookies.get("halo_session")?.value;
  if (!token) return null;
  const session = parseSessionToken(token);
  return session?.wallet || null;
}

// Require authentication — returns wallet or error response
export function requireAuth(
  req: NextRequest
): { wallet: string } | NextResponse {
  const wallet = getWalletFromSession(req);
  if (!wallet) {
    return apiError("Unauthorized", 401);
  }
  return { wallet };
}

// Look up Supabase UUID for a wallet address
export async function getUserIdFromWallet(
  wallet: string
): Promise<string | null> {
  const { getServiceClient } = await import("./supabase");
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", wallet)
    .single();
  return data?.id || null;
}
