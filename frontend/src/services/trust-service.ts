import type { TrustScoreBreakdown, TransactionResponse } from "@/types";

export async function fetchTrustScore(
  address: string
): Promise<TrustScoreBreakdown> {
  const res = await fetch(`/api/trust-score?address=${address}`);
  if (!res.ok) throw new Error("Failed to fetch trust score");
  return res.json();
}

export async function initializeTrustScoreTx(
  wallet: string
): Promise<TransactionResponse> {
  const res = await fetch("/api/trust-score/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to initialize trust score");
  }
  return res.json();
}

export async function batchFetchTrustScores(
  addresses: string[]
): Promise<Record<string, TrustScoreBreakdown>> {
  const res = await fetch("/api/trust-score/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addresses }),
  });
  if (!res.ok) throw new Error("Failed to batch fetch trust scores");
  return res.json();
}
