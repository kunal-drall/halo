import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | Halo Protocol",
  description:
    "Explore Halo Protocol features: lending circles, on-chain trust scoring, secure escrow, and automated yield generation on Solana.",
};

const features = [
  {
    title: "Lending Circles",
    subtitle: "Community-Powered Savings",
    description:
      "Rotating Savings and Credit Associations (ROSCAs) brought on-chain. Members pool funds each round and take turns receiving the pot — automated, transparent, and trustless.",
    details: [
      "Support for 3-10 members per circle",
      "Configurable round frequency (weekly, bi-weekly, monthly)",
      "SOL and USDC contribution options",
      "Automatic payout rotation enforced by smart contracts",
      "Circle governance with member voting",
      "Insurance pool for defaulting members",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Trust Scoring",
    subtitle: "On-Chain Credit Reputation",
    description:
      "Build a verifiable credit reputation scored from 0 to 1000. Your trust score is calculated on-chain based on your actual behavior — not arbitrary algorithms controlled by centralized bureaus.",
    details: [
      "Score range: 0-1000 across four tiers",
      "Newcomer (0-249), Silver (250-499), Gold (500-749), Platinum (750-1000)",
      "Payment history accounts for 40% of score",
      "Circle completion contributes 30%",
      "DeFi activity contributes 20%",
      "Social proof and referrals contribute 10%",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Secure Escrow",
    subtitle: "Trustless Fund Management",
    description:
      "All contributions are held in program-derived escrow accounts on Solana. No single party can access or move funds outside the rules defined in the smart contract.",
    details: [
      "Program-derived addresses (PDAs) for each circle escrow",
      "Funds cannot be withdrawn outside of payout rules",
      "On-chain verification of every deposit and withdrawal",
      "Multi-signature support for high-value circles",
      "Automatic refund if a circle fails to form",
      "Full audit trail visible on Solana Explorer",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Yield Generation",
    subtitle: "Automated DeFi Returns",
    description:
      "Idle pool funds are automatically deployed into vetted DeFi protocols on Solana to generate yield. Returns are distributed proportionally to circle members, boosting savings beyond contributions alone.",
    details: [
      "Automatic deployment of idle escrow funds",
      "Integration with Solana DeFi protocols",
      "Yield distributed proportionally to all members",
      "Risk-managed with configurable yield strategies",
      "Real-time yield tracking in your dashboard",
      "0.25% protocol fee on generated yield",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const stats = [
  { label: "Smart Contract Instructions", value: "30+" },
  { label: "Score Range", value: "0-1000" },
  { label: "Members per Circle", value: "3-10" },
  { label: "Avg Gas Cost", value: "<$0.01" },
];

export default function FeaturesPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Features
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to save together, build credit, and grow your
            wealth — all powered by Solana smart contracts.
          </p>
        </div>

        {/* Feature Cards (alternating layout) */}
        <div className="space-y-16 mb-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`glass-card p-8 sm:p-10 flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 items-start`}
            >
              {/* Icon & Text */}
              <div className="flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">
                  {feature.subtitle}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  {feature.title}
                </h2>
                <p className="text-white/50 leading-relaxed text-lg mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Detail List */}
              <div className="flex-1 min-w-0">
                <ul className="space-y-3">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 text-white/60"
                    >
                      <svg
                        className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="glass-card p-8 sm:p-12">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Protocol at a Glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
