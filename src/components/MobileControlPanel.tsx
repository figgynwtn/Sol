'use client';

import React from 'react';
import { MobileControlPanelProps } from '@/types';
import { Planet } from '@/data/planets';
import { cn } from '@/lib/utils';

export default function MobileControlPanel({
  onTogglePlay,
  speedMultiplier,
  onSpeedChange,
  planets,
  onPlanetMute
}: MobileControlPanelProps) {
  // Touch-friendly slider component
  const TouchSlider = ({ 
    value, 
    min, 
    max, 
    step, 
    onChange, 
    label,
    unit = '',
    icon
  }: {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    label: string;
    unit?: string;
    icon?: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-purple-300">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-12 bg-purple-900/30 rounded-lg appearance-none cursor-pointer touch-manipulation"
          style={{
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(value - min) / (max - min) * 100}%, #374151 ${(value - min) / (max - min) * 100}%, #374151 100%)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <span className="text-xs text-gray-500">{min}{unit}</span>
          <span className="text-xs text-gray-500">{max}{unit}</span>
        </div>
      </div>
    </div>
  );

  // Touch-friendly button component
  const TouchButton = ({ 
    onClick, 
    children, 
    disabled = false,
    variant = 'primary',
    icon,
    className = ''
  }: {
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-semibold text-base transition-all duration-200",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'primary' 
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl"
          : "bg-purple-900/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/70",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );

  // Planet toggle component
  const PlanetToggle = ({ planet, isMuted, onToggle }: {
    planet: Planet;
    isMuted: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={cn(
        "w-full h-12 flex items-center justify-between px-4 rounded-xl transition-all duration-200",
        "active:scale-[0.98] touch-manipulation",
        isMuted 
          ? "bg-gray-800/50 text-gray-400" 
          : "bg-purple-900/30 text-purple-300 border border-purple-500/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: planet.color }}
        />
        <span className="text-sm font-medium">{planet.name}</span>
      </div>
      <div className={cn(
        "w-8 h-5 rounded-full relative transition-colors duration-200",
        isMuted ? "bg-gray-600" : "bg-purple-500"
      )}>
        <div className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
          isMuted ? "left-0.5" : "left-3.5"
        )} />
      </div>
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Play/Pause Button */}
      <TouchButton
        onClick={onTogglePlay}
        variant="primary"
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l3-2z" clipRule="evenodd" />
          </svg>
        }
      >
        Toggle Animation
      </TouchButton>

      {/* Speed Control */}
      <TouchSlider
        value={speedMultiplier}
        min={0.1}
        max={10}
        step={0.1}
        onChange={onSpeedChange}
        label="Time Speed"
        unit="x"
        icon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        }
      />

      {/* Planet Controls */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          Planet Visibility
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {planets.map((planet) => (
            <PlanetToggle
              key={planet.id}
              planet={planet}
              isMuted={planet.isMuted || false}
              onToggle={() => onPlanetMute(planet.id, !planet.isMuted)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
