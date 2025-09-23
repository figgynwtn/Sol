'use client';

import React, { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function LoadingAnimation({ 
  message = "Initializing celestial audio...", 
  onComplete,
  duration = 3000 
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Connecting to the cosmos...",
    "Calibrating planetary frequencies...",
    "Tuning celestial harmonics...",
    "Preparing audio context...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, duration / 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, duration / steps.length);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [duration, onComplete, steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-space-950 via-purple-950 to-space-950">
      <div className="text-center space-y-8 max-w-md mx-auto p-8">
        {/* Animated celestial logo */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-purple-400/30 animate-pulse" />
          
          {/* Central sun */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse shadow-lg">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </div>
          
          {/* Orbiting planets */}
          {[0, 120, 240].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0 rounded-full border border-purple-300/10"
              style={{
                transform: `rotate(${rotation + (progress * 3.6)}deg)`,
                animation: 'spin 20s linear infinite'
              }}
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-300 rounded-full -translate-x-1/2 -translate-y-1 shadow-lg" />
            </div>
          ))}
        </div>

        {/* Progress text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white animate-pulse">
            {message}
          </h2>
          
          <p className="text-purple-300 text-lg transition-all duration-500 ease-in-out transform">
            {steps[currentStep]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-white/30 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="text-purple-400 text-sm font-mono">
          {Math.round(progress)}%
        </div>

        {/* Decorative stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => {
            // Use deterministic positions based on index to avoid hydration mismatch
            const seed = i * 9301 + 49297; // Simple seed based on index
            const left = ((seed * 9301) % 1000000) / 10000;
            const top = ((seed * 49297) % 1000000) / 10000;
            const delay = ((seed * 233) % 2000) / 1000;
            const opacity = ((seed * 7665) % 800) / 1000 + 0.2;
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  opacity: opacity
                }}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
