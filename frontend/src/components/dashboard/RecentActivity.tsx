"use client";

import { cn, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserMinus,
  FileText,
  Activity,
} from "lucide-react";
import type { ActivityLog } from "@/types";

interface RecentActivityProps {
  activities: ActivityLog[];
}

const actionConfig: Record<
  string,
  { icon: typeof ArrowUpRight; color: string; bgColor: string; label: string }
> = {
  contribute: {
    icon: ArrowUpRight,
    color: "text-white",
    bgColor: "bg-white/10",
    label: "Contribution",
  },
  payout: {
    icon: ArrowDownRight,
    color: "text-neutral-300",
    bgColor: "bg-white/10",
    label: "Payout Received",
  },
  join: {
    icon: UserPlus,
    color: "text-white",
    bgColor: "bg-white/10",
    label: "Joined Circle",
  },
  leave: {
    icon: UserMinus,
    color: "text-neutral-400",
    bgColor: "bg-white/10",
    label: "Left Circle",
  },
  proposal: {
    icon: FileText,
    color: "text-neutral-300",
    bgColor: "bg-white/10",
    label: "Proposal",
  },
};

const defaultAction = {
  icon: Activity,
  color: "text-white/60",
  bgColor: "bg-white/10",
  label: "Activity",
};

function getDescription(activity: ActivityLog): string {
  const details = activity.details as Record<string, string> | null;

  switch (activity.action) {
    case "contribute":
      return details?.circle_name
        ? `Contributed to ${details.circle_name}`
        : "Made a contribution";
    case "payout":
      return details?.circle_name
        ? `Received payout from ${details.circle_name}`
        : "Received a payout";
    case "join":
      return details?.circle_name
        ? `Joined ${details.circle_name}`
        : "Joined a circle";
    case "leave":
      return details?.circle_name
        ? `Left ${details.circle_name}`
        : "Left a circle";
    case "proposal":
      return details?.title
        ? `Created proposal: ${details.title}`
        : "Created a proposal";
    default:
      return details?.description || activity.action;
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const displayActivities = activities.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {displayActivities.map((activity) => {
              const config = actionConfig[activity.action] || defaultAction;
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    "hover:bg-white/5 transition-colors"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">
                      {getDescription(activity)}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {timeAgo(new Date(activity.created_at))}
                    </p>
                  </div>

                  {/* Tx link indicator */}
                  {activity.tx_signature && (
                    <a
                      href={`https://explorer.solana.com/tx/${activity.tx_signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/40 hover:text-white transition-colors flex-shrink-0"
                    >
                      TX
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
