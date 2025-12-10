// Audio context for generating sounds
let audioContext: AudioContext | null = null;
let audioInitialized = false;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Auto-resume if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Initialize audio on first user interaction
if (typeof window !== 'undefined') {
  const initHandler = () => {
    if (audioInitialized) return;
    audioInitialized = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    window.removeEventListener('click', initHandler);
    window.removeEventListener('touchstart', initHandler);
  };
  window.addEventListener('click', initHandler, { once: true });
  window.addEventListener('touchstart', initHandler, { once: true });
}

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

// Sound + Vibration effects - warm, energetic tones
export const workoutFeedback = {
  // Countdown tick (last 3 seconds)
  tick: () => {
    playTone(587, 0.08, 'sine', 0.15); // D5 - softer tick
    vibrate(40);
  },
  
  // Exercise complete - transition to break
  exerciseComplete: () => {
    // Satisfying completion sound
    playTone(392, 0.12, 'sine', 0.22); // G4
    setTimeout(() => playTone(494, 0.15, 'sine', 0.25), 130); // B4
    vibrate([70, 40, 70]);
  },
  
  // Break complete - new exercise starting
  breakComplete: () => {
    // Energizing start sound
    playTone(392, 0.08, 'sine', 0.2); // G4
    setTimeout(() => playTone(494, 0.08, 'sine', 0.2), 90); // B4
    setTimeout(() => playTone(587, 0.12, 'sine', 0.22), 180); // D5
    vibrate([60, 40, 60, 40, 120]);
  },
  
  // Workout complete - celebration
  workoutComplete: () => {
    // Triumphant but warm celebration
    playTone(392, 0.12, 'sine', 0.25); // G4
    setTimeout(() => playTone(494, 0.12, 'sine', 0.25), 140); // B4
    setTimeout(() => playTone(587, 0.12, 'sine', 0.28), 280); // D5
    setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 420); // G5
    vibrate([150, 80, 150, 80, 300]);
  },
  
  // Start workout / resume
  start: () => {
    playTone(392, 0.1, 'sine', 0.18); // G4 - ready sound
    vibrate(80);
  },
  
  // Pause workout
  pause: () => {
    playTone(330, 0.12, 'sine', 0.12); // E4 - gentle pause
    vibrate(40);
  },
  
  // Skip exercise
  skip: () => {
    playTone(494, 0.06, 'sine', 0.12); // B4
    setTimeout(() => playTone(392, 0.06, 'sine', 0.1), 60); // G4
    vibrate([35, 25, 35]);
  },
  
  // Button press feedback
  buttonPress: () => {
    vibrate(25);
  }
};

// Resume audio context after user interaction (needed for some browsers)
export const resumeAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};
