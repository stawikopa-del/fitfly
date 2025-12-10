import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, List, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { morningWorkoutData, MorningExercise } from '@/data/morningWorkoutData';
import { workoutFeedback, resumeAudioContext } from '@/utils/soundFeedback';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';

interface MorningWorkoutPlayerProps {
  startIndex: number;
  onComplete: () => void;
  onBackToList: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MorningWorkoutPlayer({ startIndex, onComplete, onBackToList }: MorningWorkoutPlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(startIndex);
  const [timeLeft, setTimeLeft] = useState(morningWorkoutData.exercises[startIndex].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(15);

  const exercises = morningWorkoutData.exercises;
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progressPercent = ((currentExerciseIndex + 1) / totalExercises) * 100;

  // Resume audio context on first interaction
  useEffect(() => {
    resumeAudioContext();
  }, []);

  // Main timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (isBreak) {
        setBreakTimeLeft((prev) => {
          if (prev <= 1) {
            // Break complete
            workoutFeedback.breakComplete();
            setIsBreak(false);
            
            if (currentExerciseIndex < totalExercises - 1) {
              const nextExercise = exercises[currentExerciseIndex + 1];
              setCurrentExerciseIndex(currentExerciseIndex + 1);
              setTimeLeft(nextExercise.duration);
            }
            return 15;
          }
          
          // Tick sound for last 3 seconds
          if (prev <= 3) {
            workoutFeedback.tick();
          }
          return prev - 1;
        });
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Exercise complete
            workoutFeedback.exerciseComplete();
            
            if (currentExerciseIndex === totalExercises - 1) {
              // Last exercise - complete workout
              workoutFeedback.workoutComplete();
              setIsRunning(false);
              onComplete();
              return 0;
            }
            
            // Start break
            if (currentExercise.breakDuration > 0) {
              setIsBreak(true);
              setBreakTimeLeft(currentExercise.breakDuration);
            } else {
              // No break, go to next exercise
              const nextExercise = exercises[currentExerciseIndex + 1];
              setCurrentExerciseIndex(currentExerciseIndex + 1);
              setTimeLeft(nextExercise.duration);
            }
            return 0;
          }
          
          // Tick sound for last 3 seconds
          if (prev <= 3) {
            workoutFeedback.tick();
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak, currentExerciseIndex, exercises, totalExercises, currentExercise, onComplete]);

  const togglePlayPause = useCallback(() => {
    if (isRunning) {
      workoutFeedback.pause();
    } else {
      workoutFeedback.start();
    }
    setIsRunning(!isRunning);
  }, [isRunning]);

  const skipBreak = useCallback(() => {
    workoutFeedback.skip();
    setIsBreak(false);
    
    if (currentExerciseIndex < totalExercises - 1) {
      const nextExercise = exercises[currentExerciseIndex + 1];
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimeLeft(nextExercise.duration);
    }
  }, [currentExerciseIndex, exercises, totalExercises]);

  const nextExercise = useCallback(() => {
    workoutFeedback.skip();
    
    if (currentExerciseIndex === totalExercises - 1) {
      onComplete();
      return;
    }

    const next = exercises[currentExerciseIndex + 1];
    setCurrentExerciseIndex(currentExerciseIndex + 1);
    setTimeLeft(next.duration);
    setIsBreak(false);
  }, [currentExerciseIndex, exercises, totalExercises, onComplete]);

  // Break screen
  if (isBreak) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <button 
            onClick={onBackToList}
            className="w-10 h-10 rounded-xl bg-card border-2 border-border/50 flex items-center justify-center"
          >
            <List className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Ćwiczenie {currentExerciseIndex + 1}/{totalExercises}
          </span>
        </header>

        {/* Break Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <Coffee className="w-16 h-16 text-secondary mb-4 animate-pulse" />
          
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            Przerwa
          </h2>
          
          <div className="text-7xl font-extrabold font-display text-secondary mb-8">
            {breakTimeLeft}s
          </div>

          <p className="text-muted-foreground text-center mb-4">
            Następne: <span className="font-bold text-foreground">{exercises[currentExerciseIndex + 1]?.name}</span>
          </p>

          <Button
            variant="outline"
            size="lg"
            onClick={skipBreak}
            className="rounded-2xl h-14 px-8"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Pomiń przerwę
          </Button>
        </div>

        {/* Progress */}
        <div className="p-4">
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button 
          onClick={onBackToList}
          className="w-10 h-10 rounded-xl bg-card border-2 border-border/50 flex items-center justify-center"
        >
          <List className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          Ćwiczenie {currentExerciseIndex + 1}/{totalExercises}
        </span>
      </header>

      {/* Exercise Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Exercise Name */}
        <h1 className="text-2xl font-extrabold font-display text-center text-foreground mb-6">
          {currentExercise.name}
        </h1>

        {/* Mascot */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125" />
          <img 
            src={fitekPajacyki} 
            alt="FITEK" 
            className={`w-40 h-40 object-contain relative z-10 ${isRunning ? 'animate-bounce' : ''}`}
          />
        </div>

        {/* Timer */}
        <div className={`text-8xl font-extrabold font-display mb-4 transition-colors ${
          timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-primary'
        }`}>
          {formatTime(timeLeft)}
        </div>

        {/* Instruction */}
        <p className="text-muted-foreground text-center max-w-xs mb-8 leading-relaxed">
          {currentExercise.instruction}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            onClick={togglePlayPause}
            className={`w-20 h-20 rounded-full shadow-playful ${
              isRunning 
                ? 'bg-secondary hover:bg-secondary/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isRunning ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 space-y-3">
        <Progress value={progressPercent} className="h-2" />
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToList}
            className="flex-1 h-12 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do listy
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={nextExercise}
            className="flex-1 h-12 rounded-xl"
          >
            Następne
            <SkipForward className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
