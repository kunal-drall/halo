import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="border-t border-white/10 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Build Your On-Chain Credit?
        </h2>
        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
          Connect your Solana wallet and join a lending circle today. No minimum
          balance required to get started.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="px-8 text-base">
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
