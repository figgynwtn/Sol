'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { SoundPreference } from '@/types';

interface SoundToggleButtonProps {
  soundPreference: SoundPreference;
  onToggleSound: () => void;
  audioReady?: boolean;
}

export default function SoundToggleButton({ 
  soundPreference, 
  onToggleSound, 
  audioReady = false 
}: SoundToggleButtonProps) {
  const isSoundEnabled = soundPreference === 'enabled';
  
  const buttonText = isSoundEnabled ? 'Disable Sound' : 'Enable Sound';
  const buttonIcon = isSoundEnabled ? (
    // Speaker icon (sound enabled)
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
  ) : (
    // Muted speaker icon (sound disabled)
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  const tooltipContent = isSoundEnabled 
    ? "Disable sound and explore the solar system in silence" 
    : "Enable sound to experience the celestial symphony";

  return (
    <Tooltip content={tooltipContent} position="top">
      <button
        onClick={onToggleSound}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleSound();
          }
        }}
        className={`
          cosmic-button text-sm sm:text-base w-full
          flex items-center justify-center gap-2 sm:gap-3
          min-h-[44px] touch-manipulation
          ${!audioReady ? 'opacity-75 hover:opacity-100' : ''}
        `}
        aria-label={buttonText}
        disabled={!audioReady}
      >
        {buttonIcon}
        <span className="text-xs sm:text-sm">{buttonText}</span>
      </button>
    </Tooltip>
  );
}
