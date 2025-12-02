import { Clock, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutCardProps {
  id: string;
  name: string;
  category: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  onClick?: () => void;
}

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  hard: 'bg-red-500/10 text-red-500',
};

const difficultyLabels = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
};

export function WorkoutCard({ name, category, duration, difficulty, onClick }: WorkoutCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center gap-4">
        {/* Placeholder dla grafiki treningu */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Flame className="w-8 h-8 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{category}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{duration} min</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', difficultyColors[difficulty])}>
              {difficultyLabels[difficulty]}
            </span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}
