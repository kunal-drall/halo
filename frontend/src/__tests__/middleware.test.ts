import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function createRequest(path: string, cookie?: string): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  const req = new NextRequest(url);
  if (cookie) {
    // NextRequest cookies are read-only, so we need to construct properly
    const headers = new Headers();
    headers.set("cookie", `halo_session=${cookie}`);
    return new NextRequest(url, { headers });
  }
  return req;
}

describe("Middleware", () => {
  it("redirects unauthenticated users from /dashboard", () => {
    const req = createRequest("/dashboard");
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/");
  });

  it("redirects unauthenticated users from /circles", () => {
    const req = createRequest("/circles");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });

  it("redirects unauthenticated users from /trust-score", () => {
    const req = createRequest("/trust-score");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });

  it("redirects unauthenticated users from /profile", () => {
    const req = createRequest("/profile");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });

  it("redirects unauthenticated users from /governance", () => {
    const req = createRequest("/governance");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });

  it("allows unauthenticated access to /", () => {
    const req = createRequest("/");
    const res = middleware(req);
    // Should not redirect — returns NextResponse.next()
    expect(res.status).not.toBe(307);
  });

  it("allows unauthenticated access to /about", () => {
    const req = createRequest("/about");
    const res = middleware(req);
    expect(res.status).not.toBe(307);
  });

  it("allows authenticated users through protected routes", () => {
    const req = createRequest("/dashboard", "fake-session-token");
    const res = middleware(req);
    expect(res.status).not.toBe(307);
  });

  it("adds CORS headers to API routes", () => {
    const req = createRequest("/api/circles");
    const res = middleware(req);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("protects nested protected paths", () => {
    const req = createRequest("/circles/create");
    const res = middleware(req);
    expect(res.status).toBe(307);
  });
});
