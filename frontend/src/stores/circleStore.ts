import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Circle, CircleMember, CircleWithMembers, UserStats } from "@/types";

interface CircleState {
  // Data
  myCircles: Circle[];
  availableCircles: Circle[];
  currentCircle: CircleWithMembers | null;
  userStats: UserStats | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Cache timestamps
  myCirclesLastFetch: number;
  availableCirclesLastFetch: number;

  // Actions
  setMyCircles: (circles: Circle[]) => void;
  setAvailableCircles: (circles: Circle[]) => void;
  setCurrentCircle: (circle: CircleWithMembers | null) => void;
  setUserStats: (stats: UserStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  isCacheStale: (key: "myCircles" | "availableCircles", ttlMs?: number) => boolean;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useCircleStore = create<CircleState>()(
  persist(
    (set, get) => ({
      myCircles: [],
      availableCircles: [],
      currentCircle: null,
      userStats: null,
      loading: false,
      error: null,
      myCirclesLastFetch: 0,
      availableCirclesLastFetch: 0,

      setMyCircles: (circles) =>
        set({ myCircles: circles, myCirclesLastFetch: Date.now() }),

      setAvailableCircles: (circles) =>
        set({ availableCircles: circles, availableCirclesLastFetch: Date.now() }),

      setCurrentCircle: (circle) => set({ currentCircle: circle }),

      setUserStats: (stats) => set({ userStats: stats }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearCache: () =>
        set({
          myCircles: [],
          availableCircles: [],
          currentCircle: null,
          userStats: null,
          myCirclesLastFetch: 0,
          availableCirclesLastFetch: 0,
        }),

      isCacheStale: (key, ttlMs = CACHE_TTL) => {
        const state = get();
        const lastFetch =
          key === "myCircles"
            ? state.myCirclesLastFetch
            : state.availableCirclesLastFetch;
        return Date.now() - lastFetch > ttlMs;
      },
    }),
    {
      name: "halo-circles",
      partialize: (state) => ({
        myCircles: state.myCircles,
        availableCircles: state.availableCircles,
        userStats: state.userStats,
        myCirclesLastFetch: state.myCirclesLastFetch,
        availableCirclesLastFetch: state.availableCirclesLastFetch,
      }),
    }
  )
);
