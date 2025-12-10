// Audio context for generating sounds - lazy initialized
let audioContext: AudioContext | null = null;

// Get settings from localStorage
const getSettings = (): { sounds: boolean; vibrations: boolean } => {
  if (typeof window === 'undefined') return { sounds: false, vibrations: true };
  try {
    const saved = localStorage.getItem('fitfly-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        sounds: parsed.sounds ?? false,
        vibrations: parsed.vibrations ?? true,
      };
    }
  } catch {
    // Ignore errors
  }
  return { sounds: false, vibrations: true };
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    return audioContext;
  } catch {
    return null;
  }
};

// Generate a beep sound
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  // Check if sounds are enabled
  const { sounds } = getSettings();
  if (!sounds) return;
  
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
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
  } catch {
    // Audio not available - fail silently
  }
};

// Vibration patterns (in milliseconds)
const vibrate = (pattern: number | number[]) => {
  // Check if vibrations are enabled
  const { vibrations } = getSettings();
  if (!vibrations) return;
  
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available - fail silently
  }
};

// App-wide sound & vibration effects
export const soundFeedback = {
  buttonClick: () => {
    playTone(600, 0.06, 'sine', 0.15);
    vibrate(20);
  },
  
  primaryClick: () => {
    playTone(700, 0.08, 'sine', 0.2);
    vibrate(30);
  },
  
  secondaryClick: () => {
    playTone(500, 0.05, 'sine', 0.12);
    vibrate(15);
  },
  
  navTap: () => {
    playTone(550, 0.05, 'sine', 0.1);
    vibrate(15);
  },
  
  success: () => {
    playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.25), 80);
    vibrate([50, 30, 50]);
  },
  
  toggle: () => {
    playTone(650, 0.05, 'sine', 0.15);
    vibrate(25);
  },
  
  cardTap: () => {
    playTone(480, 0.04, 'sine', 0.1);
    vibrate(10);
  },
  
  error: () => {
    playTone(300, 0.15, 'triangle', 0.2);
    vibrate([100, 50, 100]);
  },
  
  notification: () => {
    playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.2), 100);
    vibrate([50, 50, 50]);
  },
  
  achievement: () => {
    playTone(523, 0.12, 'triangle', 0.3);
    setTimeout(() => playTone(659, 0.12, 'triangle', 0.3), 100);
    setTimeout(() => playTone(784, 0.12, 'triangle', 0.3), 200);
    setTimeout(() => playTone(1047, 0.2, 'triangle', 0.35), 300);
    vibrate([100, 50, 100, 50, 200]);
  },
  
  messageSent: () => {
    playTone(600, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(800, 0.06, 'sine', 0.15), 50);
    vibrate(25);
  },
  
  messageReceived: () => {
    playTone(500, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(700, 0.08, 'sine', 0.18), 80);
    vibrate([30, 20, 30]);
  },
};

// Resume audio context after user interaction
export const resumeAudioContext = () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Fail silently
  }
};

// Workout-specific sounds
export const workoutFeedback = {
  tick: () => {
    playTone(800, 0.1, 'sine', 0.2);
    vibrate(50);
  },
  
  exerciseComplete: () => {
    playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.2, 'sine', 0.3), 150);
    vibrate([100, 50, 100]);
  },
  
  breakComplete: () => {
    playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200);
    vibrate([100, 50, 100, 50, 200]);
  },
  
  workoutComplete: () => {
    playTone(523, 0.15, 'triangle', 0.4);
    setTimeout(() => playTone(659, 0.15, 'triangle', 0.4), 150);
    setTimeout(() => playTone(784, 0.15, 'triangle', 0.4), 300);
    setTimeout(() => playTone(1047, 0.3, 'triangle', 0.5), 450);
    vibrate([200, 100, 200, 100, 400]);
  },
  
  start: () => {
    playTone(440, 0.1, 'sine', 0.25);
    vibrate(100);
  },
  
  pause: () => {
    playTone(330, 0.15, 'sine', 0.2);
    vibrate(50);
  },
  
  skip: () => {
    playTone(600, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(500, 0.08, 'sine', 0.2), 80);
    vibrate([50, 30, 50]);
  },
  
  buttonPress: () => {
    vibrate(30);
  }
};
