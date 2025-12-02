import { Trophy, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/flyfit';
import { cn } from '@/lib/utils';

interface ChallengeCardProps {
  challenge: Challenge;
  onStart?: (id: string) => void;
}

export function ChallengeCard({ challenge, onStart }: ChallengeCardProps) {
  const percentage = Math.min((challenge.current / challenge.target) * 100, 100);

  return (
    <div className={cn(
      'bg-card rounded-2xl p-4 border shadow-sm transition-all',
      challenge.isCompleted 
        ? 'border-green-500/50 bg-green-500/5' 
        : 'border-border'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-full',
            challenge.isCompleted ? 'bg-green-500/10' : 'bg-yellow-500/10'
          )}>
            {challenge.isCompleted ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Trophy className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{challenge.title}</h3>
            <p className="text-xs text-muted-foreground">{challenge.duration} dni</p>
          </div>
        </div>
        <span className="text-sm font-bold text-yellow-500">+{challenge.points} pkt</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
      
      {challenge.isActive && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Postęp</span>
            <span className="font-medium">{challenge.current}/{challenge.target} {challenge.unit}</span>
          </div>
          <div className="bg-muted rounded-full h-2">
            <div 
              className={cn(
                'rounded-full h-2 transition-all duration-500',
                challenge.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
      
      {!challenge.isActive && !challenge.isCompleted && (
        <Button 
          onClick={() => onStart?.(challenge.id)}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          <Play className="w-4 h-4 mr-2" />
          Rozpocznij wyzwanie
        </Button>
      )}
      
      {challenge.isCompleted && (
        <div className="text-center text-sm text-green-500 font-medium">
          ✓ Ukończone!
        </div>
      )}
    </div>
  );
}
