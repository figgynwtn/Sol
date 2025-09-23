import { Planet } from '@/data/planets';

// Re-export Planet interface for convenience
export type { Planet };

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
  onTogglePlay: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
}

export interface PlanetInfoPanelProps {
  planet: Planet;
  onClose: () => void;
}

export interface MobileControlPanelProps {
  onTogglePlay: () => void;
  speedMultiplier: number;
  onSpeedChange: (value: number) => void;
  planets: Planet[];
  onPlanetMute: (planetId: string, muted: boolean) => void;
}
