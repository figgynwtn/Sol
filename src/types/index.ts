import { Planet } from '@/data/planets';

// Re-export Planet interface for convenience
export type { Planet };

export interface AudioSettings {
  isPlaying: boolean;
  volume: number;
  tempo: number;
  scale: string[];
}

export type AudioStatus = 'uninitialized' | 'initializing' | 'ready' | 'playing' | 'paused' | 'error';

export interface PlanetPosition {
  x: number;
  y: number;
  angle: number;
}

export interface SolarSystemVisualizationProps {
  width?: number;
  height?: number;
  isPlaying?: boolean;
  speedMultiplier?: number;
  onPlanetClick?: (planet: Planet) => void;
  selectedPlanet?: Planet | null;
}

export interface ControlPanelProps {
  audioSettings: AudioSettings;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
  onTempoChange: (tempo: number) => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  audioReady?: boolean;
  audioStatus?: AudioStatus;
}

export interface PlanetInfoPanelProps {
  planet: Planet;
  onClose: () => void;
}
