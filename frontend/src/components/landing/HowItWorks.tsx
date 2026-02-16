import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description:
      "Link your Solana wallet (Phantom, Solflare) to get started.",
  },
  {
    number: "02",
    title: "Join or Create a Circle",
    description:
      "Browse open circles or create your own with custom parameters.",
  },
  {
    number: "03",
    title: "Contribute Each Round",
    description:
      "Make USDC contributions on time each round. Smart contracts enforce the rules.",
  },
  {
    number: "04",
    title: "Build Your Credit",
    description:
      "Every on-time payment increases your trust score. Complete circles to unlock higher tiers.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Get started in four simple steps and begin building your on-chain
            credit history.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-6">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white font-mono font-bold">
                {step.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 text-base">
              Start Building Credit
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
