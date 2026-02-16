import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | Halo Protocol",
  description:
    "Halo Protocol developer documentation: getting started guides, core concepts, API reference, and smart contract documentation for Solana.",
};

const sections = [
  {
    title: "Getting Started",
    description:
      "Set up your environment and make your first interaction with Halo Protocol. From wallet connection to joining your first circle.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    links: [
      { label: "Quick Start Guide", href: "/docs#quickstart" },
      { label: "Wallet Connection", href: "/docs#wallet" },
      { label: "Create Your First Circle", href: "/docs#first-circle" },
      { label: "Understanding Trust Scores", href: "/docs#trust-scores" },
    ],
  },
  {
    title: "Core Concepts",
    description:
      "Learn the fundamentals of Halo Protocol: how ROSCAs work, trust score calculations, escrow mechanics, insurance pools, and governance.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    links: [
      { label: "How ROSCAs Work", href: "/docs#rosca" },
      { label: "Trust Score Algorithm", href: "/docs#scoring" },
      { label: "Escrow & PDAs", href: "/docs#escrow" },
      { label: "Insurance Pools", href: "/docs#insurance" },
      { label: "Governance", href: "/docs#governance" },
      { label: "Yield Generation", href: "/docs#yield" },
    ],
  },
  {
    title: "API Reference",
    description:
      "Complete reference for the Halo Protocol REST API. Endpoints for authentication, circles, trust scores, users, and webhooks.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    links: [
      { label: "Authentication", href: "/api-reference#auth" },
      { label: "Circles API", href: "/api-reference#circles" },
      { label: "Trust Score API", href: "/api-reference#trust-score" },
      { label: "Users API", href: "/api-reference#users" },
      { label: "Webhooks", href: "/api-reference#webhooks" },
    ],
  },
  {
    title: "Smart Contracts",
    description:
      "Technical documentation for the Halo Protocol Anchor program. Account structures, instruction reference, PDA derivations, and error codes.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    links: [
      { label: "Program Overview", href: "/docs#program" },
      { label: "Account Structures", href: "/docs#accounts" },
      { label: "Instructions", href: "/docs#instructions" },
      { label: "PDA Derivations", href: "/docs#pdas" },
      { label: "Error Codes", href: "/docs#errors" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Documentation
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to understand, build on, and integrate with Halo
            Protocol.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="glass-card p-8 glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
                    >
                      <svg
                        className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SDK Callout */}
        <div className="mt-12 glass-card p-8 sm:p-10 text-center border border-violet-500/20">
          <h2 className="text-xl font-bold text-white mb-3">
            Looking for the SDK?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-6">
            Integrate Halo Protocol into your application with our TypeScript
            SDK. Query trust scores, manage circles, and interact with the smart
            contract programmatically.
          </p>
          <Link
            href="/sdk"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors"
          >
            View SDK Docs
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
