'use client';

import React, { useState, useEffect } from 'react';
import { audioDebugHelper } from '@/lib/audioDebugHelper';

interface AudioDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AudioDebugPanel({ isVisible, onClose }: AudioDebugPanelProps) {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [errorLogs, setErrorLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await audioDebugHelper.runDiagnostics();
      setDiagnostics(results);
      setErrorLogs(audioDebugHelper.getErrorLogs());
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runTransportTest = async () => {
    try {
      const result = await audioDebugHelper.testToneTransport();
      setTestResults(prev => ({ ...prev, transport: result }));
    } catch (error) {
      console.error('Transport test failed:', error);
    }
  };

  const runSynthTest = async () => {
    try {
      const result = await audioDebugHelper.testSynthCreation();
      setTestResults(prev => ({ ...prev, synth: result }));
    } catch (error) {
      console.error('Synth test failed:', error);
    }
  };

  const testFrequencyMapping = () => {
    const testDistances = [0.39, 1.0, 5.2, 19.2, 30.1, 39.48]; // Mercury to Neptune
    testDistances.forEach(distance => {
      audioDebugHelper.testFrequencyMapping(distance);
    });
  };

  const testOrbitalScheduling = () => {
    const testPeriods = [88, 225, 365, 687, 4333, 10759, 30687, 60190]; // Planet orbital periods
    testPeriods.forEach(period => {
      audioDebugHelper.testOrbitalScheduling(period);
    });
  };

  const simulateUserGesture = async () => {
    try {
      const result = await audioDebugHelper.simulateUserGesture();
      setTestResults(prev => ({ ...prev, userGesture: result }));
      // Refresh diagnostics after user gesture
      await runDiagnostics();
    } catch (error) {
      console.error('User gesture simulation failed:', error);
    }
  };

  const generateReport = () => {
    const report = audioDebugHelper.generateReport();
    console.log(report);
    alert('Debug report generated and logged to console. Check browser console for full details.');
  };

  const clearErrors = () => {
    audioDebugHelper.clearErrorLogs();
    setErrorLogs([]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">🔍 Audio Debug Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </button>
          <button
            onClick={runTransportTest}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Test Transport
          </button>
          <button
            onClick={runSynthTest}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Test Synth
          </button>
          <button
            onClick={testFrequencyMapping}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Test Frequency Mapping
          </button>
          <button
            onClick={testOrbitalScheduling}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
          >
            Test Orbital Scheduling
          </button>
          <button
            onClick={simulateUserGesture}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
          >
            Simulate User Gesture
          </button>
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded"
          >
            Generate Report
          </button>
          <button
            onClick={clearErrors}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Clear Errors
          </button>
        </div>

        {/* Diagnostics Results */}
        {diagnostics && (
          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-semibold text-green-400">📊 Diagnostics Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400 mb-2">Browser Info</h4>
                <p>Name: {diagnostics.browserInfo.name}</p>
                <p>Version: {diagnostics.browserInfo.version}</p>
                <p>Platform: {diagnostics.browserInfo.platform}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400 mb-2">Audio Support</h4>
                <p>Web Audio API: {diagnostics.webAudioSupported ? '✅' : '❌'}</p>
                <p>Tone.js: {diagnostics.toneAvailable ? '✅' : '❌'}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400 mb-2">Context States</h4>
                <p>Audio Context: {diagnostics.audioContextState}</p>
                <p>Tone.js Context: {diagnostics.toneContextState}</p>
                <p>User Gesture Required: {diagnostics.userGestureRequired ? '✅' : '❌'}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400 mb-2">Transport State</h4>
                <p>Running: {diagnostics.transportState.isRunning ? '✅' : '❌'}</p>
                <p>BPM: {diagnostics.transportState.bpm}</p>
                <p>Position: {diagnostics.transportState.position}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-semibold text-yellow-400">🧪 Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="bg-gray-800 p-4 rounded">
                  <p className="font-semibold">{test}: {result ? '✅ Passed' : '❌ Failed'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Logs */}
        {errorLogs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-400">❌ Error Logs</h3>
            <div className="bg-gray-800 p-4 rounded max-h-60 overflow-y-auto">
              {errorLogs.map((error, index) => (
                <div key={index} className="text-red-300 text-sm mb-2 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debugging Tips */}
        <div className="mt-6 p-4 bg-blue-900 rounded">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">💡 Debugging Tips</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• If Web Audio API is not supported, try a modern browser</li>
            <li>• If Tone.js is not available, check if it's properly imported</li>
            <li>• If user gesture is required, click the "Simulate User Gesture" button</li>
            <li>• If context is suspended, user interaction is needed to start audio</li>
            <li>• If transport tests fail, check Tone.Transport initialization</li>
            <li>• If synth tests fail, check audio context and connections</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
