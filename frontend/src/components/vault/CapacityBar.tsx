"use client";

import { cn } from "@/lib/utils";

interface CapacityBarProps {
  totalCapacity: number;
  usedCapacity: number;
  commitments: { name: string; amount: number }[];
}

export default function CapacityBar({
  totalCapacity,
  usedCapacity,
  commitments,
}: CapacityBarProps) {
  const percent = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  const available = totalCapacity - usedCapacity;

  // Monochrome opacity thresholds: <60% normal, 60-80% medium, >80% high
  const barOpacity =
    percent > 80 ? "bg-white/60" : percent > 60 ? "bg-white/40" : "bg-white/20";
  const percentTextClass =
    percent > 80
      ? "text-white/90"
      : percent > 60
        ? "text-white/70"
        : "text-white/50";

  return (
    <div className="bg-[#111827] rounded-lg border border-white/10 p-6">
      <h3 className="text-white font-semibold text-base mb-4">
        Staking Capacity
      </h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barOpacity)}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-sm mb-5">
        <div>
          <span className="text-white/40">Used </span>
          <span className={cn("font-medium", percentTextClass)}>
            {usedCapacity.toLocaleString()} USDC
          </span>
        </div>
        <div>
          <span className="text-white/40">Available </span>
          <span className="text-white font-medium">
            {available.toLocaleString()} USDC
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/40 mb-4">
        <span>Total Capacity</span>
        <span className="text-white/60 font-medium">
          {totalCapacity.toLocaleString()} USDC
        </span>
      </div>

      {/* Percentage indicator */}
      <div className="text-xs text-white/40 mb-5">
        <span className={percentTextClass}>{percent.toFixed(1)}%</span> utilized
      </div>

      {/* Active Commitments */}
      {commitments.length > 0 && (
        <div>
          <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">
            Active Commitments
          </h4>
          <div className="space-y-2">
            {commitments.map((commitment) => (
              <div
                key={commitment.name}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-white/5 border border-white/5"
              >
                <span className="text-sm text-white/60">{commitment.name}</span>
                <span className="text-sm text-white font-medium">
                  {commitment.amount.toLocaleString()} USDC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {commitments.length === 0 && (
        <div className="text-center py-4">
          <p className="text-white/30 text-sm">No active commitments</p>
        </div>
      )}
    </div>
  );
}
