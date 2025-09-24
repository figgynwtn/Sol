'use client';

import React, { useEffect, useState } from 'react';
import { getAudioEngine } from '@/lib/audioEngine';

// Tone.js will be imported dynamically
let Tone: any;

interface LoadingAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  onAudioReady?: () => void;
  onProceedWithoutAudio?: () => void;
  onSoundPreferenceChange?: (preference: 'enabled' | 'disabled') => void;
}

export default function LoadingAnimation({ 
  message = "Initializing celestial symphony...", 
  onComplete,
  onAudioReady,
  onProceedWithoutAudio,
  onSoundPreferenceChange,
  duration = 5000 
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'needs_interaction'>('loading');
  const [showInteraction, setShowInteraction] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [soundPreference, setSoundPreference] = useState<'enabled' | 'disabled' | null>(null);
  
  const audioEngine = getAudioEngine();
  
  const steps = [
    "Connecting to the cosmos...",
    "Calibrating planetary frequencies...",
    "Tuning celestial harmonics...",
    "Preparing audio context...",
    "Initializing Tone.js...",
    "Setting up celestial audio engine...",
    "Almost ready..."
  ];

  // Initialize audio in the background
  useEffect(() => {
    initializeAudioInBackground();
  }, []);

  const initializeAudioInBackground = async () => {
    try {
      console.log('🎵 Starting background audio initialization...');
      
      // Try to import Tone.js
      if (!Tone) {
        console.log('🔍 Loading Tone.js...');
        const toneModule = await import('tone');
        Tone = toneModule as any;
        console.log('✅ Tone.js loaded successfully');
      }
      
      // Try to start audio context (this may fail without user interaction)
      try {
        if (typeof Tone.start === 'function') {
          await Tone.start();
          console.log('✅ Audio context started automatically');
        }
        
        // Initialize audio engine
        audioEngine.setToneReference(Tone);
        await audioEngine.initialize();
        
        console.log('✅ Audio initialization completed successfully');
        setAudioStatus('ready');
        onAudioReady?.();
      } catch (contextError) {
        console.log('⚠️ Audio context requires user interaction');
        setAudioStatus('needs_interaction');
        setShowInteraction(true);
      }
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      setAudioStatus('needs_interaction');
      setShowInteraction(true);
    }
  };

  const handleUserInteraction = async () => {
    try {
      console.log('👤 User interaction detected - finalizing audio setup...');
      
      // Start Tone.js context with user interaction
      if (typeof Tone.start === 'function') {
        await Tone.start();
      }
      
      // Initialize audio engine if not already done
      const audioState = audioEngine.getAudioState();
      if (!audioState.isInitialized) {
        audioEngine.setToneReference(Tone);
        await audioEngine.initialize();
      }
      
      console.log('✅ Audio setup completed with user interaction');
      setAudioStatus('ready');
      setShowInteraction(false);
      onAudioReady?.();
    } catch (error) {
      console.error('❌ Audio setup failed even with user interaction:', error);
    }
  };

  // Auto-proceed when loading reaches 100% AND user has made a selection
  useEffect(() => {
    if (progress >= 100 && soundPreference !== null) {
      setLoadingComplete(true);
      // Automatically proceed to main page after a short delay
      setTimeout(() => {
        console.log('🚀 Loading complete and user made selection - proceeding to main page with sound preference:', soundPreference);
        if (soundPreference === 'disabled') {
          onProceedWithoutAudio?.();
        }
        onComplete?.();
      }, 500);
    }
  }, [progress, soundPreference, onComplete, onProceedWithoutAudio]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setLoadingComplete(true);
          // Auto-proceed logic is handled in the useEffect above
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

        {/* Sound Preference Selection - appears immediately and stays visible */}
        <div className="space-y-4 animate-fade-in">
          <p className="text-purple-300 text-lg font-medium text-center">
            Choose Your Cosmic Experience
          </p>
          
          <div className="space-y-3">
            {/* Enable Sound Button */}
            <button
              onClick={() => {
                console.log('User chose to enable sound');
                setSoundPreference('enabled');
                // Notify parent of sound preference change
                onSoundPreferenceChange?.('enabled');
                // Start audio initialization in background
                handleUserInteraction();
              }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-xl border-2 ${
                soundPreference === 'enabled'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-purple-600 hover:bg-blue-600 border-purple-400 hover:border-blue-400'
              }`}
            >
              <span className="text-lg">
                Enable Sound
              </span>
            </button>
            
            {/* Explore Without Sound Button */}
            <button
              onClick={() => {
                console.log('User chose to explore without sound');
                setSoundPreference('disabled');
                // Notify parent of sound preference change
                onSoundPreferenceChange?.('disabled');
                // Set a flag to disable audio when proceeding
                // Don't call onProceedWithoutAudio immediately - wait for loading to complete
              }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-xl border-2 ${
                soundPreference === 'disabled'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-purple-600 hover:bg-blue-600 border-purple-400 hover:border-blue-400'
              }`}
            >
              <span className="text-lg">
                Explore Without Sound
              </span>
            </button>
          </div>
          
          <p className="text-purple-400/80 text-sm text-center">
            {progress >= 100 
              ? 'Loading complete! Please select your preference to proceed.'
              : 'Select your preference. You\'ll proceed automatically when loading completes.'}
          </p>
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
