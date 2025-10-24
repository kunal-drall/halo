'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrustScore, TrustTier } from '@/types/circles';
import { PublicKey } from '@solana/web3.js';

interface TrustStore {
  // State
  userScore: TrustScore | null;
  tier: TrustTier;
  loading: boolean;
  error: string | null;
  lastFetch: number;
  
  // Actions
  fetchTrustScore: (userAddress: PublicKey) => Promise<void>;
  updateTrustScore: (score: TrustScore) => void;
  clearCache: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for trust scores

export const useTrustStore = create<TrustStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userScore: null,
      tier: TrustTier.Newcomer,
      loading: false,
      error: null,
      lastFetch: 0,

      // Fetch trust score
      fetchTrustScore: async (userAddress: PublicKey) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < CACHE_TTL && get().userScore) {
          return;
        }

        set({ loading: true, error: null });
        try {
          // Mock trust score data - in real app, would fetch from smart contract
          const mockScore: TrustScore = {
            user: userAddress.toBase58(),
            paymentReliability: 95,
            circlesCompleted: 2,
            circlesDefaulted: 0,
            totalContributionsMade: 8,
            onTimePayments: 7,
            latePayments: 1,
            overallScore: 650,
            tier: TrustTier.Silver,
            lastUpdated: now,
          };

          set({ 
            userScore: mockScore,
            tier: mockScore.tier,
            loading: false, 
            lastFetch: now 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch trust score',
            loading: false 
          });
        }
      },

      // Update trust score
      updateTrustScore: (score: TrustScore) => {
        set({ 
          userScore: score,
          tier: score.tier,
          lastFetch: Date.now()
        });
      },

      // Clear cache
      clearCache: () => {
        set({ 
          userScore: null,
          tier: TrustTier.Newcomer,
          lastFetch: 0,
          error: null
        });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Set loading
      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'trust-store',
      partialize: (state) => ({
        userScore: state.userScore,
        tier: state.tier,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

