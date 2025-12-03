import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, ArrowLeft, X, Info, ChevronLeft, ChevronRight, Trophy, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitek-pompki.png';
import { workoutFeedback, resumeAudioContext } from '@/utils/soundFeedback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
const BREAK_DURATION = 15; // seconds

const motivationalMessages = ["Świetnie ci idzie! 💪", "Jeszcze trochę, dasz radę!", "Jesteś niesamowity! ⭐", "Tak trzymaj!", "Widzę postępy! 🔥", "Nie poddawaj się!", "Robisz to genialnie!", "Czuję tę energię! ⚡", "Jestem z ciebie dumny!", "Każdy ruch się liczy!", "Wierzę w ciebie! 🌟", "Super forma!"];
const breakMessages = ["Czas na przerwę! 😌", "Złap oddech! 🌬️", "Dobra robota! Odpocznij chwilę", "Świetnie! Regeneruj siły 💚", "Przerwa zasłużona! ✨"];
const completionMessages = ["BRAWO! Dałeś radę! 🎉", "Jesteś MISTRZEM! 🏆", "Niesamowite! To był świetny trening! 💪", "Super! Jestem z Ciebie dumny! ⭐"];
export function WorkoutSession({
  workout,
  onClose,
  onComplete
}: WorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workout.exercises[0]?.duration || 30);
  const [isRunning, setIsRunning] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState(motivationalMessages[0]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progressPercent = (currentExerciseIndex + (isBreak ? 0.5 : 0)) / totalExercises * 100;

  // Trigger transition animation
  const triggerTransition = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionKey(prev => prev + 1);
    }, 150);
  }, []);

  // Calculate total remaining time
  const totalRemainingTime = useMemo(() => {
    let remaining = timeLeft;
    for (let i = currentExerciseIndex + 1; i < totalExercises; i++) {
      remaining += workout.exercises[i].duration + BREAK_DURATION;
    }
    if (!isBreak && currentExerciseIndex < totalExercises - 1) {
      remaining += BREAK_DURATION; // Add break after current exercise
    }
    return remaining;
  }, [timeLeft, currentExerciseIndex, totalExercises, workout.exercises, isBreak]);

  // Change motivational message every 4 seconds when running
  useEffect(() => {
    if (!isRunning || isCompleted) return;
    const messages = isBreak ? breakMessages : motivationalMessages;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMotivationMessage(messages[randomIndex]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, isCompleted]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // Countdown tick for last 3 seconds
        if (prev <= 4 && prev > 1) {
          workoutFeedback.tick();
        }
        if (prev <= 1) {
          triggerTransition();
          if (isBreak) {
            // Break finished, move to next exercise
            workoutFeedback.breakComplete();
            setIsBreak(false);
            if (currentExerciseIndex < totalExercises - 1) {
              setCurrentExerciseIndex(idx => idx + 1);
              return workout.exercises[currentExerciseIndex + 1]?.duration || 30;
            } else {
              // Workout complete
              workoutFeedback.workoutComplete();
              setIsRunning(false);
              setIsCompleted(true);
              setMotivationMessage(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
              return 0;
            }
          } else {
            // Exercise finished
            if (currentExerciseIndex < totalExercises - 1) {
              // Start break
              workoutFeedback.exerciseComplete();
              setIsBreak(true);
              setMotivationMessage(breakMessages[Math.floor(Math.random() * breakMessages.length)]);
              return BREAK_DURATION;
            } else {
              // Last exercise - workout complete
              workoutFeedback.workoutComplete();
              setIsRunning(false);
              setIsCompleted(true);
              setMotivationMessage(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentExerciseIndex, totalExercises, workout.exercises, isBreak, isCompleted, triggerTransition]);
  const togglePlayPause = useCallback(() => {
    resumeAudioContext();
    setIsRunning(prev => {
      if (!prev) {
        workoutFeedback.start();
      } else {
        workoutFeedback.pause();
      }
      return !prev;
    });
  }, []);
  const skipExercise = useCallback(() => {
    workoutFeedback.skip();
    triggerTransition();
    if (isBreak) {
      // Skip break
      setIsBreak(false);
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(idx => idx + 1);
        setTimeLeft(workout.exercises[currentExerciseIndex + 1]?.duration || 30);
      }
    } else if (currentExerciseIndex < totalExercises - 1) {
      // Skip to break then next exercise
      setIsBreak(true);
      setTimeLeft(BREAK_DURATION);
      setMotivationMessage(breakMessages[Math.floor(Math.random() * breakMessages.length)]);
    } else {
      setIsCompleted(true);
      setMotivationMessage(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
    }
  }, [currentExerciseIndex, totalExercises, workout.exercises, isBreak]);
  const previousExercise = useCallback(() => {
    workoutFeedback.skip();
    triggerTransition();
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(workout.exercises[currentExerciseIndex]?.duration || 30);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(idx => idx - 1);
      setTimeLeft(workout.exercises[currentExerciseIndex - 1]?.duration || 30);
    }
  }, [currentExerciseIndex, workout.exercises, isBreak, triggerTransition]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleFinish = () => {
    workoutFeedback.buttonPress();
    onComplete();
    onClose();
  };
  if (!currentExercise && !isCompleted) return null;

  // Completion Screen
  if (isCompleted) {
    return <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center justify-between px-3 py-2 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8">
            <X className="w-5 h-5" />
          </Button>
          <h2 className="font-bold font-display text-base">{workout.name}</h2>
          <div className="w-8" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">
          {/* Trophy */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-fitfly-yellow/20 flex items-center justify-center animate-pulse">
              <Trophy className="w-9 h-9 text-fitfly-yellow" />
            </div>
          </div>

          {/* Mascot */}
          <img src={mascotImage} alt="FITEK" className="w-28 h-28 object-contain animate-float-gentle" />
          
          {/* Completion bubble */}
          <div className="relative">
            <div className="bg-fitfly-green/10 border-2 border-fitfly-green rounded-[1.5rem] px-5 py-3 max-w-[260px] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-fitfly-green" />
              <p className="text-base text-foreground text-center font-bold">
                {motivationMessage}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5 mt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Ćwiczeń</span>
              <span className="font-bold">{totalExercises}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-fitfly-green/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-fitfly-green" />
              </div>
              <span className="text-xs text-muted-foreground">Czas</span>
              <span className="font-bold">{Math.round(workout.exercises.reduce((acc, ex) => acc + ex.duration, 0) / 60)} min</span>
            </div>
          </div>

          <Button onClick={handleFinish} className="w-full max-w-xs rounded-full h-12 font-bold shadow-playful-green mt-2">
            Zakończ trening
          </Button>
        </div>
      </div>;
  }
  return <div className="fixed inset-0 bg-fitfly-cream z-[100] flex flex-col items-center justify-center px-4">
      {/* Back button */}
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 left-4 rounded-full w-10 h-10">
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Progress indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-bold text-primary">{currentExerciseIndex + 1}/{totalExercises}</span>
        <span>•</span>
        <Clock className="w-4 h-4" />
        <span>{formatTime(totalRemainingTime)}</span>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center gap-3">
        {/* Mascot */}
        <img 
          key={`mascot-${transitionKey}`} 
          src={mascotImage} 
          alt="FITEK" 
          className={cn(
            "w-48 h-48 object-contain animate-pushup transition-all duration-300", 
            isTransitioning && "opacity-0 scale-90"
          )} 
        />
        
        {/* Speech bubble */}
        <div key={`bubble-${transitionKey}`} className={cn("relative max-w-[260px] transition-all duration-300", isTransitioning && "opacity-0 translate-y-2")}>
          <div className={cn("relative px-5 py-3 rounded-2xl border-2 transition-colors duration-300", isBreak ? 'bg-fitfly-green/10 border-fitfly-green' : 'bg-primary/10 border-primary')}>
            <div className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] transition-colors duration-300", isBreak ? 'border-b-fitfly-green' : 'border-b-primary')} />
            <p className="text-sm text-foreground text-center font-bold">
              {motivationMessage}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div key={`timer-${transitionKey}`} className={cn("text-center transition-all duration-300 mt-2", isTransitioning && "opacity-0 scale-95")}>
          <div className={cn("text-6xl font-extrabold font-display transition-colors duration-300", isBreak ? 'text-fitfly-green' : 'bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent')}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBreak ? 'przerwa' : 'pozostało'}
          </p>
        </div>

        {/* Exercise name */}
        <div key={`exercise-${transitionKey}`} className={cn("text-center transition-all duration-300 mt-2", isTransitioning && "opacity-0 translate-y-2")}>
          <h3 className={cn("text-xl font-bold font-display transition-colors duration-300", isBreak ? 'text-fitfly-green' : 'text-foreground')}>
            {isBreak ? '☕ Przerwa' : currentExercise.name}
          </h3>
          {!isBreak && (
            <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)} className="rounded-full border-2 gap-1.5 h-9 text-sm px-4 mt-2">
              <Info className="w-4 h-4" />
              Instrukcja
            </Button>
          )}
          {isBreak && (
            <p className="text-sm text-muted-foreground mt-1">
              Następne: <span className="font-semibold">{workout.exercises[currentExerciseIndex + 1]?.name || 'Koniec!'}</span>
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <Button variant="outline" size="icon" onClick={previousExercise} disabled={currentExerciseIndex === 0 && !isBreak} className="w-14 h-14 rounded-full border-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button onClick={togglePlayPause} className={cn("w-24 h-24 rounded-full shadow-playful", isBreak && 'bg-fitfly-green hover:bg-fitfly-green-dark')}>
            {isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </Button>

          <Button variant="outline" size="icon" onClick={skipExercise} className="w-14 h-14 rounded-full border-2">
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="rounded-3xl border-2">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {currentExercise?.name}
            </DialogTitle>
            <DialogDescription className="text-base pt-4 leading-relaxed">
              {currentExercise?.instruction}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>;
}