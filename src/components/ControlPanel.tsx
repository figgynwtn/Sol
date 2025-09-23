'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { ControlPanelProps } from '@/types';

export default function ControlPanel({
  onTogglePlay,
  speedMultiplier,
  onSpeedChange
}: ControlPanelProps) {
  return (
    <div 
      className="glass-panel p-3 sm:p-4 md:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-80 neon-glow"
      role="region"
      aria-label="Control panel"
      tabIndex={0}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h2 className="cosmic-subtitle text-sm sm:text-base md:text-lg">Mission Control</h2>
      </div>
      
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Play/Pause Button */}
        <div className="flex items-center justify-center">
          <Tooltip 
            content="Start or pause the solar system animation"
            position="top"
          >
            <button
              onClick={onTogglePlay}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTogglePlay();
                }
              }}
              className={`
                cosmic-button text-sm sm:text-base w-full py-3 sm:py-4
                flex items-center justify-center gap-2 sm:gap-3
                min-h-[44px] sm:min-h-[48px] touch-manipulation
              `}
              aria-label="Toggle animation"
            >
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex gap-1">
                  <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-white rounded-sm animate-pulse"></div>
                  <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-white rounded-sm animate-pulse"></div>
                </div>
                <span className="text-xs sm:text-sm">Toggle</span>
              </>
            </button>
          </Tooltip>
        </div>

        {/* Speed Multiplier */}
        <div className="space-y-2 sm:space-y-3" role="group" aria-label="Time speed multiplier controls">
          <div className="flex items-center justify-between">
            <Tooltip 
              content="Adjust the time speed multiplier to see planets orbit faster or slower"
              position="top"
            >
              <label className="text-xs sm:text-sm font-medium text-purple-300 flex items-center gap-1 sm:gap-2 cursor-help touch-manipulation">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Time Speed</span>
                <span className="sm:hidden">Speed</span>
              </label>
            </Tooltip>
            <span 
              className="cosmic-badge text-xs" 
              aria-live="polite"
              aria-atomic="true"
            >
              {speedMultiplier}x
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 sm:gap-2" role="radiogroup" aria-label="Time speed options">
            {[1, 10, 100, 1000, 10000].map((speed) => (
              <Tooltip 
                key={speed}
                content={`Set time speed to ${speed}x${speed === 1 ? ' (real-time)' : speed === 10000 ? ' (maximum speed)' : ''}`}
                position="top"
              >
                <button
                  onClick={() => onSpeedChange(speed)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSpeedChange(speed);
                    }
                  }}
                  className={`
                    py-2 sm:py-3 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900
                    min-h-[36px] sm:min-h-[40px]
                    ${speedMultiplier === speed
                      ? 'cosmic-button text-xs px-1 py-1 sm:text-sm sm:px-2 sm:py-1'
                      : 'glass-panel hover:glass-panel-hover text-purple-300'
                    }
                  `}
                  aria-label={`Set time speed to ${speed}x${speed === 1 ? ' (real-time)' : speed === 10000 ? ' (maximum speed)' : ''}`}
                  aria-pressed={speedMultiplier === speed}
                  role="radio"
                  aria-checked={speedMultiplier === speed}
                  tabIndex={0}
                >
                  {speed}x
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="cosmic-card p-3 sm:p-4 space-y-2" role="complementary" aria-label="Application information">
          <div className="flex items-start gap-1 sm:gap-2">
            <span className="text-blue-400 text-xs sm:text-sm" aria-hidden="true">🪐</span>
            <p className="text-xs cosmic-text">Click planets to learn more</p>
          </div>
          <div className="flex items-start gap-1 sm:gap-2">
            <span className="text-cyan-400 text-xs sm:text-sm" aria-hidden="true">⚡</span>
            <p className="text-xs cosmic-text">Adjust speed to see planets move</p>
          </div>
        </div>
      </div>
    </div>
  );
}
