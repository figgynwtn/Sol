'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { ControlPanelProps } from '@/types';

export default function ControlPanel({
  audioSettings,
  onTogglePlay,
  onVolumeChange,
  onTempoChange,
  speedMultiplier,
  onSpeedChange,
  audioReady = false,
  audioStatus = 'uninitialized'
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
            content={!audioReady 
              ? "Click to enable audio and experience the celestial symphony"
              : audioSettings.isPlaying 
                ? "Pause the celestial symphony and stop all planetary audio" 
                : "Start the celestial symphony and begin planetary audio generation"
            }
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
                ${audioSettings.isPlaying ? 'cosmic-button-danger' : ''}
                ${!audioReady ? 'opacity-75 hover:opacity-100' : ''}
                flex items-center justify-center gap-2 sm:gap-3
                min-h-[44px] sm:min-h-[48px] touch-manipulation
              `}
              aria-label={!audioReady ? "Click to enable audio" : audioSettings.isPlaying ? "Pause audio" : "Play audio"}
            >
              {!audioReady ? (
                <>
                  <span className="text-lg animate-pulse">🎵</span>
                  <span>Click to Enable Audio</span>
                </>
              ) : audioSettings.isPlaying ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 flex gap-1">
                    <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-white rounded-sm animate-pulse"></div>
                    <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-white rounded-sm animate-pulse"></div>
                  </div>
                  <span className="text-xs sm:text-sm">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs sm:text-sm">Start</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Volume Control */}
        <div className="space-y-2 sm:space-y-3" role="group" aria-label="Volume controls">
          <div className="flex items-center justify-between">
            <Tooltip 
              content={!audioReady ? "Audio not initialized" : "Adjust the master volume of the celestial symphony (0-100%)"}
              position="top"
            >
              <label 
                htmlFor="volume-slider"
                className="text-xs sm:text-sm font-medium text-purple-300 flex items-center gap-1 sm:gap-2 cursor-help touch-manipulation"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 100 12 9 9 0 000-12zm0 0V3m0 18v-3" />
                </svg>
                <span className="hidden sm:inline">Volume</span>
                <span className="sm:hidden">Vol</span>
              </label>
            </Tooltip>
            <span 
              className="cosmic-badge text-xs" 
              aria-live="polite"
              aria-atomic="true"
            >
              {Math.round(audioSettings.volume * 100)}%
            </span>
          </div>
          <Tooltip 
            content={!audioReady ? "Audio not initialized" : `Current volume: ${Math.round(audioSettings.volume * 100)}%`}
            position="bottom"
          >
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audioSettings.volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              disabled={!audioReady}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const step = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.01 : 0.01;
                  const newValue = Math.max(0, Math.min(1, audioSettings.volume + step));
                  onVolumeChange(newValue);
                }
              }}
              className="cosmic-slider h-2 sm:h-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900 touch-manipulation"
              aria-label={!audioReady ? "Volume control disabled" : "Master volume control"}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={audioSettings.volume}
              aria-valuetext={!audioReady ? "Volume control disabled" : `${Math.round(audioSettings.volume * 100)}%`}
              tabIndex={0}
              style={{
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </Tooltip>
        </div>

        {/* Tempo Control */}
        <div className="space-y-2 sm:space-y-3" role="group" aria-label="Tempo controls">
          <div className="flex items-center justify-between">
            <Tooltip 
              content={!audioReady ? "Audio not initialized" : "Control the tempo (beats per minute) of the planetary music"}
              position="top"
            >
              <label 
                htmlFor="tempo-slider"
                className="text-xs sm:text-sm font-medium text-purple-300 flex items-center gap-1 sm:gap-2 cursor-help touch-manipulation"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Tempo</span>
                <span className="sm:hidden">BPM</span>
              </label>
            </Tooltip>
            <span 
              className="cosmic-badge text-xs" 
              aria-live="polite"
              aria-atomic="true"
            >
              {audioSettings.tempo}
            </span>
          </div>
          <Tooltip 
            content={!audioReady ? "Audio not initialized" : `Current tempo: ${audioSettings.tempo} beats per minute`}
            position="bottom"
          >
            <input
              id="tempo-slider"
              type="range"
              min="60"
              max="180"
              step="5"
              value={audioSettings.tempo}
              onChange={(e) => onTempoChange(parseInt(e.target.value))}
              disabled={!audioReady}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const step = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 5;
                  const newValue = Math.max(60, Math.min(180, audioSettings.tempo + step));
                  onTempoChange(newValue);
                }
              }}
              className="cosmic-slider h-2 sm:h-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900 touch-manipulation"
              aria-label="Tempo control"
              aria-valuemin={60}
              aria-valuemax={180}
              aria-valuenow={audioSettings.tempo}
              aria-valuetext={`${audioSettings.tempo} beats per minute`}
              tabIndex={0}
              style={{
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
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
            <span className="text-purple-400 text-xs sm:text-sm" aria-hidden="true">🎵</span>
            <p className="text-xs cosmic-text">Planets generate music based on orbital characteristics</p>
          </div>
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
