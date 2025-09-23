import { getAudioEngine } from './audioEngine';
import React from 'react';

export async function initializeAudioWithUserGesture(): Promise<boolean> {
  try {
    const audioEngine = getAudioEngine();
    await audioEngine.initialize();
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
}

export function createAudioStartButton(onStart: () => void): React.ReactElement {
  return (
    <button
      onClick={async () => {
        const success = await initializeAudioWithUserGesture();
        if (success) {
          onStart();
        }
      }}
      className="fixed inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50"
      style={{ cursor: 'pointer' }}
    >
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🎵</div>
        <h2 className="text-3xl font-bold mb-4">Click to Start Celestial Symphony</h2>
        <p className="text-lg opacity-75">Browser requires user interaction to begin audio</p>
      </div>
    </button>
  );
}
