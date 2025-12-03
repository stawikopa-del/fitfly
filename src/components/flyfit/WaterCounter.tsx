import { Droplets, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { soundFeedback } from '@/utils/soundFeedback';

interface WaterCounterProps {
  current: number;
  goal: number;
  onAdd: (amount?: number) => void;
}

export function WaterCounter({ current, goal, onAdd }: WaterCounterProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const glasses = Math.floor(current / 250);

  const handleAdd = (amount: number) => {
    soundFeedback.success();
    onAdd(amount);
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-500/10">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nawodnienie</h3>
            <p className="text-xs text-muted-foreground">{glasses} szklanek</p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => handleAdd(250)}
          sound={false}
          className="rounded-full bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          250ml
        </Button>
      </div>
      
      <div className="space-y-2">
        <Progress value={percentage} className="h-3 bg-blue-100" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{current} ml</span>
          <span className="font-medium text-blue-500">{goal} ml</span>
        </div>
      </div>
    </div>
  );
}
