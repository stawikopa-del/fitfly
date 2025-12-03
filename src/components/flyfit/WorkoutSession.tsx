import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitek-pompki.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instruction: string;
}

export interface WorkoutData {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutSessionProps {
  workout: WorkoutData;
  onClose: () => void;
  onComplete: () => void;
}

const motivationalMessages = [
  "Świetnie ci idzie! 💪",
  "Jeszcze trochę, dasz radę!",
  "Jesteś niesamowity! ⭐",
  "Tak trzymaj!",
  "Widzę postępy! 🔥",
  "Nie poddawaj się!",
  "Robisz to genialnie!",
  "Czuję tę energię! ⚡",
  "Jestem z ciebie dumny!",
  "Każdy ruch się liczy!",
  "Wierzę w ciebie! 🌟",
  "Super forma!",
];

export function WorkoutSession({ workout, onClose, onComplete }: WorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workout.exercises[0]?.duration || 30);
  const [isRunning, setIsRunning] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState(motivationalMessages[0]);
  const [showInstructions, setShowInstructions] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progressPercent = ((currentExerciseIndex) / totalExercises) * 100;

  // Change motivational message every 5 seconds when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setMotivationMessage(motivationalMessages[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Exercise complete, move to next
          if (currentExerciseIndex < totalExercises - 1) {
            setCurrentExerciseIndex((idx) => idx + 1);
            return workout.exercises[currentExerciseIndex + 1]?.duration || 30;
          } else {
            // Workout complete
            setIsRunning(false);
            onComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentExerciseIndex, totalExercises, workout.exercises, onComplete]);

  const togglePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const skipExercise = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((idx) => idx + 1);
      setTimeLeft(workout.exercises[currentExerciseIndex + 1]?.duration || 30);
    } else {
      onComplete();
    }
  }, [currentExerciseIndex, totalExercises, workout.exercises, onComplete]);

  const previousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((idx) => idx - 1);
      setTimeLeft(workout.exercises[currentExerciseIndex - 1]?.duration || 30);
    }
  }, [currentExerciseIndex, workout.exercises]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-6 h-6" />
        </Button>
        <h2 className="font-bold font-display text-lg">{workout.name}</h2>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Ćwiczenie {currentExerciseIndex + 1} z {totalExercises}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
        {/* Mascot with motivation */}
        <div className="flex flex-col items-center gap-4">
          <img 
            src={mascotImage} 
            alt="FITEK" 
            className="w-48 h-48 object-contain animate-float-slow"
          />
          
          {/* Motivational bubble */}
          <div className="relative animate-bounce-in">
            <div className="bg-card border-2 border-primary/30 rounded-3xl px-6 py-3 shadow-card-playful max-w-[280px]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="w-5 h-5 bg-card border-l-2 border-t-2 border-primary/30 rotate-45 rounded-tl-md" />
              </div>
              <p className="text-sm text-foreground text-center font-bold relative z-10">
                {motivationMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="text-7xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
            {formatTime(timeLeft)}
          </div>
          <p className="text-muted-foreground text-sm mt-1">pozostało</p>
        </div>

        {/* Exercise name */}
        <div className="text-center">
          <h3 className="text-2xl font-bold font-display text-foreground mb-2">
            {currentExercise.name}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowInstructions(true)}
            className="rounded-full border-2 gap-2"
          >
            <Info className="w-4 h-4" />
            Instrukcja
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-28 border-t border-border bg-card/50">
        <div className="flex items-center justify-center gap-4">
          {/* Previous */}
          <Button
            variant="outline"
            size="icon"
            onClick={previousExercise}
            disabled={currentExerciseIndex === 0}
            className="w-14 h-14 rounded-full border-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Play/Pause */}
          <Button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full shadow-playful"
          >
            {isRunning ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </Button>

          {/* Skip/Next */}
          <Button
            variant="outline"
            size="icon"
            onClick={skipExercise}
            className="w-14 h-14 rounded-full border-2"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="rounded-3xl border-2">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {currentExercise.name}
            </DialogTitle>
            <DialogDescription className="text-base pt-4 leading-relaxed">
              {currentExercise.instruction}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
