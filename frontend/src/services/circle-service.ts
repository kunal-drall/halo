import type {
  Circle,
  CircleWithMembers,
  TransactionResponse,
  UserStats,
} from "@/types";

const API_BASE = "/api/circles";

export async function fetchMyCircles(wallet: string): Promise<Circle[]> {
  const res = await fetch(`${API_BASE}?wallet=${wallet}&type=my`);
  if (!res.ok) throw new Error("Failed to fetch circles");
  return res.json();
}

export async function fetchAvailableCircles(
  filters?: Record<string, string>
): Promise<Circle[]> {
  const params = new URLSearchParams({ type: "available", ...filters });
  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch circles");
  return res.json();
}

export async function fetchCircleDetail(
  circleId: string
): Promise<CircleWithMembers> {
  const res = await fetch(`${API_BASE}/${circleId}`);
  if (!res.ok) throw new Error("Failed to fetch circle");
  return res.json();
}

export async function createCircleTx(params: {
  wallet: string;
  name: string;
  description: string;
  contribution_amount: number;
  duration_months: number;
  max_members: number;
  penalty_rate: number;
  payout_method: string;
  min_trust_tier: string;
  is_public: boolean;
}): Promise<TransactionResponse> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create circle");
  }
  return res.json();
}

export async function joinCircleTx(
  circleId: string,
  wallet: string,
  stakeAmount: number
): Promise<TransactionResponse> {
  const res = await fetch(`${API_BASE}/${circleId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, stake_amount: stakeAmount }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to join circle");
  }
  return res.json();
}

export async function contributeTx(
  circleId: string,
  wallet: string,
  amount: number
): Promise<TransactionResponse> {
  const res = await fetch(`${API_BASE}/${circleId}/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, amount }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to contribute");
  }
  return res.json();
}

export async function claimPayoutTx(
  circleId: string,
  wallet: string
): Promise<TransactionResponse> {
  const res = await fetch(`${API_BASE}/${circleId}/claim-payout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to claim payout");
  }
  return res.json();
}

export async function fetchUserStats(wallet: string): Promise<UserStats> {
  const res = await fetch(`/api/users/${wallet}`);
  if (!res.ok) throw new Error("Failed to fetch user stats");
  const data = await res.json();
  return data.stats;
}
