import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | Halo Protocol",
  description:
    "Halo Protocol is free to use. Learn about transaction costs, protocol fees, and how Halo compares to traditional credit-building services.",
};

const freeFeatures = [
  "Account creation and wallet connection",
  "Trust score initialization and tracking",
  "Join unlimited lending circles",
  "Create and manage circles",
  "Dashboard and analytics access",
  "Community support via Discord and Telegram",
  "Full governance participation",
  "Insurance pool protection",
];

const transactionCosts = [
  {
    label: "SOL Gas Fees",
    value: "< $0.01",
    description:
      "Solana network fees for each transaction. Typically fractions of a cent per transaction.",
  },
  {
    label: "Distribution Fee",
    value: "0.5%",
    description:
      "Applied to each payout distribution. Covers protocol maintenance and development.",
  },
  {
    label: "Yield Fee",
    value: "0.25%",
    description:
      "Applied to yield generated from idle pool funds deployed in DeFi protocols.",
  },
  {
    label: "Management Fee",
    value: "2% annual",
    description:
      "Annual fee applied to active circle balances. Supports ongoing development and security audits.",
  },
];

const comparisonRows = [
  {
    feature: "Monthly Cost",
    halo: "Free",
    traditional: "$10-30/month",
  },
  {
    feature: "Credit Score Type",
    halo: "On-chain (0-1000)",
    traditional: "Off-chain (300-850)",
  },
  {
    feature: "Data Ownership",
    halo: "You own your score",
    traditional: "Bureau owns your data",
  },
  {
    feature: "KYC Required",
    halo: "No",
    traditional: "Yes",
  },
  {
    feature: "Geographic Restrictions",
    halo: "None — global access",
    traditional: "Country-specific",
  },
  {
    feature: "Transparency",
    halo: "Fully on-chain and auditable",
    traditional: "Opaque algorithms",
  },
  {
    feature: "Savings Component",
    halo: "Built-in with yield",
    traditional: "None",
  },
  {
    feature: "Community Governed",
    halo: "Yes",
    traditional: "No",
  },
  {
    feature: "Time to Build Credit",
    halo: "Immediate — first contribution counts",
    traditional: "6-12 months minimum",
  },
];

export default function PricingPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Pricing
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Halo Protocol is free to use. You only pay minimal Solana gas fees
            and small protocol fees on distributions and yield.
          </p>
        </div>

        {/* Free Tier Card */}
        <div className="max-w-lg mx-auto mb-20">
          <div className="glass-card p-8 sm:p-10 text-center border border-violet-500/30">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-2">
              For Everyone
            </p>
            <h2 className="text-3xl font-bold text-white mb-1">Free</h2>
            <p className="text-5xl font-bold text-gradient mb-2">$0</p>
            <p className="text-white/40 mb-8">per month, forever</p>
            <ul className="space-y-3 text-left mb-8">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
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
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-8 py-3 font-semibold hover:bg-white/90 transition-colors w-full justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Transaction Costs */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Transaction Costs
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {transactionCosts.map((cost) => (
              <div key={cost.label} className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {cost.label}
                  </h3>
                  <span className="text-xl font-bold text-gradient">
                    {cost.value}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  {cost.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Halo vs Traditional Credit Building
          </h2>
          <p className="text-white/40 text-center mb-12 max-w-xl mx-auto">
            See how Halo Protocol compares to traditional credit-building
            services and bureaus.
          </p>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-white/40 text-sm font-medium uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-violet-400 text-sm font-medium uppercase tracking-wider">
                      Halo Protocol
                    </th>
                    <th className="px-6 py-4 text-white/40 text-sm font-medium uppercase tracking-wider">
                      Traditional
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={
                        index < comparisonRows.length - 1
                          ? "border-b border-white/5"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-medium">
                        {row.halo}
                      </td>
                      <td className="px-6 py-4 text-white/40 text-sm">
                        {row.traditional}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
