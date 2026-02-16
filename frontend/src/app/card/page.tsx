"use client";

import { useState } from "react";
import Link from "next/link";

const bentoFeatures = [
  {
    title: "Vault",
    description:
      "Secure on-chain escrow for every lending circle. Funds are held in program-derived accounts that no single party can access outside the smart contract rules.",
    span: "md:col-span-2",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "Yield",
    description:
      "Idle pool funds are automatically deployed into vetted DeFi protocols on Solana, generating yield that is distributed proportionally to all circle members.",
    span: "md:col-span-1",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Identity",
    description:
      "Your on-chain trust score (0-1000) is your portable, verifiable credit identity. It travels with your wallet — no centralized bureau, no opaque algorithms.",
    span: "md:col-span-1",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
  },
  {
    title: "Credit Card",
    description:
      "Coming soon: a Halo-powered credit card backed by your on-chain trust score. Spend in the real world using credit you built through lending circles on Solana.",
    span: "md:col-span-2",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

export default function CardPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Animated Heading */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-6">
            The Halo Card
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Your on-chain credit reputation, in your pocket. Save with lending
            circles, build your trust score, and unlock real-world financial
            access.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {bentoFeatures.map((feature) => (
            <div
              key={feature.title}
              className={`glass-card p-8 ${feature.span} glass-card-hover`}
            >
              <div className="w-14 h-14 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6">
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h2>
              <p className="text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Waitlist Section */}
        <div className="max-w-xl mx-auto">
          <div className="glass-card p-8 sm:p-10 text-center border border-violet-500/20">
            <h2 className="text-2xl font-bold text-white mb-3">
              Join the Waitlist
            </h2>
            <p className="text-white/50 mb-8">
              Be the first to know when the Halo Card launches. Enter your email
              to reserve your spot.
            </p>

            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <svg
                  className="w-10 h-10 text-green-400 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-400 font-semibold text-lg">
                  You are on the list!
                </p>
                <p className="text-white/40 text-sm mt-2">
                  We will notify you when the Halo Card is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors flex-shrink-0"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
