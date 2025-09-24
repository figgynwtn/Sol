'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioEngine } from '@/lib/audioEngine';
import { AudioSettings } from '@/types';

interface UseAudioEngineReturn {
  audioSettings: AudioSettings;
  speedMultiplier: number;
  isInitialized: boolean;
  handleTogglePlay: () => Promise<void>;
  handleVolumeChange: (volume: number) => void;
  handleTempoChange: (tempo: number) => void;
  handleSpeedChange: (speed: number) => void;
  handlePlanetMute: (planetId: string, isMuted: boolean) => void;
  handleGlobalMute: (isMuted: boolean) => void;
}

export function useAudioEngine(): UseAudioEngineReturn {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    isPlaying: false,
    volume: 0.7,
    tempo: 120,
    scale: ['C', 'D', 'E', 'G', 'A']
  });
  
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1000);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const audioEngine = getAudioEngine();
  
  // Listen to audio engine state changes
  useEffect(() => {
    const handleStateChange = (state: any) => {
      if (state.isInitialized && !isInitialized) {
        setIsInitialized(true);
        console.log('🎵 Audio engine initialized - hook updated');
      }
      
      // Always sync playing state from audio engine to hook state
      setAudioSettings(prev => ({
        ...prev,
        isPlaying: state.isPlaying
      }));
      console.log('🔄 Synced playing state from audio engine:', state.isPlaying);
    };
    
    audioEngine.onStateChange(handleStateChange);
    
    return () => {
      audioEngine.offStateChange(handleStateChange);
    };
  }, [audioEngine, isInitialized]);
  
  // Debounce refs for smooth performance
  const volumeDebounceRef = useRef<NodeJS.Timeout>();
  const tempoDebounceRef = useRef<NodeJS.Timeout>();
  const speedDebounceRef = useRef<NodeJS.Timeout>();

  // Initialize audio settings
  useEffect(() => {
    audioEngine.setMasterVolume(audioSettings.volume);
    audioEngine.setTempo(audioSettings.tempo);
  }, [audioEngine, audioSettings.volume, audioSettings.tempo]);

  // Handle speed changes with debouncing
  useEffect(() => {
    if (speedDebounceRef.current) {
      clearTimeout(speedDebounceRef.current);
    }

    speedDebounceRef.current = setTimeout(() => {
      if (isInitialized && audioSettings.isPlaying) {
        audioEngine.setTimeMultiplier(speedMultiplier);
      }
    }, 100); // 100ms debounce

    return () => {
      if (speedDebounceRef.current) {
        clearTimeout(speedDebounceRef.current);
      }
    };
  }, [speedMultiplier, isInitialized, audioSettings.isPlaying, audioEngine]);

  // Handle audio play/pause with initialization if needed
  const handleTogglePlay = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      console.log('🎵 Audio not initialized - attempting to initialize now');
      try {
        // Import Tone.js dynamically
        const toneModule = await import('tone');
        const Tone = toneModule as any;
        
        // Try to start audio context
        if (typeof Tone.start === 'function') {
          await Tone.start();
        }
        
        // Initialize audio engine
        audioEngine.setToneReference(Tone);
        await audioEngine.initialize();
        
        console.log('✅ Audio initialized successfully from main page');
        // Note: isInitialized will be updated via the state change listener
      } catch (error) {
        console.error('❌ Failed to initialize audio from main page:', error);
        return;
      }
    }
    
    try {
      if (audioSettings.isPlaying) {
        audioEngine.stop();
        console.log('🔇 Audio stopped');
      } else {
        await audioEngine.start();
        console.log('🎵 Audio started');
      }
      // Note: State update is now handled by the audio engine state change listener
    } catch (error) {
      console.error('Failed to toggle audio playback:', error);
    }
  }, [audioSettings.isPlaying, isInitialized, audioEngine]);

  // Handle volume change with debouncing
  const handleVolumeChange = useCallback((volume: number): void => {
    setAudioSettings(prev => ({ ...prev, volume }));
    
    if (volumeDebounceRef.current) {
      clearTimeout(volumeDebounceRef.current);
    }

    volumeDebounceRef.current = setTimeout(() => {
      audioEngine.setMasterVolume(volume);
    }, 50); // 50ms debounce for smooth volume changes
  }, [audioEngine]);

  // Handle tempo change with debouncing
  const handleTempoChange = useCallback((tempo: number): void => {
    setAudioSettings(prev => ({ ...prev, tempo }));
    
    if (tempoDebounceRef.current) {
      clearTimeout(tempoDebounceRef.current);
    }

    tempoDebounceRef.current = setTimeout(() => {
      audioEngine.setTempo(tempo);
    }, 100); // 100ms debounce for tempo changes
  }, [audioEngine]);

  // Handle speed multiplier change
  const handleSpeedChange = useCallback((speed: number): void => {
    setSpeedMultiplier(speed);
  }, []);

  // Handle planet mute/unmute
  const handlePlanetMute = useCallback((planetId: string, isMuted: boolean): void => {
    if (isMuted) {
      audioEngine.setPlanetVolume(planetId, -Infinity); // Mute
    } else {
      audioEngine.setPlanetVolume(planetId, 0.3); // Unmute
    }
  }, [audioEngine]);

  // Handle global mute/unmute
  const handleGlobalMute = useCallback((isMuted: boolean): void => {
    console.log('🎵 Setting global mute to:', isMuted);
    audioEngine.setGlobalMute(isMuted);
  }, [audioEngine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (volumeDebounceRef.current) {
        clearTimeout(volumeDebounceRef.current);
      }
      if (tempoDebounceRef.current) {
        clearTimeout(tempoDebounceRef.current);
      }
      if (speedDebounceRef.current) {
        clearTimeout(speedDebounceRef.current);
      }
    };
  }, []);

  return {
    audioSettings,
    speedMultiplier,
    isInitialized,
    handleTogglePlay,
    handleVolumeChange,
    handleTempoChange,
    handleSpeedChange,
    handlePlanetMute,
    handleGlobalMute
  };
}
