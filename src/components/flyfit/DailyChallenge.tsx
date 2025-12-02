import { Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DailyChallengeProps {
  title: string;
  description: string;
  progress: number;
  target: number;
}

export function DailyChallenge({ title, description, progress, target }: DailyChallengeProps) {
  const navigate = useNavigate();
  const percentage = Math.min((progress / target) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-500/10">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Wyzwanie dnia</h3>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/wyzwania')}
          className="text-muted-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 bg-purple-100 rounded-full h-2 mr-3">
          <div 
            className="bg-purple-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-purple-500">
          {progress}/{target}
        </span>
      </div>
    </div>
  );
}
