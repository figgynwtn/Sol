'use client';

import React from 'react';
import { Planet } from '@/data/planets';
import { calculateOrbitalVelocity } from '@/lib/orbital-mechanics';
import { PlanetInfoPanelProps } from '@/types';

export default function PlanetInfoPanel({ planet, onClose }: PlanetInfoPanelProps) {
  if (!planet) return null;

  const orbitalVelocity = calculateOrbitalVelocity(planet);
  const relativeSize = planet.radius;
  const yearLength = Math.round(planet.orbitalPeriod);

  return (
    <div 
      className="glass-panel p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:w-96 neon-glow-blue max-h-[80vh] overflow-y-auto"
      role="dialog"
      aria-label={`${planet.name} information panel`}
      aria-modal="true"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full planet-glow animate-pulse-slow"
            style={{ 
              backgroundColor: planet.color,
              color: planet.color
            }}
          />
          <div>
            <h2 className="cosmic-subtitle text-lg sm:text-xl">{planet.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="cosmic-badge text-xs">Planet</span>
              <span className="text-xs text-purple-300">Solar System</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
          className="
            p-2 sm:p-3 rounded-full glass-panel hover:glass-panel-hover
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900
            touch-manipulation
          "
          aria-label="Close planet information"
          title="Close panel"
          tabIndex={0}
        >
          <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div className="cosmic-card" role="article" aria-label="Planet description">
          <p className="cosmic-text text-sm leading-relaxed">
            {planet.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4" role="list" aria-label="Planet statistics">
          <div className="cosmic-card" role="listitem">
            <div className="text-purple-300 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Distance from Sun
            </div>
            <div className="text-white font-bold text-lg" aria-label={`Distance from Sun: ${planet.distanceFromSun} astronomical units`}>
              {planet.distanceFromSun} AU
            </div>
          </div>

          <div className="cosmic-card" role="listitem">
            <div className="text-purple-300 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Orbital Period
            </div>
            <div className="text-white font-bold text-lg" aria-label={`Orbital period: ${yearLength} days`}>
              {yearLength} days
            </div>
          </div>

          <div className="cosmic-card" role="listitem">
            <div className="text-purple-300 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Relative Size
            </div>
            <div className="text-white font-bold text-lg" aria-label={`Relative size: ${relativeSize} times Earth`}>
              {relativeSize}× Earth
            </div>
          </div>

          <div className="cosmic-card" role="listitem">
            <div className="text-purple-300 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Musical Note
            </div>
            <div className="text-white font-bold text-lg flex items-center gap-2" aria-label={`Musical note: ${planet.musicalNote || 'C'}`}>
              {planet.musicalNote || 'C'}
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: planet.color }} aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <div className="cosmic-card border border-purple-500/30 bg-purple-500/10" role="region" aria-label="Sonification data">
          <div className="text-purple-300 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span aria-hidden="true">🎵</span> Sonification Data
          </div>
          <div className="space-y-2 text-sm" role="list" aria-label="Audio properties">
            <div className="flex justify-between items-center" role="listitem">
              <span className="text-purple-300">Base Frequency:</span>
              <span className="cosmic-badge" aria-label={`Base frequency: ${planet.frequency?.toFixed(2)} hertz`}>
                {planet.frequency?.toFixed(2)} Hz
              </span>
            </div>
            <div className="flex justify-between items-center" role="listitem">
              <span className="text-purple-300">Orbital Velocity:</span>
              <span className="cosmic-badge" aria-label={`Orbital velocity: ${orbitalVelocity.toFixed(3)}`}>
                {orbitalVelocity.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center" role="listitem">
              <span className="text-purple-300">Audio Timing:</span>
              <span 
                className={`cosmic-badge ${
                  orbitalVelocity > 0.3 ? 'bg-red-500/20 border-red-500/50' : 
                  orbitalVelocity > 0.1 ? 'bg-yellow-500/20 border-yellow-500/50' : 
                  'bg-green-500/20 border-green-500/50'
                }`}
                aria-label={`Audio timing: ${orbitalVelocity > 0.3 ? 'Fast' : orbitalVelocity > 0.1 ? 'Medium' : 'Slow'}`}
              >
                {orbitalVelocity > 0.3 ? 'Fast' : orbitalVelocity > 0.1 ? 'Medium' : 'Slow'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center cosmic-text text-xs italic p-3 cosmic-card" role="note">
          <span className="text-purple-400" aria-hidden="true">✨</span> Click another planet to explore, or close this panel to enjoy the celestial symphony.
        </div>
      </div>
    </div>
  );
}
