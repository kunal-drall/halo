"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 px-4">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Glow blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Status badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live on Solana Devnet
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Build Credit
          <br />
          Through Community
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Halo Protocol brings rotating savings circles on-chain with trustless
          escrow, verifiable credit scoring, and smart contract automation on
          Solana. Build your financial reputation through community participation.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 text-base">
              Get Started
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="lg" className="px-8 text-base">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">0 - 1,000</div>
            <div className="text-xs text-neutral-500 mt-1">Trust Score Range</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">3 - 10</div>
            <div className="text-xs text-neutral-500 mt-1">Members per Circle</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">USDC</div>
            <div className="text-xs text-neutral-500 mt-1">Contribution Token</div>
          </div>
        </div>
      </div>
    </section>
  );
}
