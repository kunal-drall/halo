"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Wallet,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import ContributionTracker from "@/components/circles/ContributionTracker";
import PayoutSchedule from "@/components/circles/PayoutSchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTransactionBuilder } from "@/hooks/useTransactionBuilder";
import { useCircleStore } from "@/stores/circleStore";
import {
  fetchCircleDetail,
  joinCircleTx,
  contributeTx,
  claimPayoutTx,
} from "@/services/circle-service";
import {
  cn,
  shortenAddress,
  formatDate,
  getTrustTierColor,
} from "@/lib/utils";
import { TRUST_TIERS, getTrustTier } from "@/lib/constants";
import type { CircleWithMembers, CircleMember, Contribution, Payout } from "@/types";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "success" | "secondary" | "destructive" | "outline" }
> = {
  forming: { label: "Forming", variant: "secondary" },
  active: { label: "Active", variant: "success" },
  distributing: { label: "Distributing", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
  dissolved: { label: "Dissolved", variant: "destructive" },
};

const PAYOUT_LABELS: Record<string, string> = {
  fixed_rotation: "Fixed Rotation",
  random: "Random",
  auction: "Auction",
};

function SkeletonDetail() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-1/2" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-lg border border-white/10" />
        ))}
      </div>
      <div className="h-64 bg-white/5 rounded-lg border border-white/10" />
    </div>
  );
}

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  const { publicKey, connected } = useWallet();
  const { buildAndSend, loading: txLoading, error: txError, setError: setTxError } = useTransactionBuilder();
  const { currentCircle, setCurrentCircle } = useCircleStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [circle, setCircle] = useState<CircleWithMembers | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const loadCircle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCircleDetail(circleId);
      setCircle(data);
      setCurrentCircle(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load circle";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [circleId, setCurrentCircle]);

  useEffect(() => {
    loadCircle();
  }, [loadCircle]);

  const walletAddress = publicKey?.toBase58();
  const isMember = circle?.members?.some(
    (m) => m.user?.wallet_address === walletAddress && m.status === "active"
  );
  const isCreator = circle?.creator?.wallet_address === walletAddress;
  const canJoin =
    circle?.status === "forming" && !isMember && connected;
  const canContribute =
    circle?.status === "active" && isMember;
  const canClaim =
    circle?.status === "distributing" && isMember;

  const handleJoin = async () => {
    if (!publicKey || !circle) return;
    setActionLoading(true);
    try {
      const tier = getTrustTier(0);
      const requiredStake = circle.contribution_amount * tier.stakeMultiplier;
      await buildAndSend(`/api/circles/${circleId}/join`, {
        stake_amount: parseFloat(stakeAmount) || requiredStake,
      });
      setShowJoinDialog(false);
      await loadCircle();
    } catch {
      // Error handled by useTransactionBuilder
    } finally {
      setActionLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!publicKey || !circle) return;
    setActionLoading(true);
    try {
      await buildAndSend(`/api/circles/${circleId}/contribute`, {
        amount: circle.contribution_amount,
      });
      setShowContributeDialog(false);
      await loadCircle();
    } catch {
      // Error handled by useTransactionBuilder
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimPayout = async () => {
    if (!publicKey || !circle) return;
    setActionLoading(true);
    try {
      await buildAndSend(`/api/circles/${circleId}/claim-payout`, {});
      await loadCircle();
    } catch {
      // Error handled by useTransactionBuilder
    } finally {
      setActionLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteLink = () => {
    if (!circle?.invite_code) return;
    const url = `${window.location.origin}/join/${circle.invite_code}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        <SkeletonDetail />
      </main>
    );
  }

  if (error || !circle) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Circle Not Found
          </h2>
          <p className="text-white/50 mb-6">
            {error || "This circle does not exist or has been removed."}
          </p>
          <Button variant="outline" onClick={() => router.push("/circles")}>
            Back to Circles
          </Button>
        </div>
      </main>
    );
  }

  const statusConfig = STATUS_CONFIG[circle.status] || STATUS_CONFIG.forming;
  const progressPercent =
    circle.duration_months > 0
      ? (circle.current_month / circle.duration_months) * 100
      : 0;

  return (
    <>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 mb-4 text-white/50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {circle.name || "Untitled Circle"}
                </h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-white/50 text-sm flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {circle.current_members}/{circle.max_members} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Month {circle.current_month}/{circle.duration_months}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              {canJoin && (
                <Button onClick={() => setShowJoinDialog(true)}>
                  Join Circle
                </Button>
              )}
              {canContribute && (
                <Button onClick={() => setShowContributeDialog(true)}>
                  Contribute
                </Button>
              )}
              {canClaim && (
                <Button
                  variant="default"
                  onClick={handleClaimPayout}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Claim Payout
                </Button>
              )}
            </div>
          </div>

          {circle.description && (
            <p className="text-white/40 text-sm mt-2 max-w-2xl">
              {circle.description}
            </p>
          )}

          {circle.invite_code && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-white/30 text-xs">Invite link:</span>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors bg-white/5 border border-white/10 rounded px-2 py-1"
              >
                {inviteCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={DollarSign}
            label="Contribution"
            value={`$${circle.contribution_amount.toLocaleString()}`}
            sub="USDC / month"
          />
          <StatCard
            icon={Wallet}
            label="Escrow Balance"
            value={`$${circle.total_pot.toLocaleString()}`}
            sub="USDC"
          />
          <StatCard
            icon={TrendingUp}
            label="Yield Earned"
            value={`$${circle.total_yield_earned.toFixed(2)}`}
            sub="USDC"
            highlight
          />
          <StatCard
            icon={Shield}
            label="Min Trust"
            value={circle.min_trust_tier.charAt(0).toUpperCase() + circle.min_trust_tier.slice(1)}
            sub={`Penalty: ${circle.penalty_rate}%`}
          />
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Circle Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto mb-4">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1 sm:flex-initial">
              Members
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex-1 sm:flex-initial">
              Contributions
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex-1 sm:flex-initial">
              Payouts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base">Circle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Payout Method" value={PAYOUT_LABELS[circle.payout_method] || circle.payout_method} />
                  <DetailRow label="Duration" value={`${circle.duration_months} months`} />
                  <DetailRow label="Max Members" value={circle.max_members.toString()} />
                  <DetailRow label="Penalty Rate" value={`${circle.penalty_rate}%`} />
                  <DetailRow label="Visibility" value={circle.is_public ? "Public" : "Private"} />
                  <DetailRow label="Created" value={formatDate(circle.created_at)} />
                  {circle.on_chain_pubkey && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                      <span className="text-white/40">On-chain</span>
                      <button
                        onClick={() => copyAddress(circle.on_chain_pubkey)}
                        className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                      >
                        {shortenAddress(circle.on_chain_pubkey)}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base">Contribution Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContributionTracker
                    contributions={[]}
                    currentMonth={circle.current_month}
                    totalMonths={circle.duration_months}
                    memberCount={circle.current_members}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-0">
                {circle.members && circle.members.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {circle.members.map((member, index) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        index={index}
                        isCurrentUser={member.user?.wallet_address === walletAddress}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No members yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-white/40 font-medium">Month</th>
                        <th className="text-left p-4 text-white/40 font-medium">Member</th>
                        <th className="text-left p-4 text-white/40 font-medium">Amount</th>
                        <th className="text-left p-4 text-white/40 font-medium">Status</th>
                        <th className="text-left p-4 text-white/40 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {circle.current_month > 0 ? (
                        Array.from({ length: circle.current_month }, (_, month) =>
                          (circle.members || []).map((member) => (
                            <tr
                              key={`${month}-${member.id}`}
                              className="border-b border-white/5 hover:bg-white/[0.02]"
                            >
                              <td className="p-4 text-white/60">
                                Month {month + 1}
                              </td>
                              <td className="p-4 text-white">
                                {member.user
                                  ? shortenAddress(member.user.wallet_address)
                                  : "Unknown"}
                              </td>
                              <td className="p-4 text-white">
                                ${circle.contribution_amount.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <Badge variant="success" className="text-xs">
                                  Paid
                                </Badge>
                              </td>
                              <td className="p-4 text-white/40">
                                {formatDate(circle.created_at)}
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/40">
                            No contributions yet. The circle has not started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="pt-6">
                <PayoutSchedule
                  members={circle.members || []}
                  payouts={[]}
                  currentMonth={circle.current_month}
                  payoutMethod={circle.payout_method}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Circle</DialogTitle>
            <DialogDescription>
              Join &ldquo;{circle.name}&rdquo; by depositing your stake. Your stake
              amount depends on your trust tier.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">
                Stake Amount (USDC)
              </label>
              <Input
                type="number"
                placeholder={`${circle.contribution_amount * 2}`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <p className="text-white/30 text-xs mt-1">
                Newcomers stake 2x contribution. Higher trust tiers require less.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div className="flex justify-between text-white/50 mb-1">
                <span>Monthly Contribution</span>
                <span>${circle.contribution_amount}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Duration</span>
                <span>{circle.duration_months} months</span>
              </div>
            </div>
            {txError && (
              <p className="text-red-400 text-sm">{txError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowJoinDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={actionLoading || txLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Join
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Contribution</DialogTitle>
            <DialogDescription>
              Contribute ${circle.contribution_amount} USDC for month{" "}
              {circle.current_month + 1}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-white/60 mb-1">Amount Due</p>
              <p className="text-2xl font-bold text-white">
                ${circle.contribution_amount.toLocaleString()}{" "}
                <span className="text-sm font-normal text-white/40">USDC</span>
              </p>
            </div>
            {txError && (
              <p className="text-red-400 text-sm">{txError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowContributeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContribute}
                disabled={actionLoading || txLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Contribution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <p
          className={cn(
            "text-lg font-bold",
            highlight ? "text-green-400" : "text-white"
          )}
        >
          {value}
        </p>
        <p className="text-white/30 text-xs">{sub}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function MemberRow({
  member,
  index,
  isCurrentUser,
}: {
  member: CircleMember;
  index: number;
  isCurrentUser: boolean;
}) {
  const address = member.user?.wallet_address || "Unknown";
  const tierColor = getTrustTierColor(member.user?.trust_tier || "newcomer");

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors",
        isCurrentUser && "bg-white/[0.02]"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/60">
          {index + 1}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium">
              {member.user?.display_name || shortenAddress(address)}
            </span>
            {isCurrentUser && (
              <Badge variant="default" className="text-[10px]">
                You
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-xs font-medium capitalize", tierColor)}>
              {member.user?.trust_tier || "newcomer"}
            </span>
            <span className="text-white/30 text-xs">
              Score: {member.trust_score_at_join}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {member.payout_position !== null && (
          <span className="text-xs text-white/40">
            Payout #{member.payout_position + 1}
          </span>
        )}
        <Badge
          variant={member.status === "active" ? "success" : "destructive"}
          className="text-xs capitalize"
        >
          {member.status}
        </Badge>
      </div>
    </div>
  );
}
