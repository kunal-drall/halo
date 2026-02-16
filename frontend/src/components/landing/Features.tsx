import React from "react";

const features = [
  {
    title: "Lending Circles",
    description:
      "Form circles with trusted members to save and borrow together. Smart contracts manage contributions, payouts, and escrow so every round is fair and transparent.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-white"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Trust Scoring",
    description:
      "Build a verifiable credit score from 0 to 1,000 through on-time contributions and successful circle completions. Higher scores unlock lower stake requirements and premium circles.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-white"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Secure & Private",
    description:
      "All funds are held in smart contract escrow accounts on Solana. No intermediaries, no custodians. You stay in control of your assets at every step.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-white"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for Community Trust
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Every feature is designed to make saving together safe, transparent,
            and rewarding for all participants.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
