'use client';

import React, { useState, useEffect } from 'react';
import SolarSystemVisualization from '@/components/SolarSystemVisualization';
import ControlPanel from '@/components/ControlPanel';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import LoadingAnimation from '@/components/LoadingAnimation';
import AudioDebugPanel from '@/components/AudioDebugPanel';
import SlideUpDrawer from '@/components/SlideUpDrawer';
import MobileControlPanel from '@/components/MobileControlPanel';
import MobilePlanetInfoPanel from '@/components/MobilePlanetInfoPanel';
import { Planet } from '@/data/planets';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useGestures, useIsMobile, useOrientation } from '@/hooks/useGestures';
import { PLANETS } from '@/lib/planets-data';
import { cn } from '@/lib/utils';
import type { AudioStatus } from '@/types';

export default function HomePage() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('uninitialized');
  const [audioReady, setAudioReady] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showPlanetInfo, setShowPlanetInfo] = useState(false);
  const [visualizationScale, setVisualizationScale] = useState(1);
  
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  
  const {
    audioSettings,
    speedMultiplier,
    isInitialized,
    handleTogglePlay,
    handleVolumeChange,
    handleTempoChange,
    handleSpeedChange,
    handlePlanetMute
  } = useAudioEngine();

  // Handle audio ready callback
  const handleAudioReady = () => {
    console.log('🎵 Audio is ready - enabling controls');
    setAudioReady(true);
  };

  // Handle audio state changes
  useEffect(() => {
    if (isInitialized) {
      setAudioStatus('ready');
    }
  }, [isInitialized]);

  // Handle loading completion
  const handleLoadingComplete = () => {
    console.log('📊 Loading animation completed - hiding loading screen');
    setShowLoading(false);
  };

  const handleProceedWithoutAudio = () => {
    setShowLoading(false);
  };

  // No fallback timeout needed - user must click to proceed

  // Handle planet selection - show mobile panel on mobile, desktop panel on desktop
  const handlePlanetClick = (planet: Planet): void => {
    setSelectedPlanet(planet);
    
    // Toggle planet mute state
    const newMutedState = !planet.isMuted;
    handlePlanetMute(planet.id, newMutedState);
    
    // Update the planet's mute state for UI feedback
    planet.isMuted = newMutedState;
    
    // Show appropriate info panel based on device
    if (isMobile) {
      setShowPlanetInfo(true);
    }
  };

  // Close planet info panel
  const handleClosePlanetInfo = (): void => {
    setSelectedPlanet(null);
    setShowPlanetInfo(false);
  };

  // Gesture handlers
  const handleSwipeUp = () => {
    if (isMobile) {
      setShowMobileControls(true);
    }
  };

  const handleSwipeDown = () => {
    if (isMobile) {
      setShowMobileControls(false);
    }
  };

  const handleSwipeLeft = () => {
    // Increase speed
    const newSpeed = Math.min(speedMultiplier + 0.5, 10);
    handleSpeedChange(newSpeed);
  };

  const handleSwipeRight = () => {
    // Decrease speed
    const newSpeed = Math.max(speedMultiplier - 0.5, 0.1);
    handleSpeedChange(newSpeed);
  };

  const handlePinchChange = (scale: number) => {
    setVisualizationScale(scale);
  };

  // Initialize gesture handlers
  const gestureElement = typeof document !== 'undefined' ? document.body : null;
  useGestures({
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPinchChange: handlePinchChange
  }, { element: gestureElement });

  return (
    <>
      {/* Show loading animation on page load */}
      {showLoading && (
        <LoadingAnimation 
          onComplete={handleLoadingComplete} 
          onAudioReady={handleAudioReady}
          onProceedWithoutAudio={handleProceedWithoutAudio}
        />
      )}
      
      {/* Only show main content when loading is complete */}
      {!showLoading && (
        <div className="min-h-screen bg-gradient-to-br from-space-950 via-purple-950 to-space-950 overflow-hidden relative flex flex-col">
          {/* Animated starfield background */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-space-950 via-purple-950 to-space-950"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                                   radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                                   radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                                   radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
                                   radial-gradient(2px 2px at 160px 30px, #ddd, transparent)`,
                backgroundRepeat: 'repeat',
                backgroundSize: '200px 100px',
                animation: 'sparkle 20s linear infinite'
              }}></div>
            </div>

            {/* Header - Proper document flow */}
            <header className="relative z-10 p-4 sm:p-6">
              <div className="glass-panel p-4 sm:p-6 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="animate-float">
                    <h1 className="cosmic-title text-2xl sm:text-3xl">
                      Sol
                    </h1>
                    <p className="cosmic-subtitle mt-1 sm:mt-2 text-sm sm:text-base">
                      Celestial Symphony
                    </p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                      <span className="cosmic-badge text-xs">Interactive</span>
                      <span className="cosmic-badge text-xs">Educational</span>
                      <span className="cosmic-badge text-xs">Audio-Visual</span>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-purple-300 text-sm font-medium">Solar System Sonification</p>
                    <p className="text-gray-400 text-xs mt-1">Experience the cosmos through sound</p>
                    <div className="mt-2 flex flex-wrap items-center justify-start sm:justify-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        audioSettings.isPlaying ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {audioSettings.isPlaying ? '🎵 Playing' : '⏸️ Paused'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile Control Button - More prominent and accessible */}
            {isMobile && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                <button
                  onClick={() => setShowMobileControls(!showMobileControls)}
                  className="glass-panel p-4 px-6 rounded-full neon-glow hover:scale-105 transition-all duration-200 touch-manipulation shadow-xl border border-purple-500/30 flex items-center gap-3 min-w-[140px] justify-center"
                  aria-label={showMobileControls ? "Hide Mission Control" : "Show Mission Control"}
                >
                  <svg 
                    className="w-6 h-6 text-purple-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {showMobileControls ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    )}
                  </svg>
                  <span className="text-sm font-medium text-purple-300">
                    {showMobileControls ? 'Close' : 'Mission Control'}
                  </span>
                </button>
              </div>
            )}

            {/* Gesture Hints - More visible and better positioned */}
            {isMobile && !showMobileControls && (
              <div className="fixed bottom-24 right-4 z-20 glass-panel p-4 rounded-2xl max-w-[220px] border border-purple-500/20">
                <div className="text-xs text-purple-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⬆️</span>
                    <span>Swipe up for controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⬅️➡️</span>
                    <span>Swipe for speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤏</span>
                    <span>Pinch to zoom</span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Fixed layout */}
            <main className={cn(
              "relative flex-1 overflow-hidden",
              "flex flex-col"
            )}>
              {/* Desktop Control Panel - Fixed positioning and z-index */}
              {!isMobile && (
                <div className="flex-shrink-0 mb-6 z-20">
                  <div className="container mx-auto px-4">
                    <div className="glass-panel cosmic-card p-6 max-w-4xl">
                      <ControlPanel
                        audioSettings={audioSettings}
                        onTogglePlay={handleTogglePlay}
                        onVolumeChange={handleVolumeChange}
                        onTempoChange={handleTempoChange}
                        speedMultiplier={speedMultiplier}
                        onSpeedChange={handleSpeedChange}
                        audioReady={audioReady}
                        audioStatus={audioStatus}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Main Content Area - Fixed flex layout */}
              <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Visualization Area - Center with proper constraints */}
                <div className={cn(
                  "flex-1 flex items-center justify-center relative z-10 min-h-[60vh] lg:min-h-[70vh]",
                  "overflow-hidden"
                )}>
                  <div className={cn(
                    "w-full h-full flex items-center justify-center transition-transform duration-300",
                    "container mx-auto px-4"
                  )}>
                    <SolarSystemVisualization
                      width={isMobile 
                        ? Math.min(window.innerWidth - 32, 600) 
                        : orientation === 'portrait' ? 700 : 900}
                      height={isMobile 
                        ? Math.min(window.innerHeight - 280, 450) 
                        : orientation === 'portrait' ? 500 : 600}
                      onPlanetClick={handlePlanetClick}
                      selectedPlanet={selectedPlanet}
                      speedMultiplier={speedMultiplier}
                      isPlaying={audioSettings.isPlaying}
                    />
                  </div>
                </div>
                
                {/* Desktop Planet Info Panel - Fixed positioning */}
                {!isMobile && selectedPlanet && (
                  <div className="lg:w-96 flex-shrink-0 z-20">
                    <div className="glass-panel cosmic-card p-4 h-full overflow-hidden">
                      <PlanetInfoPanel
                        planet={selectedPlanet}
                        onClose={handleClosePlanetInfo}
                      />
                    </div>
                  </div>
                )}
              </div>
            </main>


            {/* Mobile Slide-up Control Panel */}
            <SlideUpDrawer
              isOpen={showMobileControls}
              onClose={() => setShowMobileControls(false)}
              title="Mission Control"
              maxHeight="70vh"
            >
              <MobileControlPanel
                audioSettings={audioSettings}
                onTogglePlay={handleTogglePlay}
                onVolumeChange={handleVolumeChange}
                onTempoChange={handleTempoChange}
                speedMultiplier={speedMultiplier}
                onSpeedChange={handleSpeedChange}
                audioReady={audioReady}
                audioStatus={audioStatus}
                planets={PLANETS}
                onPlanetMute={handlePlanetMute}
              />
            </SlideUpDrawer>

            {/* Mobile Planet Info Panel */}
            {showPlanetInfo && selectedPlanet && (
              <MobilePlanetInfoPanel
                planet={selectedPlanet}
                onClose={handleClosePlanetInfo}
              />
            )}

            {/* Footer */}
            <footer className="relative p-4 text-center text-gray-400 text-xs z-5 mt-auto">
              <p>
                Built with Next.js, D3.js, and Tone.js • 
                Orbital data based on NASA planetary fact sheets • 
                Click planets to explore, adjust controls to customize your experience
              </p>
            </footer>

          </div>
        )}
    </>
  );
}
