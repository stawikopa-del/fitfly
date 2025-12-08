import { ArrowLeft, Play, Clock, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { morningWorkoutData } from '@/data/morningWorkoutData';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';

interface MorningWorkoutListProps {
  onStartExercise: (exerciseIndex: number) => void;
  onBack: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} s`;
  if (secs === 0) return `${mins}:00`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MorningWorkoutList({ onStartExercise, onBack }: MorningWorkoutListProps) {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-card border-2 border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              Lista ćwiczeń
            </h1>
            <p className="text-sm text-muted-foreground">
              {morningWorkoutData.exercises.length} ćwiczeń
            </p>
          </div>
        </div>
      </header>

      {/* Exercise List */}
      <div className="p-4 space-y-3">
        {morningWorkoutData.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-card rounded-2xl p-4 border-2 border-border/50 shadow-card-playful flex items-center gap-4"
          >
            {/* Mascot Image */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-fitfly-blue-light/20 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src={fitekPajacyki} 
                alt="FITEK" 
                className="w-12 h-12 object-contain"
              />
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm leading-tight">
                {index + 1}. {exercise.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">{formatTime(exercise.duration)}</span>
              </div>
              {exercise.breakDuration > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <Coffee className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Przerwa: {exercise.breakDuration} s</span>
                </div>
              )}
            </div>

            {/* Start Button */}
            <Button
              size="sm"
              onClick={() => onStartExercise(index)}
              className="rounded-xl h-10 px-4 shadow-playful-sm shrink-0"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          </div>
        ))}
      </div>

      {/* Start from first Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-6">
        <Button
          onClick={() => onStartExercise(0)}
          size="lg"
          className="w-full h-14 rounded-2xl text-base font-bold shadow-playful"
        >
          <Play className="w-5 h-5 mr-2" />
          Rozpocznij od pierwszego ćwiczenia
        </Button>
      </div>
    </div>
  );
}
