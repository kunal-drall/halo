import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases | Halo Protocol",
  description:
    "Discover how Halo Protocol serves unbanked individuals, small business owners, community savings groups, and immigrants building credit on Solana.",
};

const useCases = [
  {
    title: "Unbanked Individuals",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    description:
      "Over 1.4 billion people worldwide have no access to formal banking or credit. Traditional systems require government-issued ID, proof of address, and existing credit history — barriers that exclude billions from financial participation.",
    scenario:
      "Maria lives in a rural area with no bank branch within 50 miles. She has a smartphone and a small income from selling produce at a local market. With Halo Protocol, she connects a Solana wallet, joins a lending circle with five neighbors, and begins building an on-chain credit score by making regular contributions in USDC. After completing her first circle, her trust score rises to Silver tier, giving her access to larger circles and lower collateral requirements.",
    benefits: [
      "No KYC or bank account required",
      "Accessible with only a smartphone and internet connection",
      "Build credit from zero with real savings behavior",
      "SOL and USDC support for flexible participation",
    ],
  },
  {
    title: "Small Business Owners",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    description:
      "Small business owners in emerging markets often cannot access affordable credit. Banks require collateral, lengthy applications, and credit histories that do not exist. Informal lending comes with predatory interest rates.",
    scenario:
      "Kofi runs a small electronics repair shop in Accra. He needs 500 USDC to buy inventory for the holiday season but has no bank credit. He creates a lending circle on Halo Protocol with nine other small business owners in his trade association. Each member contributes 50 USDC per month. Kofi receives the first payout of 500 USDC, buys his inventory, and continues contributing monthly. His trust score climbs to Gold tier.",
    benefits: [
      "Access working capital without traditional loans",
      "Build a verifiable credit history for future borrowing",
      "Circle governance allows business community coordination",
      "Yield on idle funds provides additional returns",
    ],
  },
  {
    title: "Community Savings Groups",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    description:
      "Savings groups — known as chamas, tandas, susus, or cundinas — have existed for centuries. These informal groups rely on trust and social pressure, but they are vulnerable to fraud, mismanagement, and lack of record-keeping.",
    scenario:
      "A group of eight women in Nairobi have been running an informal chama for two years using a notebook and mobile money. Twice, their treasurer disappeared with funds. They migrate their chama to Halo Protocol. Now, all contributions go to an on-chain escrow. Payouts are automatic and verifiable. No single member can access funds outside the rules. Their informal trust is now backed by smart contracts.",
    benefits: [
      "Digitize existing savings groups with trustless infrastructure",
      "Eliminate fraud and mismanagement through smart contracts",
      "Full transparency with on-chain records for every transaction",
      "Insurance pool protects members against defaults",
    ],
  },
  {
    title: "Immigrants & Newcomers",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    description:
      "Immigrants arriving in a new country start with zero credit history, regardless of their financial track record in their home country. Building credit from scratch takes years through traditional channels, limiting access to housing, employment, and financial services.",
    scenario:
      "Ahmed moves from Egypt to Toronto. He has a stable job but no Canadian credit history, making it impossible to rent an apartment or get a credit card. He joins a Halo Protocol lending circle with other newcomers from his mosque community. After six months of on-time contributions, his trust score reaches 600 (Gold tier). His portable, on-chain credit reputation can be shared with landlords and service providers who recognize on-chain credentials.",
    benefits: [
      "Build credit immediately upon arrival, not after years of waiting",
      "Portable reputation that works across borders",
      "Connect with community members in similar situations",
      "Credit score is transparent and verifiable by anyone",
    ],
  },
];

export default function UseCasesPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Use Cases
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Halo Protocol is built for the billions who need credit access most.
            Here is who we serve and how.
          </p>
        </div>

        {/* Use Case Cards */}
        <div className="space-y-12 mb-16">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="glass-card p-8 sm:p-10">
              {/* Header */}
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
                  {useCase.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {useCase.title}
                  </h2>
                  <p className="text-white/50 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>

              {/* Example Scenario */}
              <div className="bg-white/[0.03] rounded-lg p-6 mb-6 border border-white/5">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
                  Example Scenario
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {useCase.scenario}
                </p>
              </div>

              {/* Benefits */}
              <ul className="grid sm:grid-cols-2 gap-3">
                {useCase.benefits.map((benefit) => (
                  <li
                    key={benefit}
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
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="glass-card p-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              See Yourself Here?
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Whether you are an individual, a business owner, or a community
              organizer, Halo Protocol gives you the tools to save together and
              build credit on your own terms.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-8 py-3 font-semibold hover:bg-white/90 transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
