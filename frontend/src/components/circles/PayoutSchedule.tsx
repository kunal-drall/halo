"use client";

import { cn, formatTokenAmount, shortenAddress } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CircleDot, ArrowDownRight } from "lucide-react";
import type { CircleMember, Payout } from "@/types";

interface PayoutScheduleProps {
  members: CircleMember[];
  payouts: Payout[];
  currentMonth: number;
  payoutMethod: string;
}

const payoutMethodLabels: Record<string, string> = {
  fixed_rotation: "Fixed Rotation",
  random: "Random",
  auction: "Auction",
};

export default function PayoutSchedule({
  members,
  payouts,
  currentMonth,
  payoutMethod,
}: PayoutScheduleProps) {
  // Build the timeline slots based on member count (one payout per month)
  const totalSlots = members.length;

  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const month = i + 1;
    const payout = payouts.find((p) => p.month === month);
    const isCompleted = payout != null;
    const isCurrent = month === currentMonth;
    const isUpcoming = month > currentMonth;

    // Find recipient info
    let recipientLabel = "TBD";
    if (payout) {
      const recipientMember = members.find(
        (m) => m.user_id === payout.recipient_id
      );
      recipientLabel =
        recipientMember?.user?.display_name ||
        (recipientMember?.user?.wallet_address
          ? shortenAddress(recipientMember.user.wallet_address)
          : `Member ${payout.recipient_id.slice(0, 6)}`);
    } else if (!isUpcoming) {
      // Current month - find scheduled member by payout_position
      const scheduledMember = members.find(
        (m) => m.payout_position === month
      );
      if (scheduledMember) {
        recipientLabel =
          scheduledMember.user?.display_name ||
          (scheduledMember.user?.wallet_address
            ? shortenAddress(scheduledMember.user.wallet_address)
            : "Assigned");
      }
    } else {
      // Upcoming - find member by payout position
      const scheduledMember = members.find(
        (m) => m.payout_position === month
      );
      if (scheduledMember) {
        recipientLabel =
          scheduledMember.user?.display_name ||
          (scheduledMember.user?.wallet_address
            ? shortenAddress(scheduledMember.user.wallet_address)
            : "Assigned");
      }
    }

    return {
      month,
      payout,
      isCompleted,
      isCurrent,
      isUpcoming,
      recipientLabel,
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payout Schedule</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {payoutMethodLabels[payoutMethod] || payoutMethod}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {slots.map((slot, idx) => {
            const isLast = idx === slots.length - 1;

            return (
              <div key={slot.month} className="relative flex gap-4">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10",
                      "transition-all",
                      slot.isCompleted &&
                        "border-green-500 bg-green-500/20",
                      slot.isCurrent &&
                        "border-white bg-white/10 ring-2 ring-white/20",
                      slot.isUpcoming &&
                        "border-white/20 bg-white/5"
                    )}
                  >
                    {slot.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : slot.isCurrent ? (
                      <CircleDot className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[24px]",
                        slot.isCompleted
                          ? "bg-green-500/30"
                          : "bg-white/10"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "flex-1 pb-4 pt-0.5",
                    !isLast && "border-b border-white/5 mb-0"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            slot.isCurrent
                              ? "text-white/70"
                              : slot.isCompleted
                              ? "text-white/80"
                              : "text-white/40"
                          )}
                        >
                          Month {slot.month}
                        </span>
                        {slot.isCurrent && (
                          <Badge variant="default" className="text-[9px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm mt-0.5",
                          slot.isCompleted || slot.isCurrent
                            ? "text-white/60"
                            : "text-white/30"
                        )}
                      >
                        <ArrowDownRight className="w-3 h-3 inline mr-1" />
                        {slot.recipientLabel}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      {slot.payout ? (
                        <span className="text-sm font-mono text-green-400">
                          {formatTokenAmount(slot.payout.net_amount)}
                        </span>
                      ) : slot.isCurrent ? (
                        <span className="text-sm text-white/70/60">
                          Pending
                        </span>
                      ) : (
                        <span className="text-sm text-white/20">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
