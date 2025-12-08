import { Clock, Flame, Trophy, ChevronRight, Play, Sparkles } from 'lucide-react';
import { WorkoutProgram, difficultyConfig } from '@/data/workoutPrograms';
import { cn } from '@/lib/utils';

interface WorkoutProgramCardProps {
  workout: WorkoutProgram;
  onSelect: () => void;
  featured?: boolean;
  compact?: boolean;
}

export function WorkoutProgramCard({ workout, onSelect, featured, compact }: WorkoutProgramCardProps) {
  if (compact) {
    return (
      <button
        onClick={onSelect}
        className={cn(
          'w-full bg-gradient-to-br rounded-2xl p-4 border-2 text-left transition-all duration-300 active:scale-[0.98]',
          workout.gradient,
          'border-white/20'
        )}
      >
        <div className="text-4xl mb-2">{workout.icon}</div>
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{workout.name}</h3>
        <div className="flex items-center gap-2 text-white/80 text-xs">
          <Clock className="w-3 h-3" />
          <span>{workout.duration} min</span>
        </div>
      </button>
    );
  }

  if (featured) {
    return (
      <button
        onClick={onSelect}
        className={cn(
          'w-full rounded-3xl p-6 border-2 text-left transition-all duration-300 relative overflow-hidden active:scale-[0.99]',
          'bg-gradient-to-br',
          workout.gradient,
          'border-white/30 shadow-lg'
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white">Polecane</span>
        </div>
        
        {/* Icon */}
        <div className="text-6xl mb-4">{workout.icon}</div>
        
        {/* Content */}
        <h3 className="font-extrabold text-white text-xl mb-2">{workout.name}</h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{workout.description}</p>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-white/90">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">{workout.calories.min}-{workout.calories.max} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">+{workout.xpReward} XP</span>
          </div>
        </div>
        
        {/* Difficulty badge */}
        <span className="inline-block text-xs px-3 py-1 rounded-full font-bold bg-white/20 text-white mb-4">
          {difficultyConfig[workout.difficulty].label}
        </span>
        
        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">{workout.exercises.length} ćwiczeń</span>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Play className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Rozpocznij</span>
          </div>
        </div>
      </button>
    );
  }

  // Default card
  return (
    <button
      onClick={onSelect}
      className="w-full bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-left transition-all duration-300 hover:shadow-md active:scale-[0.99] flex items-center gap-4"
    >
      {/* Icon */}
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0',
        'bg-gradient-to-br',
        workout.gradient
      )}>
        {workout.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate">{workout.name}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{workout.description}</p>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs">{workout.calories.min}-{workout.calories.max} kcal</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-xs">+{workout.xpReward} XP</span>
          </div>
        </div>
        
        <span className={cn(
          'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-2',
          difficultyConfig[workout.difficulty].color
        )}>
          {difficultyConfig[workout.difficulty].label}
        </span>
      </div>
      
      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}
