"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CircleCard from "@/components/circles/CircleCard";
import TrustScoreWidget from "@/components/trust/TrustScoreWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/WalletContext";
import { useCircleStore } from "@/stores/circleStore";
import { useTrustStore } from "@/stores/trustStore";
import { fetchMyCircles, fetchUserStats } from "@/services/circle-service";
import { fetchTrustScore } from "@/services/trust-service";
import type { ActivityLog } from "@/types";

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-3 bg-white/10 rounded w-2/3" />
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse"
        >
          <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
          <div className="h-6 bg-white/10 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function ConnectWalletPrompt() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6">
          <Wallet className="w-10 h-10 text-white/70" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Connect Your Wallet
        </h2>
        <p className="text-white/50 mb-6 leading-relaxed">
          Connect your Solana wallet to view your dashboard, manage circles, and
          track your trust score.
        </p>
        <p className="text-white/30 text-sm">
          Use the wallet button in the top navigation bar to connect.
        </p>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { isAuthenticated } = useAuth();
  const {
    myCircles,
    userStats,
    setMyCircles,
    setUserStats,
    setLoading: setCircleLoading,
    setError: setCircleError,
    isCacheStale: isCircleCacheStale,
    loading: circleLoading,
  } = useCircleStore();
  const {
    score,
    tier,
    setBreakdown,
    setLoading: setTrustLoading,
    setError: setTrustError,
    isCacheStale: isTrustCacheStale,
    loading: trustLoading,
  } = useTrustStore();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (!publicKey) return;
      const wallet = publicKey.toBase58();

      const shouldFetchCircles = forceRefresh || isCircleCacheStale("myCircles");
      const shouldFetchTrust = forceRefresh || isTrustCacheStale();

      try {
        setCircleLoading(true);
        setTrustLoading(true);

        const promises: Promise<void>[] = [];

        if (shouldFetchCircles) {
          promises.push(
            fetchMyCircles(wallet).then((circles) => {
              setMyCircles(circles);
            })
          );
          promises.push(
            fetchUserStats(wallet).then((stats) => {
              setUserStats(stats);
            })
          );
        }

        if (shouldFetchTrust) {
          promises.push(
            fetchTrustScore(wallet)
              .then((breakdown) => {
                setBreakdown(breakdown);
              })
              .catch(() => {
                // Trust score might not be initialized yet
              })
          );
        }

        await Promise.allSettled(promises);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setCircleError(message);
      } finally {
        setCircleLoading(false);
        setTrustLoading(false);
        setInitialLoad(false);
      }
    },
    [
      publicKey,
      isCircleCacheStale,
      isTrustCacheStale,
      setMyCircles,
      setUserStats,
      setBreakdown,
      setCircleLoading,
      setTrustLoading,
      setCircleError,
    ]
  );

  useEffect(() => {
    if (isAuthenticated && publicKey) {
      loadDashboardData();
    }
  }, [isAuthenticated, publicKey, loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  };

  const isLoading = (circleLoading || trustLoading) && initialLoad;

  return (
    <>
      {!isAuthenticated ? (
        <ConnectWalletPrompt />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Welcome back. Here is your overview.
              </p>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 text-white/60 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <SkeletonStats />
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  <SkeletonCard />
                </div>
                <SkeletonCard />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                {userStats && <StatsCards stats={userStats} />}

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* My Circles */}
                  <div className="lg:col-span-2">
                    <Card className="border-white/5 bg-white/[0.02]">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">My Circles</CardTitle>
                        <Link href="/circles/create">
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <PlusCircle className="w-4 h-4" />
                            Create
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {myCircles.length > 0 ? (
                          <div className="space-y-3">
                            {myCircles.slice(0, 5).map((circle) => (
                              <CircleCard key={circle.id} circle={circle} />
                            ))}
                            {myCircles.length > 5 && (
                              <Link href="/circles">
                                <Button
                                  variant="ghost"
                                  className="w-full gap-2 text-white/50"
                                >
                                  View all {myCircles.length} circles
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 mb-4">
                              You have not joined any circles yet.
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Link href="/discover">
                                <Button variant="outline" size="sm">
                                  Discover Circles
                                </Button>
                              </Link>
                              <Link href="/circles/create">
                                <Button size="sm">Create Circle</Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trust Score Widget */}
                  <div>
                    <Card className="border-white/5 bg-white/[0.02]">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="w-5 h-5 text-white/70" />
                          Trust Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {score > 0 ? (
                          <div className="space-y-4">
                            <TrustScoreWidget score={score} tier={tier} />
                            <Link href="/trust-score">
                              <Button
                                variant="ghost"
                                className="w-full gap-2 text-white/50 mt-2"
                                size="sm"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Shield className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 text-sm mb-4">
                              Initialize your trust score to get started.
                            </p>
                            <Link href="/trust-score">
                              <Button size="sm">Initialize Score</Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-white/5 bg-white/[0.02] mt-4">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/50 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Yield Earned
                            </span>
                            <span className="text-green-400 font-medium">
                              {userStats
                                ? `$${userStats.total_yield_earned.toFixed(2)}`
                                : "$0.00"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/50 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Active Circles
                            </span>
                            <span className="text-white font-medium">
                              {userStats?.active_circles ?? 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Recent Activity */}
                <Card className="border-white/5 bg-white/[0.02]">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentActivity activities={activities} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}

    </>
  );
}
