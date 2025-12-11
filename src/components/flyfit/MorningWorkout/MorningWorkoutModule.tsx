import { useState, useEffect } from 'react';
import { MorningWorkoutInfo } from './MorningWorkoutInfo';
import { MorningWorkoutList } from './MorningWorkoutList';
import { MorningWorkoutPlayer } from './MorningWorkoutPlayer';
import { MorningWorkoutComplete } from './MorningWorkoutComplete';
import { useGamification } from '@/hooks/useGamification';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useWorkout } from '@/contexts/WorkoutContext';

type Screen = 'info' | 'list' | 'player' | 'complete';

interface MorningWorkoutModuleProps {
  onClose: () => void;
}

export function MorningWorkoutModule({ onClose }: MorningWorkoutModuleProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('info');
  const [startExerciseIndex, setStartExerciseIndex] = useState(0);
  const { onWorkoutCompleted } = useGamification();
  const { addActiveMinutes } = useUserProgress();
  const { setWorkoutActive } = useWorkout();

  // Mark workout as active when in player screen
  useEffect(() => {
    const isActive = currentScreen === 'player';
    setWorkoutActive(isActive);
    
    return () => {
      setWorkoutActive(false);
    };
  }, [currentScreen, setWorkoutActive]);

  const handleStartFromInfo = () => {
    setCurrentScreen('list');
  };

  const handleStartExercise = (index: number) => {
    setStartExerciseIndex(index);
    setCurrentScreen('player');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
  };

  const handleBackToInfo = () => {
    setCurrentScreen('info');
  };

  const handleWorkoutComplete = () => {
    // Add 10 minutes of active time
    addActiveMinutes(10);
    
    // Award XP for completing workout
    onWorkoutCompleted();
    
    setCurrentScreen('complete');
  };

  const handleFinish = () => {
    onClose();
  };

  switch (currentScreen) {
    case 'info':
      return (
        <MorningWorkoutInfo 
          onStart={handleStartFromInfo} 
          onBack={onClose}
        />
      );
    case 'list':
      return (
        <MorningWorkoutList 
          onStartExercise={handleStartExercise}
          onBack={handleBackToInfo}
        />
      );
    case 'player':
      return (
        <MorningWorkoutPlayer 
          startIndex={startExerciseIndex}
          onComplete={handleWorkoutComplete}
          onBackToList={handleBackToList}
        />
      );
    case 'complete':
      return (
        <MorningWorkoutComplete 
          onFinish={handleFinish}
        />
      );
    default:
      return null;
  }
}
