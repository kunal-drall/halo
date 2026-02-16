import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | Halo Protocol",
  description:
    "Learn how Halo Protocol works: connect your wallet, join or create a lending circle, contribute each round, and build on-chain credit on Solana.",
};

const steps = [
  {
    number: "01",
    title: "Sign Up & Connect Wallet",
    description:
      "Get started by connecting your Solana wallet. Halo Protocol supports Phantom, Solflare, and Ledger. No email, no KYC, no centralized account required — your wallet is your identity.",
    details: [
      "Connect any Solana-compatible wallet",
      "Supports Phantom, Solflare, and Ledger hardware wallets",
      "No personal information or KYC required",
      "Your wallet address serves as your on-chain identity",
    ],
  },
  {
    number: "02",
    title: "Join or Create a Circle",
    description:
      "Browse available lending circles or create your own. Configure contribution amounts in SOL or USDC, set the round frequency, choose the number of members (3-10), and define governance rules.",
    details: [
      "Browse and filter circles by size, frequency, and trust tier",
      "Create custom circles with your own parameters",
      "Set contribution amounts in SOL or USDC",
      "Configure round frequency: weekly, bi-weekly, or monthly",
    ],
  },
  {
    number: "03",
    title: "Contribute Each Round",
    description:
      "Make your contribution each round before the deadline. Funds are deposited directly into an on-chain escrow account — no middlemen, no manual transfers. Each round, one member receives the full pot.",
    details: [
      "One-click contributions directly from your wallet",
      "Funds held in program-derived escrow accounts",
      "Real-time tracking of all deposits and balances",
      "Automatic notifications before round deadlines",
    ],
  },
  {
    number: "04",
    title: "Build Credit & Earn Yield",
    description:
      "Every on-time payment boosts your trust score (0-1000). Progress through Newcomer, Silver, Gold, and Platinum tiers to unlock lower stake requirements and access to higher-value circles. Meanwhile, idle pool funds generate yield automatically.",
    details: [
      "Trust score updated on-chain after each round",
      "Higher scores unlock better circles and lower collateral",
      "Idle funds earn yield through DeFi integrations",
      "Portable, verifiable credit reputation you own forever",
    ],
  },
];

const faqs = [
  {
    question: "What is a ROSCA?",
    answer:
      "A Rotating Savings and Credit Association (ROSCA) is a group of individuals who agree to contribute a fixed amount to a common pool each period. Each period, one member receives the full pot. This rotates until everyone has received a payout. ROSCAs have been used for centuries across the world.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "Halo Protocol supports all major Solana wallets including Phantom, Solflare, and Ledger. Any wallet compatible with the Solana Wallet Adapter standard will work.",
  },
  {
    question: "How is my trust score calculated?",
    answer:
      "Your trust score (0-1000) is calculated on-chain based on four factors: Payment History (40%), Circle Completion Rate (30%), DeFi Activity (20%), and Social Proof (10%). The score determines your tier: Newcomer (0-249), Silver (250-499), Gold (500-749), or Platinum (750-1000).",
  },
  {
    question: "What happens if a member misses a payment?",
    answer:
      "Missed payments reduce the member's trust score and trigger the circle's insurance pool. The insurance pool covers shortfalls so other members are not affected. Repeated defaults may result in removal from the circle.",
  },
  {
    question: "What are the fees?",
    answer:
      "Halo Protocol charges a 0.5% fee on payout distributions, a 0.25% fee on generated yield, and a 2% annual management fee. SOL gas fees for transactions are typically under $0.01.",
  },
  {
    question: "Is Halo Protocol audited?",
    answer:
      "All smart contracts are open-source and available for public review. The protocol undergoes continuous security reviews and community audits. We encourage independent security researchers to review the codebase.",
  },
  {
    question: "Can I be in multiple circles at once?",
    answer:
      "Yes. You can participate in multiple lending circles simultaneously, as long as you meet the stake and trust score requirements for each circle.",
  },
  {
    question: "What blockchain does Halo run on?",
    answer:
      "Halo Protocol runs on the Solana blockchain, leveraging its sub-second finality, low transaction costs (under $0.01), and high throughput for a seamless user experience.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            How It Works
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            From connecting your wallet to building on-chain credit — here is
            everything you need to know.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-24">
          {steps.map((step) => (
            <div key={step.number} className="glass-card p-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Number & Title */}
                <div className="md:w-1/3">
                  <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {step.title}
                  </h2>
                  <p className="text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Details */}
                <div className="md:w-2/3 flex items-center">
                  <ul className="space-y-3 w-full">
                    {step.details.map((detail) => (
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
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-24">
          <div className="glass-card p-10 sm:p-14">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Connect your Solana wallet and join your first lending circle in
              minutes. No credit check, no paperwork, no gatekeepers.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-8 py-3 font-semibold hover:bg-white/90 transition-colors"
            >
              Create Your Account
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

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-white/50 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
