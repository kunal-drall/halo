'use client';

import { useCallback, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const startTime = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: startTime
    };

    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true
    });
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isDragging || !touchStartRef.current) return;

    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY
    }));
  }, [swipeState.isDragging, preventDefault]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isDragging || !touchStartRef.current) return;

    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Only trigger swipe if gesture was quick enough (less than 300ms)
    if (deltaTime > 300) {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      touchStartRef.current = null;
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine primary direction
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setSwipeState(prev => ({ ...prev, isDragging: false }));
    touchStartRef.current = null;
  }, [swipeState.isDragging, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, preventDefault]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const startTime = Date.now();
    
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: startTime
    };

    setSwipeState({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: true
    });
  }, [preventDefault]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!swipeState.isDragging || !touchStartRef.current) return;

    if (preventDefault) {
      e.preventDefault();
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY
    }));
  }, [swipeState.isDragging, preventDefault]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!swipeState.isDragging || !touchStartRef.current) return;

    if (preventDefault) {
      e.preventDefault();
    }

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Only trigger swipe if gesture was quick enough (less than 300ms)
    if (deltaTime > 300) {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      touchStartRef.current = null;
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine primary direction
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setSwipeState(prev => ({ ...prev, isDragging: false }));
    touchStartRef.current = null;
  }, [swipeState.isDragging, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, preventDefault]);

  const gestureProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    style: {
      touchAction: preventDefault ? 'none' : 'auto',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      MozUserSelect: 'none' as const,
      msUserSelect: 'none' as const,
    }
  };

  return {
    gestureProps,
    swipeState,
    isDragging: swipeState.isDragging,
    deltaX: swipeState.currentX - swipeState.startX,
    deltaY: swipeState.currentY - swipeState.startY
  };
}

