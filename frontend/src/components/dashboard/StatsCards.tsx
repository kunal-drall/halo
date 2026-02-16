"use client";

import { cn, formatTokenAmount } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import type { UserStats } from "@/types";

interface StatsCardsProps {
  stats: UserStats;
}

const statItems = [
  {
    key: "active_circles" as const,
    label: "Active Circles",
    icon: Users,
    iconColor: "text-white",
    iconBg: "bg-white/10",
    isToken: false,
  },
  {
    key: "total_contributed" as const,
    label: "Total Contributed",
    icon: ArrowUpRight,
    iconColor: "text-white",
    iconBg: "bg-white/10",
    isToken: true,
  },
  {
    key: "total_received" as const,
    label: "Total Received",
    icon: ArrowDownRight,
    iconColor: "text-neutral-300",
    iconBg: "bg-white/10",
    isToken: true,
  },
  {
    key: "total_yield_earned" as const,
    label: "Yield Earned",
    icon: TrendingUp,
    iconColor: "text-neutral-300",
    iconBg: "bg-white/10",
    isToken: true,
  },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];
        const displayValue = item.isToken
          ? formatTokenAmount(value)
          : value.toString();

        return (
          <Card
            key={item.key}
            className={cn(
              "group hover:border-white/20 transition-all duration-300"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg",
                    item.iconBg
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5", item.iconColor)} />
                </div>
              </div>
              <p className="text-xl font-bold text-white mb-0.5">
                {displayValue}
              </p>
              <p className="text-xs text-white/40">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
