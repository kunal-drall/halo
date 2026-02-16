import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally for health check tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Health Check API", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it("returns healthy when all services respond", async () => {
    // Set env vars so all services are reachable
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_RPC_ENDPOINT = "https://api.devnet.solana.com";

    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: "ok" }),
      });
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.services).toBeDefined();
    expect(data.services.supabase).toBe("ok");
    expect(data.services.redis).toBe("ok");
    expect(data.services.solana).toBe("ok");
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it("returns degraded when some services are down", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_RPC_ENDPOINT = "https://api.devnet.solana.com";

    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      // First call (supabase) succeeds, others fail
      if (callCount === 1) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error("Connection refused"));
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe("degraded");
  });

  it("returns unhealthy when no env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    process.env.NEXT_PUBLIC_RPC_ENDPOINT = "";

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
  });
});
