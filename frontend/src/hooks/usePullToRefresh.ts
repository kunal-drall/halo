'use client';

import { useCallback, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullState {
  startY: number;
  currentY: number;
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    resistance = 0.5,
    enabled = true
  } = options;

  const [pullState, setPullState] = useState<PullState>({
    startY: 0,
    currentY: 0,
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0
  });

  const touchStartRef = useRef<{ y: number; time: number } | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || pullState.isRefreshing) return;

    const touch = e.touches[0];
    const startTime = Date.now();
    
    touchStartRef.current = {
      y: touch.clientY,
      time: startTime
    };

    setPullState(prev => ({
      ...prev,
      startY: touch.clientY,
      currentY: touch.clientY,
      isPulling: true,
      pullDistance: 0
    }));
  }, [enabled, pullState.isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !pullState.isPulling || !touchStartRef.current || pullState.isRefreshing) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only allow downward pull
    if (deltaY <= 0) return;

    // Apply resistance
    const pullDistance = deltaY * resistance;
    
    setPullState(prev => ({
      ...prev,
      currentY: touch.clientY,
      pullDistance
    }));

    // Prevent default scrolling when pulling
    if (pullDistance > 0) {
      e.preventDefault();
    }
  }, [enabled, pullState.isPulling, pullState.isRefreshing, resistance]);

  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (!enabled || !pullState.isPulling || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Check if it's a valid pull gesture (downward, quick enough)
    if (deltaY <= 0 || deltaTime > 1000) {
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0
      }));
      touchStartRef.current = null;
      return;
    }

    const pullDistance = deltaY * resistance;

    // Trigger refresh if threshold is met
    if (pullDistance >= threshold) {
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullDistance: 0
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        // Reset after a short delay
        refreshTimeoutRef.current = setTimeout(() => {
          setPullState(prev => ({
            ...prev,
            isRefreshing: false
          }));
        }, 1000);
      }
    } else {
      // Reset if threshold not met
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0
      }));
    }

    touchStartRef.current = null;
  }, [enabled, pullState.isPulling, threshold, resistance, onRefresh]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled || pullState.isRefreshing) return;

    const startTime = Date.now();
    
    touchStartRef.current = {
      y: e.clientY,
      time: startTime
    };

    setPullState(prev => ({
      ...prev,
      startY: e.clientY,
      currentY: e.clientY,
      isPulling: true,
      pullDistance: 0
    }));
  }, [enabled, pullState.isRefreshing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled || !pullState.isPulling || !touchStartRef.current || pullState.isRefreshing) return;

    const deltaY = e.clientY - touchStartRef.current.y;
    
    // Only allow downward pull
    if (deltaY <= 0) return;

    // Apply resistance
    const pullDistance = deltaY * resistance;
    
    setPullState(prev => ({
      ...prev,
      currentY: e.clientY,
      pullDistance
    }));

    // Prevent default scrolling when pulling
    if (pullDistance > 0) {
      e.preventDefault();
    }
  }, [enabled, pullState.isPulling, pullState.isRefreshing, resistance]);

  const handleMouseUp = useCallback(async (e: React.MouseEvent) => {
    if (!enabled || !pullState.isPulling || !touchStartRef.current) return;

    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Check if it's a valid pull gesture (downward, quick enough)
    if (deltaY <= 0 || deltaTime > 1000) {
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0
      }));
      touchStartRef.current = null;
      return;
    }

    const pullDistance = deltaY * resistance;

    // Trigger refresh if threshold is met
    if (pullDistance >= threshold) {
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullDistance: 0
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        // Reset after a short delay
        refreshTimeoutRef.current = setTimeout(() => {
          setPullState(prev => ({
            ...prev,
            isRefreshing: false
          }));
        }, 1000);
      }
    } else {
      // Reset if threshold not met
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0
      }));
    }

    touchStartRef.current = null;
  }, [enabled, pullState.isPulling, threshold, resistance, onRefresh]);

  const gestureProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    style: {
      touchAction: 'pan-y',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      MozUserSelect: 'none' as const,
      msUserSelect: 'none' as const,
    }
  };

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  return {
    gestureProps,
    pullState,
    isPulling: pullState.isPulling,
    isRefreshing: pullState.isRefreshing,
    pullDistance: pullState.pullDistance,
    progress: Math.min(pullState.pullDistance / threshold, 1),
    cleanup
  };
}

