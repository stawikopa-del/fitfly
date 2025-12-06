import { Droplets, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import fitekWoda from '@/assets/fitek/fitek-woda.png';

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
      'bg-card rounded-3xl p-5 border-2 shadow-card-playful transition-all duration-300',
      isComplete ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5' : 'border-border/50'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden border border-border/30',
            'bg-muted/80 shadow-sm'
          )}>
            <img 
              src={fitekWoda} 
              alt="FITEK pije wodę" 
              className={cn(
                'w-12 h-12 object-contain',
                isComplete && 'animate-bounce-soft'
              )} 
            />
          </div>
          <div>
            <h3 className="font-bold font-display text-foreground text-lg">Nawodnienie 💧</h3>
            <p className="text-sm text-muted-foreground font-medium">
              {glasses} szklanek • {current} ml
            </p>
          </div>
        </div>
        {isComplete && (
          <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-playful-sm animate-bounce-in">
            ✓ Cel!
          </span>
        )}
      </div>
      
      {/* Progress bar - more playful */}
      <div className="relative h-5 bg-muted rounded-full overflow-hidden mb-4 border border-border/50">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-fitfly-blue-light rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        {/* Bubbles decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1 left-[15%] w-2 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-1 left-[40%] w-1.5 h-1.5 bg-white/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-0.5 left-[65%] w-1 h-1 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground drop-shadow-sm">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Controls - more playful */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onAdd(-250)}
          disabled={current <= 0}
          className="rounded-2xl w-12 h-12 border-2"
        >
          <Minus className="w-5 h-5" />
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => onAdd(250)}
            className="rounded-2xl h-12 px-5 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1" />
            250ml
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onAdd(500)}
            className="rounded-2xl h-12 px-5 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1" />
            500ml
          </Button>
        </div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
        Cel dzienny: {goal} ml 🎯
      </p>
    </div>
  );
}
