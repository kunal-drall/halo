"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type YieldInfo = {
  circleId: string;
  circleName: string;
  totalDeposited: number;
  currentYield: number;
  apy: number;
  userShare: number;
  claimable: number;
  protocol: string;
};

export default function YieldDisplay({
  yieldInfo,
  onClaim,
}: {
  yieldInfo: YieldInfo;
  onClaim?: (circleId: string) => void;
}) {
  return (
    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-white">
                {yieldInfo.circleName}
              </h3>
              <p className="text-xs text-white/40">via {yieldInfo.protocol}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            {yieldInfo.apy.toFixed(1)}% APY
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Deposited</p>
            <p className="font-sans text-lg font-bold text-white">
              ${(yieldInfo.totalDeposited / 1e6).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Yield Earned</p>
            <p className="font-sans text-lg font-bold text-white">
              +${(yieldInfo.currentYield / 1e6).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Your Share</p>
            <p className="font-sans text-lg font-bold text-neutral-300">
              ${(yieldInfo.userShare / 1e6).toFixed(2)}
            </p>
          </div>
        </div>

        {yieldInfo.claimable > 0 && onClaim && (
          <Button
            className="w-full gap-2"
            onClick={() => onClaim(yieldInfo.circleId)}
          >
            Claim ${(yieldInfo.claimable / 1e6).toFixed(2)}
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
