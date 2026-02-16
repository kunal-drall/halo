"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Loader2,
  Users,
  Shield,
  Copy,
  Check,
  Wallet,
  AlertCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransactionBuilder } from "@/hooks/useTransactionBuilder";
import { shortenAddress } from "@/lib/utils";
import type { Circle, TrustTier } from "@/types";

interface CirclePreview {
  id: string;
  name: string | null;
  description: string | null;
  contribution_amount: number;
  duration_months: number;
  max_members: number;
  current_members: number;
  min_trust_tier: TrustTier;
  status: string;
  creator?: { wallet_address: string; display_name: string | null };
  invite_code: string | null;
}

const TIER_LABELS: Record<TrustTier, string> = {
  newcomer: "Newcomer (0-249)",
  silver: "Silver (250-499)",
  gold: "Gold (500-749)",
  platinum: "Platinum (750-1000)",
};

export default function JoinByInvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { publicKey, connected } = useWallet();
  const {
    buildAndSend,
    loading: txLoading,
    error: txError,
    setError: setTxError,
  } = useTransactionBuilder();

  const [circle, setCircle] = useState<CirclePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCircle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/circles?invite_code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        throw new Error("Circle not found");
      }
      const data = await res.json();
      // The API may return an array or a single object
      const circleData = Array.isArray(data) ? data[0] : data;
      if (!circleData) {
        throw new Error("No circle found for this invite code");
      }
      setCircle(circleData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load circle";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  const handleJoin = async () => {
    if (!publicKey || !circle) return;
    setJoining(true);
    setTxError(null);
    try {
      await buildAndSend(`/api/circles/${circle.id}/join`, {
        invite_code: code,
      });
      router.push(`/circles/${circle.id}`);
    } catch {
      // Error handled by useTransactionBuilder
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-2/3 mx-auto" />
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
          <div className="bg-[#111827] rounded-lg border border-white/10 p-6 space-y-4">
            <div className="h-6 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="h-10 bg-white/10 rounded w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !circle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">
            Circle Not Found
          </h1>
          <p className="text-white/50 mb-6">
            {error ||
              "This invite link is invalid or the circle no longer exists."}
          </p>
          <Button variant="outline" onClick={() => router.push("/circles")}>
            Browse Circles
          </Button>
        </div>
      </div>
    );
  }

  const isFull = circle.current_members >= circle.max_members;
  const isForming = circle.status === "forming";
  const canJoin = connected && isForming && !isFull;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            You&apos;re Invited
          </h1>
          <p className="text-white/40 text-sm">
            Join a savings circle on Halo Protocol
          </p>
        </div>

        {/* Circle Preview Card */}
        <div className="bg-[#111827] rounded-lg border border-white/10 p-6 mb-4">
          {/* Circle Name & Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {circle.name || "Untitled Circle"}
              </h2>
              {circle.description && (
                <p className="text-white/40 text-sm mt-1 line-clamp-2">
                  {circle.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0 ml-3">
              {circle.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/40">
                <DollarSign className="w-3.5 h-3.5" />
                Contribution
              </span>
              <span className="text-white font-medium">
                ${circle.contribution_amount.toLocaleString()} / month
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/40">
                <Users className="w-3.5 h-3.5" />
                Members
              </span>
              <span className="text-white font-medium">
                {circle.current_members}/{circle.max_members}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/40">
                <Calendar className="w-3.5 h-3.5" />
                Duration
              </span>
              <span className="text-white font-medium">
                {circle.duration_months} months
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/40">
                <Shield className="w-3.5 h-3.5" />
                Trust Requirement
              </span>
              <span className="text-white font-medium capitalize">
                {TIER_LABELS[circle.min_trust_tier] || circle.min_trust_tier}
              </span>
            </div>
          </div>

          {/* Creator */}
          {circle.creator && (
            <div className="pt-3 border-t border-white/5 text-xs text-white/30">
              Created by{" "}
              {circle.creator.display_name ||
                shortenAddress(circle.creator.wallet_address)}
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="space-y-3">
          {!connected ? (
            <div className="bg-[#111827] rounded-lg border border-white/10 p-5 text-center">
              <Wallet className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-3">
                Connect your wallet to join this circle
              </p>
              <p className="text-white/30 text-xs">
                You need a Solana wallet to participate
              </p>
            </div>
          ) : !isForming ? (
            <div className="bg-[#111827] rounded-lg border border-white/10 p-5 text-center">
              <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                This circle is no longer accepting new members
              </p>
            </div>
          ) : isFull ? (
            <div className="bg-[#111827] rounded-lg border border-white/10 p-5 text-center">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">This circle is full</p>
            </div>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={joining || txLoading || !canJoin}
              className="w-full"
            >
              {joining || txLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Join Circle
            </Button>
          )}

          {txError && (
            <p className="text-red-400 text-sm text-center">{txError}</p>
          )}

          {/* Copy Invite Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Link Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Invite Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
