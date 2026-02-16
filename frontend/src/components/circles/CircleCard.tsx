"use client";

import Link from "next/link";
import { Users, Clock, ArrowRight } from "lucide-react";
import { cn, formatTokenAmount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Circle, CircleStatus, TrustTier } from "@/types";

interface CircleCardProps {
  circle: Circle;
}

const statusConfig: Record<CircleStatus, { label: string; variant: "success" | "default" | "secondary" | "outline" | "destructive" }> = {
  forming: { label: "Forming", variant: "secondary" },
  active: { label: "Active", variant: "success" },
  distributing: { label: "Distributing", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
  dissolved: { label: "Dissolved", variant: "destructive" },
};

const tierConfig: Record<TrustTier, { label: string; variant: "newcomer" | "silver" | "gold" | "platinum" }> = {
  newcomer: { label: "Newcomer+", variant: "newcomer" },
  silver: { label: "Silver+", variant: "silver" },
  gold: { label: "Gold+", variant: "gold" },
  platinum: { label: "Platinum", variant: "platinum" },
};

const payoutLabels: Record<string, string> = {
  fixed_rotation: "Fixed Rotation",
  random: "Random",
  auction: "Auction",
};

export default function CircleCard({ circle }: CircleCardProps) {
  const status = statusConfig[circle.status] || statusConfig.forming;
  const tier = tierConfig[circle.min_trust_tier] || tierConfig.newcomer;

  return (
    <Link href={`/circles/${circle.id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden cursor-pointer",
          "hover:border-white/20 hover:bg-white/[0.08]",
          "transition-all duration-300"
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/[0.03] group-hover:to-white/[0.01] transition-all duration-300" />

        <CardContent className="relative p-5">
          {/* Header row: Name + Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-sans font-semibold text-white truncate text-lg">
                {circle.name || "Unnamed Circle"}
              </h3>
              {circle.description && (
                <p className="text-sm text-white/50 line-clamp-2 mt-1">
                  {circle.description}
                </p>
              )}
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Contribution amount */}
          <div className="mb-4">
            <span className="text-2xl font-sans font-bold text-white">
              {formatTokenAmount(circle.contribution_amount)}
            </span>
            <span className="text-sm text-white/40 ml-1.5">/ month</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col">
              <span className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">
                Members
              </span>
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Users className="w-3.5 h-3.5 text-white/50" />
                {circle.current_members}/{circle.max_members}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">
                Duration
              </span>
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                {circle.duration_months}mo
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">
                Payout
              </span>
              <span className="text-sm text-white/80">
                {payoutLabels[circle.payout_method] || circle.payout_method}
              </span>
            </div>
          </div>

          {/* Footer: Trust tier + yield + arrow */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Badge variant={tier.variant} className="text-[10px]">
                {tier.label}
              </Badge>
              {circle.total_yield_earned > 0 && (
                <span className="text-xs text-green-400">
                  +{formatTokenAmount(circle.total_yield_earned)} yield
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
