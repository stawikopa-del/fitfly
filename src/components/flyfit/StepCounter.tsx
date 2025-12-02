import { Footprints, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StepCounterProps {
  current: number;
  goal: number;
}

export function StepCounter({ current, goal }: StepCounterProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const distance = (current * 0.0007).toFixed(1); // przybliżona kalkulacja km

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-green-500/10">
            <Footprints className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Kroki</h3>
            <p className="text-xs text-muted-foreground">~{distance} km</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={percentage} className="h-3 bg-green-100" />
        <div className="flex justify-between text-sm">
          <span className="text-2xl font-bold text-foreground">{current.toLocaleString()}</span>
          <span className="text-muted-foreground self-end">/ {goal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
