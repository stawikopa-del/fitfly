import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, Play, SkipForward, ChevronRight, Heart, Flame, Clock, Volume2, VolumeX } from 'lucide-react';
import { WorkoutProgram, WorkoutExercise, breathingPatterns, restTips } from '@/data/workoutPrograms';
import { BreathingExercise } from './BreathingExercise';
import { workoutFeedback, resumeAudioContext } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';
import fitekPompki from '@/assets/fitek-pompki.png';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';

interface EnhancedWorkoutPlayerProps {
  workout: WorkoutProgram;
  userEnergy: 'low' | 'medium' | 'high';
  onComplete: (stats: { totalTime: number; exercisesCompleted: number; caloriesBurned: number; xpEarned: number }) => void;
  onBack: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function EnhancedWorkoutPlayer({ workout, userEnergy, onComplete, onBack }: EnhancedWorkoutPlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  
  const exercises = workout.exercises;
  const currentExercise = exercises[currentExerciseIndex];
  
  // Adjust break duration based on energy
  const adjustedBreakDuration = useMemo(() => {
    if (userEnergy === 'low') return Math.ceil(workout.breakDuration * 1.5);
    if (userEnergy === 'high') return Math.floor(workout.breakDuration * 0.7);
    return workout.breakDuration;
  }, [userEnergy, workout.breakDuration]);

  // Initialize timer
  useEffect(() => {
    resumeAudioContext();
    if (currentExercise) {
      setTimeLeft(currentExercise.duration);
    }
  }, []);

  // Update timer when exercise changes
  useEffect(() => {
    if (currentExercise && !isBreak) {
      setTimeLeft(currentExercise.duration);
    }
  }, [currentExerciseIndex, currentExercise]);

  // Set random tip for breaks
  useEffect(() => {
    if (isBreak) {
      setCurrentTip(restTips[Math.floor(Math.random() * restTips.length)]);
    }
  }, [isBreak]);

  // Main timer
  useEffect(() => {
    if (!isRunning || !currentExercise) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (isBreak) {
            // Break finished
            if (soundEnabled) workoutFeedback.breakComplete();
            setIsBreak(false);
            setShowBreathing(false);
            
            if (currentExerciseIndex < exercises.length - 1) {
              setCurrentExerciseIndex(i => i + 1);
              return exercises[currentExerciseIndex + 1].duration;
            } else {
              // Workout complete
              handleComplete();
              return 0;
            }
          } else {
            // Exercise finished
            if (soundEnabled) workoutFeedback.exerciseComplete();
            
            if (currentExerciseIndex < exercises.length - 1) {
              setIsBreak(true);
              setShowBreathing(true);
              return adjustedBreakDuration;
            } else {
              handleComplete();
              return 0;
            }
          }
        }
        
        // Tick sound for last 3 seconds
        if (prev <= 4 && prev > 1 && soundEnabled) {
          workoutFeedback.tick();
        }
        
        return prev - 1;
      });
      
      setElapsedTime(t => t + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, isBreak, currentExerciseIndex, exercises, adjustedBreakDuration, soundEnabled]);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (soundEnabled) workoutFeedback.workoutComplete();
    
    const caloriesBurned = Math.round(
      (workout.calories.min + workout.calories.max) / 2 * 
      (userEnergy === 'high' ? 1.1 : userEnergy === 'low' ? 0.9 : 1)
    );
    
    onComplete({
      totalTime: Math.floor(elapsedTime / 60),
      exercisesCompleted: exercises.length,
      caloriesBurned,
      xpEarned: workout.xpReward
    });
  }, [elapsedTime, exercises.length, workout, userEnergy, soundEnabled, onComplete]);

  const togglePlayPause = useCallback(() => {
    if (!isRunning && soundEnabled) {
      workoutFeedback.start();
    } else if (isRunning && soundEnabled) {
      workoutFeedback.pause();
    }
    setIsRunning(prev => !prev);
  }, [isRunning, soundEnabled]);

  const skipToNext = useCallback(() => {
    if (soundEnabled) workoutFeedback.skip();
    
    if (isBreak) {
      setIsBreak(false);
      setShowBreathing(false);
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(i => i + 1);
      }
    } else {
      if (currentExerciseIndex < exercises.length - 1) {
        setIsBreak(true);
        setShowBreathing(true);
        setTimeLeft(adjustedBreakDuration);
      } else {
        handleComplete();
      }
    }
  }, [isBreak, currentExerciseIndex, exercises.length, adjustedBreakDuration, soundEnabled, handleComplete]);

  // Calculate progress
  const overallProgress = ((currentExerciseIndex + (isBreak ? 0.5 : 0)) / exercises.length) * 100;
  const exerciseProgress = isBreak 
    ? ((adjustedBreakDuration - timeLeft) / adjustedBreakDuration) * 100
    : ((currentExercise?.duration - timeLeft) / currentExercise?.duration) * 100;

  // Get next exercise
  const nextExercise = exercises[currentExerciseIndex + 1];

  const getMascotForExercise = (exercise: WorkoutExercise): string => {
    // Return different mascot based on animation type
    if (exercise.animationType === 'pulse' || exercise.animationType === 'bounce') {
      return fitekPajacyki;
    }
    return fitekPompki;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isBreak ? 'Przerwa' : `Ćwiczenie ${currentExerciseIndex + 1}/${exercises.length}`}
          </p>
          <p className="font-bold text-sm">{workout.name}</p>
        </div>
        
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="px-4 pt-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {isBreak ? (
            <motion.div
              key="break"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full text-center"
            >
              <div className="mb-6">
                <p className="text-6xl mb-2">😮‍💨</p>
                <h2 className="text-2xl font-bold text-foreground mb-2">Przerwa</h2>
                <p className="text-muted-foreground">{currentTip}</p>
              </div>

              {/* Breathing Exercise */}
              {showBreathing && (
                <div className="mb-6">
                  <BreathingExercise 
                    pattern={breathingPatterns[0]} 
                    isActive={isRunning}
                  />
                </div>
              )}

              {/* Timer */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-40 h-40 -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-primary"
                    strokeDasharray={440}
                    animate={{ strokeDashoffset: 440 - (exerciseProgress / 100) * 440 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <span className="absolute text-4xl font-bold">{timeLeft}</span>
              </div>

              {/* Next Exercise Preview */}
              {nextExercise && (
                <div className="bg-muted/50 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Następne ćwiczenie</p>
                  <p className="font-bold">{nextExercise.name}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`exercise-${currentExerciseIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full text-center"
            >
              {/* Mascot */}
              <motion.div 
                className="mb-4"
                animate={
                  currentExercise.animationType === 'pulse' 
                    ? { scale: [1, 1.05, 1] }
                    : currentExercise.animationType === 'bounce'
                    ? { y: [0, -10, 0] }
                    : currentExercise.animationType === 'rotate'
                    ? { rotate: [0, 5, 0, -5, 0] }
                    : { opacity: [1, 0.8, 1] }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img 
                  src={getMascotForExercise(currentExercise)} 
                  alt="FITEK" 
                  className="w-32 h-32 mx-auto object-contain"
                />
              </motion.div>

              {/* Exercise Name */}
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentExercise.name}</h2>
              <p className="text-muted-foreground mb-4 text-sm px-4">{currentExercise.instruction}</p>

              {/* Tips */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {currentExercise.tips.slice(0, 2).map((tip, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                    💡 {tip}
                  </span>
                ))}
              </div>

              {/* Timer Ring */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-48 h-48 -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="86"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="86"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={cn(
                      currentExercise.intensity === 'high' ? 'text-red-500' :
                      currentExercise.intensity === 'medium' ? 'text-amber-500' :
                      'text-green-500'
                    )}
                    strokeDasharray={540}
                    animate={{ strokeDashoffset: 540 - (exerciseProgress / 100) * 540 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-5xl font-bold">{formatTime(timeLeft)}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentExercise.muscleGroups.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Intensity indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className={cn(
                  'w-4 h-4',
                  currentExercise.intensity === 'high' ? 'text-red-500 animate-pulse' :
                  currentExercise.intensity === 'medium' ? 'text-amber-500' :
                  'text-green-500'
                )} />
                <span className="text-xs text-muted-foreground">
                  Intensywność: {
                    currentExercise.intensity === 'high' ? 'Wysoka' :
                    currentExercise.intensity === 'medium' ? 'Średnia' : 'Niska'
                  }
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8">
        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className="w-4 h-4" />
            <span>~{Math.round(elapsedTime * 0.1)} kcal</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onBack}
            className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all duration-300 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
          >
            {isRunning ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
          
          <button
            onClick={skipToNext}
            className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all duration-300 active:scale-95"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
