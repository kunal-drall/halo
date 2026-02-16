import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers | Halo Protocol",
  description:
    "Join the Halo Protocol team. We are hiring smart contract engineers, frontend developers, community managers, and developer relations engineers.",
};

const positions = [
  {
    title: "Smart Contract Engineer",
    type: "Full-time",
    location: "Remote",
    description:
      "Design, implement, and audit Solana smart contracts using the Anchor framework. You will work on core protocol logic including circle mechanics, trust scoring algorithms, escrow management, insurance pools, and yield integrations. Experience with Rust and the Solana runtime is required.",
    requirements: [
      "3+ years of experience with Rust programming",
      "Experience building and deploying Solana programs (Anchor preferred)",
      "Deep understanding of PDAs, CPIs, and the Solana account model",
      "Familiarity with DeFi protocols and token standards (SPL)",
      "Strong security mindset and experience with smart contract auditing",
    ],
  },
  {
    title: "Frontend Developer",
    type: "Full-time",
    location: "Remote",
    description:
      "Build the user-facing experience for Halo Protocol using Next.js, TypeScript, and TailwindCSS. You will create responsive, performant pages and components that interact with Solana smart contracts through the Wallet Adapter. Experience with React Server Components and the App Router is a plus.",
    requirements: [
      "3+ years of experience with React and TypeScript",
      "Experience with Next.js 14 App Router and Server Components",
      "Strong proficiency with TailwindCSS and responsive design",
      "Familiarity with Solana Wallet Adapter and web3 frontend patterns",
      "Experience with state management (Zustand, React Query)",
    ],
  },
  {
    title: "Community Manager",
    type: "Part-time",
    location: "Remote",
    description:
      "Grow and manage the Halo Protocol community across Discord, Telegram, and Twitter. You will be the voice of the project — answering questions, moderating discussions, organizing events, and gathering feedback from users. Experience with DeFi or fintech communities is a strong plus.",
    requirements: [
      "2+ years of community management experience in crypto or fintech",
      "Excellent written communication in English (additional languages a plus)",
      "Experience managing Discord and Telegram communities",
      "Understanding of DeFi, Solana ecosystem, and ROSCAs",
      "Self-motivated and comfortable working asynchronously across time zones",
    ],
  },
  {
    title: "Developer Relations Engineer",
    type: "Full-time",
    location: "Remote",
    description:
      "Be the bridge between Halo Protocol and the developer community. Write documentation, create tutorials, build sample integrations, speak at conferences, and support third-party developers building on our SDK. You will make it easy for anyone to integrate with Halo Protocol.",
    requirements: [
      "3+ years in developer relations, developer advocacy, or technical writing",
      "Strong programming skills in TypeScript and/or Rust",
      "Experience creating technical content (docs, tutorials, videos)",
      "Familiarity with the Solana ecosystem and blockchain development",
      "Public speaking experience at meetups or conferences",
    ],
  },
];

export default function CareersPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Join Our Team
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Help us build the future of community-powered credit on Solana. We
            are a remote-first team working on one of the most impactful problems
            in decentralized finance.
          </p>
        </div>

        {/* Open Positions */}
        <div className="space-y-6 mb-16">
          {positions.map((position) => (
            <div key={position.title} className="glass-card p-8 glass-card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {position.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                      {position.type}
                    </span>
                    <span className="text-xs font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                      {position.location}
                    </span>
                  </div>
                </div>
                <Link
                  href="mailto:careers@haloprotocol.io"
                  className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0B0F1A] px-6 py-2.5 font-semibold text-sm hover:bg-white/90 transition-colors flex-shrink-0"
                >
                  Apply
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

              <p className="text-white/50 leading-relaxed mb-6">
                {position.description}
              </p>

              <div>
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {position.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-3 text-white/50 text-sm"
                    >
                      <svg
                        className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0"
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
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-3">
              Do not see the right role?
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-6">
              We are always looking for talented individuals passionate about
              financial inclusion and decentralized systems. Send us your resume
              and tell us how you want to contribute.
            </p>
            <Link
              href="mailto:careers@haloprotocol.io"
              className="inline-flex items-center gap-2 text-white font-medium hover:text-white/80 transition-colors"
            >
              careers@haloprotocol.io
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
    </div>
  );
}
