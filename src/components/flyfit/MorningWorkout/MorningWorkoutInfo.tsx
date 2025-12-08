import { Clock, Flame, Trophy, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { morningWorkoutData } from '@/data/morningWorkoutData';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';

interface MorningWorkoutInfoProps {
  onStart: () => void;
  onBack: () => void;
}

export function MorningWorkoutInfo({ onStart, onBack }: MorningWorkoutInfoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <button 
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          ← Wróć
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Mascot */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <img 
            src={fitekPajacyki} 
            alt="FITEK maskotka" 
            className="w-48 h-48 object-contain relative z-10 animate-float"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold font-display text-center bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent mb-2">
          {morningWorkoutData.name}
        </h1>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
          <div className="bg-card rounded-2xl px-5 py-3 border-2 border-border/50 shadow-card-playful flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">{morningWorkoutData.totalTime}</span>
          </div>
          <div className="bg-card rounded-2xl px-5 py-3 border-2 border-border/50 shadow-card-playful flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <span className="font-bold text-foreground">{morningWorkoutData.difficulty}</span>
          </div>
          <div className="bg-card rounded-2xl px-5 py-3 border-2 border-border/50 shadow-card-playful flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground">{morningWorkoutData.calories}</span>
          </div>
        </div>

        {/* Exercise count */}
        <p className="text-muted-foreground text-center mb-8">
          <span className="font-bold text-foreground">{morningWorkoutData.exercises.length}</span> ćwiczeń do wykonania
        </p>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-6">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full h-16 rounded-2xl text-lg font-bold shadow-playful"
        >
          <Play className="w-6 h-6 mr-2" />
          Rozpocznij trening
        </Button>
      </div>
    </div>
  );
}
