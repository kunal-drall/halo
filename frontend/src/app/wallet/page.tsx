"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import {
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  Coins,
  CircleDollarSign,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCircleStore } from "@/stores/circleStore";
import { shortenAddress, formatDate, timeAgo, cn } from "@/lib/utils";
import type { ActivityLog } from "@/types";

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  uiAmount: string;
}

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
          Connect your Solana wallet to view your balances and transaction
          history.
        </p>
      </motion.div>
    </div>
  );
}

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { userStats } = useCircleStore();

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<
    {
      signature: string;
      timestamp: number;
      type: string;
      status: "success" | "failed";
    }[]
  >([]);

  const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT ||
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const loadBalances = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      // SOL balance
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      // USDC balance (SPL Token)
      try {
        const usdcMint = new PublicKey(USDC_MINT);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: usdcMint }
        );
        if (tokenAccounts.value.length > 0) {
          const parsed =
            tokenAccounts.value[0].account.data.parsed.info.tokenAmount;
          setUsdcBalance(parsed.uiAmountString || "0.00");
        } else {
          setUsdcBalance("0.00");
        }
      } catch {
        setUsdcBalance("0.00");
      }

      // Recent transactions
      try {
        const signatures = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 10 }
        );
        const txs = signatures.map((sig) => ({
          signature: sig.signature,
          timestamp: sig.blockTime || 0,
          type: "Transaction",
          status: (sig.err ? "failed" : "success") as "success" | "failed",
        }));
        setRecentTransactions(txs);
      } catch {
        setRecentTransactions([]);
      }
    } catch {
      // Balance fetch failed
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, USDC_MINT]);

  useEffect(() => {
    if (connected && publicKey) {
      loadBalances();
    }
  }, [connected, publicKey, loadBalances]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBalances();
    setRefreshing(false);
  };

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected) {
    return <ConnectWalletPrompt />;
  }

  const walletAddress = publicKey?.toBase58() || "";
  const totalValue =
    (solBalance || 0) * 0 + parseFloat(usdcBalance); // SOL price approximation excluded for devnet

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Wallet
            </h1>
            <p className="text-white/50 text-sm">
              Your balances and transaction history.
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

        <div className="space-y-6">
          {/* Wallet Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Connected Wallet</p>
                      <p className="text-sm text-white font-mono">
                        {shortenAddress(walletAddress, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyAddress}
                      className="h-8 w-8"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </Button>
                    <a
                      href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Balance Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* SOL Balance */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white/60">SOL</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Native
                  </Badge>
                </div>
                {loading ? (
                  <div className="h-8 bg-white/10 rounded w-32 animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {solBalance !== null ? solBalance.toFixed(4) : "0.0000"}
                    <span className="text-lg text-white/40 font-normal ml-1">
                      SOL
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* USDC Balance */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <CircleDollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-white/60">USDC</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    SPL Token
                  </Badge>
                </div>
                {loading ? (
                  <div className="h-8 bg-white/10 rounded w-32 animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {parseFloat(usdcBalance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-lg text-white/40 font-normal ml-1">
                      USDC
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Circle Activity Summary */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Circle Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xs text-white/40 mb-1">Contributed</p>
                      <p className="text-lg font-bold text-white">
                        ${userStats.total_contributed.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xs text-white/40 mb-1">Received</p>
                      <p className="text-lg font-bold text-white">
                        ${userStats.total_received.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xs text-white/40 mb-1">Yield Earned</p>
                      <p className="text-lg font-bold text-green-400">
                        ${userStats.total_yield_earned.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                      <p className="text-xs text-white/40 mb-1">
                        Net Position
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          userStats.total_received -
                            userStats.total_contributed >=
                            0
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        $
                        {Math.abs(
                          userStats.total_received - userStats.total_contributed
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/40" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 bg-white/5 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((tx) => (
                      <a
                        key={tx.signature}
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              tx.status === "success"
                                ? "bg-green-500/10"
                                : "bg-red-500/10"
                            )}
                          >
                            {tx.status === "success" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {tx.type}
                            </p>
                            <p className="text-xs text-white/40 font-mono">
                              {shortenAddress(tx.signature, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge
                              variant={
                                tx.status === "success"
                                  ? "success"
                                  : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {tx.status}
                            </Badge>
                            {tx.timestamp > 0 && (
                              <p className="text-xs text-white/30 mt-0.5">
                                {timeAgo(tx.timestamp)}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      No recent transactions found.
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      Transactions will appear here once you start using Halo
                      Protocol.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </main>
  );
}
