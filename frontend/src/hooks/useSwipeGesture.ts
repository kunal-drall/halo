"use client";

import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type SwipeDirection = "left" | "right";

type UseSwipeGestureOptions = {
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number;
  enabled?: boolean;
};

export function useSwipeGesture({
  onSwipe,
  threshold = 80,
  enabled = true,
}: UseSwipeGestureOptions = {}) {
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !onSwipe) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX.current;
      const diffY = endY - startY.current;

      // Only detect horizontal swipes (more horizontal than vertical)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        onSwipe(diffX > 0 ? "right" : "left");
      }
    },
    [enabled, onSwipe, threshold]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
}
