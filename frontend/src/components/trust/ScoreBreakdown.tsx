"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle, Activity, UsersRound } from "lucide-react";
import type { TrustScoreBreakdown } from "@/types";

interface ScoreBreakdownProps {
  breakdown: TrustScoreBreakdown;
}

const categories = [
  {
    key: "payment_score" as const,
    label: "Payment History",
    max: 400,
    icon: CreditCard,
    barColor: "bg-green-500",
    iconColor: "text-green-400",
  },
  {
    key: "completion_score" as const,
    label: "Circle Completion",
    max: 300,
    icon: CheckCircle,
    barColor: "bg-blue-500",
    iconColor: "text-blue-400",
  },
  {
    key: "defi_score" as const,
    label: "DeFi Activity",
    max: 200,
    icon: Activity,
    barColor: "bg-purple-500",
    iconColor: "text-purple-400",
  },
  {
    key: "social_score" as const,
    label: "Social Proof",
    max: 100,
    icon: UsersRound,
    barColor: "bg-yellow-500",
    iconColor: "text-yellow-400",
  },
] as const;

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map((cat) => {
          const value = breakdown[cat.key];
          const percent = cat.max > 0 ? (value / cat.max) * 100 : 0;
          const Icon = cat.icon;

          return (
            <div key={cat.key} className="space-y-2">
              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", cat.iconColor)} />
                  <span className="text-sm text-white/80">{cat.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mono font-medium text-white">
                    {value}
                  </span>
                  <span className="text-xs text-white/30">/ {cat.max}</span>
                </div>
              </div>

              {/* Progress bar */}
              <Progress
                value={percent}
                className="h-2.5"
                indicatorClassName={cn(cat.barColor, "transition-all duration-700")}
              />
            </div>
          );
        })}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-white">
              {breakdown.circles_completed}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Completed
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-white">
              {breakdown.on_time_payments}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              On-Time
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-white">
              {breakdown.total_payments}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Total Pmts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
