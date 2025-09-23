'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Planet } from '@/data/planets';
import { PLANETS } from '@/lib/planets-data';
import { calculateOrbitPosition, generateOrbitPath, calculatePlanetRadius } from '@/lib/orbital-mechanics';
import { SolarSystemVisualizationProps } from '@/types';

export default function SolarSystem({
  width = 800,
  height = 600,
  isPlaying = false,
  speedMultiplier = 1000,
  onPlanetClick,
  selectedPlanet
}: SolarSystemVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setTimeElapsed(prev => prev + 16); // ~60fps
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-space-950 rounded-lg"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background stars */}
        {Array.from({ length: 100 }, (_, i) => (
          <circle
            key={i}
            cx={Math.random() * width}
            cy={Math.random() * height}
            r={Math.random() * 1.5}
            fill="white"
            opacity={Math.random() * 0.8 + 0.2}
          />
        ))}

        {/* Orbit paths */}
        {PLANETS.map(planet => (
          <path
            key={`orbit-${planet.id}`}
            d={generateOrbitPath(planet, centerX, centerY)}
            className="orbit-path"
          />
        ))}

        {/* Sun */}
        <circle
          cx={centerX}
          cy={centerY}
          r={30}
          fill="#FBBF24"
          className="sun-glow cursor-pointer"
          onClick={() => {
            const sunPlanet: Planet = {
              id: 'sun',
              name: 'Sun',
              color: '#FBBF24',
              radius: 109,
              distanceFromSun: 0,
              orbitalPeriod: 0,
              frequency: 0,
              musicalNote: 'C',
              description: 'The star at the center of our solar system. The Sun is a nearly perfect sphere of hot plasma that provides the energy for life on Earth.'
            };
            onPlanetClick?.(sunPlanet);
          }}
        />

        {/* Planets */}
        {PLANETS.map(planet => {
          const position = calculateOrbitPosition(planet, timeElapsed, speedMultiplier, centerX, centerY);
          const planetRadius = calculatePlanetRadius(planet, 8);
          const isSelected = selectedPlanet?.id === planet.id;

          return (
            <g key={planet.id}>
              <circle
                cx={position.x}
                cy={position.y}
                r={planetRadius}
                fill={planet.color}
                className={`planet-glow cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-white ring-opacity-50' : ''
                }`}
                onClick={() => onPlanetClick?.(planet)}
              />
              {/* Planet label */}
              <text
                x={position.x}
                y={position.y + planetRadius + 15}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                className="text-shadow"
              >
                {planet.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
