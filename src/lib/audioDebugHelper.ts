/**
 * Audio Debug Helper for Tone.js Issues
 * This helper provides debugging tools and diagnostics for common audio problems
 */

export interface AudioDiagnostics {
  webAudioSupported: boolean;
  audioContextState: string;
  toneAvailable: boolean;
  toneContextState: string;
  userGestureRequired: boolean;
  initializationErrors: string[];
  playbackErrors: string[];
  synthConnections: {
    totalSynths: number;
    connectedSynths: number;
    mutedSynths: number;
  };
  transportState: {
    isRunning: boolean;
    bpm: number;
    position: string;
  };
  browserInfo: {
    name: string;
    version: string;
    platform: string;
  };
}

export class AudioDebugHelper {
  private static instance: AudioDebugHelper;
  private diagnostics: AudioDiagnostics;
  private errorLog: string[] = [];

  private constructor() {
    this.diagnostics = this.initializeDiagnostics();
  }

  static getInstance(): AudioDebugHelper {
    if (!AudioDebugHelper.instance) {
      AudioDebugHelper.instance = new AudioDebugHelper();
    }
    return AudioDebugHelper.instance;
  }

  private initializeDiagnostics(): AudioDiagnostics {
    return {
      webAudioSupported: this.checkWebAudioSupport(),
      audioContextState: 'unknown',
      toneAvailable: this.checkToneAvailability(),
      toneContextState: 'unknown',
      userGestureRequired: true,
      initializationErrors: [],
      playbackErrors: [],
      synthConnections: {
        totalSynths: 0,
        connectedSynths: 0,
        mutedSynths: 0
      },
      transportState: {
        isRunning: false,
        bpm: 120,
        position: '0:0:0'
      },
      browserInfo: this.getBrowserInfo()
    };
  }

  private checkWebAudioSupport(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  private checkToneAvailability(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      return typeof (window as any).Tone !== 'undefined';
    } catch (e) {
      return false;
    }
  }

  private getBrowserInfo() {
    // Check if we're in a browser environment
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return {
        name: 'Server',
        version: 'N/A',
        platform: 'Server'
      };
    }
    
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let platform = 'Unknown';

    // Chrome
    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    }
    // Firefox
    else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    }
    // Safari
    else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    // Edge
    else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    platform = navigator.platform || 'Unknown';

    return {
      name: browserName,
      version: browserVersion,
      platform
    };
  }

  private getToneContextState(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'unavailable';
    }
    
    try {
      if (!(window as any).Tone) return 'unavailable';
      
      const contexts = (window as any).Tone.contexts || [];
      if (contexts.length > 0) {
        return contexts[0].state || 'unknown';
      }
      
      return 'uninitialized';
    } catch (e) {
      return 'error';
    }
  }

  private getAudioContextState(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'unavailable';
    }
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return 'unavailable';
      
      // Try to get the current context if it exists
      const contexts = (window as any).Tone?.contexts || [];
      if (contexts.length > 0) {
        return contexts[0].state || 'unknown';
      }
      
      return 'uninitialized';
    } catch (e) {
      return 'error';
    }
  }

  /**
   * Run comprehensive audio diagnostics
   */
  async runDiagnostics(): Promise<AudioDiagnostics> {
    console.log('🔍 Running audio diagnostics...');
    
    // Check Web Audio API support
    this.diagnostics.webAudioSupported = this.checkWebAudioSupport();
    console.log(`Web Audio API supported: ${this.diagnostics.webAudioSupported}`);

    // Check Tone.js availability
    this.diagnostics.toneAvailable = this.checkToneAvailability();
    console.log(`Tone.js available: ${this.diagnostics.toneAvailable}`);

    // Check audio context state
    if (this.diagnostics.webAudioSupported) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.diagnostics.audioContextState = audioContext.state;
        console.log(`Audio Context state: ${this.diagnostics.audioContextState}`);
        audioContext.close();
      } catch (error) {
        this.logError('Audio Context creation failed', error);
      }
    }

    // Check Tone.js context
    if (this.diagnostics.toneAvailable) {
      try {
        const Tone = (window as any).Tone;
        this.diagnostics.toneContextState = this.getToneContextState();
        console.log(`Tone.js context state: ${this.diagnostics.toneContextState}`);
      } catch (error) {
        this.logError('Tone.js context check failed', error);
      }
    }

    // Check user gesture requirement
    this.diagnostics.userGestureRequired = this.checkUserGestureRequirement();
    console.log(`User gesture required: ${this.diagnostics.userGestureRequired}`);

    return { ...this.diagnostics };
  }

  private checkUserGestureRequirement(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return true; // Assume gesture is required on server
    }
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const isRequired = audioContext.state === 'suspended';
      audioContext.close();
      return isRequired;
    } catch (e) {
      return true;
    }
  }

  /**
   * Test Tone.js Transport functionality
   */
  async testToneTransport(): Promise<boolean> {
    if (!this.diagnostics.toneAvailable) {
      this.logError('Tone.js not available for transport test');
      return false;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      this.logError('Cannot test transport on server side');
      return false;
    }

    try {
      const Tone = (window as any).Tone;
      
      // Check if Transport exists
      if (!Tone.Transport) {
        this.logError('Tone.Transport not available');
        return false;
      }

      // Test Transport state
      this.diagnostics.transportState.isRunning = Tone.Transport.state === 'started';
      this.diagnostics.transportState.bpm = Tone.Transport.bpm.value || 120;
      this.diagnostics.transportState.position = Tone.Transport.position || '0:0:0';

      console.log('Transport test passed:', this.diagnostics.transportState);
      return true;
    } catch (error) {
      this.logError('Tone Transport test failed', error);
      return false;
    }
  }

  /**
   * Test synth creation and connection
   */
  async testSynthCreation(): Promise<boolean> {
    if (!this.diagnostics.toneAvailable) {
      this.logError('Tone.js not available for synth test');
      return false;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      this.logError('Cannot test synth creation on server side');
      return false;
    }

    try {
      const Tone = (window as any).Tone;
      
      // Create a test synth
      const synth = new Tone.Synth();
      
      // Test connection
      synth.toDestination();
      
      // Test basic functionality
      await synth.triggerAttackRelease('C4', '8n');
      
      // Clean up
      synth.dispose();

      console.log('Synth creation test passed');
      return true;
    } catch (error) {
      this.logError('Synth creation test failed', error);
      return false;
    }
  }

  /**
   * Test frequency mapping
   */
  testFrequencyMapping(distanceFromSun: number): number {
    // This should match the logic in your audio engine
    const minDistance = 0.39; // Mercury
    const maxDistance = 39.48; // Neptune
    
    const normalizedDistance = (distanceFromSun - minDistance) / (maxDistance - minDistance);
    const inverseFactor = 1 - normalizedDistance;
    
    const minFreq = 200;
    const maxFreq = 800;
    
    const frequency = minFreq + (maxFreq - minFreq) * Math.pow(inverseFactor, 0.7);
    
    console.log(`Distance: ${distanceFromSun} -> Frequency: ${Math.round(frequency * 100) / 100}Hz`);
    return Math.round(frequency * 100) / 100;
  }

  /**
   * Test orbital period scheduling
   */
  testOrbitalScheduling(orbitalPeriod: number): number {
    // This should match the logic in your audio engine
    const baseInterval = 2000; // 2 seconds
    const interval = baseInterval * (orbitalPeriod / 365);
    
    console.log(`Orbital period: ${orbitalPeriod} days -> Interval: ${interval}ms`);
    return interval;
  }

  /**
   * Simulate user gesture for audio context resume
   */
  async simulateUserGesture(): Promise<boolean> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      this.logError('Cannot simulate user gesture on server side');
      return false;
    }
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed successfully');
      }
      
      audioContext.close();
      return true;
    } catch (error) {
      this.logError('User gesture simulation failed', error);
      return false;
    }
  }

  /**
   * Log error with timestamp
   */
  private logError(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const errorLog = `[${timestamp}] ${message}: ${error?.message || error || 'Unknown error'}`;
    this.errorLog.push(errorLog);
    console.error(errorLog);
  }

  /**
   * Get all error logs
   */
  getErrorLogs(): string[] {
    return [...this.errorLog];
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    this.errorLog = [];
  }

  /**
   * Generate debugging report
   */
  generateReport(): string {
    const report = `
=== AUDIO DEBUGGING REPORT ===
Generated: ${new Date().toISOString()}

BROWSER INFO:
- Name: ${this.diagnostics.browserInfo.name}
- Version: ${this.diagnostics.browserInfo.version}
- Platform: ${this.diagnostics.browserInfo.platform}

AUDIO SUPPORT:
- Web Audio API: ${this.diagnostics.webAudioSupported ? '✅' : '❌'}
- Tone.js: ${this.diagnostics.toneAvailable ? '✅' : '❌'}

CONTEXT STATES:
- Audio Context: ${this.diagnostics.audioContextState}
- Tone.js Context: ${this.diagnostics.toneContextState}

USER GESTURE:
- Required: ${this.diagnostics.userGestureRequired ? '✅' : '❌'}

TRANSPORT STATE:
- Running: ${this.diagnostics.transportState.isRunning ? '✅' : '❌'}
- BPM: ${this.diagnostics.transportState.bpm}
- Position: ${this.diagnostics.transportState.position}

SYNTH CONNECTIONS:
- Total: ${this.diagnostics.synthConnections.totalSynths}
- Connected: ${this.diagnostics.synthConnections.connectedSynths}
- Muted: ${this.diagnostics.synthConnections.mutedSynths}

ERROR LOG:
${this.errorLog.join('\n') || 'No errors logged'}

=== END REPORT ===
    `;
    return report.trim();
  }
}

// Export singleton instance
export const audioDebugHelper = AudioDebugHelper.getInstance();
