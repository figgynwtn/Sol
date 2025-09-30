'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import SolarSystemVisualization from '@/components/SolarSystemVisualization';
import ControlPanel from '@/components/ControlPanel';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import LoadingAnimation from '@/components/LoadingAnimation';
import AudioDebugPanel from '@/components/AudioDebugPanel';
import MobilePlanetInfoPanel from '@/components/MobilePlanetInfoPanel';
import { Planet } from '@/data/planets';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useGestures, useIsMobile, useOrientation } from '@/hooks/useGestures';
import { PLANETS } from '@/lib/planets-data';
import { cn } from '@/lib/utils';
import type { AudioStatus, SoundPreference } from '@/types';

export default function HomePage() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('uninitialized');
  const [audioReady, setAudioReady] = useState(false);
  const [showPlanetInfo, setShowPlanetInfo] = useState(false);
  const [visualizationScale, setVisualizationScale] = useState(1);
  const [soundPreference, setSoundPreference] = useState<SoundPreference>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const [leftPanelHeight, setLeftPanelHeight] = useState<number | undefined>(undefined);
  const [rightPanelWidth, setRightPanelWidth] = useState<number | undefined>(undefined);
  
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
    handlePlanetMute,
    handleGlobalMute
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

  // Initialize global mute state on component mount
  useEffect(() => {
    // Start with global mute enabled (no sound) until user makes a preference
    console.log('🎵 Initializing with global mute enabled');
    handleGlobalMute(true);
  }, [handleGlobalMute]);

  // Handle loading completion
  const handleLoadingComplete = () => {
    console.log('📊 Loading animation completed - hiding loading screen');
    setShowLoading(false);
  };

  const handleProceedWithoutAudio = () => {
    setShowLoading(false);
  };

  // Handle sound preference change from loading animation
  const handleSoundPreferenceChange = (preference: 'enabled' | 'disabled') => {
    console.log('🎵 Sound preference changed to:', preference);
    setSoundPreference(preference);
    
    // Set global mute state immediately
    const isMuted = preference === 'disabled';
    handleGlobalMute(isMuted);
    
    console.log('🎵 Global mute set to:', isMuted);
  };

  // Handle sound toggle from control panel
  const handleToggleSound = () => {
    const newPreference = soundPreference === 'enabled' ? 'disabled' : 'enabled';
    console.log('🎵 Toggling sound from', soundPreference, 'to', newPreference);
    setSoundPreference(newPreference);
    
    // Set global mute state immediately
    const isMuted = newPreference === 'disabled';
    handleGlobalMute(isMuted);
    
    // If enabling sound, we might need to initialize audio
    if (newPreference === 'enabled' && !audioReady) {
      // Audio initialization will be handled by the existing audio engine logic
      console.log('🎵 Sound enabled - audio will be initialized when ready');
    } else if (newPreference === 'disabled') {
      // If disabling sound, stop any playing audio
      if (audioSettings.isPlaying) {
        handleTogglePlay();
      }
      console.log('🎵 Sound disabled - stopping any playing audio');
    }
    
    console.log('🎵 Global mute set to:', isMuted);
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
    setShowPlanetInfo(true);
  };

  // Close planet info panel
  const handleClosePlanetInfo = (): void => {
    setSelectedPlanet(null);
    setShowPlanetInfo(false);
  };

  // Gesture handlers
  const handleSwipeUp = () => {
    // Handle swipe up gesture
  };

  const handleSwipeDown = () => {
    // Handle swipe down gesture
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

  // Observe Mission Control (left panel) height and sync planet map height to match (desktop only)
  useLayoutEffect(() => {
    const leftEl = leftPanelRef.current;
    if (!leftEl) {
      console.log('🔍 DEBUG: Left panel ref not found');
      return;
    }
    
    const measureHeight = () => {
      const rect = leftEl.getBoundingClientRect();
      const styles = window.getComputedStyle(leftEl);
      
      // Calculate total height including borders
      const borderTop = parseFloat(styles.borderTopWidth) || 0;
      const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
      const paddingTop = parseFloat(styles.paddingTop) || 0;
      const paddingBottom = parseFloat(styles.paddingBottom) || 0;
      
      // Use the full visible height
      const h = Math.round(rect.height);
      
      console.log('🔍 DEBUG: Measuring left panel:', {
        rectHeight: rect.height,
        clientHeight: leftEl.clientHeight,
        offsetHeight: leftEl.offsetHeight,
        scrollHeight: leftEl.scrollHeight,
        borderTop,
        borderBottom,
        paddingTop,
        paddingBottom,
        finalHeight: h
      });
      
      if (h > 0) {
        setLeftPanelHeight(h);
      }
    };
    
    // Initial measurement after a short delay to ensure DOM is ready
    setTimeout(measureHeight, 100);
    
    // Set up observer
    const ro = new ResizeObserver(() => {
      measureHeight();
    });
    
    ro.observe(leftEl);
    
    // Also measure on window resize as a fallback
    window.addEventListener('resize', measureHeight);
    
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureHeight);
    };
  }, [isMobile]);

  // Debug: Log when leftPanelHeight changes
  useEffect(() => {
    console.log('🔍 DEBUG: Left panel height changed:', leftPanelHeight);
    console.log('🔍 DEBUG: Right panel height being applied:', !isMobile ? leftPanelHeight : 'mobile');
  }, [leftPanelHeight, isMobile]);
  useLayoutEffect(() => {
    const rightEl = rightPanelRef.current;
    if (!rightEl) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        setRightPanelWidth(w > 0 ? w : undefined);
      }
    });
    ro.observe(rightEl);
    // Initialize immediately
    setRightPanelWidth(Math.round(rightEl.getBoundingClientRect().width) || undefined);
    return () => ro.disconnect();
  }, [isMobile]);

  return (
    <>
      {/* Show loading animation on page load */}
      {showLoading && (
        <LoadingAnimation 
          onComplete={handleLoadingComplete} 
          onAudioReady={handleAudioReady}
          onProceedWithoutAudio={handleProceedWithoutAudio}
          onSoundPreferenceChange={handleSoundPreferenceChange}
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
              <div className="glass-panel p-4 sm:p-6 w-full sm:max-w-6xl sm:mx-auto">
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

            {/* Main Content - Responsive layout */}
            <main className={cn(
              "relative flex-1 overflow-hidden",
              "p-4 md:p-6"
            )}>
              {/* Desktop Layout - Side by side */}
              {!isMobile && (
                <>
                  <div className="flex flex-row gap-6 h-full items-stretch">
                  {/* Mission Control - Left side (40%) */}
                  <div ref={leftPanelRef} className="w-[40%] flex-shrink-0 relative z-10 h-full glass-panel p-4 sm:p-6 overflow-y-auto">
                      <ControlPanel
                        audioSettings={audioSettings}
                        onTogglePlay={handleTogglePlay}
                        onVolumeChange={handleVolumeChange}
                        onTempoChange={handleTempoChange}
                        speedMultiplier={speedMultiplier}
                        onSpeedChange={handleSpeedChange}
                        audioReady={audioReady}
                        audioStatus={audioStatus}
                        soundPreference={soundPreference}
                        onToggleSound={handleToggleSound}
                      />
                  </div>
                  
                  {/* Planet Map - Right side (60%) */}
                  <div ref={rightPanelRef} className="flex-1 relative z-10 rounded-2xl" style={{ height: !isMobile ? leftPanelHeight : undefined }}>
                    <div className="w-full h-full" style={{ height: !isMobile ? leftPanelHeight : undefined }}>
                      <SolarSystemVisualization
                        width='100%'
                        height='100%'
                        onPlanetClick={handlePlanetClick}
                        selectedPlanet={selectedPlanet}
                        speedMultiplier={speedMultiplier}
                        isPlaying={audioSettings.isPlaying}
                      />
                    </div>
                  </div>
                  
                  {/* Desktop Planet Info Panel - Overlay on planet map */}
                  {selectedPlanet && !isMobile && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <PlanetInfoPanel
                        planet={selectedPlanet}
                        onClose={() => setSelectedPlanet(null)}
                      />
                    </div>
                  )}
                </div>
              </> 
              )}
              
              {/* Mobile Layout - Mission Control and Planet Map */}
              {isMobile && (
                <div className="flex flex-col gap-4 md:gap-6">
                  {/* Mission Control - Top section */}
                  <div className="relative z-10 glass-panel p-4 sm:p-6 w-full">
                      <ControlPanel
                        audioSettings={audioSettings}
                        onTogglePlay={handleTogglePlay}
                        onVolumeChange={handleVolumeChange}
                        onTempoChange={handleTempoChange}
                        speedMultiplier={speedMultiplier}
                        onSpeedChange={handleSpeedChange}
                        audioReady={audioReady}
                        audioStatus={audioStatus}
                        soundPreference={soundPreference}
                        onToggleSound={handleToggleSound}
                      />
                  </div>
                  
                  {/* Planet Map - Bottom section */}
                  <div className="flex items-center justify-center relative z-10 min-h-[400px]">
                    <div className="w-full h-full flex items-center justify-center">
                      <SolarSystemVisualization
                        width='100%'
                        height='100%'
                        onPlanetClick={handlePlanetClick}
                        selectedPlanet={selectedPlanet}
                        speedMultiplier={speedMultiplier}
                        isPlaying={audioSettings.isPlaying}
                      />
                    </div>
                  </div>
                </div>
              )}
            </main>



            {/* Mobile Planet Info Panel */}
            {showPlanetInfo && selectedPlanet && (
              <MobilePlanetInfoPanel
                planet={selectedPlanet}
                onClose={handleClosePlanetInfo}
              />
            )}

            {/* Footer */}
            <footer className="relative p-4 text-center text-gray-400 text-xs z-5 mt-auto w-full">
              <p className="w-full sm:max-w-6xl sm:mx-auto">
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
