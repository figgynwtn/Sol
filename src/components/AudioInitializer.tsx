'use client';

import React, { useState, useEffect } from 'react';
import { getAudioEngine } from '@/lib/audioEngine';

// Tone.js will be imported dynamically
let Tone: any;

export type AudioStatus = 'uninitialized' | 'initializing' | 'ready' | 'playing' | 'paused' | 'error';

interface AudioInitializerProps {
  onAudioReady: () => void;
  onAudioStateChange: (status: AudioStatus) => void;
  children: React.ReactNode;
}

export default function AudioInitializer({ 
  onAudioReady, 
  onAudioStateChange, 
  children 
}: AudioInitializerProps) {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('uninitialized');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showButton, setShowButton] = useState(true);

  const audioEngine = getAudioEngine();

  useEffect(() => {
    // Check if audio context is already available
    checkAudioContext();
  }, []);

  useEffect(() => {
    // Notify parent of state changes
    onAudioStateChange(audioStatus);
  }, [audioStatus, onAudioStateChange]);

  const checkAudioContext = () => {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('Web Audio API is not supported in this browser');
      }

      console.log('🔍 Web Audio API is supported');
      
      // Check if Tone.js is available (will be loaded dynamically)
      if (!Tone) {
        console.log('🔍 Tone.js not yet loaded, will load on user interaction');
        return;
      }

      console.log('🔍 Tone.js is available');
      console.log('🔍 Tone.js version:', Tone.version);
      
      // Check if audio context is already running
      if (Tone.context && Tone.context.state === 'running') {
        console.log('🔍 Audio context is already running');
        setAudioStatus('ready');
        setShowButton(false);
        onAudioReady();
      }
    } catch (error) {
      console.error('❌ Audio context check failed:', error);
      setAudioStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const initializeAudio = async () => {
    try {
      console.log('🎵 Starting audio initialization...');
      setAudioStatus('initializing');
      setErrorMessage('');

      // Dynamically import Tone.js
      console.log('🔍 Loading Tone.js...');
      
      // Try different Tone.js import approaches
      console.log('🔍 Attempting Tone.js import...');
      
      // Method 1: Simple Tone.js v14 import
      try {
        console.log('🔍 Attempting simple Tone.js v14 import...');
        
        // Try to import Tone.js with error handling for chunk loading
        let toneModule;
        try {
          toneModule = await import('tone');
          console.log('🔍 Tone.js module imported');
          console.log('🔍 Module keys:', Object.keys(toneModule));
        } catch (importError) {
          console.error('❌ Tone.js chunk import failed:', importError);
          // Try alternative import method
          console.log('🔍 Trying alternative Tone.js import...');
          toneModule = await import('tone/build/Tone');
          console.log('🔍 Tone.js imported via build path');
        }
        
        // Try to use the module directly
        Tone = toneModule as any;
        
        // Check if we have basic functionality
        console.log('🔍 Checking basic functionality...');
        console.log('🔍 Tone.start type:', typeof Tone.start);
        console.log('🔍 Tone.Transport type:', typeof Tone.Transport);
        
        // Try to start Tone.js context first
        if (typeof Tone.start === 'function') {
          console.log('🔍 Starting Tone.js context...');
          await Tone.start();
          console.log('✅ Tone.js context started successfully');
        } else {
          console.log('❌ Tone.start is not a function');
        }
        
        console.log('🔍 Tone.js imported successfully');
        if (Tone.version) {
          console.log('🔍 Tone.js version:', Tone.version);
        } else {
          console.log('🔍 Tone.js version: not available');
        }
        
        // Debug the complete Tone.js structure
        console.log('🔍 Complete Tone.js structure:');
        Object.keys(Tone).forEach(key => {
          console.log(`  - ${key}: ${typeof Tone[key]}`);
          if (typeof Tone[key] === 'object' && Tone[key] !== null) {
            console.log(`    Properties: ${Object.keys(Tone[key])}`);
          }
        });
        
        // Check for common Tone.js v14 patterns
        console.log('🔍 Checking for Tone.js v14 patterns...');
        
        // Check if there's a default export
        if (Tone.default) {
          console.log('🔍 Found default export:', typeof Tone.default);
          console.log('🔍 Default export keys:', Object.keys(Tone.default));
        }
        
        // Check if there are sub-modules
        if (Tone.Component) {
          console.log('🔍 Found Component module:', Object.keys(Tone.Component));
        }
        if (Tone.Effect) {
          console.log('🔍 Found Effect module:', Object.keys(Tone.Effect));
        }
        if (Tone.Instrument) {
          console.log('🔍 Found Instrument module:', Object.keys(Tone.Instrument));
        }
        if (Tone.Signal) {
          console.log('🔍 Found Signal module:', Object.keys(Tone.Signal));
        }
        
        // Try to find Volume in different locations
        const volumeLocations = [
          'Volume',
          'Component.Volume',
          'Effect.Volume',
          'Signal.Volume',
          'default.Volume',
          'default.Component.Volume',
          'default.Effect.Volume'
        ];
        
        volumeLocations.forEach(location => {
          try {
            const parts = location.split('.');
            let obj = Tone;
            for (const part of parts) {
              obj = obj[part];
            }
            if (obj && typeof obj === 'function') {
              console.log(`✅ Found Volume at ${location}`);
            }
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Try different methods to start the audio context
        console.log('🔍 Attempting to start audio context...');
        let contextStarted = false;
        
        // Method 1: Try Tone.start()
        if (typeof Tone.start === 'function') {
          try {
            await Tone.start();
            contextStarted = true;
            console.log('✅ Tone.js context started via Tone.start()');
          } catch (e) {
            console.log('❌ Tone.start() failed:', e);
          }
        }
        
        // Method 2: Try context.resume()
        if (!contextStarted && Tone.context) {
          try {
            await Tone.context.resume();
            contextStarted = true;
            console.log('✅ Tone.js context started via Tone.context.resume()');
          } catch (e) {
            console.log('❌ Tone.context.resume() failed:', e);
          }
        }
        
        // Method 3: Try creating a new context
        if (!contextStarted) {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            await audioContext.resume();
            contextStarted = true;
            console.log('✅ Audio context started via native Web Audio API');
          } catch (e) {
            console.log('❌ Native Web Audio API failed:', e);
          }
        }
        
        if (!contextStarted) {
          throw new Error('Failed to start audio context with all available methods');
        }
        
        // Check context state
        if (Tone.context && Tone.context.state !== 'running') {
          console.log('🔍 Resuming suspended audio context...');
          await Tone.context.resume();
          console.log('✅ Audio context resumed successfully');
        }

        // Initialize our audio engine
        console.log('🔍 Setting Tone.js reference in audio engine...');
        audioEngine.setToneReference(Tone);
        
        console.log('🔍 Initializing Celestial Audio Engine...');
        await audioEngine.initialize();
        console.log('✅ Celestial Audio Engine initialized successfully');

        // Set up audio engine event listeners
        setupAudioEngineListeners();

        // Update state
        setAudioStatus('ready');
        setShowButton(false);
        
        // Notify parent
        onAudioReady();
        
        console.log('🎉 Audio initialization completed successfully');

      } catch (error) {
        console.error('❌ Audio initialization failed:', error);
        setAudioStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        
        // Show the button again for retry
        setShowButton(true);
      }
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      setAudioStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      
      // Show the button again for retry
      setShowButton(true);
    }
  };

  const setupAudioEngineListeners = () => {
    // Listen for audio state changes
    audioEngine.onStateChange((state) => {
      console.log('🔊 Audio state changed:', state);
      
      if (state.hasError) {
        setAudioStatus('error');
        setErrorMessage(state.error?.message || 'Unknown audio error');
      } else if (state.isPlaying) {
        setAudioStatus('playing');
      } else if (state.isInitialized && !state.isPlaying) {
        setAudioStatus('paused');
      }
    });

    // Listen for audio errors
    audioEngine.onError((error) => {
      console.error('❌ Audio error:', error);
      setAudioStatus('error');
      setErrorMessage(error.message);
    });
  };

  const retryInitialization = () => {
    setErrorMessage('');
    initializeAudio();
  };

  const getStatusColor = () => {
    switch (audioStatus) {
      case 'uninitialized': return 'text-gray-400';
      case 'initializing': return 'text-blue-400';
      case 'ready': return 'text-green-400';
      case 'playing': return 'text-purple-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (audioStatus) {
      case 'uninitialized': return '🔇';
      case 'initializing': return '⏳';
      case 'ready': return '✅';
      case 'playing': return '🎵';
      case 'paused': return '⏸️';
      case 'error': return '❌';
      default: return '🔇';
    }
  };

  const getStatusText = () => {
    switch (audioStatus) {
      case 'uninitialized': return 'Audio Not Initialized';
      case 'initializing': return 'Initializing Audio...';
      case 'ready': return 'Audio Ready';
      case 'playing': return 'Playing';
      case 'paused': return 'Paused';
      case 'error': return 'Audio Error';
      default: return 'Unknown Status';
    }
  };

  // Show initialization UI if audio is not ready
  if (showButton || audioStatus === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center border border-purple-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-2">
              {getStatusIcon()} Audio Setup
            </h2>
            <p className={`text-lg ${getStatusColor()} mb-4`}>
              {getStatusText()}
            </p>
            
            {errorMessage && (
              <div className="bg-red-900 border border-red-500 rounded p-3 mb-4">
                <p className="text-red-300 text-sm">
                  Error: {errorMessage}
                </p>
              </div>
            )}
          </div>

          {showButton && (
            <div className="space-y-4">
              <button
                onClick={initializeAudio}
                disabled={audioStatus === 'initializing'}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  audioStatus === 'initializing'
                    ? 'bg-blue-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 transform hover:scale-105'
                }`}
              >
                {audioStatus === 'initializing' ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Initializing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    🎵 Click to Start Audio
                  </span>
                )}
              </button>

              {audioStatus === 'error' && (
                <button
                  onClick={retryInitialization}
                  className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm"
                >
                  🔄 Retry Initialization
                </button>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-400">
            <p className="mb-2">
              <strong>Why is this needed?</strong>
            </p>
            <p className="text-xs leading-relaxed">
              Modern browsers require user interaction before playing audio to prevent 
              unwanted autoplay. Clicking this button initializes the audio system 
              and allows the celestial symphony to play.
            </p>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>
              <strong>Browser Support:</strong> Chrome, Firefox, Safari, Edge
            </p>
            <p>
              <strong>Requirements:</strong> Web Audio API, Tone.js
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show children content when audio is ready
  return <>{children}</>;
}
