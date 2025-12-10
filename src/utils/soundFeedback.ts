import { getSoundTheme, SoundTheme } from '@/hooks/useSoundSettings';

// Audio context for generating sounds - lazy initialized
let audioContext: AudioContext | null = null;
let audioInitialized = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
};

// Initialize audio on first user interaction
const initAudioOnInteraction = () => {
  if (audioInitialized) return;
  audioInitialized = true;
  
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
};

if (typeof window !== 'undefined') {
  const initHandler = () => {
    initAudioOnInteraction();
    window.removeEventListener('click', initHandler);
    window.removeEventListener('touchstart', initHandler);
  };
  window.addEventListener('click', initHandler, { once: true });
  window.addEventListener('touchstart', initHandler, { once: true });
}

// Vibration helper
const vibrate = (pattern: number | number[]) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
};

// ============= SOFT THEME (pops & clicks) =============
const playSoftClick = (duration: number = 0.03, volume: number = 0.08) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
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
  } catch {}
};

const playSoftPop = (pitch: number = 1, volume: number = 0.12) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
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
  } catch {}
};

const playSoftChime = (baseFreq: number = 800, volume: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
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
  } catch {}
};

// ============= TONES THEME (crystal/glass sounds) =============
const playCrystal = (frequency: number, duration: number = 0.3, volume: number = 0.15) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    oscillator.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    oscillator2.frequency.value = frequency * 2.5;
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  } catch {}
};

const playCrystalChime = (baseFreq: number = 1200, volume: number = 0.12) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playCrystal(freq, 0.4, volume * (1 - i * 0.2));
      }, i * 50);
    });
  } catch {}
};

// ============= NATURE THEME (organic) =============
const playNatureWhoosh = (volume: number = 0.1, duration: number = 0.15) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    
    source.start(ctx.currentTime);
  } catch {}
};

const playNatureDrop = (pitch: number = 1, volume: number = 0.12) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(400 * pitch, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150 * pitch, ctx.currentTime + 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {}
};

// ============= THEMED SOUND EFFECTS =============

const playThemedButtonClick = (theme: SoundTheme) => {
  switch (theme) {
    case 'soft':
      playSoftClick(0.025, 0.06);
      break;
    case 'tones':
      playCrystal(1800, 0.08, 0.1);
      break;
    case 'nature':
      playNatureWhoosh(0.08, 0.08);
      break;
  }
};

const playThemedSuccess = (theme: SoundTheme) => {
  switch (theme) {
    case 'soft':
      playSoftPop(1.5, 0.12);
      setTimeout(() => playSoftChime(600, 0.08), 60);
      break;
    case 'tones':
      playCrystal(1400, 0.15, 0.12);
      setTimeout(() => playCrystal(1800, 0.15, 0.1), 80);
      setTimeout(() => playCrystal(2200, 0.2, 0.08), 160);
      break;
    case 'nature':
      playNatureDrop(1.2, 0.12);
      setTimeout(() => playNatureDrop(1.5, 0.1), 100);
      break;
  }
};

const playThemedError = (theme: SoundTheme) => {
  switch (theme) {
    case 'soft':
      playSoftPop(0.7, 0.1);
      setTimeout(() => playSoftPop(0.5, 0.08), 80);
      break;
    case 'tones':
      playCrystal(800, 0.12, 0.1);
      setTimeout(() => playCrystal(600, 0.15, 0.08), 100);
      break;
    case 'nature':
      playNatureDrop(0.6, 0.1);
      break;
  }
};

const playThemedNotification = (theme: SoundTheme) => {
  switch (theme) {
    case 'soft':
      playSoftChime(700, 0.1);
      break;
    case 'tones':
      playCrystalChime(1600, 0.1);
      break;
    case 'nature':
      playNatureWhoosh(0.1, 0.12);
      setTimeout(() => playNatureDrop(1.3, 0.08), 80);
      break;
  }
};

const playThemedAchievement = (theme: SoundTheme) => {
  switch (theme) {
    case 'soft':
      playSoftPop(1.4, 0.12);
      setTimeout(() => playSoftChime(800, 0.1), 80);
      setTimeout(() => playSoftChime(1000, 0.08), 180);
      break;
    case 'tones':
      playCrystal(1200, 0.2, 0.12);
      setTimeout(() => playCrystal(1600, 0.2, 0.1), 100);
      setTimeout(() => playCrystal(2000, 0.2, 0.1), 200);
      setTimeout(() => playCrystalChime(2400, 0.1), 300);
      break;
    case 'nature':
      playNatureDrop(1.2, 0.1);
      setTimeout(() => playNatureDrop(1.5, 0.12), 100);
      setTimeout(() => playNatureWhoosh(0.12, 0.2), 200);
      break;
  }
};

// ============= EXPORTED SOUND FEEDBACK =============

export const soundFeedback = {
  buttonClick: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(8);
  },
  
  primaryClick: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(12);
  },
  
  secondaryClick: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(6);
  },
  
  navTap: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(5);
  },
  
  success: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedSuccess(theme);
    vibrate([20, 20, 30]);
  },
  
  toggle: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(10);
  },
  
  cardTap: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(4);
  },
  
  error: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedError(theme);
    vibrate([30, 20, 30]);
  },
  
  notification: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedNotification(theme);
    vibrate([15, 15, 15]);
  },
  
  achievement: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedAchievement(theme);
    vibrate([40, 30, 40, 30, 80]);
  },
  
  messageSent: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedButtonClick(theme);
    vibrate(10);
  },
  
  messageReceived: () => {
    const theme = getSoundTheme();
    if (theme === 'off') return;
    playThemedNotification(theme);
    vibrate([12, 10, 12]);
  },
};

export const resumeAudioContext = () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {}
};

// ============= WORKOUT FEEDBACK (uses same themes) =============
export const workoutFeedback = {
  tick: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate(20); return; }
    playThemedButtonClick(theme);
    vibrate(20);
  },
  
  exerciseComplete: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate([40, 25, 40]); return; }
    playThemedSuccess(theme);
    vibrate([40, 25, 40]);
  },
  
  breakComplete: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate([30, 20, 30, 20, 60]); return; }
    playThemedNotification(theme);
    vibrate([30, 20, 30, 20, 60]);
  },
  
  workoutComplete: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate([80, 40, 80, 40, 150]); return; }
    playThemedAchievement(theme);
    vibrate([80, 40, 80, 40, 150]);
  },
  
  start: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate(40); return; }
    playThemedButtonClick(theme);
    vibrate(40);
  },
  
  pause: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate(20); return; }
    playThemedButtonClick(theme);
    vibrate(20);
  },
  
  skip: () => {
    const theme = getSoundTheme();
    if (theme === 'off') { vibrate([15, 10, 15]); return; }
    playThemedButtonClick(theme);
    vibrate([15, 10, 15]);
  },
  
  buttonPress: () => {
    vibrate(12);
  }
};
