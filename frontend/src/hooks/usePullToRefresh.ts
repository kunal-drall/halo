"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type UsePullToRefreshOptions = {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
};

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
      }
    },
    [threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance };
}
