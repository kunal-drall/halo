import { PublicKey } from "@solana/web3.js";

// Program
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5"
);

// Token mints
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

// PDA Seeds
export const SEEDS = {
  CIRCLE: Buffer.from("circle"),
  ESCROW: Buffer.from("escrow"),
  MEMBER: Buffer.from("member"),
  TRUST_SCORE: Buffer.from("trust_score"),
  INSURANCE: Buffer.from("insurance"),
  TREASURY: Buffer.from("treasury"),
  REVENUE_PARAMS: Buffer.from("revenue_params"),
  PROPOSAL: Buffer.from("proposal"),
  VOTE: Buffer.from("vote"),
  AUCTION: Buffer.from("auction"),
  BID: Buffer.from("bid"),
  AUTOMATION_STATE: Buffer.from("automation_state"),
  CIRCLE_AUTOMATION: Buffer.from("circle_automation"),
  REVENUE_REPORT: Buffer.from("revenue_report"),
} as const;

// Trust Tiers
export const TRUST_TIERS = {
  NEWCOMER: { min: 0, max: 249, stakeMultiplier: 2.0, label: "Newcomer" },
  SILVER: { min: 250, max: 499, stakeMultiplier: 1.5, label: "Silver" },
  GOLD: { min: 500, max: 749, stakeMultiplier: 1.0, label: "Gold" },
  PLATINUM: { min: 750, max: 1000, stakeMultiplier: 0.75, label: "Platinum" },
} as const;

// Fee rates (basis points)
export const FEES = {
  DISTRIBUTION: 50, // 0.5%
  YIELD: 25, // 0.25%
  MANAGEMENT_ANNUAL: 200, // 2% annual
} as const;

// UI
export const CIRCLE_STATUSES = [
  "forming",
  "active",
  "distributing",
  "completed",
  "dissolved",
] as const;

export const PAYOUT_METHODS = [
  "fixed_rotation",
  "random",
  "auction",
] as const;

export function getTrustTier(score: number) {
  if (score >= 750) return TRUST_TIERS.PLATINUM;
  if (score >= 500) return TRUST_TIERS.GOLD;
  if (score >= 250) return TRUST_TIERS.SILVER;
  return TRUST_TIERS.NEWCOMER;
}
