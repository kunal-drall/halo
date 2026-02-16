"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import {
  User,
  Wallet,
  Shield,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  Users,
  Calendar,
  ExternalLink,
  Settings,
} from "lucide-react";
import CircleCard from "@/components/circles/CircleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCircleStore } from "@/stores/circleStore";
import { useTrustStore } from "@/stores/trustStore";
import { fetchMyCircles, fetchUserStats } from "@/services/circle-service";
import { fetchTrustScore } from "@/services/trust-service";
import { shortenAddress, formatDate, getTrustTierColor, cn } from "@/lib/utils";
import type { TrustTier } from "@/types";

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
          Connect your Solana wallet to view your profile.
        </p>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const {
    myCircles,
    setMyCircles,
    userStats,
    setUserStats,
    isCacheStale: isCircleCacheStale,
  } = useCircleStore();
  const {
    score,
    tier,
    setBreakdown,
    isCacheStale: isTrustCacheStale,
  } = useTrustStore();

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);

  const walletAddress = publicKey?.toBase58() || "";

  const loadProfile = useCallback(async () => {
    if (!publicKey) return;
    const wallet = publicKey.toBase58();

    setLoading(true);
    try {
      const promises: Promise<void>[] = [];

      if (isCircleCacheStale("myCircles")) {
        promises.push(
          fetchMyCircles(wallet).then((circles) => setMyCircles(circles))
        );
        promises.push(
          fetchUserStats(wallet).then((stats) => setUserStats(stats))
        );
      }

      if (isTrustCacheStale()) {
        promises.push(
          fetchTrustScore(wallet)
            .then((breakdown) => setBreakdown(breakdown))
            .catch(() => {
              // Trust score may not be initialized
            })
        );
      }

      await Promise.allSettled(promises);
    } catch {
      // Errors handled individually
    } finally {
      setLoading(false);
    }
  }, [
    publicKey,
    isCircleCacheStale,
    isTrustCacheStale,
    setMyCircles,
    setUserStats,
    setBreakdown,
  ]);

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile();
    }
  }, [connected, publicKey, loadProfile]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await fetch(`/api/users/${walletAddress}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: tempName }),
      });
      setDisplayName(tempName);
      setEditingName(false);
    } catch {
      // Failed to save
    } finally {
      setSavingName(false);
    }
  };

  const startEditing = () => {
    setTempName(displayName);
    setEditingName(true);
  };

  const cancelEditing = () => {
    setTempName(displayName);
    setEditingName(false);
  };

  if (!connected) {
    return <ConnectWalletPrompt />;
  }

  const tierColor = getTrustTierColor(tier);
  const memberSince = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const activeCircles = myCircles.filter(
    (c) => c.status === "active" || c.status === "forming"
  );
  const completedCircles = myCircles.filter(
    (c) => c.status === "completed"
  );

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Profile
          </h1>
          <p className="text-white/50 text-sm">
            Manage your account and view your activity.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Display Name */}
                    <div className="flex items-center gap-2 mb-2">
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="Enter display name"
                            className="h-8 text-sm max-w-[200px]"
                            maxLength={30}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleSaveName}
                            disabled={savingName}
                          >
                            <Save className="w-4 h-4 text-green-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={cancelEditing}
                          >
                            <X className="w-4 h-4 text-white/40" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-bold text-white">
                            {displayName || "Anonymous User"}
                          </h2>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={startEditing}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-white/40" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Wallet Address */}
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 transition-colors mb-3"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      {shortenAddress(walletAddress, 6)}
                      {copied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={tier as TrustTier}>
                        <Shield className="w-3 h-3 mr-1" />
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} - {score}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Member since {memberSince}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 text-center sm:text-right">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {userStats?.active_circles ?? 0}
                      </p>
                      <p className="text-xs text-white/40">Active Circles</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">
                        ${userStats?.total_yield_earned?.toFixed(2) ?? "0.00"}
                      </p>
                      <p className="text-xs text-white/40">Yield Earned</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        ${userStats?.total_contributed?.toLocaleString() ?? "0"}
                      </p>
                      <p className="text-xs text-white/40">Contributed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        ${userStats?.total_received?.toLocaleString() ?? "0"}
                      </p>
                      <p className="text-xs text-white/40">Received</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Circle History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-white/60" />
                  Circle History
                </CardTitle>
                <Link href="/circles">
                  <Button variant="ghost" size="sm" className="text-white/50">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-white/5 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : myCircles.length > 0 ? (
                  <div className="space-y-4">
                    {activeCircles.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                          Active ({activeCircles.length})
                        </p>
                        <div className="space-y-2">
                          {activeCircles.map((circle) => (
                            <CircleCard key={circle.id} circle={circle} />
                          ))}
                        </div>
                      </div>
                    )}
                    {completedCircles.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                          Completed ({completedCircles.length})
                        </p>
                        <div className="space-y-2">
                          {completedCircles.map((circle) => (
                            <CircleCard key={circle.id} circle={circle} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm mb-4">
                      You have not participated in any circles yet.
                    </p>
                    <Link href="/discover">
                      <Button size="sm">Discover Circles</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-white/40" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display Name Setting */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-sm text-white font-medium">
                      Display Name
                    </p>
                    <p className="text-xs text-white/40">
                      {displayName || "Not set - defaults to shortened address"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditing}
                    className="text-white/60"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Wallet Info */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-sm text-white font-medium">
                      Connected Wallet
                    </p>
                    <p className="text-xs text-white/40 font-mono">
                      {shortenAddress(walletAddress, 8)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="text-white/50"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Explorer Link */}
                <a
                  href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      View on Explorer
                    </p>
                    <p className="text-xs text-white/40">
                      Solana Explorer (Devnet)
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40" />
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </main>
  );
}
