# Tone.js Audio Debugging Guide

This guide provides comprehensive debugging steps for common Tone.js issues in the Sol application.

## 🔍 Debugging Tools

### 1. Audio Debug Panel
Access the debug panel by clicking the "🔍 Audio Debug Panel" link in the footer of the application.

**Features:**
- Comprehensive audio system diagnostics
- Individual component testing
- Real-time error logging
- Browser compatibility checking
- User gesture simulation

### 2. Audio Debug Helper
Located at `src/lib/audioDebugHelper.ts`, this provides programmatic access to debugging functions.

## 🚨 Common Issues & Solutions

### Issue 1: No Sound When Clicking Play

**Symptoms:**
- Play button shows as active but no audio
- No errors in console
- Visual animations work but no sound

**Debugging Steps:**

1. **Check Audio Context State**
   ```javascript
   // Open debug panel and run diagnostics
   // Look for "Audio Context" and "Tone.js Context" states
   ```

2. **Verify User Gesture**
   ```javascript
   // In debug panel, click "Simulate User Gesture"
   // This should resume suspended audio contexts
   ```

3. **Test Basic Synth**
   ```javascript
   // In debug panel, click "Test Synth"
   // If this fails, there's a fundamental audio issue
   ```

**Common Solutions:**
- **Browser Autoplay Policy:** Modern browsers require user interaction before playing audio
- **Context State:** Audio context might be suspended - need user gesture to resume
- **Volume Levels:** Master volume might be muted or too low

### Issue 2: Controls Not Affecting Audio Parameters

**Symptoms:**
- Volume slider moves but no change in sound level
- Tempo changes don't affect playback speed
- Planet mute buttons don't work

**Debugging Steps:**

1. **Check Transport State**
   ```javascript
   // In debug panel, click "Test Transport"
   // Verify BPM and position are updating
   ```

2. **Test Individual Controls**
   ```javascript
   // Check browser console for control change events
   // Look for errors in the error logs
   ```

3. **Verify Synth Connections**
   ```javascript
   // Check if synths are properly connected to output
   // Look for connection errors in debug panel
   ```

**Common Solutions:**
- **Debouncing Issues:** Controls might be debounced too aggressively
- **Transport Not Started:** Tone.Transport might not be properly initialized
- **Synth Disconnection:** Individual planet synths might be disconnected

### Issue 3: Browser Console Errors Related to Audio Context

**Symptoms:**
- "AudioContext is suspended" errors
- "Tone.js context not started" warnings
- "Failed to construct AudioContext" errors

**Debugging Steps:**

1. **Check Browser Compatibility**
   ```javascript
   // In debug panel, check "Browser Info" section
   // Verify Web Audio API support
   ```

2. **Run Full Diagnostics**
   ```javascript
   // Click "Run Diagnostics" in debug panel
   // Check all system requirements
   ```

3. **Test Context Creation**
   ```javascript
   // Look for context creation errors
   // Check if Tone.js is properly loaded
   ```

**Common Solutions:**
- **Browser Support:** Some older browsers don't support Web Audio API
- **HTTPS Requirement:** Audio context requires HTTPS in most browsers
- **Tone.js Loading:** Verify Tone.js is properly imported and available

### Issue 4: Timing Issues with Planet Loops

**Symptoms:**
- Planet loops are out of sync
- Timing drifts over time
- Some planets don't loop at all

**Debugging Steps:**

1. **Test Orbital Scheduling**
   ```javascript
   // In debug panel, click "Test Orbital Scheduling"
   // Verify interval calculations are correct
   ```

2. **Check Transport Position**
   ```javascript
   // Monitor transport position in debug panel
   // Look for position jumps or resets
   ```

3. **Test Frequency Mapping**
   ```javascript
   // Click "Test Frequency Mapping"
   // Verify frequency calculations match expected values
   ```

**Common Solutions:**
- **Transport Sync:** Ensure all loops are scheduled relative to Transport
- **Interval Calculations:** Verify orbital period to interval conversions
- **Timing Precision:** Use Tone.Transport timing instead of setTimeout

## 🛠️ Advanced Debugging

### Console Commands

Open browser console and run these commands for manual debugging:

```javascript
// Check if Tone.js is loaded
typeof Tone !== 'undefined'

// Check audio context state
Tone.context.state

// Check transport state
Tone.Transport.state
Tone.Transport.bpm.value
Tone.Transport.position

// List all scheduled events
Tone.Transport._scheduledEvents

// Test basic sound
const synth = new Tone.Synth().toDestination()
synth.triggerAttackRelease("C4", "8n")
```

### Manual Context Resume

```javascript
// Resume audio context manually
if (Tone.context.state === 'suspended') {
  Tone.context.resume().then(() => {
    console.log('Audio context resumed');
  });
}
```

### Transport Debugging

```javascript
// Start transport manually
Tone.Transport.start().then(() => {
  console.log('Transport started');
});

// Stop transport manually
Tone.Transport.stop();

// Check transport events
Tone.Transport.on('start', (time) => {
  console.log('Transport started at:', time);
});

Tone.Transport.on('stop', () => {
  console.log('Transport stopped');
});
```

## 📊 Debugging Checklist

### Pre-Flight Checks
- [ ] Browser supports Web Audio API
- [ ] Tone.js is loaded and available
- [ ] Application is served over HTTPS (or localhost)
- [ ] User has interacted with the page

### Initialization Checks
- [ ] Audio context is created successfully
- [ ] Audio context is in 'running' state
- [ ] Tone.js context is started
- [ ] Master volume is set correctly
- [ ] All planet synths are created

### Playback Checks
- [ ] Transport is started when play is clicked
- [ ] Transport BPM is set correctly
- [ ] Individual planet loops are scheduled
- [ ] Synths are connected to output
- [ ] Volume controls are working

### Timing Checks
- [ ] Planet intervals are calculated correctly
- [ ] Loops are synchronized with transport
- [ ] No timing drift over extended playback
- [ ] Frequency mapping is accurate

## 🔧 Common Fixes

### Fix 1: Audio Context Suspended
```javascript
// Add this to your play button handler
async function handlePlay() {
  if (Tone.context.state === 'suspended') {
    await Tone.context.resume();
  }
  // Rest of your play logic
}
```

### Fix 2: Transport Not Started
```javascript
// Ensure transport is started before scheduling
async function startPlayback() {
  await Tone.Transport.start();
  // Schedule your loops
}
```

### Fix 3: Synth Not Connected
```javascript
// Always connect synths to destination
const synth = new Tone.Synth();
synth.toDestination(); // This is crucial!
```

### Fix 4: Timing Issues
```javascript
// Use Transport timing instead of setTimeout
Tone.Transport.scheduleRepeat((time) => {
  // Your scheduling logic here
  synth.triggerAttackRelease("C4", "8n", time);
}, "8n");
```

## 📚 Additional Resources

- [Tone.js Documentation](https://tonejs.github.io/docs/)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Browser Autoplay Policy](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes)
- [Audio Context Best Practices](https://web.dev/audiocontext/)

## 🐛 Reporting Issues

When reporting audio issues, please include:

1. **Browser Information:** Name, version, platform
2. **Console Errors:** Full error messages and stack traces
3. **Debug Panel Output:** Complete diagnostics report
4. **Steps to Reproduce:** Exact sequence of actions
5. **Expected vs Actual:** What you expected vs what happened

Use the "Generate Report" button in the debug panel to capture all relevant information.
