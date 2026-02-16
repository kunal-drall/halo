"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InsuranceOverview from "@/components/insurance/InsuranceOverview";

const mockPools = [
  {
    circleId: "1",
    circleName: "DeFi Builders",
    totalStaked: 5000_000000,
    userStaked: 500_000000,
    availableCoverage: 4500_000000,
    contributionAmount: 1000_000000,
    minStakePercent: 10,
    maxStakePercent: 20,
    status: "active" as const,
    bonusRate: 5,
  },
  {
    circleId: "2",
    circleName: "Solana Savers",
    totalStaked: 8000_000000,
    userStaked: 800_000000,
    availableCoverage: 6000_000000,
    contributionAmount: 2000_000000,
    minStakePercent: 10,
    maxStakePercent: 20,
    status: "active" as const,
    bonusRate: 5,
  },
];

export default function InsurancePage() {
  const totalStaked = mockPools.reduce((sum, p) => sum + p.userStaked, 0);
  const totalPoolValue = mockPools.reduce((sum, p) => sum + p.totalStaked, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-amber-300 text-sm font-medium">
            Insurance pools are coming soon. Below is a preview of planned features.
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
            <h1 className="font-sans text-3xl font-bold">Insurance</h1>
            <p className="text-white/50 mt-1">
              Protect yourself and your circles from defaults
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <Shield className="w-5 h-5 text-white mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">
                  {(totalStaked / 1e6).toFixed(0)}
                </div>
                <p className="text-xs text-white/40">Your Total Staked (USDC)</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-white mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">
                  {(totalPoolValue / 1e6).toFixed(0)}
                </div>
                <p className="text-xs text-white/40">Total Pool Value (USDC)</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-5 h-5 text-neutral-300 mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">
                  {mockPools.length}
                </div>
                <p className="text-xs text-white/40">Active Pools</p>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.03]">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                <div className="font-sans text-xl font-bold text-white">0</div>
                <p className="text-xs text-white/40">Claims Filed</p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="border-white/5 bg-white/[0.03] mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-white" />
                <h2 className="font-sans text-lg font-semibold">
                  How Insurance Works
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-white/60">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white font-medium mb-1">1. Stake</p>
                  <p>Stake 10-20% of your contribution amount as insurance when joining a circle.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white font-medium mb-1">2. Protect</p>
                  <p>Insurance covers defaults. If a member misses payments, the pool covers the loss.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-white font-medium mb-1">3. Earn</p>
                  <p>Get your stake back with a 5% bonus when the circle completes with no claims.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pools */}
          <h2 className="font-sans text-xl font-semibold mb-4">
            Your Insurance Pools
          </h2>
          <div className="space-y-4">
            {mockPools.map((pool) => (
              <InsuranceOverview key={pool.circleId} pool={pool} />
            ))}
          </div>
        </motion.div>
        </div>
    </div>
  );
}
