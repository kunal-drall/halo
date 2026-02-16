"use client";

import { useState } from "react";
import { Coins, CircleDollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AssetDepositCardProps {
  asset: "SOL" | "USDC";
  balance: string;
  stakedAmount: string;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  loading?: boolean;
}

export default function AssetDepositCard({
  asset,
  balance,
  stakedAmount,
  onDeposit,
  onWithdraw,
  loading = false,
}: AssetDepositCardProps) {
  const [mode, setMode] = useState<"stake" | "withdraw">("stake");
  const [amount, setAmount] = useState("");

  const Icon = asset === "SOL" ? Coins : CircleDollarSign;
  const maxAmount = mode === "stake" ? balance : stakedAmount;

  function handleMax() {
    setAmount(maxAmount);
  }

  function handleSubmit() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    if (mode === "stake") {
      onDeposit(parsed);
    } else {
      onWithdraw(parsed);
    }
    setAmount("");
  }

  return (
    <div className="bg-[#111827] rounded-lg border border-white/10 p-6">
      {/* Asset Icon & Name */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">{asset}</h3>
          <p className="text-white/40 text-xs">
            {asset === "SOL" ? "Solana" : "USD Coin"}
          </p>
        </div>
      </div>

      {/* Balance Info */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Wallet Balance</span>
          <span className="text-white font-medium">
            {balance} {asset}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Staked in Escrow</span>
          <span className="text-white font-medium">
            {stakedAmount} {asset}
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-md overflow-hidden border border-white/10 mb-4">
        <button
          onClick={() => setMode("stake")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            mode === "stake"
              ? "bg-white/10 text-white"
              : "bg-transparent text-white/40 hover:text-white/60"
          )}
        >
          Stake
        </button>
        <button
          onClick={() => setMode("withdraw")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors border-l border-white/10",
            mode === "withdraw"
              ? "bg-white/10 text-white"
              : "bg-transparent text-white/40 hover:text-white/60"
          )}
        >
          Withdraw
        </button>
      </div>

      {/* Amount Input */}
      <div className="relative mb-4">
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="pr-16"
          min="0"
          step="any"
          disabled={loading}
        />
        <button
          onClick={handleMax}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white transition-colors"
          disabled={loading}
        >
          MAX
        </button>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className="w-full"
        variant="outline"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {mode === "stake" ? "Stake" : "Withdraw"} {asset}
      </Button>
    </div>
  );
}
