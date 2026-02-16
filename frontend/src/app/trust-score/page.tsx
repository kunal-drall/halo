"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import {
  Shield,
  Wallet,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Star,
  Award,
  BarChart3,
  Info,
} from "lucide-react";
import TrustScoreWidget from "@/components/trust/TrustScoreWidget";
import ScoreBreakdown from "@/components/trust/ScoreBreakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTrustStore } from "@/stores/trustStore";
import { useTransactionBuilder } from "@/hooks/useTransactionBuilder";
import { fetchTrustScore, initializeTrustScoreTx } from "@/services/trust-service";
import { TRUST_TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TrustTier } from "@/types";

const TIER_INFO: Record<
  string,
  {
    label: string;
    range: string;
    stake: string;
    color: string;
    benefits: string[];
    badgeVariant: TrustTier;
  }
> = {
  newcomer: {
    label: "Newcomer",
    range: "0 - 249",
    stake: "2x contribution",
    color: "text-red-400",
    benefits: [
      "Access to public circles",
      "Basic trust features",
      "Build reputation through participation",
    ],
    badgeVariant: "newcomer",
  },
  silver: {
    label: "Silver",
    range: "250 - 499",
    stake: "1.5x contribution",
    color: "text-amber-400",
    benefits: [
      "Lower stake requirements",
      "Access to Silver-tier circles",
      "Priority in random payout selection",
    ],
    badgeVariant: "silver",
  },
  gold: {
    label: "Gold",
    range: "500 - 749",
    stake: "1x contribution",
    color: "text-green-400",
    benefits: [
      "Equal stake to contribution",
      "Access to Gold-tier circles",
      "Governance voting rights",
      "Reduced penalty rates",
    ],
    badgeVariant: "gold",
  },
  platinum: {
    label: "Platinum",
    range: "750 - 1000",
    stake: "0.75x contribution",
    color: "text-emerald-400",
    benefits: [
      "Lowest stake requirements",
      "Access to all circles",
      "Circle creation privileges",
      "Enhanced governance weight",
      "Yield bonus multiplier",
    ],
    badgeVariant: "platinum",
  },
};

function ConnectWalletPrompt() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6">
          <Wallet className="w-10 h-10 text-white/70" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Connect Your Wallet
        </h2>
        <p className="text-white/50 mb-6">
          Connect your Solana wallet to view and manage your trust score.
        </p>
      </motion.div>
    </div>
  );
}

export default function TrustScorePage() {
  const { publicKey, connected } = useWallet();
  const {
    score,
    tier,
    breakdown,
    setBreakdown,
    setLoading: setStoreLoading,
    setError: setStoreError,
    isCacheStale,
    loading: storeLoading,
  } = useTrustStore();
  const {
    buildAndSend,
    loading: txLoading,
    error: txError,
  } = useTransactionBuilder();

  const [initializing, setInitializing] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);
  const [hasScore, setHasScore] = useState<boolean | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadTrustScore = useCallback(async () => {
    if (!publicKey) return;
    const wallet = publicKey.toBase58();

    try {
      setStoreLoading(true);
      const data = await fetchTrustScore(wallet);
      setBreakdown(data);
      setHasScore(true);
    } catch {
      setHasScore(false);
    } finally {
      setStoreLoading(false);
      setPageLoading(false);
    }
  }, [publicKey, setBreakdown, setStoreLoading]);

  useEffect(() => {
    if (connected && publicKey) {
      if (isCacheStale() || hasScore === null) {
        loadTrustScore();
      } else {
        setPageLoading(false);
        setHasScore(score > 0 || breakdown !== null);
      }
    }
  }, [connected, publicKey, isCacheStale, loadTrustScore, score, breakdown, hasScore]);

  const handleInitialize = async () => {
    if (!publicKey) return;
    setInitializing(true);
    try {
      await buildAndSend("/api/trust-score/initialize", {});
      setInitSuccess(true);
      setTimeout(() => {
        loadTrustScore();
        setInitSuccess(false);
      }, 2000);
    } catch {
      // Error handled by useTransactionBuilder
    } finally {
      setInitializing(false);
    }
  };

  if (!connected) {
    return <ConnectWalletPrompt />;
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Trust Score
          </h1>
          <p className="text-white/50 text-sm">
            Your on-chain reputation that determines circle access and stake
            requirements.
          </p>
        </motion.div>

        {pageLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-white/5 rounded-lg border border-white/10" />
            <div className="h-64 bg-white/5 rounded-lg border border-white/10" />
          </div>
        ) : hasScore && breakdown ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Score Widget */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-8 flex flex-col items-center">
                <TrustScoreWidget score={score} tier={tier} />
                <div className="mt-4 text-center">
                  <Badge
                    variant={tier as TrustTier}
                    className="text-sm px-4 py-1"
                  >
                    {TIER_INFO[tier]?.label || "Newcomer"} Tier
                  </Badge>
                  <p className="text-white/40 text-sm mt-2">
                    Score range: {TIER_INFO[tier]?.range || "0 - 249"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-white/60" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown breakdown={breakdown} />
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardContent className="p-5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {breakdown.circles_completed}
                  </p>
                  <p className="text-white/40 text-xs">Circles Completed</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/[0.02]">
                <CardContent className="p-5 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {breakdown.on_time_payments}/{breakdown.total_payments}
                  </p>
                  <p className="text-white/40 text-xs">On-Time Payments</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/[0.02]">
                <CardContent className="p-5 text-center">
                  <TrendingUp className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {breakdown.total_payments > 0
                      ? Math.round(
                          (breakdown.on_time_payments /
                            breakdown.total_payments) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-white/40 text-xs">Payment Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Explanation */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-white/60" />
                  Trust Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(TIER_INFO).map(([key, info]) => {
                    const isCurrent = key === tier;
                    return (
                      <div
                        key={key}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          isCurrent
                            ? "border-white/20 bg-white/[0.03]"
                            : "border-white/5 bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={info.badgeVariant}>
                              {info.label}
                            </Badge>
                            {isCurrent && (
                              <span className="text-xs text-white/70 font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40">
                              Score: {info.range}
                            </p>
                            <p className="text-xs text-white/40">
                              Stake: {info.stake}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {info.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="text-xs text-white/50 flex items-start gap-1.5"
                            >
                              <CheckCircle2 className="w-3 h-3 mt-0.5 text-white/30 shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* History Placeholder */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Score History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      Score history chart coming soon.
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      Track how your trust score evolves over time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-16"
          >
            <Card className="border-white/5 bg-white/[0.02] max-w-md w-full">
              <CardContent className="p-8 text-center">
                {initSuccess ? (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      Trust Score Initialized!
                    </h2>
                    <p className="text-white/50 text-sm">
                      Loading your score...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6">
                      <Shield className="w-10 h-10 text-white/70" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      Initialize Your Trust Score
                    </h2>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      Create your on-chain trust score account to start building
                      reputation. Your score starts at 0 (Newcomer tier) and
                      grows as you participate in circles.
                    </p>

                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-6 text-left">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
                        <div className="text-xs text-white/50">
                          <p className="font-medium text-white/70 mb-1">
                            What happens next:
                          </p>
                          <ul className="space-y-0.5">
                            <li>A trust score PDA is created on-chain</li>
                            <li>You start at Newcomer tier (score: 0)</li>
                            <li>
                              Earn points by completing circles and paying on time
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {txError && (
                      <p className="text-red-400 text-sm mb-4">{txError}</p>
                    )}

                    <Button
                      onClick={handleInitialize}
                      disabled={initializing || txLoading}
                      className="gap-2"
                      size="lg"
                    >
                      {initializing || txLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Initialize Trust Score
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
    </main>
  );
}
