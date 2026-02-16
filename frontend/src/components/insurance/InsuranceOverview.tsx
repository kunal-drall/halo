"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type InsurancePool = {
  circleId: string;
  circleName: string;
  totalStaked: number;
  userStaked: number;
  availableCoverage: number;
  contributionAmount: number;
  minStakePercent: number;
  maxStakePercent: number;
  status: "active" | "claimed" | "returned";
  bonusRate: number;
};

export default function InsuranceOverview({
  pool,
  onStake,
  onClaim,
}: {
  pool: InsurancePool;
  onStake?: () => void;
  onClaim?: () => void;
}) {
  const stakePercent = pool.contributionAmount > 0
    ? (pool.userStaked / pool.contributionAmount) * 100
    : 0;
  const coveragePercent = pool.totalStaked > 0
    ? (pool.availableCoverage / pool.totalStaked) * 100
    : 0;

  return (
    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-white">
                {pool.circleName}
              </h3>
              <p className="text-xs text-white/40">Insurance Pool</p>
            </div>
          </div>
          <Badge
            variant={
              pool.status === "active"
                ? "success"
                : pool.status === "claimed"
                ? "destructive"
                : "secondary"
            }
          >
            {pool.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Your Stake</p>
            <p className="font-sans text-lg font-bold text-white">
              {(pool.userStaked / 1e6).toFixed(2)} USDC
            </p>
            <p className="text-xs text-white/30">
              {stakePercent.toFixed(0)}% of contribution
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Pool Total</p>
            <p className="font-sans text-lg font-bold text-white">
              {(pool.totalStaked / 1e6).toFixed(2)} USDC
            </p>
            <p className="text-xs text-white/30">
              {coveragePercent.toFixed(0)}% available
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Coverage Available</span>
            <span>{coveragePercent.toFixed(0)}%</span>
          </div>
          <Progress
            value={coveragePercent}
            indicatorClassName={cn(
              coveragePercent > 75
                ? "bg-white"
                : coveragePercent > 40
                ? "bg-neutral-400"
                : "bg-neutral-600"
            )}
          />
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <TrendingUp className="w-4 h-4 text-white shrink-0" />
          <p className="text-xs text-neutral-300">
            +{pool.bonusRate}% bonus on return if no claims are made
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
