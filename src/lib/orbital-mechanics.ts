import { Planet } from '@/data/planets';
import { PlanetPosition } from '@/types';
import { SCALE_FACTOR } from '@/lib/planets-data';

export function calculateOrbitPosition(
  planet: Planet,
  timeElapsed: number,
  speedMultiplier: number = 1000,
  centerX: number = 400,
  centerY: number = 300
): PlanetPosition {
  const periodInSeconds = planet.orbitalPeriod * 24 * 60 * 60;
  const angularVelocity = (2 * Math.PI) / periodInSeconds;
  const angle = (timeElapsed * speedMultiplier * angularVelocity) % (2 * Math.PI);
  const orbitRadius = planet.distanceFromSun * SCALE_FACTOR;
  const x = centerX + orbitRadius * Math.cos(angle);
  const y = centerY + orbitRadius * Math.sin(angle);
  
  return { x, y, angle };
}

export function generateOrbitPath(
  planet: Planet,
  centerX: number = 400,
  centerY: number = 300
): string {
  const radius = planet.distanceFromSun * SCALE_FACTOR;
  
  return `M ${centerX + radius} ${centerY} 
          A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}
          A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`;
}

export function calculatePlanetRadius(planet: Planet, baseSize: number = 12, containerSize?: number): number {
  // If container size is provided, calculate responsive base size - increased multiplier
  const responsiveBaseSize = containerSize ? Math.max(containerSize * 0.015, 6) : baseSize;
  
  // Use a more aggressive scaling factor to better show size differences
  // Jupiter (radius 5.0) should be much larger than Neptune (radius 1.9)
  const sizeMultiplier = Math.pow(planet.radius, 0.7); // Use power function for better size differentiation
  
  return Math.max(6, responsiveBaseSize * sizeMultiplier);
}

export function calculateOrbitalVelocity(planet: Planet): number {
  return 1 / Math.sqrt(planet.distanceFromSun);
}

export function mapPlanetToTempo(planet: Planet, baseTempo: number = 120): number {
  const velocity = calculateOrbitalVelocity(planet);
  return Math.max(60, baseTempo * velocity);
}
