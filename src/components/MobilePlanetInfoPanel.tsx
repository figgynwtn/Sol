'use client';

import React from 'react';
import { Planet } from '@/data/planets';
import { cn } from '@/lib/utils';

interface MobilePlanetInfoPanelProps {
  planet: Planet | null;
  onClose: () => void;
}

export default function MobilePlanetInfoPanel({
  planet,
  onClose
}: MobilePlanetInfoPanelProps) {
  if (!planet) return null;

  const formatNumber = (num: number, unit: string) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${unit}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${unit}`;
    }
    return `${num.toFixed(0)} ${unit}`;
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000000) {
      return `${(distance / 1000000).toFixed(1)} million km`;
    } else if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} thousand km`;
    }
    return `${distance.toFixed(0)} km`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full bg-gradient-to-b from-purple-900/95 to-space-950/95 rounded-t-3xl shadow-2xl border-t border-purple-500/20 max-h-[85vh] overflow-hidden">
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1 bg-purple-400/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full shadow-lg"
                style={{ backgroundColor: planet.color }}
              />
              <h2 className="text-2xl font-bold text-white">{planet.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-900/30 rounded-2xl p-4 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Distance from Sun</div>
              <div className="text-lg font-bold text-white">{formatDistance(planet.distanceFromSun)}</div>
            </div>
            <div className="bg-purple-900/30 rounded-2xl p-4 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Orbital Period</div>
              <div className="text-lg font-bold text-white">{planet.orbitalPeriod} days</div>
            </div>
            <div className="bg-purple-900/30 rounded-2xl p-4 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Radius</div>
              <div className="text-lg font-bold text-white">{formatNumber(planet.radius, 'km')}</div>
            </div>
            <div className="bg-purple-900/30 rounded-2xl p-4 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Musical Note</div>
              <div className="text-lg font-bold text-white">{planet.musicalNote}</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">About {planet.name}</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              {planet.description}
            </p>
          </div>

          {/* Audio Properties */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Sound Properties</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-purple-500/10">
                <span className="text-sm text-gray-400">Frequency</span>
                <span className="text-sm font-medium text-purple-300">{planet.frequency} Hz</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Muted</span>
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded-full",
                  planet.isMuted ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"
                )}>
                  {planet.isMuted ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
