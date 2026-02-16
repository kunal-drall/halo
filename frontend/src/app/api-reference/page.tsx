import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Reference | Halo Protocol",
  description:
    "Complete REST API reference for Halo Protocol: authentication, circles, trust scores, users, and webhook endpoints.",
};

const apiSections = [
  {
    id: "auth",
    title: "Authentication",
    description:
      "Wallet-based authentication using HMAC-signed session tokens. Connect your Solana wallet and receive a session token for subsequent API calls.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/connect",
        description: "Connect wallet and create a session. Returns an HMAC-signed session token.",
      },
      {
        method: "POST",
        path: "/api/auth/verify",
        description: "Verify an existing session token. Returns wallet address and expiration.",
      },
      {
        method: "POST",
        path: "/api/auth/disconnect",
        description: "Invalidate the current session token.",
      },
    ],
  },
  {
    id: "circles",
    title: "Circles",
    description:
      "Create, manage, and query lending circles. All write operations require authentication.",
    endpoints: [
      {
        method: "GET",
        path: "/api/circles",
        description: "List all available circles. Supports filtering by status, trust tier, and contribution amount.",
      },
      {
        method: "POST",
        path: "/api/circles",
        description: "Create a new lending circle. Requires authentication. Returns the circle address.",
      },
      {
        method: "GET",
        path: "/api/circles/:id",
        description: "Fetch details for a specific circle including members, round state, and escrow balance.",
      },
      {
        method: "POST",
        path: "/api/circles/:id/join",
        description: "Join an existing circle. Requires authentication and meeting the minimum trust score.",
      },
      {
        method: "POST",
        path: "/api/circles/:id/contribute",
        description: "Make a contribution to the current round. Requires authentication and circle membership.",
      },
      {
        method: "POST",
        path: "/api/circles/:id/distribute",
        description: "Trigger payout distribution for the current round. Requires circle authority.",
      },
      {
        method: "GET",
        path: "/api/circles/my",
        description: "List circles the authenticated user is a member of.",
      },
    ],
  },
  {
    id: "trust-score",
    title: "Trust Score",
    description:
      "Query and manage on-chain trust scores. Scores range from 0-1000 across four tiers: Newcomer, Silver, Gold, Platinum.",
    endpoints: [
      {
        method: "GET",
        path: "/api/trust-score",
        description: "Fetch the trust score for the authenticated wallet. Returns score, tier, and component breakdown.",
      },
      {
        method: "POST",
        path: "/api/trust-score/initialize",
        description: "Initialize a trust score account on-chain for the authenticated wallet.",
      },
      {
        method: "POST",
        path: "/api/trust-score/batch",
        description: "Fetch trust scores for multiple wallet addresses in a single request.",
      },
    ],
  },
  {
    id: "users",
    title: "Users",
    description:
      "Manage user profiles and query user data. Profiles are linked to Solana wallet addresses.",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/me",
        description: "Fetch the authenticated user's profile including display name, avatar, and stats.",
      },
      {
        method: "PATCH",
        path: "/api/users/me",
        description: "Update the authenticated user's profile (display name, avatar URL).",
      },
      {
        method: "GET",
        path: "/api/users/:wallet",
        description: "Fetch a public user profile by wallet address.",
      },
      {
        method: "GET",
        path: "/api/users/:wallet/stats",
        description: "Fetch user statistics: circles joined, circles completed, total contributions, trust score.",
      },
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    description:
      "Helius-powered webhook endpoints for real-time on-chain event processing. These endpoints are called by the Helius indexer, not by clients directly.",
    endpoints: [
      {
        method: "POST",
        path: "/api/webhooks/helius",
        description: "Receive and process Solana transaction events from Helius. Requires HELIUS_WEBHOOK_SECRET.",
      },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-400 border-green-500/30",
    POST: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    PATCH: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`inline-block text-xs font-mono font-bold px-2 py-0.5 rounded border ${
        colors[method] || "bg-white/5 text-white/40 border-white/10"
      }`}
    >
      {method}
    </span>
  );
}

export default function ApiReferencePage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            API Reference
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Complete REST API documentation for Halo Protocol. All endpoints use
            JSON request and response bodies.
          </p>
        </div>

        {/* Base URL */}
        <div className="glass-card p-6 mb-12">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">
            Base URL
          </h2>
          <code className="text-violet-400 font-mono text-sm">
            https://app.haloprotocol.io
          </code>
          <p className="text-white/40 text-sm mt-2">
            All endpoints are relative to this base URL. Authentication is
            performed via session tokens passed in the{" "}
            <code className="text-white/60 bg-white/5 px-1 py-0.5 rounded text-xs">
              Authorization
            </code>{" "}
            header.
          </p>
        </div>

        {/* API Sections */}
        <div className="space-y-12">
          {apiSections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  {section.description}
                </p>

                <div className="space-y-4">
                  {section.endpoints.map((endpoint) => (
                    <div
                      key={`${endpoint.method}-${endpoint.path}`}
                      className="bg-white/[0.02] rounded-lg p-4 border border-white/5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <MethodBadge method={endpoint.method} />
                        <code className="text-white/80 font-mono text-sm">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-white/40 text-sm">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Bottom links */}
        <div className="mt-12 glass-card p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Need More Detail?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-6 text-sm">
            For request/response schemas, error codes, and code examples, visit
            our SDK documentation or browse the source code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sdk"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors text-sm"
            >
              TypeScript SDK
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors text-sm"
            >
              Full Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
