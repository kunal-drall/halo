import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press | Halo Protocol",
  description:
    "Halo Protocol press kit: brand assets, media contact information, and press releases for decentralized lending circles on Solana.",
};

const brandAssets = [
  {
    label: "Primary Logo (SVG)",
    description: "Full Halo Protocol logo for light and dark backgrounds.",
    format: "SVG",
  },
  {
    label: "Icon Mark (PNG)",
    description: "Square icon for social media profiles and app icons.",
    format: "PNG",
  },
  {
    label: "Brand Colors",
    description:
      "Midnight #0B0F1A, Navy #111827, White #FFFFFF, Violet #7C3AED.",
    format: "—",
  },
  {
    label: "Typography",
    description: "Primary: Inter. Monospace: JetBrains Mono.",
    format: "—",
  },
];

const pressReleases = [
  {
    date: "February 10, 2026",
    title: "Halo Protocol Launches Decentralized Lending Circles on Solana",
    excerpt:
      "Halo Protocol announces the launch of its decentralized ROSCA platform on Solana, enabling community-powered savings circles with on-chain credit scoring, trustless escrow, and automated yield generation. The protocol aims to provide credit access to the 1.4 billion unbanked adults worldwide.",
  },
  {
    date: "January 15, 2026",
    title:
      "Halo Protocol Completes Smart Contract Audit and Deploys to Solana Devnet",
    excerpt:
      "Following a comprehensive security audit of all 30+ smart contract instructions, Halo Protocol has deployed its lending circle and trust scoring program to Solana Devnet. The open-source codebase includes full test coverage with 42 test cases covering circle lifecycle, trust score calculations, and insurance mechanics.",
  },
];

export default function PressPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Press
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Brand assets, media resources, and press releases for Halo Protocol.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Brand Assets */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Brand Assets
            </h2>
            <div className="space-y-4">
              {brandAssets.map((asset) => (
                <div key={asset.label} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{asset.label}</h3>
                    {asset.format !== "—" && (
                      <span className="text-xs text-white/30 bg-white/5 border border-white/10 rounded px-2 py-0.5">
                        {asset.format}
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{asset.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 glass-card p-5 border border-violet-500/20">
              <p className="text-white/50 text-sm mb-3">
                Need high-resolution assets or custom formats? Contact our media
                team.
              </p>
              <Link
                href="mailto:press@haloprotocol.io"
                className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
              >
                press@haloprotocol.io
              </Link>
            </div>
          </div>

          {/* Media Contact */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Media Contact
            </h2>
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                For press inquiries:
              </h3>
              <div className="space-y-3 text-white/60">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>press@haloprotocol.io</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@HaloProtocol</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                About Halo Protocol
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Halo Protocol is a decentralized lending circle platform built on
                Solana. It enables communities to form rotating savings groups
                (ROSCAs) with trustless escrow, on-chain credit scoring (0-1000),
                insurance pools, governance, and automated yield generation. The
                protocol is designed to provide credit access to the 1.4 billion
                unbanked adults worldwide. All smart contracts and frontend code
                are open source.
              </p>
            </div>
          </div>
        </div>

        {/* Press Releases */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8">
            Press Releases
          </h2>
          <div className="space-y-6">
            {pressReleases.map((release) => (
              <div key={release.title} className="glass-card p-8 glass-card-hover">
                <p className="text-sm text-white/30 mb-2">{release.date}</p>
                <h3 className="text-xl font-bold text-white mb-4">
                  {release.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {release.excerpt}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
