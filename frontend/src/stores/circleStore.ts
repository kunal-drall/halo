'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Circle, CircleFilters, PaymentDue, PayoutReady, UserStats } from '@/types/circles';
import { circleService } from '@/services/circle-service';
import { PublicKey } from '@solana/web3.js';

interface CircleStore {
  // State
  myCircles: Circle[];
  availableCircles: Circle[];
  currentCircle: Circle | null;
  paymentDue: PaymentDue[];
  payoutReady: PayoutReady[];
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  lastFetch: number;
  
  // Actions
  fetchMyCircles: (userAddress: PublicKey) => Promise<void>;
  fetchAvailableCircles: (filters?: CircleFilters) => Promise<void>;
  fetchCircle: (circleId: string) => Promise<void>;
  fetchPaymentDue: (userAddress: PublicKey) => Promise<void>;
  fetchPayoutReady: (userAddress: PublicKey) => Promise<void>;
  fetchUserStats: (userAddress: PublicKey) => Promise<void>;
  
  // Circle operations
  createCircle: (params: any, userAddress: PublicKey) => Promise<string>;
  joinCircle: (circleId: string, insuranceAmount: number, userAddress: PublicKey) => Promise<string>;
  contribute: (circleId: string, amount: number, userAddress: PublicKey) => Promise<string>;
  claimPayout: (circleId: string, userAddress: PublicKey) => Promise<string>;
  bidForPayout: (circleId: string, bidAmount: number, userAddress: PublicKey) => Promise<string>;
  
  // Cache management
  clearCache: () => void;
  setCurrentCircle: (circle: Circle | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BALANCE_TTL = 10 * 1000; // 10 seconds

export const useCircleStore = create<CircleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      myCircles: [],
      availableCircles: [],
      currentCircle: null,
      paymentDue: [],
      payoutReady: [],
      userStats: null,
      loading: false,
      error: null,
      lastFetch: 0,

      // Fetch my circles
      fetchMyCircles: async (userAddress: PublicKey) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < CACHE_TTL && get().myCircles.length > 0) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const circles = await circleService.getUserCircles(userAddress);
          set({ 
            myCircles: circles, 
            loading: false, 
            lastFetch: now 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch circles',
            loading: false 
          });
        }
      },

      // Fetch available circles
      fetchAvailableCircles: async (filters?: CircleFilters) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < CACHE_TTL && get().availableCircles.length > 0) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const circles = await circleService.getAllCircles(filters);
          set({ 
            availableCircles: circles, 
            loading: false, 
            lastFetch: now 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch circles',
            loading: false 
          });
        }
      },

      // Fetch specific circle
      fetchCircle: async (circleId: string) => {
        set({ loading: true, error: null });
        try {
          const circle = await circleService.getCircle(circleId);
          set({ 
            currentCircle: circle, 
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch circle',
            loading: false 
          });
        }
      },

      // Fetch payment due
      fetchPaymentDue: async (userAddress: PublicKey) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < BALANCE_TTL && get().paymentDue.length >= 0) {
          return;
        }

        try {
          const paymentDue = await circleService.getPaymentDue(userAddress);
          set({ paymentDue });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch payment due'
          });
        }
      },

      // Fetch payout ready
      fetchPayoutReady: async (userAddress: PublicKey) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < BALANCE_TTL && get().payoutReady.length >= 0) {
          return;
        }

        try {
          const payoutReady = await circleService.getPayoutReady(userAddress);
          set({ payoutReady });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch payout ready'
          });
        }
      },

      // Fetch user stats
      fetchUserStats: async (userAddress: PublicKey) => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Use cache if data is fresh
        if (now - lastFetch < CACHE_TTL && get().userStats) {
          return;
        }

        try {
          const userStats = await circleService.getUserStats(userAddress);
          set({ userStats });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user stats'
          });
        }
      },

      // Create circle
      createCircle: async (params: any, userAddress: PublicKey) => {
        set({ loading: true, error: null });
        try {
          const signature = await circleService.createCircle(params, userAddress);
          
          // Refresh my circles
          await get().fetchMyCircles(userAddress);
          
          set({ loading: false });
          return signature;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create circle',
            loading: false 
          });
          throw error;
        }
      },

      // Join circle
      joinCircle: async (circleId: string, insuranceAmount: number, userAddress: PublicKey) => {
        set({ loading: true, error: null });
        try {
          const signature = await circleService.joinCircle(
            { circleId, insuranceAmount }, 
            userAddress
          );
          
          // Refresh my circles
          await get().fetchMyCircles(userAddress);
          
          set({ loading: false });
          return signature;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join circle',
            loading: false 
          });
          throw error;
        }
      },

      // Contribute to circle
      contribute: async (circleId: string, amount: number, userAddress: PublicKey) => {
        set({ loading: true, error: null });
        try {
          const signature = await circleService.contribute(
            { circleId, amount }, 
            userAddress
          );
          
          // Refresh payment due and my circles
          await Promise.all([
            get().fetchPaymentDue(userAddress),
            get().fetchMyCircles(userAddress)
          ]);
          
          set({ loading: false });
          return signature;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to contribute',
            loading: false 
          });
          throw error;
        }
      },

      // Claim payout
      claimPayout: async (circleId: string, userAddress: PublicKey) => {
        set({ loading: true, error: null });
        try {
          const signature = await circleService.claimPayout(
            { circleId }, 
            userAddress
          );
          
          // Refresh payout ready and my circles
          await Promise.all([
            get().fetchPayoutReady(userAddress),
            get().fetchMyCircles(userAddress)
          ]);
          
          set({ loading: false });
          return signature;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to claim payout',
            loading: false 
          });
          throw error;
        }
      },

      // Bid for payout
      bidForPayout: async (circleId: string, bidAmount: number, userAddress: PublicKey) => {
        set({ loading: true, error: null });
        try {
          const signature = await circleService.bidForPayout(
            { circleId, bidAmount }, 
            userAddress
          );
          
          // Refresh my circles
          await get().fetchMyCircles(userAddress);
          
          set({ loading: false });
          return signature;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to place bid',
            loading: false 
          });
          throw error;
        }
      },

      // Clear cache
      clearCache: () => {
        set({ 
          myCircles: [],
          availableCircles: [],
          currentCircle: null,
          paymentDue: [],
          payoutReady: [],
          userStats: null,
          lastFetch: 0,
          error: null
        });
      },

      // Set current circle
      setCurrentCircle: (circle: Circle | null) => {
        set({ currentCircle: circle });
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
      name: 'circle-store',
      partialize: (state) => ({
        myCircles: state.myCircles,
        availableCircles: state.availableCircles,
        currentCircle: state.currentCircle,
        userStats: state.userStats,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

