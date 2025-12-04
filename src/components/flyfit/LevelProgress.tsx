import { Progress } from '@/components/ui/progress';
import { getXPProgress } from '@/types/gamification';
import { Star, Zap } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  totalXP: number;
  compact?: boolean;
}

export function LevelProgress({ level, totalXP, compact = false }: LevelProgressProps) {
  const progress = getXPProgress(totalXP, level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-fitfly-green/20 px-2 py-1 rounded-full">
          <Star className="w-4 h-4 text-fitfly-green fill-fitfly-green" />
          <span className="text-sm font-bold text-fitfly-green">Lvl {level}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Zap className="w-3 h-3" />
          <span>{totalXP} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fitfly-green to-fitfly-green/70 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{level}</span>
          </div>
          <div>
            <p className="font-bold text-foreground">Poziom {level}</p>
            <p className="text-sm text-muted-foreground">{totalXP} XP łącznie</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Do następnego:</p>
          <p className="font-semibold text-fitfly-green">{progress.required - progress.current} XP</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30 border border-border/50">
          <div 
            className="h-full bg-gradient-to-r from-fitfly-green to-fitfly-green/80 transition-all rounded-full"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress.current} XP</span>
          <span>{progress.required} XP</span>
        </div>
      </div>
    </div>
  );
}
