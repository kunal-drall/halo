import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepaper | Halo Protocol",
  description:
    "Read the Halo Protocol whitepaper: decentralized ROSCA mechanism, on-chain trust scoring algorithm, technical architecture, and roadmap on Solana.",
};

export default function WhitepaperPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Whitepaper
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Halo Protocol: Decentralized Lending Circles with On-Chain Credit
            Scoring on Solana
          </p>
          <p className="text-white/30 text-sm mt-4">Version 1.0 — February 2026</p>
        </div>

        {/* Whitepaper Content */}
        <div className="glass-card p-8 sm:p-12 space-y-12">
          {/* Abstract */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Abstract</h2>
            <p className="text-white/60 leading-relaxed">
              Halo Protocol is a decentralized protocol built on Solana that brings
              Rotating Savings and Credit Associations (ROSCAs) on-chain. The
              protocol enables groups of 3-10 individuals to form lending circles,
              contribute funds each round to a shared escrow, and receive payouts on
              a rotating basis — all enforced by smart contracts. Halo introduces an
              on-chain trust scoring system (0-1000) that rewards reliable financial
              behavior, creating a portable, transparent, and permissionless credit
              reputation. By combining time-tested community savings mechanisms with
              Solana&apos;s speed and low costs, Halo Protocol aims to provide credit
              access to the 1.4 billion adults worldwide who lack formal financial
              histories.
            </p>
          </section>

          {/* Problem Statement */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Problem Statement
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Traditional credit systems are exclusionary by design. They require
                existing credit history to build credit, creating a paradox that
                traps billions in a cycle of financial invisibility. The World Bank
                estimates that 1.4 billion adults are unbanked, and many more are
                underbanked with limited access to credit.
              </p>
              <p>
                Existing credit scoring models (FICO, VantageScore) are opaque,
                centralized, and geographically restricted. They do not recognize
                informal savings behavior, community trust, or cross-border financial
                activity. Immigrants, gig workers, and rural communities are
                systematically excluded.
              </p>
              <p>
                Meanwhile, ROSCAs — known by dozens of names worldwide (chamas,
                tandas, susus, cundinas, paluwagan) — have served as informal
                credit and savings vehicles for centuries. These systems rely on
                social trust but are vulnerable to fraud, mismanagement, and lack of
                verifiable records.
              </p>
              <p>
                Halo Protocol bridges this gap by encoding the ROSCA mechanism into
                auditable smart contracts and replacing informal trust with
                cryptographic guarantees and on-chain reputation.
              </p>
            </div>
          </section>

          {/* ROSCA Mechanism */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. The ROSCA Mechanism
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                A ROSCA (Rotating Savings and Credit Association) is a group savings
                mechanism in which a fixed number of members contribute a set amount
                to a common pool each round. Each round, one member receives the
                entire pool. The rotation continues until every member has received a
                payout.
              </p>
              <p>
                In Halo Protocol, the ROSCA mechanism is implemented as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong className="text-white/80">Circle Creation:</strong> A
                  creator initializes a circle with parameters: contribution amount
                  (in SOL or USDC), round frequency, member count (3-10), and
                  minimum trust score requirement.
                </li>
                <li>
                  <strong className="text-white/80">Member Joining:</strong>{" "}
                  Members join by depositing a stake (collateral) proportional to
                  their trust tier. Higher trust scores require less collateral.
                </li>
                <li>
                  <strong className="text-white/80">Contribution Rounds:</strong>{" "}
                  Each round, all members send their contribution to the
                  circle&apos;s escrow PDA. The smart contract enforces deadlines and
                  tracks payments.
                </li>
                <li>
                  <strong className="text-white/80">Payout Distribution:</strong>{" "}
                  The full pool is distributed to the designated recipient for that
                  round. Payout order can be predetermined or determined by
                  governance vote.
                </li>
                <li>
                  <strong className="text-white/80">Circle Completion:</strong>{" "}
                  After all members have received a payout, the circle completes.
                  Stakes are returned, and trust scores are updated.
                </li>
              </ul>
            </div>
          </section>

          {/* Trust Scoring Algorithm */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Trust Scoring Algorithm
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Halo Protocol implements a transparent, on-chain trust scoring
                system. Each user&apos;s trust score ranges from 0 to 1000 and is
                calculated based on four weighted factors:
              </p>

              <div className="bg-white/[0.03] rounded-lg p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-medium">
                    Payment History
                  </span>
                  <span className="text-white font-bold">40%</span>
                </div>
                <p className="text-sm">
                  On-time payments vs. missed or late payments across all circles.
                  Consistent, timely contributions have the largest impact on score.
                </p>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-white/80 font-medium">
                    Circle Completion Rate
                  </span>
                  <span className="text-white font-bold">30%</span>
                </div>
                <p className="text-sm">
                  Ratio of circles completed to circles joined. Early exits,
                  defaults, and incomplete circles reduce this component.
                </p>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-white/80 font-medium">
                    DeFi Activity
                  </span>
                  <span className="text-white font-bold">20%</span>
                </div>
                <p className="text-sm">
                  Broader Solana ecosystem participation: token holdings, DeFi
                  interactions, and wallet age. Demonstrates overall financial
                  engagement.
                </p>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-white/80 font-medium">
                    Social Proof
                  </span>
                  <span className="text-white font-bold">10%</span>
                </div>
                <p className="text-sm">
                  Referrals, vouches from other members, and participation in
                  governance. Reflects community trust and engagement.
                </p>
              </div>

              <p>
                Scores map to four tiers with corresponding stake multipliers:
              </p>
              <div className="bg-white/[0.03] rounded-lg p-6 border border-white/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-red-400 font-bold">Newcomer</p>
                    <p className="text-sm text-white/40">0-249</p>
                    <p className="text-xs text-white/30">2x stake</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-bold">Silver</p>
                    <p className="text-sm text-white/40">250-499</p>
                    <p className="text-xs text-white/30">1.5x stake</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">Gold</p>
                    <p className="text-sm text-white/40">500-749</p>
                    <p className="text-xs text-white/30">1x stake</p>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-bold">Platinum</p>
                    <p className="text-sm text-white/40">750-1000</p>
                    <p className="text-xs text-white/30">0.75x stake</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Architecture */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Technical Architecture
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Halo Protocol is built on the Solana blockchain using the Anchor
                framework (v0.31.1). The smart contract system consists of over 30
                instructions managing circles, members, escrow, payouts, trust
                scores, insurance, governance, and yield.
              </p>
              <h3 className="text-lg font-semibold text-white/80 mt-6">
                On-Chain Components
              </h3>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong className="text-white/80">Circle Account:</strong> Stores
                  circle parameters, member list, round state, and payout schedule.
                  PDA seeds: [&quot;circle&quot;, creator, id_bytes].
                </li>
                <li>
                  <strong className="text-white/80">Escrow Account:</strong> Holds
                  pooled funds for each circle. PDA seeds: [&quot;escrow&quot;, circle].
                </li>
                <li>
                  <strong className="text-white/80">Member Account:</strong> Tracks
                  individual member state within a circle. PDA seeds:
                  [&quot;member&quot;, circle, authority].
                </li>
                <li>
                  <strong className="text-white/80">Trust Score Account:</strong>{" "}
                  Stores computed trust score and component weights. PDA seeds:
                  [&quot;trust_score&quot;, authority].
                </li>
                <li>
                  <strong className="text-white/80">Insurance Account:</strong>{" "}
                  Manages the insurance pool for each circle. PDA seeds:
                  [&quot;insurance&quot;, circle].
                </li>
                <li>
                  <strong className="text-white/80">Treasury & Revenue:</strong>{" "}
                  Protocol-level accounts for fee collection and distribution. PDA
                  seeds: [&quot;treasury&quot;] and [&quot;revenue_params&quot;].
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white/80 mt-6">
                Off-Chain Infrastructure
              </h3>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong className="text-white/80">Frontend:</strong> Next.js 14
                  App Router with TypeScript, TailwindCSS, and Solana Wallet
                  Adapter.
                </li>
                <li>
                  <strong className="text-white/80">Database:</strong> Supabase
                  (PostgreSQL) for off-chain metadata, user profiles, and activity
                  logs.
                </li>
                <li>
                  <strong className="text-white/80">Caching:</strong> Upstash Redis
                  for rate limiting, session management, and real-time data.
                </li>
                <li>
                  <strong className="text-white/80">Indexing:</strong> Helius
                  webhooks for real-time on-chain event processing and
                  notifications.
                </li>
              </ul>
            </div>
          </section>

          {/* Token Design */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Token Design
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Halo Protocol currently operates without a native governance token.
                Circles accept SOL and USDC (SPL tokens) for contributions and
                payouts. Governance is implemented through on-chain voting by circle
                members using their existing stake.
              </p>
              <p>
                A future governance token may be introduced to decentralize protocol
                upgrades, fee parameter changes, and treasury management. Any token
                launch will be preceded by community discussion and governance
                proposals.
              </p>
              <h3 className="text-lg font-semibold text-white/80 mt-6">
                Fee Structure
              </h3>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong className="text-white/80">Distribution Fee:</strong> 0.5%
                  on each payout distribution
                </li>
                <li>
                  <strong className="text-white/80">Yield Fee:</strong> 0.25% on
                  generated yield
                </li>
                <li>
                  <strong className="text-white/80">Management Fee:</strong> 2%
                  annual on active circle balances
                </li>
              </ul>
              <p>
                All fees flow to the protocol treasury and are governed by the
                revenue_params account on-chain.
              </p>
            </div>
          </section>

          {/* Roadmap */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Roadmap</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-violet-400">
                    Q1 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-white/80 font-medium mb-1">
                    Protocol Launch
                  </h3>
                  <p className="text-white/50 text-sm">
                    Mainnet deployment on Solana. Core ROSCA mechanics, trust scoring,
                    escrow, and insurance. Open-source smart contracts and frontend.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-violet-400">
                    Q2 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-white/80 font-medium mb-1">
                    Yield & Governance
                  </h3>
                  <p className="text-white/50 text-sm">
                    DeFi yield integration for idle pool funds. On-chain governance
                    for circle parameters and protocol upgrades. Mobile PWA
                    enhancements.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-violet-400">
                    Q3 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-white/80 font-medium mb-1">
                    SDK & Integrations
                  </h3>
                  <p className="text-white/50 text-sm">
                    TypeScript SDK for third-party integrations. API for external
                    applications to query trust scores. Partnerships with fintechs
                    and microfinance institutions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-violet-400">
                    Q4 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-white/80 font-medium mb-1">
                    Global Expansion
                  </h3>
                  <p className="text-white/50 text-sm">
                    Multi-language support. Regional community programs. Cross-chain
                    credit portability research. Governance token evaluation.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
