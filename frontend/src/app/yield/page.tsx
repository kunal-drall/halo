"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  DollarSign,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import YieldDisplay from "@/components/yield/YieldDisplay";
import AssetDepositCard from "@/components/vault/AssetDepositCard";
import CapacityBar from "@/components/vault/CapacityBar";

const mockYieldData = [
  {
    circleId: "1",
    circleName: "DeFi Builders",
    totalDeposited: 50000_000000,
    currentYield: 2500_000000,
    apy: 12.5,
    userShare: 250_000000,
    claimable: 125_000000,
    protocol: "Solend",
  },
  {
    circleId: "2",
    circleName: "Solana Savers",
    totalDeposited: 80000_000000,
    currentYield: 4800_000000,
    apy: 10.8,
    userShare: 480_000000,
    claimable: 240_000000,
    protocol: "Solend",
  },
  {
    circleId: "3",
    circleName: "NFT Collectors",
    totalDeposited: 30000_000000,
    currentYield: 900_000000,
    apy: 8.2,
    userShare: 90_000000,
    claimable: 0,
    protocol: "Solend",
  },
];

export default function YieldPage() {
  const totalYield = mockYieldData.reduce((s, y) => s + y.currentYield, 0);
  const totalClaimable = mockYieldData.reduce((s, y) => s + y.claimable, 0);
  const totalDeposited = mockYieldData.reduce((s, y) => s + y.totalDeposited, 0);
  const avgApy =
    mockYieldData.reduce((s, y) => s + y.apy, 0) / mockYieldData.length;

  function handleClaim(circleId: string) {
    console.log("Claim yield for circle:", circleId);
    // TODO: call yield claim API
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-amber-300 text-sm font-medium">
            Yield generation is coming soon. Below is a preview of planned features.
          </p>
        </div>

        <div className="opacity-60 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-sans text-3xl font-bold">Yield</h1>
            <p className="text-white/50 mt-1">
              Earn passive income from your circle deposits via DeFi protocols
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-5 h-5 text-white mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">
                  ${(totalYield / 1e6).toFixed(0)}
                </div>
                <p className="text-xs text-white/40">Total Yield Earned</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <Zap className="w-5 h-5 text-neutral-300 mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-neutral-300">
                  ${(totalClaimable / 1e6).toFixed(0)}
                </div>
                <p className="text-xs text-white/40">Claimable Now</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-white mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">
                  ${(totalDeposited / 1e6).toFixed(0)}K
                </div>
                <p className="text-xs text-white/40">Total Deposited</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <Percent className="w-5 h-5 text-neutral-300 mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-neutral-300">
                  {avgApy.toFixed(1)}%
                </div>
                <p className="text-xs text-white/40">Average APY</p>
              </CardContent>
            </Card>
          </div>

          {/* How yield works */}
          <Card className="border-white/5 bg-[#111827] mb-8">
            <CardContent className="p-6">
              <h2 className="font-sans text-lg font-semibold mb-2">
                How Yield Generation Works
              </h2>
              <p className="text-sm text-white/60">
                Idle funds in circle escrow accounts are automatically deposited
                into Solend lending pools. The interest earned is distributed
                proportionally to all circle members after a 0.25% protocol fee.
                You can claim your yield share at any time.
              </p>
            </CardContent>
          </Card>

          {/* Asset Management */}
          <h2 className="font-sans text-xl font-semibold mb-4">
            Asset Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <AssetDepositCard
              asset="SOL"
              balance="0.00"
              stakedAmount="0.00"
              onDeposit={() => {}}
              onWithdraw={() => {}}
            />
            <AssetDepositCard
              asset="USDC"
              balance="0.00"
              stakedAmount="0.00"
              onDeposit={() => {}}
              onWithdraw={() => {}}
            />
          </div>
          <div className="mb-8">
            <CapacityBar
              totalCapacity={10000}
              usedCapacity={0}
              commitments={[]}
            />
          </div>

          {/* Yield per circle */}
          <h2 className="font-sans text-xl font-semibold mb-4">
            Yield by Circle
          </h2>
          <div className="space-y-4">
            {mockYieldData.map((yieldInfo) => (
              <YieldDisplay
                key={yieldInfo.circleId}
                yieldInfo={yieldInfo}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </motion.div>
        </div>
    </div>
  );
}
