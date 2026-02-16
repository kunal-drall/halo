import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Halo Protocol",
  description:
    "Learn about Halo Protocol — decentralized lending circles on Solana with on-chain credit scoring, trustless escrow, and yield generation.",
};

export default function AboutPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            About Halo Protocol
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Building the future of community-powered finance on Solana.
          </p>
        </div>

        {/* Our Mission */}
        <section className="mb-20">
          <div className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed text-lg">
              <p>
                Over 1.4 billion adults worldwide lack access to formal credit
                systems. Without a credit history, they cannot borrow money, start
                businesses, or build a financial future. Traditional credit scoring
                systems exclude those who need them the most.
              </p>
              <p>
                Halo Protocol changes this by bringing Rotating Savings and Credit
                Associations (ROSCAs) on-chain. ROSCAs have been used for centuries
                across Africa, Asia, Latin America, and the Caribbean to help
                communities save and lend to one another. By combining this
                time-tested mechanism with Solana smart contracts, we create a
                transparent, trustless, and programmable savings system available to
                anyone with a wallet.
              </p>
              <p>
                Our mission is to make credit accessible for the billions who are
                underserved by the traditional financial system, using the power of
                decentralized technology to create a fairer and more inclusive
                financial world.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Form a Circle",
                description:
                  "Create or join a lending circle with 3-10 trusted members. Set contribution amounts in SOL or USDC, choose round frequency, and define payout rules — all enforced by Solana smart contracts.",
              },
              {
                step: "2",
                title: "Contribute Each Round",
                description:
                  "Every member contributes a fixed amount each round. Funds are held in a trustless escrow account on-chain. Each round, one member receives the full pot, rotating until everyone has received a payout.",
              },
              {
                step: "3",
                title: "Build Credit On-Chain",
                description:
                  "Every on-time payment, every completed circle, and every act of reliability is recorded on-chain. Your trust score grows from 0 to 1000, unlocking better circles, lower stake requirements, and more opportunities.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Built on Solana */}
        <section className="mb-20">
          <div className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Built on Solana
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Halo Protocol is built entirely on the Solana blockchain, taking
                  advantage of its sub-second finality, negligible transaction fees
                  (typically less than $0.01), and high throughput to deliver a
                  seamless user experience.
                </p>
                <p>
                  Our Anchor-based smart contracts handle circle creation, member
                  management, escrow, payouts, trust score calculations, insurance
                  pools, governance, and yield generation — all on-chain and fully
                  verifiable.
                </p>
              </div>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Every transaction is transparent, every rule is enforced by code,
                  and every participant can verify the state of the protocol at any
                  time. There is no central authority controlling funds or
                  manipulating scores.
                </p>
                <p>
                  By leveraging Solana Program Library (SPL) tokens, Halo supports
                  both SOL and USDC for contributions and payouts, giving members
                  flexibility in how they participate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="text-center">
          <div className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Open Source
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              All Halo Protocol smart contracts and frontend code are open source
              and auditable. We believe in building in the open and inviting the
              community to inspect, contribute, and improve the protocol.
            </p>
            <Link
              href="https://github.com/halo-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
