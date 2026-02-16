import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SDK | Halo Protocol",
  description:
    "Halo Protocol TypeScript SDK: install, configure, and integrate decentralized lending circles and trust scoring into your Solana application.",
};

export default function SdkPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            TypeScript SDK
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Integrate Halo Protocol into your application. Query trust scores,
            manage circles, and interact with on-chain data programmatically.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              The <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-sm">@halo-protocol/sdk</code> package
              provides a TypeScript client for interacting with the Halo Protocol
              smart contract on Solana. It wraps all on-chain instructions, handles
              PDA derivation, and provides typed account fetchers and event
              listeners.
            </p>
            <ul className="space-y-2 text-white/50 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">-</span>
                Full TypeScript types for all accounts and instructions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">-</span>
                Automatic PDA derivation for circles, escrow, members, and trust scores
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">-</span>
                Built-in transaction builders with compute budget optimization
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">-</span>
                Works with any Solana wallet adapter
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">-</span>
                Compatible with Node.js, browser, and React Native environments
              </li>
            </ul>
          </div>
        </section>

        {/* Installation */}
        <section className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Installation</h2>
            <p className="text-white/60 text-sm mb-4">
              Install the SDK using npm, yarn, or pnpm:
            </p>
            <div className="bg-[#0B0F1A] rounded-lg border border-white/10 p-4 font-mono text-sm overflow-x-auto">
              <div className="mb-3">
                <span className="text-white/30"># npm</span>
                <br />
                <span className="text-green-400">npm install</span>{" "}
                <span className="text-white">@halo-protocol/sdk @solana/web3.js @coral-xyz/anchor</span>
              </div>
              <div className="mb-3">
                <span className="text-white/30"># yarn</span>
                <br />
                <span className="text-green-400">yarn add</span>{" "}
                <span className="text-white">@halo-protocol/sdk @solana/web3.js @coral-xyz/anchor</span>
              </div>
              <div>
                <span className="text-white/30"># pnpm</span>
                <br />
                <span className="text-green-400">pnpm add</span>{" "}
                <span className="text-white">@halo-protocol/sdk @solana/web3.js @coral-xyz/anchor</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Start</h2>
            <p className="text-white/60 text-sm mb-4">
              Initialize the client and fetch a trust score:
            </p>
            <div className="bg-[#0B0F1A] rounded-lg border border-white/10 p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-white/80 leading-relaxed">
{`import { HaloClient } from "@halo-protocol/sdk";
import { Connection, PublicKey } from "@solana/web3.js";

// Initialize client
const connection = new Connection(
  "https://api.mainnet-beta.solana.com"
);
const halo = new HaloClient(connection);

// Fetch trust score for a wallet
const walletAddress = new PublicKey("YOUR_WALLET_ADDRESS");
const trustScore = await halo.getTrustScore(walletAddress);

console.log("Score:", trustScore.score);       // 0-1000
console.log("Tier:", trustScore.tier);         // Newcomer | Silver | Gold | Platinum
console.log("History:", trustScore.paymentHistory);
console.log("Completion:", trustScore.circleCompletion);`}
              </pre>
            </div>
          </div>
        </section>

        {/* Create a Circle */}
        <section className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Create a Circle
            </h2>
            <p className="text-white/60 text-sm mb-4">
              Build and send a transaction to create a new lending circle:
            </p>
            <div className="bg-[#0B0F1A] rounded-lg border border-white/10 p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-white/80 leading-relaxed">
{`import { HaloClient } from "@halo-protocol/sdk";
import { useWallet } from "@solana/wallet-adapter-react";

const wallet = useWallet();
const halo = new HaloClient(connection);

// Create a lending circle
const tx = await halo.createCircle({
  name: "Community Savers",
  contributionAmount: 10_000_000,  // 10 USDC (6 decimals)
  frequency: "monthly",
  maxMembers: 5,
  minTrustScore: 250,              // Silver tier minimum
  creator: wallet.publicKey,
});

// Sign and send
const signature = await wallet.sendTransaction(tx, connection);
console.log("Circle created:", signature);`}
              </pre>
            </div>
          </div>
        </section>

        {/* API Methods */}
        <section className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Available Methods
            </h2>
            <div className="space-y-4">
              {[
                {
                  method: "getTrustScore(wallet)",
                  description: "Fetch the trust score account for a wallet address.",
                },
                {
                  method: "getCircle(circleAddress)",
                  description: "Fetch circle account data including members and state.",
                },
                {
                  method: "getCirclesForMember(wallet)",
                  description: "List all circles a wallet is a member of.",
                },
                {
                  method: "createCircle(params)",
                  description: "Build a transaction to create a new lending circle.",
                },
                {
                  method: "joinCircle(circleAddress, wallet)",
                  description: "Build a transaction to join an existing circle.",
                },
                {
                  method: "contribute(circleAddress, wallet, amount)",
                  description: "Build a transaction to make a round contribution.",
                },
                {
                  method: "distributePayout(circleAddress, authority)",
                  description: "Build a transaction to distribute the round payout.",
                },
                {
                  method: "initializeTrustScore(wallet)",
                  description: "Build a transaction to initialize a trust score account.",
                },
              ].map((item) => (
                <div
                  key={item.method}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-white/5 last:border-0"
                >
                  <code className="text-violet-400 text-sm font-mono whitespace-nowrap">
                    {item.method}
                  </code>
                  <span className="text-white/40 text-sm">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Links */}
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Full Documentation
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-6">
            For complete API documentation, advanced usage, error handling, and
            examples, visit the full docs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors"
            >
              View Full Docs
            </Link>
            <Link
              href="https://github.com/halo-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
