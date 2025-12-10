import { Trophy, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';
import { useEffect } from 'react';
import { triggerLevelUpConfetti } from '@/utils/confetti';
import { workoutFeedback } from '@/utils/workoutFeedback';

interface MorningWorkoutCompleteProps {
  onFinish: () => void;
}

export function MorningWorkoutComplete({ onFinish }: MorningWorkoutCompleteProps) {
  useEffect(() => {
    // Trigger celebration effects
    triggerLevelUpConfetti();
    workoutFeedback.workoutComplete();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center px-6">
      {/* Celebration icons */}
      <div className="flex items-center gap-4 mb-6">
        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
        <Trophy className="w-12 h-12 text-primary animate-bounce" />
        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold font-display text-center bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent mb-2">
        Gratulacje!
      </h1>
      <h2 className="text-xl font-bold text-foreground mb-6">
        Trening ukończony 🎉
      </h2>

      {/* Mascot */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
        <img 
          src={fitekPajacyki} 
          alt="FITEK gratuluje" 
          className="w-52 h-52 object-contain relative z-10 animate-float"
        />
      </div>

      {/* Message */}
      <p className="text-muted-foreground text-center max-w-xs mb-10 text-lg leading-relaxed">
        Świetna robota! Każdy poranek to krok do lepszej formy. 💪
      </p>

      {/* Finish Button */}
      <Button
        size="lg"
        onClick={onFinish}
        className="w-full max-w-xs h-14 rounded-2xl text-lg font-bold shadow-playful"
      >
        <Home className="w-5 h-5 mr-2" />
        Wróć do strony głównej
      </Button>
    </div>
  );
}
