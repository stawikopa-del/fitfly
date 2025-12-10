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

// Play soft pop sound
const playPop = (pitch: number = 1, volume: number = 0.12) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(180 * pitch, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80 * pitch, ctx.currentTime + 0.06);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Play soft chime
const playChime = (baseFreq: number = 800, volume: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Soft click
const playClick = (duration: number = 0.03, volume: number = 0.08) => {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    source.start(ctx.currentTime);
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

// Sound + Vibration effects - soft pops and clicks
export const workoutFeedback = {
  tick: () => {
    playClick(0.02, 0.05);
    vibrate(20);
  },
  
  exerciseComplete: () => {
    playPop(1.3, 0.12);
    setTimeout(() => playChime(600, 0.08), 70);
    vibrate([40, 25, 40]);
  },
  
  breakComplete: () => {
    playPop(1.4, 0.1);
    setTimeout(() => playPop(1.6, 0.08), 60);
    setTimeout(() => playChime(700, 0.1), 140);
    vibrate([30, 20, 30, 20, 60]);
  },
  
  workoutComplete: () => {
    playPop(1.5, 0.12);
    setTimeout(() => playChime(700, 0.1), 100);
    setTimeout(() => playChime(900, 0.1), 220);
    setTimeout(() => playChime(1100, 0.08), 360);
    vibrate([80, 40, 80, 40, 150]);
  },
  
  start: () => {
    playPop(1.2, 0.1);
    vibrate(40);
  },
  
  pause: () => {
    playClick(0.03, 0.05);
    vibrate(20);
  },
  
  skip: () => {
    playClick(0.025, 0.04);
    vibrate([15, 10, 15]);
  },
  
  buttonPress: () => {
    vibrate(12);
  }
};

// Resume audio context after user interaction
export const resumeAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};
