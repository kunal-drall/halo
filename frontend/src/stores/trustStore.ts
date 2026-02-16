import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrustScoreBreakdown, TrustTier } from "@/types";

interface TrustState {
  // Data
  score: number;
  tier: TrustTier;
  breakdown: TrustScoreBreakdown | null;

  // Cache
  lastFetch: number;
  loading: boolean;
  error: string | null;

  // Actions
  setScore: (score: number, tier: TrustTier) => void;
  setBreakdown: (breakdown: TrustScoreBreakdown) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  isCacheStale: (ttlMs?: number) => boolean;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const useTrustStore = create<TrustState>()(
  persist(
    (set, get) => ({
      score: 0,
      tier: "newcomer",
      breakdown: null,
      lastFetch: 0,
      loading: false,
      error: null,

      setScore: (score, tier) =>
        set({ score, tier, lastFetch: Date.now() }),

      setBreakdown: (breakdown) =>
        set({
          breakdown,
          score: breakdown.score,
          tier: breakdown.tier,
          lastFetch: Date.now(),
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearCache: () =>
        set({
          score: 0,
          tier: "newcomer",
          breakdown: null,
          lastFetch: 0,
        }),

      isCacheStale: (ttlMs = CACHE_TTL) => {
        return Date.now() - get().lastFetch > ttlMs;
      },
    }),
    {
      name: "halo-trust",
      partialize: (state) => ({
        score: state.score,
        tier: state.tier,
        breakdown: state.breakdown,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
