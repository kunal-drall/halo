import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Halo Protocol",
  description:
    "Read the latest news, updates, and insights from the Halo Protocol team about decentralized lending circles on Solana.",
};

const featuredPost = {
  title: "Introducing Halo Protocol",
  date: "February 10, 2026",
  excerpt:
    "Today we are excited to announce the launch of Halo Protocol — a decentralized lending circle platform built on Solana. Halo brings the centuries-old practice of ROSCAs on-chain with trustless escrow, on-chain credit scoring, and automated yield generation. Our mission is to make credit accessible for the 1.4 billion adults worldwide who lack formal financial histories.",
  slug: "#",
  tag: "Announcement",
};

const posts = [
  {
    title: "Understanding ROSCAs: The World's Oldest Savings Mechanism",
    date: "February 8, 2026",
    excerpt:
      "Rotating Savings and Credit Associations have been used for centuries across Africa, Asia, and Latin America. Learn how Halo Protocol brings these community savings groups into the web3 era.",
    slug: "#",
    tag: "Education",
  },
  {
    title: "How On-Chain Trust Scoring Works",
    date: "February 5, 2026",
    excerpt:
      "Your Halo trust score ranges from 0 to 1000 and is calculated entirely on-chain. We break down the four factors — Payment History, Circle Completion, DeFi Activity, and Social Proof — that determine your tier.",
    slug: "#",
    tag: "Technical",
  },
  {
    title: "Why We Built on Solana",
    date: "February 1, 2026",
    excerpt:
      "Sub-second finality, transaction fees under $0.01, and a thriving DeFi ecosystem. Here is why Solana is the ideal blockchain for community lending circles at scale.",
    slug: "#",
    tag: "Technical",
  },
  {
    title: "Building Credit Without a Bank Account",
    date: "January 28, 2026",
    excerpt:
      "1.4 billion adults are unbanked. Traditional credit systems require existing credit to build credit. Halo Protocol breaks this cycle by letting anyone build a verifiable credit reputation through community savings.",
    slug: "#",
    tag: "Education",
  },
];

export default function BlogPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Blog
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            News, updates, and insights from the Halo Protocol team.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Link href={featuredPost.slug}>
            <div className="glass-card p-8 sm:p-10 border border-violet-500/20 glass-card-hover">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1">
                  {featuredPost.tag}
                </span>
                <span className="text-xs text-white/30">Featured</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-white/40 text-sm mb-4">{featuredPost.date}</p>
              <p className="text-white/50 leading-relaxed mb-6">
                {featuredPost.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-white font-medium text-sm hover:text-white/80 transition-colors">
                Read More
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
              </span>
            </div>
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.title} href={post.slug}>
              <div className="glass-card p-6 h-full glass-card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    {post.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-white/30 text-xs mb-3">{post.date}</p>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors">
                  Read More
                  <svg
                    className="w-3 h-3"
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
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
