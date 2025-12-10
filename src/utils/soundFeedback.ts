// Audio context for generating sounds - lazy initialized
let audioContext: AudioContext | null = null;

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
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available - fail silently
  }
};

// App-wide sound & vibration effects - soft, warm tones
export const soundFeedback = {
  buttonClick: () => {
    playTone(392, 0.05, 'sine', 0.12); // G4 - gentle tap
    vibrate(15);
  },
  
  primaryClick: () => {
    playTone(523, 0.07, 'sine', 0.15); // C5 - soft click
    vibrate(25);
  },
  
  secondaryClick: () => {
    playTone(349, 0.04, 'sine', 0.1); // F4 - subtle
    vibrate(12);
  },
  
  navTap: () => {
    playTone(440, 0.04, 'sine', 0.08); // A4 - minimal
    vibrate(10);
  },
  
  success: () => {
    // Warm major chord arpeggio
    playTone(392, 0.12, 'sine', 0.18); // G4
    setTimeout(() => playTone(494, 0.12, 'sine', 0.18), 100); // B4
    setTimeout(() => playTone(587, 0.15, 'sine', 0.2), 200); // D5
    vibrate([40, 30, 60]);
  },
  
  toggle: () => {
    playTone(466, 0.04, 'sine', 0.1); // Bb4 - soft pop
    vibrate(18);
  },
  
  cardTap: () => {
    playTone(330, 0.03, 'sine', 0.08); // E4 - whisper
    vibrate(8);
  },
  
  error: () => {
    // Gentle descending tone instead of harsh
    playTone(392, 0.12, 'sine', 0.15); // G4
    setTimeout(() => playTone(330, 0.15, 'sine', 0.12), 120); // E4
    vibrate([60, 40, 60]);
  },
  
  notification: () => {
    // Soft bell-like chime
    playTone(659, 0.08, 'sine', 0.15); // E5
    setTimeout(() => playTone(784, 0.1, 'sine', 0.12), 80); // G5
    vibrate([30, 30, 30]);
  },
  
  achievement: () => {
    // Warm celebratory melody
    playTone(392, 0.1, 'sine', 0.2); // G4
    setTimeout(() => playTone(494, 0.1, 'sine', 0.2), 120); // B4
    setTimeout(() => playTone(587, 0.1, 'sine', 0.22), 240); // D5
    setTimeout(() => playTone(784, 0.18, 'sine', 0.25), 360); // G5
    vibrate([80, 50, 80, 50, 150]);
  },
  
  messageSent: () => {
    // Soft whoosh up
    playTone(440, 0.06, 'sine', 0.12); // A4
    setTimeout(() => playTone(554, 0.05, 'sine', 0.1), 40); // C#5
    vibrate(20);
  },
  
  messageReceived: () => {
    // Gentle notification drop
    playTone(587, 0.08, 'sine', 0.14); // D5
    setTimeout(() => playTone(494, 0.1, 'sine', 0.12), 70); // B4
    vibrate([25, 15, 25]);
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

// Workout-specific sounds - energetic but warm
export const workoutFeedback = {
  tick: () => {
    playTone(587, 0.08, 'sine', 0.15); // D5 - softer tick
    vibrate(40);
  },
  
  exerciseComplete: () => {
    // Satisfying completion sound
    playTone(392, 0.12, 'sine', 0.22); // G4
    setTimeout(() => playTone(494, 0.15, 'sine', 0.25), 130); // B4
    vibrate([70, 40, 70]);
  },
  
  breakComplete: () => {
    // Energizing start sound
    playTone(392, 0.08, 'sine', 0.2); // G4
    setTimeout(() => playTone(494, 0.08, 'sine', 0.2), 90); // B4
    setTimeout(() => playTone(587, 0.12, 'sine', 0.22), 180); // D5
    vibrate([60, 40, 60, 40, 120]);
  },
  
  workoutComplete: () => {
    // Triumphant but warm celebration
    playTone(392, 0.12, 'sine', 0.25); // G4
    setTimeout(() => playTone(494, 0.12, 'sine', 0.25), 140); // B4
    setTimeout(() => playTone(587, 0.12, 'sine', 0.28), 280); // D5
    setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 420); // G5
    vibrate([150, 80, 150, 80, 300]);
  },
  
  start: () => {
    playTone(392, 0.1, 'sine', 0.18); // G4 - ready sound
    vibrate(80);
  },
  
  pause: () => {
    playTone(330, 0.12, 'sine', 0.12); // E4 - gentle pause
    vibrate(40);
  },
  
  skip: () => {
    playTone(494, 0.06, 'sine', 0.12); // B4
    setTimeout(() => playTone(392, 0.06, 'sine', 0.1), 60); // G4
    vibrate([35, 25, 35]);
  },
  
  buttonPress: () => {
    vibrate(25);
  }
};
