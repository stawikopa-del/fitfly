import confetti from 'canvas-confetti';

export const triggerLevelUpConfetti = () => {
  // Big celebration for level up
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4ade80', '#22c55e', '#16a34a', '#fbbf24', '#f59e0b']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4ade80', '#22c55e', '#16a34a', '#fbbf24', '#f59e0b']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerBadgeConfetti = () => {
  // Burst for badge
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4ade80', '#22c55e', '#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6']
  });
};

export const triggerSmallConfetti = () => {
  // Small celebration
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#4ade80', '#22c55e']
  });
};
