import { Variants, Transition } from 'framer-motion';

// Spring transition presets
export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springGentle,
      staggerChildren: 0.07,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

// Card pop-in variants
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springBouncy,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { ...springSnappy, duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// List item stagger variants
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springBouncy,
  },
};

// Fade up variants (subtle)
export const fadeUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springGentle,
  },
};

// Scale pop variants
export const scalePopVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};

// Button press variants
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: springSnappy,
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// Stat card variants (for dashboard stats)
export const statCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springBouncy,
      delay: i * 0.1,
    },
  }),
};

// Icon bounce variants
export const iconBounceVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Slide in from side variants
export const slideInLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springGentle,
  },
};

export const slideInRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springGentle,
  },
};

// Modal/Dialog variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Backdrop variants
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Progress bar fill variants
export const progressFillVariants: Variants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      ...springGentle,
      duration: 0.8,
    },
  },
};

// Floating animation variants
export const floatingVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Pulse glow variants
export const pulseGlowVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Stagger children helper
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Nav item variants for bottom navigation
export const navItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springBouncy,
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

// Badge/chip pop variants
export const badgeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

// Shake animation (for errors)
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// Success checkmark variants
export const checkmarkVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};
