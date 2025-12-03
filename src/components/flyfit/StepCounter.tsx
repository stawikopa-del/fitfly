import { Footprints, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StepCounterProps {
  current: number;
  goal: number;
}

export function StepCounter({ current, goal }: StepCounterProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const distance = (current * 0.0007).toFixed(1);
  const isComplete = percentage >= 100;

  return (
    <div className={cn(
      "bg-card rounded-3xl p-5 border-2 shadow-card-playful transition-all duration-300",
      isComplete ? "border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/5" : "border-border/50"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-2xl transition-all",
            isComplete 
              ? "bg-secondary text-secondary-foreground shadow-playful-green" 
              : "bg-secondary/15 text-secondary"
          )}>
            <Footprints className={cn("w-6 h-6", isComplete && "animate-bounce-soft")} />
          </div>
          <div>
            <h3 className="font-bold font-display text-foreground text-lg">Kroki 👟</h3>
            <p className="text-sm text-muted-foreground font-medium">~{distance} km</p>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-full",
          isComplete ? "bg-secondary text-secondary-foreground" : "bg-secondary/15 text-secondary"
        )}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Progress value={percentage} className="h-4" />
        <div className="flex justify-between items-end">
          <span className="text-3xl font-extrabold font-display text-foreground">{current.toLocaleString()}</span>
          <span className="text-muted-foreground font-medium">/ {goal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
