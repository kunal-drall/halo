"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Wallet,
  FileText,
  Settings,
  Shield,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTransactionBuilder } from "@/hooks/useTransactionBuilder";
import { useCircleStore } from "@/stores/circleStore";
import { cn } from "@/lib/utils";
import type { PayoutMethod, TrustTier } from "@/types";

interface FormData {
  name: string;
  description: string;
  is_public: boolean;
  contribution_amount: string;
  duration_months: string;
  max_members: string;
  penalty_rate: string;
  payout_method: PayoutMethod;
  min_trust_tier: TrustTier;
}

const STEPS = [
  { label: "Basics", icon: FileText },
  { label: "Configuration", icon: Settings },
  { label: "Payout & Trust", icon: Shield },
  { label: "Review", icon: Eye },
];

const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  fixed_rotation: "Fixed Rotation",
  random: "Random",
  auction: "Auction",
};

const TRUST_TIER_LABELS: Record<TrustTier, string> = {
  newcomer: "Newcomer (0-249)",
  silver: "Silver (250-499)",
  gold: "Gold (500-749)",
  platinum: "Platinum (750-1000)",
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
          Connect your Solana wallet to create a new lending circle.
        </p>
      </motion.div>
    </div>
  );
}

export default function CreateCirclePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { buildAndSend, loading: txLoading, error: txError } = useTransactionBuilder();
  const { clearCache } = useCircleStore();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    is_public: true,
    contribution_amount: "",
    duration_months: "6",
    max_members: "5",
    penalty_rate: "5",
    payout_method: "fixed_rotation",
    min_trust_tier: "newcomer",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (s === 0) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (formData.name.length > 50)
        newErrors.name = "Name must be 50 characters or less";
    }

    if (s === 1) {
      const amount = parseFloat(formData.contribution_amount);
      if (!formData.contribution_amount || isNaN(amount) || amount <= 0) {
        newErrors.contribution_amount = "Enter a valid contribution amount";
      }
      if (amount > 100000) {
        newErrors.contribution_amount = "Amount must be under 100,000 USDC";
      }
      const penalty = parseInt(formData.penalty_rate);
      if (isNaN(penalty) || penalty < 1 || penalty > 20) {
        newErrors.penalty_rate = "Penalty rate must be between 1% and 20%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleCreate = async () => {
    if (!publicKey) return;

    setCreating(true);
    try {
      await buildAndSend("/api/circles", {
        name: formData.name,
        description: formData.description,
        contribution_amount: parseFloat(formData.contribution_amount),
        duration_months: parseInt(formData.duration_months),
        max_members: parseInt(formData.max_members),
        penalty_rate: parseInt(formData.penalty_rate),
        payout_method: formData.payout_method,
        min_trust_tier: formData.min_trust_tier,
        is_public: formData.is_public,
      });

      clearCache();
      setSuccess(true);

      setTimeout(() => {
        router.push("/circles");
      }, 2000);
    } catch (err) {
      // Error is set by useTransactionBuilder
    } finally {
      setCreating(false);
    }
  };

  if (!connected) {
    return <ConnectWalletPrompt />;
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Create Circle
          </h1>
          <p className="text-white/50 text-sm">
            Set up a new lending circle in {STEPS.length} simple steps.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                      isCompleted
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : isActive
                          ? "bg-white/10 border-white/20 text-white/70"
                          : "bg-white/5 border-white/10 text-white/30"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-white/70" : "text-white/40"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Circle Created!
              </h2>
              <p className="text-white/50">
                Redirecting you to your circles...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {STEPS[step].label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Step 1: Basics */}
                  {step === 0 && (
                    <>
                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Circle Name *
                        </label>
                        <Input
                          placeholder="e.g. Monthly Savings Club"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          maxLength={50}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                        )}
                        <p className="text-white/30 text-xs mt-1">
                          {formData.name.length}/50 characters
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Description
                        </label>
                        <textarea
                          className="flex w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-none"
                          placeholder="Describe the purpose and goals of your circle..."
                          value={formData.description}
                          onChange={(e) =>
                            updateField("description", e.target.value)
                          }
                          maxLength={500}
                        />
                        <p className="text-white/30 text-xs mt-1">
                          {formData.description.length}/500 characters
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Visibility
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateField("is_public", true)}
                            className={cn(
                              "flex-1 p-3 rounded-lg border text-sm text-left transition-all",
                              formData.is_public
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                            )}
                          >
                            <div className="font-medium mb-0.5">Public</div>
                            <div className="text-xs opacity-70">
                              Anyone can discover and request to join
                            </div>
                          </button>
                          <button
                            onClick={() => updateField("is_public", false)}
                            className={cn(
                              "flex-1 p-3 rounded-lg border text-sm text-left transition-all",
                              !formData.is_public
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                            )}
                          >
                            <div className="font-medium mb-0.5">Private</div>
                            <div className="text-xs opacity-70">
                              Invite-only with a unique code
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Configuration */}
                  {step === 1 && (
                    <>
                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Monthly Contribution (USDC) *
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="100"
                            value={formData.contribution_amount}
                            onChange={(e) =>
                              updateField("contribution_amount", e.target.value)
                            }
                            min="1"
                            step="1"
                            className="pr-16"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                            USDC
                          </span>
                        </div>
                        {errors.contribution_amount && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.contribution_amount}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-white/60 mb-1.5 block">
                            Duration (months)
                          </label>
                          <Select
                            value={formData.duration_months}
                            onValueChange={(v) =>
                              updateField("duration_months", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 months</SelectItem>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm text-white/60 mb-1.5 block">
                            Max Members
                          </label>
                          <Select
                            value={formData.max_members}
                            onValueChange={(v) =>
                              updateField("max_members", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 18 }, (_, i) => i + 3).map(
                                (n) => (
                                  <SelectItem key={n} value={n.toString()}>
                                    {n} members
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Late Penalty Rate: {formData.penalty_rate}%
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={formData.penalty_rate}
                          onChange={(e) =>
                            updateField("penalty_rate", e.target.value)
                          }
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-xs text-white/30 mt-1">
                          <span>1%</span>
                          <span>20%</span>
                        </div>
                        {errors.penalty_rate && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.penalty_rate}
                          </p>
                        )}
                      </div>

                      {/* Estimated total */}
                      {formData.contribution_amount && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/40 mb-1">
                            Estimated total pool per round
                          </p>
                          <p className="text-lg font-bold text-white">
                            $
                            {(
                              parseFloat(formData.contribution_amount || "0") *
                              parseInt(formData.max_members)
                            ).toLocaleString()}{" "}
                            <span className="text-sm text-white/40 font-normal">
                              USDC
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 3: Payout & Trust */}
                  {step === 2 && (
                    <>
                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Payout Method
                        </label>
                        <div className="space-y-2">
                          {(
                            [
                              "fixed_rotation",
                              "random",
                              "auction",
                            ] as PayoutMethod[]
                          ).map((method) => (
                            <button
                              key={method}
                              onClick={() =>
                                updateField("payout_method", method)
                              }
                              className={cn(
                                "w-full p-3 rounded-lg border text-sm text-left transition-all",
                                formData.payout_method === method
                                  ? "border-white/20 bg-white/10 text-white"
                                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                              )}
                            >
                              <div className="font-medium">
                                {PAYOUT_METHOD_LABELS[method]}
                              </div>
                              <div className="text-xs opacity-70 mt-0.5">
                                {method === "fixed_rotation" &&
                                  "Members receive payouts in a predetermined order."}
                                {method === "random" &&
                                  "Random selection each round for fair distribution."}
                                {method === "auction" &&
                                  "Members bid on early payout positions."}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-white/60 mb-1.5 block">
                          Minimum Trust Tier
                        </label>
                        <Select
                          value={formData.min_trust_tier}
                          onValueChange={(v) =>
                            updateField("min_trust_tier", v as TrustTier)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(TRUST_TIER_LABELS) as [
                                TrustTier,
                                string,
                              ][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-white/30 text-xs mt-1.5">
                          Only members with this trust tier or higher can join.
                          Higher tiers require lower stake deposits.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Step 4: Review */}
                  {step === 3 && (
                    <>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <ReviewItem
                            label="Name"
                            value={formData.name || "Untitled"}
                          />
                          <ReviewItem
                            label="Visibility"
                            value={formData.is_public ? "Public" : "Private"}
                          />
                          <ReviewItem
                            label="Contribution"
                            value={`${formData.contribution_amount || "0"} USDC`}
                          />
                          <ReviewItem
                            label="Duration"
                            value={`${formData.duration_months} months`}
                          />
                          <ReviewItem
                            label="Max Members"
                            value={formData.max_members}
                          />
                          <ReviewItem
                            label="Penalty Rate"
                            value={`${formData.penalty_rate}%`}
                          />
                          <ReviewItem
                            label="Payout Method"
                            value={PAYOUT_METHOD_LABELS[formData.payout_method]}
                          />
                          <ReviewItem
                            label="Min Trust Tier"
                            value={
                              formData.min_trust_tier.charAt(0).toUpperCase() +
                              formData.min_trust_tier.slice(1)
                            }
                          />
                        </div>

                        {formData.description && (
                          <div>
                            <p className="text-xs text-white/40 mb-1">
                              Description
                            </p>
                            <p className="text-sm text-white/70">
                              {formData.description}
                            </p>
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/60 mb-1">
                            Total Pool Value
                          </p>
                          <p className="text-xl font-bold text-white">
                            $
                            {(
                              parseFloat(formData.contribution_amount || "0") *
                              parseInt(formData.max_members)
                            ).toLocaleString()}{" "}
                            <span className="text-sm text-white/40 font-normal">
                              USDC per round
                            </span>
                          </p>
                        </div>

                        {txError && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-red-400 text-sm">{txError}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button onClick={handleNext} className="gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreate}
                    disabled={creating || txLoading}
                    className="gap-2"
                  >
                    {creating || txLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Create Circle
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <p className="text-xs text-white/40 mb-0.5">{label}</p>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  );
}
