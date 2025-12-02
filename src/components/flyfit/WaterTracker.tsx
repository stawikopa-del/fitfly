import { Droplets, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WaterTrackerProps {
  current: number;
  goal: number;
  onAdd: (amount: number) => void;
}

export function WaterTracker({ current, goal, onAdd }: WaterTrackerProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const glasses = Math.floor(current / 250);
  const isComplete = current >= goal;

  return (
    <div className={cn(
      'bg-card rounded-2xl p-5 border shadow-sm transition-all duration-300',
      isComplete ? 'border-primary/50 bg-primary/5' : 'border-border'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isComplete ? 'bg-primary/20' : 'bg-primary/10'
          )}>
            <Droplets className={cn(
              'w-6 h-6',
              isComplete ? 'text-primary animate-bounce-soft' : 'text-primary'
            )} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Nawodnienie</h3>
            <p className="text-sm text-muted-foreground">
              {glasses} szklanek • {current} ml
            </p>
          </div>
        </div>
        {isComplete && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-bold">
            ✓ Cel!
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-foreground/70">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAdd(-250)}
          disabled={current <= 0}
          className="rounded-full"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => onAdd(250)}
            className="rounded-full bg-primary hover:bg-primary/90 shadow-fitfly"
          >
            <Plus className="w-4 h-4 mr-1" />
            250ml
          </Button>
          <Button 
            size="sm"
            variant="secondary"
            onClick={() => onAdd(500)}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            500ml
          </Button>
        </div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-3">
        Cel: {goal} ml
      </p>
    </div>
  );
}
