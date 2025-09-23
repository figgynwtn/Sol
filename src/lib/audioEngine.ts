import { Planet } from '@/data/planets';
import { calculateOrbitalVelocity } from './orbital-mechanics';
import { PLANETS } from '@/data/planets';

// Tone.js will be imported dynamically
let Tone: any;

export interface AudioSettings {
  isPlaying: boolean;
  volume: number;
  tempo: number;
}

export interface PlanetAudioState {
  isMuted: boolean;
  volume: number;
  frequency: number;
}

export interface AudioError {
  type: 'initialization' | 'playback' | 'context' | 'network' | 'unknown';
  message: string;
  timestamp: number;
  recoverable: boolean;
}

export interface AudioState {
  isInitialized: boolean;
  isPlaying: boolean;
  hasError: boolean;
  error: AudioError | null;
  contextState: 'closed' | 'running' | 'suspended' | 'unknown';
}

export class CelestialAudioEngine {
  private synths: Map<string, any>;
  private loops: Map<string, any>;
  private tremolos: Map<string, any>;
  private isInitialized: boolean;
  private masterVolume: any;
  private reverb: any;
  private compressor: any;
  private eq3: any;
  private limiter: any;
  private audioContext: any;
  private scheduledEvents: Set<NodeJS.Timeout>;
  private planetStates: Map<string, PlanetAudioState>;
  private settings: AudioSettings;
  private timeMultiplier: number;
  private audioState: AudioState;
  private errorCallbacks: Set<(error: AudioError) => void>;
  
  // Tone.js constructor references
  private VolumeConstructor: any;
  private ReverbConstructor: any;
  private CompressorConstructor: any;
  private EQ3Constructor: any;
  private LimiterConstructor: any;
  private SynthConstructor: any;
  private stateChangeCallbacks: Set<(state: AudioState) => void>;
  private maxRetries: number;
  private retryCount: number;

  constructor() {
    this.synths = new Map();
    this.loops = new Map();
    this.tremolos = new Map();
    this.isInitialized = false;
    this.planetStates = new Map();
    this.timeMultiplier = 1000;
    
    this.settings = {
      isPlaying: false,
      volume: 0.7,
      tempo: 120
    };

    // Create master effects chain - will be initialized in initialize() method
    this.masterVolume = null;
    this.reverb = null;
    this.compressor = null;
    this.eq3 = null;
    this.limiter = null;
    this.audioContext = null;
    this.scheduledEvents = new Set();
    
    // Initialize error handling
    this.audioState = {
      isInitialized: false,
      isPlaying: false,
      hasError: false,
      error: null,
      contextState: 'unknown'
    };
    this.errorCallbacks = new Set();
    this.stateChangeCallbacks = new Set();
    this.maxRetries = 3;
    this.retryCount = 0;
  }

  /**
   * Set the Tone.js reference from external source
   */
  setToneReference(toneRef: any): void {
    Tone = toneRef;
    console.log('🔍 Tone.js reference set from external source');
    if (Tone.version) {
      console.log('🔍 Tone.js version:', Tone.version);
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Celestial Audio Engine with Tone.js...');
      
      // Use Tone.js reference if already set, otherwise import it
      if (!Tone) {
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
                if (obj && obj[part]) {
                  obj = obj[part];
                } else {
                  obj = null;
                  break;
                }
              }
              if (obj && typeof obj === 'function') {
                console.log(`✅ Found Volume constructor at: Tone.${location}`);
                this.VolumeConstructor = obj;
              } else if (obj && typeof obj === 'object') {
                console.log(`🔍 Found Volume object at: Tone.${location}`, Object.keys(obj));
              }
            } catch (e) {
              // Ignore errors
            }
          });
          
        } catch (e) {
          console.error('❌ All Tone.js import methods failed:', e);
          console.log('🔍 Continuing without audio - solar system will work but without sound');
          
          // Set up a dummy audio engine that doesn't produce sound but doesn't break the app
          Tone = {
            start: async () => console.log('🔤 Dummy audio start called'),
            Transport: {
              bpm: { value: 120 },
              start: () => console.log('🔤 Dummy Transport start called'),
              stop: () => console.log('🔤 Dummy Transport stop called'),
              cancel: () => console.log('🔤 Dummy Transport cancel called')
            },
            context: {
              rawContext: null
            },
            getContext: () => ({ rawContext: null }),
            version: 'dummy'
          } as any;
          
          // Set basic initialization state
          this.isInitialized = true;
          this.audioState = {
            isInitialized: true,
            isPlaying: false,
            hasError: true,
            error: {
              type: 'initialization',
              message: 'Audio failed to load, continuing without sound',
              timestamp: Date.now(),
              recoverable: false
            },
            contextState: 'unknown'
          };
          
          return; // Skip the rest of initialization
        }
      }
      
      console.log('🔍 Tone.js version:', Tone.version);
      console.log('🔍 Available Tone constructors:', Object.keys(Tone).filter(key => typeof Tone[key] === 'function'));
      console.log('🔍 All Tone properties:', Object.keys(Tone));
      console.log('🔍 Tone.Volume type:', typeof Tone.Volume);
      console.log('🔍 Tone.Reverb type:', typeof Tone.Reverb);
      console.log('🔍 Tone.Synth type:', typeof Tone.Synth);
      
      // Start with basic Tone.js functionality - skip effects for now
      console.log('🔍 Skipping effects creation for now, focusing on basic functionality...');
      
      // Create a simple gain node as master volume using Web Audio API directly
      try {
        console.log('🔍 Creating basic gain node for volume control...');
        let audioContext;
        
        // Try to get audio context from Tone.js
        if (Tone && Tone.getContext && typeof Tone.getContext === 'function') {
          audioContext = Tone.getContext().rawContext;
          console.log('✅ Got audio context from Tone.js');
        } else if (Tone && Tone.context && Tone.context.rawContext) {
          audioContext = Tone.context.rawContext;
          console.log('✅ Got audio context from Tone.context');
        } else {
          // Fallback: create our own audio context
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('✅ Created fallback audio context');
        }
        
        this.masterVolume = audioContext.createGain();
        this.masterVolume.gain.value = 0.3; // -10dB approximately
        this.masterVolume.connect(audioContext.destination);
        this.audioContext = audioContext;
        console.log('✅ Basic gain node created successfully');
      } catch (e) {
        console.log('❌ Basic gain node creation failed:', e);
        throw new Error(`Failed to create basic gain node: ${e}`);
      }
      
      // Set other effects to null for now
      this.reverb = null;
      this.compressor = null;
      this.eq3 = null;
      this.limiter = null;
      
      // No effects chain to connect since we're using basic gain node directly connected to destination
      
      // Set up Transport with null checks
      try {
        console.log('🔍 Setting up Transport...');
        if (Tone.Transport && Tone.Transport.bpm) {
          Tone.Transport.bpm.value = this.settings.tempo;
          console.log('✅ Transport BPM set successfully');
        } else {
          console.log('⚠️ Tone.Transport not available, skipping Transport setup');
        }
      } catch (e) {
        console.log('❌ Transport setup failed:', e);
        // Don't throw here, Transport is not critical for basic functionality
      }
      
      // Store audio context reference
      try {
        if (Tone.context && Tone.context.rawContext) {
          this.audioContext = Tone.context.rawContext;
          console.log('✅ Audio context reference stored');
        } else {
          console.log('⚠️ Tone.context not available, using fallback context');
          // We already created a fallback context earlier
        }
      } catch (e) {
        console.log('❌ Audio context reference storage failed:', e);
      }
      
      this.isInitialized = true;
      this.audioState.isInitialized = true;
      this.updateContextState();
      this.clearError(); // Clear any previous errors
      console.log('🎵 Celestial Audio Engine initialized successfully');
    } catch (error) {
      const audioError: AudioError = {
        type: 'initialization',
        message: error instanceof Error ? error.message : 'Unknown initialization error',
        timestamp: Date.now(),
        recoverable: true
      };
      
      console.error('Failed to initialize audio engine:', error);
      this.reportError(audioError);
      
      // Attempt recovery
      const recovered = await this.attemptRecovery(audioError);
      if (!recovered) {
        throw error;
      }
    }
  }

  /**
   * Map planetary distance to frequency using inverse relationship
   * Closer planets = higher frequencies (200-800Hz range)
   */
  private mapDistanceToFrequency(distanceFromSun: number): number {
    // Inverse mapping: closer planets get higher frequencies
    const minDistance = 0.39; // Mercury
    const maxDistance = 39.48; // Neptune
    
    // Inverse relationship with some logarithmic scaling
    const normalizedDistance = (distanceFromSun - minDistance) / (maxDistance - minDistance);
    const inverseFactor = 1 - normalizedDistance;
    
    // Map to frequency range (200Hz to 800Hz)
    const minFreq = 200;
    const maxFreq = 800;
    
    // Apply logarithmic scaling for more musical results
    const frequency = minFreq + (maxFreq - minFreq) * Math.pow(inverseFactor, 0.7);
    
    return Math.round(frequency * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Create a unique synth for each planet with celestial characteristics
   */
  private createPlanetSynth(planet: Planet): any {
    try {
      if (!Tone) {
        throw new Error('Tone.js is not available');
      }
      
      const frequency = this.mapDistanceToFrequency(planet.distanceFromSun);
      
      // Different oscillator types based on planet characteristics
      let oscillatorType: any = 'sine';
      if (planet.distanceFromSun < 1) {
        oscillatorType = 'triangle'; // Inner planets: softer, warmer
      } else if (planet.distanceFromSun > 10) {
        oscillatorType = 'square'; // Outer planets: more complex, alien
      } else {
        oscillatorType = 'sawtooth'; // Middle planets: balanced
      }
      
      // Create basic synth using Web Audio API or Tone.js if available
      let synth;
      try {
        console.log('🔍 Creating synth for planet:', planet.name);
        
        // Try to use Tone.js Synth if available
        if (Tone.Synth && typeof Tone.Synth === 'function') {
          synth = new Tone.Synth({
            oscillator: {
              type: oscillatorType
            },
            envelope: {
              attack: this.calculateAttackTime(planet),
              decay: 0.1,
              sustain: 0.3,
              release: this.calculateReleaseTime(planet)
            }
          });
          console.log('✅ Tone.js Synth created successfully for planet:', planet.name);
        } else {
          // Fallback: create basic oscillator using Web Audio API
          console.log('🔍 Tone.js Synth not available, using Web Audio API fallback...');
          const audioContext = this.audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = oscillatorType;
          oscillator.frequency.value = frequency;
          
          // Basic envelope simulation
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + this.calculateAttackTime(planet));
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + this.calculateAttackTime(planet) + 0.1);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.masterVolume);
          
          synth = {
            oscillator: oscillator,
            gainNode: gainNode,
            connect: (destination: any) => {
              gainNode.connect(destination);
            },
            toDestination: () => {
              gainNode.connect(this.masterVolume);
            },
            start: (time?: number) => {
              oscillator.start(time || audioContext.currentTime);
            },
            stop: (time?: number) => {
              oscillator.stop(time || audioContext.currentTime);
            }
          };
          
          console.log('✅ Web Audio API fallback synth created successfully for planet:', planet.name);
        }
      } catch (e) {
        console.log('❌ Synth creation failed for planet:', planet.name, e);
        throw new Error(`Failed to create synth for planet ${planet.name}: ${e}`);
      }

      // Create tremolo effect (simplified)
      let tremolo = null;
      try {
        console.log('🔍 Creating tremolo for planet:', planet.name);
        
        // Try to use Tone.js Tremolo if available
        if (Tone.Tremolo && typeof Tone.Tremolo === 'function') {
          tremolo = new Tone.Tremolo({
            frequency: this.calculateTremoloRate(planet),
            depth: 0.3,
            type: 'sine'
          });
          tremolo.start();
          console.log('✅ Tone.js Tremolo created successfully for planet:', planet.name);
          
          // Connect synth -> tremolo -> master volume
          synth.connect(tremolo);
          tremolo.connect(this.masterVolume);
        } else {
          console.log('🔍 Tone.js Tremolo not available, skipping tremolo effect');
          // Connect synth directly to master volume
          synth.connect(this.masterVolume);
        }
      } catch (e) {
        console.log('❌ Tremolo creation failed for planet:', planet.name, e);
        // Fallback: connect synth directly to master volume
        synth.connect(this.masterVolume);
      }

      // Store references
      const synthData = {
        synth,
        tremolo,
        frequency
      };
      
      this.synths.set(planet.id, synthData);
      this.tremolos.set(planet.id, tremolo);

      // Initialize planet state
      this.planetStates.set(planet.id, {
        isMuted: planet.isMuted || false,
        volume: 0.8,
        frequency: frequency
      });

      return synthData;
    } catch (error) {
      console.error(`Error creating synth for planet ${planet.name}:`, error);
      const audioError: AudioError = {
        type: 'initialization',
        message: `Error creating synth for planet ${planet.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Individual planet synth creation errors are not recoverable
      };
      this.reportError(audioError);
      return null;
    }
  }

  /**
   * Calculate attack time based on planet's orbital velocity
   */
  private calculateAttackTime(planet: Planet): number {
    const velocity = calculateOrbitalVelocity(planet);
    return Math.max(0.05, 0.5 - velocity * 0.4); // Faster planets = quicker attack
  }

  /**
   * Calculate release time based on planet's distance from sun
   */
  private calculateReleaseTime(planet: Planet): number {
    return Math.max(1, planet.distanceFromSun * 0.5); // Farther planets = longer release
  }

  /**
   * Calculate tremolo rate based on planet's orbital period
   */
  private calculateTremoloRate(planet: Planet): number {
    // Map orbital period to tremolo frequency (slower planets = slower tremolo)
    return Math.max(0.5, Math.min(8, 365 / planet.orbitalPeriod));
  }

  /**
   * Generate musical pattern based on orbital characteristics
   */
  private generatePlanetPattern(planet: Planet): number[] {
    const velocity = calculateOrbitalVelocity(planet);
    const patternLength = Math.max(4, Math.min(16, Math.floor(planet.orbitalPeriod / 50)));
    
    const pattern: number[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      // Create rhythm based on orbital characteristics
      if (velocity > 0.4) {
        // Fast planets: more frequent notes
        pattern.push(i % 2 === 0 ? 1 : 0);
      } else if (velocity > 0.2) {
        // Medium planets: moderate rhythm
        pattern.push(i % 3 === 0 ? 1 : (i % 3 === 1 ? 0.5 : 0));
      } else {
        // Slow planets: sparse notes
        pattern.push(i % 4 === 0 ? 1 : 0);
      }
    }
    
    return pattern;
  }

  /**
   * Initialize all planets for audio playback
   */
  async initializePlanets(planets: Planet[]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      let successCount = 0;
      planets.forEach(planet => {
        const synth = this.createPlanetSynth(planet);
        if (synth) {
          successCount++;
        }
      });

      if (successCount === 0) {
        throw new Error('Failed to initialize any planet synths');
      }

      console.log(`🪐 ${successCount}/${planets.length} planets initialized for audio playback`);
    } catch (error) {
      console.error('Error initializing planets:', error);
      const audioError: AudioError = {
        type: 'initialization',
        message: `Error initializing planets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: true
      };
      
      this.reportError(audioError);
      
      // Attempt recovery
      const recovered = await this.attemptRecovery(audioError);
      if (!recovered) {
        throw error;
      }
    }
  }

  /**
   * Start the celestial symphony
   */
  async start(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // If we have a dummy audio context (audio failed to load), just update state and return
      if (!this.audioContext && this.audioState.hasError) {
        console.log('🔤 Starting with dummy audio (no sound)');
        this.settings.isPlaying = true;
        this.audioState.isPlaying = true;
        this.updateContextState();
        return;
      }

      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }
      
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          this.updateContextState();
        } catch (contextError) {
          const audioError: AudioError = {
            type: 'context',
            message: `Failed to resume audio context: ${contextError instanceof Error ? contextError.message : 'Unknown error'}`,
            timestamp: Date.now(),
            recoverable: true
          };
          this.reportError(audioError);
          
          // Attempt recovery
          const recovered = await this.attemptRecovery(audioError);
          if (!recovered) {
            throw contextError;
          }
        }
      }

      // Initialize planets if not already done
      if (this.planetStates.size === 0) {
        console.log('🪐 Initializing planets for audio playback...');
        await this.initializePlanets(PLANETS);
      }

      // Start all planet loops
      this.startPlanetLoops();

      this.settings.isPlaying = true;
      this.audioState.isPlaying = true;
      this.updateContextState();
      this.clearError(); // Clear any previous errors
      console.log('🎵 Celestial symphony started');
    } catch (error) {
      const audioError: AudioError = {
        type: 'playback',
        message: error instanceof Error ? error.message : 'Unknown playback error',
        timestamp: Date.now(),
        recoverable: true
      };
      
      console.error('Failed to start audio:', error);
      this.reportError(audioError);
      
      // Attempt recovery
      const recovered = await this.attemptRecovery(audioError);
      if (!recovered) {
        throw error;
      }
    }
  }

  /**
   * Start planet loops using Tone.Transport or Web Audio API scheduling
   */
  private startPlanetLoops(): void {
    // Start Transport if available and not already running
    if (Tone && Tone.Transport) {
      try {
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
          console.log('✅ Transport started successfully');
        }
      } catch (e) {
        console.log('❌ Transport start failed:', e);
      }
    } else {
      console.log('🔍 Using Web Audio API scheduling (Tone.Transport not available)');
    }
    
    // Schedule all planets
    this.planetStates.forEach((state, planetId) => {
      if (!state.isMuted) {
        this.schedulePlanet(planetId);
      }
    });
  }

  /**
   * Stop planet loops using Tone.Transport or Web Audio API
   */
  private stopPlanetLoops(): void {
    // Stop all planet loops
    this.loops.forEach((loop, planetId) => {
      if (loop) {
        try {
          if (loop.dispose) {
            // Tone.js loop
            loop.dispose();
          } else if (loop.stop) {
            // Web Audio API loop
            loop.stop();
          }
          console.log(`✅ Stopped loop for planet ${planetId}`);
        } catch (e) {
          console.log('❌ Loop stop failed for planet:', planetId, e);
        }
      }
    });
    
    // Clear the loops map
    this.loops.clear();
    
    // Stop Transport if it's running
    if (Tone && Tone.Transport) {
      try {
        if (Tone.Transport.state === 'started') {
          Tone.Transport.stop();
          console.log('✅ Transport stopped successfully');
        }
      } catch (e) {
        console.log('❌ Transport stop failed:', e);
      }
    }
  }

  /**
   * Schedule a planet's audio events using Tone.Transport or Web Audio API
   */
  private schedulePlanet(planetId: string): void {
    try {
      if (!this.settings.isPlaying) return;
      
      const synthData = this.synths.get(planetId);
      const state = this.planetStates.get(planetId);
      
      if (!synthData || !state || state.isMuted) return;
      
      // Calculate interval based on planet's orbital period
      const intervalMs = this.calculatePlanetInterval(planetId);
      
      // Use Tone.Transport if available, otherwise use Web Audio API scheduling
      if (Tone && Tone.Transport && synthData.synth && synthData.synth.triggerAttackRelease) {
        // Tone.js scheduling
        const intervalBeats = (intervalMs / 1000) * (this.settings.tempo / 60); // Convert ms to beats
        
        // Create a repeating loop for this planet
        const planetLoop = new Tone.Loop((time: number) => {
          try {
            // Trigger note on the Tone.js synth
            synthData.synth.triggerAttackRelease(
              synthData.frequency,
              '8n', // Eighth note duration
              time,
              state.volume * 0.3 // Velocity based on planet volume
            );
          } catch (error) {
            console.error(`Error triggering Tone.js note for planet ${planetId}:`, error);
          }
        }, intervalBeats);
        
        // Start the loop
        planetLoop.start(0);
        
        // Store the loop reference
        this.loops.set(planetId, planetLoop);
        
      } else if (synthData.synth && synthData.synth.oscillator && this.audioContext) {
        // Web Audio API fallback scheduling
        console.log(`🔍 Using Web Audio API scheduling for planet ${planetId}`);
        
        // Create a simple oscillator-based loop
        const playNote = () => {
          if (!this.settings.isPlaying || state.isMuted) return;
          
          try {
            // Create a new oscillator for each note (simple approach)
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = synthData.synth.oscillator.type || 'sine';
            oscillator.frequency.value = synthData.frequency;
            
            // Connect to master volume
            oscillator.connect(gainNode);
            gainNode.connect(this.masterVolume);
            
            // Simple envelope
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(state.volume * 0.3, now + 0.1); // Attack
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3); // Release
            
            // Start and stop the oscillator
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            
            // Schedule next note
            if (this.settings.isPlaying && !state.isMuted) {
              setTimeout(playNote, intervalMs);
            }
          } catch (error) {
            console.error(`Error playing Web Audio API note for planet ${planetId}:`, error);
          }
        };
        
        // Start playing
        playNote();
        
        // Store a reference to the play function for cleanup
        this.loops.set(planetId, { stop: () => {
          // The loop will stop itself when isPlaying becomes false
          console.log(`🔍 Stopped Web Audio API loop for planet ${planetId}`);
        }});
        
      } else {
        console.log(`⚠️ No valid synth available for planet ${planetId}`);
      }
    } catch (error) {
      console.error(`Error scheduling planet ${planetId}:`, error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error scheduling planet ${planetId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false
      };
      this.reportError(audioError);
    }
  }

  /**
   * Calculate planet interval based on orbital period
   */
  private calculatePlanetInterval(planetId: string): number {
    // This should be based on the planet's orbital period
    // For now, use a simple mapping
    const baseInterval = 2000; // 2 seconds
    const planetMultipliers: Record<string, number> = {
      'mercury': 0.5,
      'venus': 0.8,
      'earth': 1.0,
      'mars': 1.5,
      'jupiter': 2.0,
      'saturn': 2.5,
      'uranus': 3.0,
      'neptune': 3.5
    };
    
    const multiplier = planetMultipliers[planetId.toLowerCase()] || 1.0;
    return (baseInterval * multiplier) / (this.settings.tempo / 120);
  }

  /**
   * Stop the celestial symphony
   */
  stop(): void {
    try {
      // If we have dummy audio (audio failed to load), just update state and return
      if (!this.audioContext && this.audioState.hasError) {
        console.log('🔤 Stopping dummy audio (no sound)');
        this.settings.isPlaying = false;
        this.audioState.isPlaying = false;
        this.updateContextState();
        return;
      }

      // Stop all planet loops
      this.stopPlanetLoops();

      // Stop all oscillators
      this.synths.forEach((synth, planetId) => {
        try {
          if (synth && synth.oscillator && this.audioContext) {
            synth.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          }
        } catch (error) {
          console.error(`Error stopping synth for planet ${planetId}:`, error);
        }
      });

      this.settings.isPlaying = false;
      this.audioState.isPlaying = false;
      this.updateContextState();
      console.log('🔇 Celestial symphony stopped');
    } catch (error) {
      const audioError: AudioError = {
        type: 'playback',
        message: error instanceof Error ? error.message : 'Unknown error stopping playback',
        timestamp: Date.now(),
        recoverable: false // Stopping should not be recoverable as it's a user action
      };
      
      console.error('Error stopping audio:', error);
      this.reportError(audioError);
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    try {
      this.settings.volume = Math.max(0, Math.min(1, volume));
      if (this.masterVolume) {
        // Convert linear volume to gain (0-1 range)
        this.masterVolume.gain.value = this.settings.volume * 0.5;
      }
    } catch (error) {
      console.error('Error setting master volume:', error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error setting master volume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Volume control errors are not critical
      };
      this.reportError(audioError);
    }
  }

  /**
   * Set tempo (BPM)
   */
  setTempo(bpm: number): void {
    try {
      this.settings.tempo = Math.max(60, Math.min(180, bpm));
      // Tempo affects the scheduling intervals, restart loops if playing
      if (this.settings.isPlaying) {
        this.stopPlanetLoops();
        this.startPlanetLoops();
      }
    } catch (error) {
      console.error('Error setting tempo:', error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error setting tempo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Tempo control errors are not critical
      };
      this.reportError(audioError);
    }
  }

  /**
   * Set time multiplier for orbital speed
   */
  setTimeMultiplier(multiplier: number): void {
    try {
      this.timeMultiplier = Math.max(1, Math.min(10000, multiplier));
      
      // Restart loops with new timing
      if (this.settings.isPlaying) {
        this.stopPlanetLoops();
        this.startPlanetLoops();
      }
    } catch (error) {
      console.error('Error setting time multiplier:', error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error setting time multiplier: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Time multiplier errors are not critical
      };
      this.reportError(audioError);
    }
  }

  /**
   * Set mute state for a specific planet
   */
  setPlanetMute(planetId: string, isMuted: boolean): void {
    try {
      const planetState = this.planetStates.get(planetId);
      if (planetState) {
        planetState.isMuted = isMuted;
        
        if (isMuted) {
          // Stop the planet's audio
          const synth = this.synths.get(planetId);
          if (synth && synth.gainNode && this.audioContext) {
            synth.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          }
        } else if (this.settings.isPlaying) {
          // Start the planet's audio if currently playing
          this.schedulePlanet(planetId);
        }
        
        console.log(`${planetId} ${isMuted ? 'muted' : 'unmuted'}`);
      }
    } catch (error) {
      console.error(`Error setting mute state for planet ${planetId}:`, error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error setting mute state for planet ${planetId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Planet mute errors are not critical
      };
      this.reportError(audioError);
    }
  }

  /**
   * Toggle mute state for a specific planet
   */
  togglePlanetMute(planetId: string): void {
    const planetState = this.planetStates.get(planetId);
    if (planetState) {
      this.setPlanetMute(planetId, !planetState.isMuted);
    }
  }

  /**
   * Set individual planet volume
   */
  setPlanetVolume(planetId: string, volume: number): void {
    try {
      const planetState = this.planetStates.get(planetId);
      if (planetState) {
        planetState.volume = Math.max(0, Math.min(1, volume));
      }
    } catch (error) {
      console.error(`Error setting volume for planet ${planetId}:`, error);
      const audioError: AudioError = {
        type: 'playback',
        message: `Error setting volume for planet ${planetId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false // Planet volume errors are not critical
      };
      this.reportError(audioError);
    }
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Get planet audio state
   */
  getPlanetState(planetId: string): PlanetAudioState | null {
    return this.planetStates.get(planetId) || null;
  }

  /**
   * Report an error to all registered error callbacks
   */
  private reportError(error: AudioError): void {
    this.audioState.hasError = true;
    this.audioState.error = error;
    
    // Notify all error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
    
    // Also notify state change callbacks
    this.notifyStateChange();
  }

  /**
   * Notify all state change callbacks of current audio state
   */
  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback({ ...this.audioState });
      } catch (callbackError) {
        console.error('Error in state change callback:', callbackError);
      }
    });
  }

  /**
   * Update audio context state
   */
  private updateContextState(): void {
    if (this.audioContext) {
      this.audioState.contextState = this.audioContext.state as 'closed' | 'running' | 'suspended' | 'unknown';
    } else {
      this.audioState.contextState = 'unknown';
    }
    this.notifyStateChange();
  }

  /**
   * Attempt to recover from an error
   */
  private async attemptRecovery(error: AudioError): Promise<boolean> {
    if (!error.recoverable || this.retryCount >= this.maxRetries) {
      return false;
    }

    this.retryCount++;
    console.log(`Attempting recovery (${this.retryCount}/${this.maxRetries}) for error: ${error.message}`);

    try {
      switch (error.type) {
        case 'context':
          // Try to resume audio context
          if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            this.updateContextState();
            return true;
          }
          break;
        
        case 'initialization':
          // Try to reinitialize
          await this.initialize();
          return true;
        
        case 'playback':
          // Try to restart playback
          if (this.settings.isPlaying) {
            await this.start();
            return true;
          }
          break;
        
        default:
          // For unknown errors, try a full reinitialization
          this.dispose();
          await this.initialize();
          return true;
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      // Report recovery error
      this.reportError({
        type: 'unknown',
        message: `Recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`,
        timestamp: Date.now(),
        recoverable: false
      });
    }

    return false;
  }

  /**
   * Add error callback
   */
  onError(callback: (error: AudioError) => void): void {
    this.errorCallbacks.add(callback);
  }

  /**
   * Remove error callback
   */
  offError(callback: (error: AudioError) => void): void {
    this.errorCallbacks.delete(callback);
  }

  /**
   * Add state change callback
   */
  onStateChange(callback: (state: AudioState) => void): void {
    this.stateChangeCallbacks.add(callback);
  }

  /**
   * Remove state change callback
   */
  offStateChange(callback: (state: AudioState) => void): void {
    this.stateChangeCallbacks.delete(callback);
  }

  /**
   * Get current audio state
   */
  getAudioState(): AudioState {
    return { ...this.audioState };
  }

  /**
   * Clear any current error state
   */
  clearError(): void {
    this.audioState.hasError = false;
    this.audioState.error = null;
    this.retryCount = 0;
    this.notifyStateChange();
  }

  /**
   * Clean up all audio resources
   */
  dispose(): void {
    this.stop();
    
    // Stop and disconnect all oscillators
    this.synths.forEach((synth, planetId) => {
      try {
        if (synth && synth.oscillator) {
          synth.oscillator.stop();
          synth.oscillator.disconnect();
          synth.gainNode.disconnect();
          if (synth.tremoloOscillator) {
            synth.tremoloOscillator.stop();
            synth.tremoloOscillator.disconnect();
          }
          if (synth.tremoloGain) {
            synth.tremoloGain.disconnect();
          }
        }
      } catch (error) {
        console.error(`Error disposing synth for planet ${planetId}:`, error);
      }
    });
    
    // Clear all maps
    this.synths.clear();
    this.loops.clear();
    this.tremolos.clear();
    this.planetStates.clear();
    this.scheduledEvents.clear();
    
    // Disconnect master effects
    try {
      if (this.masterVolume) this.masterVolume.disconnect();
      if (this.compressor) this.compressor.disconnect();
      if (this.eq3) {
        this.eq3.low.disconnect();
        this.eq3.mid.disconnect();
        this.eq3.high.disconnect();
      }
      if (this.limiter) this.limiter.disconnect();
    } catch (error) {
      console.error('Error disconnecting master effects:', error);
    }
    
    // Close audio context
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    this.audioState.isInitialized = false;
    this.audioState.isPlaying = false;
    this.updateContextState();
    console.log('🧹 Audio engine disposed');
  }
  
  // Calculate frequency based on planet distance from sun
  private calculateFrequency(planet: Planet): number {
    // Map planet distance to frequency (closer planets = higher frequency)
    // Using logarithmic scaling for better musical distribution
    const minFreq = 110; // A2
    const maxFreq = 880; // A5
    const logMin = Math.log(0.4); // Mercury distance
    const logMax = Math.log(30); // Neptune distance
    
    const normalizedDistance = (Math.log(planet.distanceFromSun) - logMin) / (logMax - logMin);
    const frequency = maxFreq - (normalizedDistance * (maxFreq - minFreq));
    
    return Math.max(minFreq, Math.min(maxFreq, frequency));
  }
}

// Singleton instance
let audioEngine: CelestialAudioEngine | null = null;

export function getAudioEngine(): CelestialAudioEngine {
  if (!audioEngine) {
    audioEngine = new CelestialAudioEngine();
  }
  return audioEngine;
}

export function resetAudioEngine(): void {
  if (audioEngine) {
    audioEngine.dispose();
    audioEngine = null;
  }
}
