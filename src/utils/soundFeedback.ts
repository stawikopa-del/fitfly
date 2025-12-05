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

// App-wide sound & vibration effects
export const soundFeedback = {
  // Generic button click - soft, pleasant pop
  buttonClick: () => {
    playTone(600, 0.06, 'sine', 0.15);
    vibrate(20);
  },
  
  // Primary action button - slightly more pronounced
  primaryClick: () => {
    playTone(700, 0.08, 'sine', 0.2);
    vibrate(30);
  },
  
  // Secondary/outline button - softer
  secondaryClick: () => {
    playTone(500, 0.05, 'sine', 0.12);
    vibrate(15);
  },
  
  // Navigation tap
  navTap: () => {
    playTone(550, 0.05, 'sine', 0.1);
    vibrate(15);
  },
  
  // Success action (e.g., adding water, completing task)
  success: () => {
    playTone(523, 0.1, 'sine', 0.25); // C5
    setTimeout(() => playTone(659, 0.12, 'sine', 0.25), 80); // E5
    vibrate([50, 30, 50]);
  },
  
  // Toggle/switch sound
  toggle: () => {
    playTone(650, 0.05, 'sine', 0.15);
    vibrate(25);
  },
  
  // Card tap/expand
  cardTap: () => {
    playTone(480, 0.04, 'sine', 0.1);
    vibrate(10);
  },
  
  // Error/warning
  error: () => {
    playTone(300, 0.15, 'triangle', 0.2);
    vibrate([100, 50, 100]);
  },
  
  // Notification/alert
  notification: () => {
    playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.2), 100);
    vibrate([50, 50, 50]);
  },
  
  // Achievement/reward
  achievement: () => {
    playTone(523, 0.12, 'triangle', 0.3);
    setTimeout(() => playTone(659, 0.12, 'triangle', 0.3), 100);
    setTimeout(() => playTone(784, 0.12, 'triangle', 0.3), 200);
    setTimeout(() => playTone(1047, 0.2, 'triangle', 0.35), 300);
    vibrate([100, 50, 100, 50, 200]);
  },
  
  // Message sent - swoosh sound
  messageSent: () => {
    playTone(600, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(800, 0.06, 'sine', 0.15), 50);
    vibrate(25);
  },
  
  // Message received - gentle pop
  messageReceived: () => {
    playTone(500, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(700, 0.08, 'sine', 0.18), 80);
    vibrate([30, 20, 30]);
  },
};

// Resume audio context after user interaction (needed for some browsers)
export const resumeAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

// Re-export workout-specific sounds for backward compatibility
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
