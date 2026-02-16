"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TrustTier } from "@/types";

interface TrustScoreWidgetProps {
  score: number;
  tier: TrustTier;
}

const tierStyles: Record<
  TrustTier,
  { color: string; glow: string; stroke: string; badge: "newcomer" | "silver" | "gold" | "platinum"; label: string }
> = {
  newcomer: {
    color: "text-red-400",
    glow: "drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]",
    stroke: "stroke-red-400",
    badge: "newcomer",
    label: "Newcomer",
  },
  silver: {
    color: "text-amber-400",
    glow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    stroke: "stroke-amber-400",
    badge: "silver",
    label: "Silver",
  },
  gold: {
    color: "text-green-400",
    glow: "drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]",
    stroke: "stroke-green-400",
    badge: "gold",
    label: "Gold",
  },
  platinum: {
    color: "text-emerald-400",
    glow: "drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    stroke: "stroke-emerald-400",
    badge: "platinum",
    label: "Platinum",
  },
};

export default function TrustScoreWidget({ score, tier }: TrustScoreWidgetProps) {
  const style = tierStyles[tier] || tierStyles.newcomer;

  // SVG circle calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 1000, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring visualization */}
      <div className={cn("relative", style.glow)}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          {/* Progress ring */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(style.stroke, "transition-all duration-1000 ease-out")}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", style.color)}>
            {score}
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">
            Score
          </span>
        </div>
      </div>

      {/* Tier badge */}
      <Badge variant={style.badge} className="text-xs px-3">
        {style.label}
      </Badge>
    </div>
  );
}
