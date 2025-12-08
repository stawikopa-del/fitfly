import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPattern } from '@/data/workoutPrograms';

interface BreathingExerciseProps {
  pattern: BreathingPattern;
  isActive: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export function BreathingExercise({ pattern, isActive }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let timeout: NodeJS.Timeout;

    const runBreathCycle = () => {
      // Inhale
      setPhase('inhale');
      
      timeout = setTimeout(() => {
        if (pattern.hold > 0) {
          // Hold
          setPhase('hold');
          timeout = setTimeout(() => {
            // Exhale
            setPhase('exhale');
            timeout = setTimeout(() => {
              setCycle(c => c + 1);
            }, pattern.exhale * 1000);
          }, pattern.hold * 1000);
        } else {
          // Exhale directly
          setPhase('exhale');
          timeout = setTimeout(() => {
            setCycle(c => c + 1);
          }, pattern.exhale * 1000);
        }
      }, pattern.inhale * 1000);
    };

    runBreathCycle();

    return () => clearTimeout(timeout);
  }, [isActive, cycle, pattern]);

  const getPhaseText = (): string => {
    switch (phase) {
      case 'inhale': return 'Wdech';
      case 'hold': return 'Zatrzymaj';
      case 'exhale': return 'Wydech';
    }
  };

  const getPhaseDuration = (): number => {
    switch (phase) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
    }
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-blue-600';
      case 'hold': return 'from-purple-400 to-purple-600';
      case 'exhale': return 'from-green-400 to-green-600';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Breathing Circle Animation */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <motion.div
          key={phase}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-30`}
          initial={{ scale: phase === 'inhale' ? 0.6 : phase === 'hold' ? 1 : 1 }}
          animate={{ scale: phase === 'inhale' ? 1 : phase === 'hold' ? 1 : 0.6 }}
          transition={{ 
            duration: getPhaseDuration(),
            ease: phase === 'hold' ? 'linear' : 'easeInOut'
          }}
        />
        <motion.div
          key={`inner-${phase}`}
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${getPhaseColor()}`}
          initial={{ scale: phase === 'inhale' ? 0.8 : 1 }}
          animate={{ scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.8 }}
          transition={{ 
            duration: getPhaseDuration(),
            ease: phase === 'hold' ? 'linear' : 'easeInOut'
          }}
        />
        <motion.p 
          key={`text-${phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute text-white font-bold text-sm"
        >
          {getPhaseText()}
        </motion.p>
      </div>

      {/* Pattern Info */}
      <p className="text-xs text-muted-foreground">
        {pattern.inhale}s wdech {pattern.hold > 0 && `• ${pattern.hold}s trzymaj`} • {pattern.exhale}s wydech
      </p>
    </div>
  );
}
