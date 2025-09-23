'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GestureHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onPinchChange?: (scale: number) => void;
}

interface GestureConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  minPinchDistance?: number;
  element?: HTMLElement | null;
}

export function useGestures(
  handlers: GestureHandlers,
  config: GestureConfig = {}
) {
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 500,
    minPinchDistance = 20,
    element
  } = config;

  const [isPinching, setIsPinching] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Update element ref
  useEffect(() => {
    if (element) {
      elementRef.current = element;
    }
  }, [element]);

  const handleTouchStart = useCallback((e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches.length === 1) {
      // Single touch - potential swipe
      touchStartRef.current = {
        x: touchEvent.touches[0].clientX,
        y: touchEvent.touches[0].clientY,
        time: Date.now()
      };
    } else if (touchEvent.touches.length === 2) {
      // Two touches - potential pinch
      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      pinchStartRef.current = {
        distance,
        scale: currentScale
      };
      setIsPinching(true);
    }
  }, [currentScale]);

  const handleTouchMove = useCallback((e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches.length === 1 && touchStartRef.current) {
      // Single touch move - track for swipe
      // We don't do anything here, just track the touch
    } else if (touchEvent.touches.length === 2 && pinchStartRef.current) {
      // Two touches move - pinch gesture
      touchEvent.preventDefault(); // Prevent default to avoid page zoom
      
      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const startDistance = pinchStartRef.current.distance;
      const startScale = pinchStartRef.current.scale;
      const newScale = startScale * (distance / startDistance);
      
      setCurrentScale(newScale);
      handlers.onPinchChange?.(newScale);
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches.length === 0) {
      // All touches ended
      if (touchStartRef.current) {
        // Check for swipe
        const touchEnd = touchEvent.changedTouches[0];
        const deltaX = touchEnd.clientX - touchStartRef.current.x;
        const deltaY = touchEnd.clientY - touchStartRef.current.y;
        const deltaTime = Date.now() - touchStartRef.current.time;
        
        if (deltaTime <= maxSwipeTime) {
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);
          
          if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
            // Determine swipe direction
            if (absDeltaX > absDeltaY) {
              // Horizontal swipe
              if (deltaX > 0) {
                handlers.onSwipeRight?.();
              } else {
                handlers.onSwipeLeft?.();
              }
            } else {
              // Vertical swipe
              if (deltaY > 0) {
                handlers.onSwipeDown?.();
              } else {
                handlers.onSwipeUp?.();
              }
            }
          }
        }
        
        touchStartRef.current = null;
      }
      
      if (pinchStartRef.current) {
        // Check for pinch gesture completion
        const startDistance = pinchStartRef.current.distance;
        const endDistance = Math.hypot(
          touchEvent.changedTouches[0].clientX - touchEvent.changedTouches[1].clientX,
          touchEvent.changedTouches[0].clientY - touchEvent.changedTouches[1].clientY
        );
        
        const deltaDistance = endDistance - startDistance;
        
        if (Math.abs(deltaDistance) > minPinchDistance) {
          if (deltaDistance > 0) {
            handlers.onPinchOut?.();
          } else {
            handlers.onPinchIn?.();
          }
        }
        
        pinchStartRef.current = null;
        setIsPinching(false);
      }
    }
  }, [handlers, minSwipeDistance, maxSwipeTime, minPinchDistance]);

  // Add event listeners
  useEffect(() => {
    const targetElement = elementRef.current || document;
    
    targetElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    targetElement.addEventListener('touchend', handleTouchEnd);
    targetElement.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.removeEventListener('touchmove', handleTouchMove);
      targetElement.removeEventListener('touchend', handleTouchEnd);
      targetElement.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPinching,
    currentScale,
    resetScale: useCallback(() => {
      setCurrentScale(1);
      handlers.onPinchChange?.(1);
    }, [handlers])
  };
}

// Hook for detecting mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Hook for detecting orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const handleOrientationChange = () => {
        setOrientation(
          window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
        );
      };

      // Set initial orientation
      handleOrientationChange();

      window.addEventListener('resize', handleOrientationChange);
      window.addEventListener('orientationchange', handleOrientationChange);
      
      return () => {
        window.removeEventListener('resize', handleOrientationChange);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, []);

  return orientation;
}
