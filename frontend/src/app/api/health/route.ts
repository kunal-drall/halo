import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ServiceStatus = "ok" | "degraded" | "down";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    supabase: ServiceStatus;
    redis: ServiceStatus;
    solana: ServiceStatus;
  };
}

const startTime = Date.now();

async function checkSupabase(): Promise<ServiceStatus> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return "down";
    const res = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? "ok" : "degraded";
  } catch {
    return "down";
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return "down";
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? "ok" : "degraded";
  } catch {
    return "down";
  }
}

async function checkSolana(): Promise<ServiceStatus> {
  try {
    const rpc = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
    if (!rpc) return "down";
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "degraded";
    const data = await res.json();
    return data.result === "ok" ? "ok" : "degraded";
  } catch {
    return "down";
  }
}

export async function GET() {
  const [supabase, redis, solana] = await Promise.all([
    checkSupabase(),
    checkRedis(),
    checkSolana(),
  ]);

  const services = { supabase, redis, solana };
  const statuses = Object.values(services);

  let status: HealthResponse["status"] = "healthy";
  if (statuses.some((s) => s === "down")) {
    status = statuses.every((s) => s === "down") ? "unhealthy" : "degraded";
  }

  const health: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
  };

  return NextResponse.json(health, {
    status: status === "unhealthy" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
