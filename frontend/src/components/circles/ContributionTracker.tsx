"use client";

import { cn, formatTokenAmount } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Clock } from "lucide-react";
import type { Contribution } from "@/types";

interface ContributionTrackerProps {
  contributions: Contribution[];
  currentMonth: number;
  totalMonths: number;
  memberCount: number;
}

export default function ContributionTracker({
  contributions,
  currentMonth,
  totalMonths,
  memberCount,
}: ContributionTrackerProps) {
  const progressPercent = totalMonths > 0 ? (currentMonth / totalMonths) * 100 : 0;

  const totalContributed = contributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  const onTimeCount = contributions.filter((c) => c.on_time).length;
  const onTimeRate =
    contributions.length > 0
      ? Math.round((onTimeCount / contributions.length) * 100)
      : 100;

  // Build month cells
  const months = Array.from({ length: totalMonths }, (_, i) => {
    const month = i + 1;
    const monthContributions = contributions.filter((c) => c.month === month);
    const isCurrent = month === currentMonth;
    const isCompleted = month < currentMonth && monthContributions.length > 0;
    const isFuture = month > currentMonth;

    return { month, isCurrent, isCompleted, isFuture, contributions: monthContributions };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contribution Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              Month {currentMonth} of {totalMonths}
            </span>
            <span className="text-white font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress
            value={progressPercent}
            indicatorClassName="bg-white"
          />
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-6 gap-2">
          {months.map(({ month, isCurrent, isCompleted, isFuture }) => (
            <div
              key={month}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg text-xs",
                "border transition-all",
                isCurrent &&
                  "border-white bg-white/10 text-white ring-1 ring-white/20",
                isCompleted &&
                  "border-green-500/30 bg-green-500/10 text-green-400",
                isFuture &&
                  "border-white/5 bg-white/[0.02] text-white/30",
                !isCurrent &&
                  !isCompleted &&
                  !isFuture &&
                  "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 mb-0.5" />
              ) : isCurrent ? (
                <Clock className="w-4 h-4 mb-0.5" />
              ) : (
                <Circle className="w-4 h-4 mb-0.5" />
              )}
              <span className="font-medium">{month}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[11px] text-white/40 uppercase tracking-wider mb-1">
              Total Contributed
            </span>
            <span className="text-lg font-sans font-semibold text-white">
              {formatTokenAmount(totalContributed)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-white/40 uppercase tracking-wider mb-1">
              On-Time Rate
            </span>
            <span
              className={cn(
                "text-lg font-sans font-semibold",
                onTimeRate >= 90
                  ? "text-green-400"
                  : onTimeRate >= 70
                  ? "text-yellow-400"
                  : "text-red-400"
              )}
            >
              {onTimeRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
