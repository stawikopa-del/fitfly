// Audio context for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate a beep sound
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Vibration patterns (in milliseconds)
const vibrate = (pattern: number | number[]) => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    console.log('Vibration not available:', e);
  }
};

// Sound + Vibration effects
export const workoutFeedback = {
  // Countdown tick (last 3 seconds)
  tick: () => {
    playTone(800, 0.1, 'sine', 0.2);
    vibrate(50);
  },
  
  // Exercise complete - transition to break
  exerciseComplete: () => {
    // Rising two-tone sound
    playTone(523, 0.15, 'sine', 0.3); // C5
    setTimeout(() => playTone(659, 0.2, 'sine', 0.3), 150); // E5
    vibrate([100, 50, 100]);
  },
  
  // Break complete - new exercise starting
  breakComplete: () => {
    // Three ascending tones
    playTone(523, 0.1, 'sine', 0.3); // C5
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200); // G5
    vibrate([100, 50, 100, 50, 200]);
  },
  
  // Workout complete - celebration
  workoutComplete: () => {
    // Fanfare-like sound
    playTone(523, 0.15, 'triangle', 0.4); // C5
    setTimeout(() => playTone(659, 0.15, 'triangle', 0.4), 150); // E5
    setTimeout(() => playTone(784, 0.15, 'triangle', 0.4), 300); // G5
    setTimeout(() => playTone(1047, 0.3, 'triangle', 0.5), 450); // C6
    vibrate([200, 100, 200, 100, 400]);
  },
  
  // Start workout / resume
  start: () => {
    playTone(440, 0.1, 'sine', 0.25);
    vibrate(100);
  },
  
  // Pause workout
  pause: () => {
    playTone(330, 0.15, 'sine', 0.2);
    vibrate(50);
  },
  
  // Skip exercise
  skip: () => {
    playTone(600, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(500, 0.08, 'sine', 0.2), 80);
    vibrate([50, 30, 50]);
  },
  
  // Button press feedback
  buttonPress: () => {
    vibrate(30);
  }
};

// Resume audio context after user interaction (needed for some browsers)
export const resumeAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};
