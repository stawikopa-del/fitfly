import { useState, useEffect } from 'react';
import { WorkoutProgramCard } from './WorkoutProgramCard';
import { PreWorkoutCheck } from './PreWorkoutCheck';
import { EnhancedWorkoutPlayer } from './EnhancedWorkoutPlayer';
import { WorkoutSummary } from './WorkoutSummary';
import { WorkoutProgram, workoutPrograms, categoryNames, WorkoutCategory } from '@/data/workoutPrograms';
import { useGamification } from '@/hooks/useGamification';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useWorkout } from '@/contexts/WorkoutContext';
import { Flame, Clock, Zap, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type HubScreen = 'browse' | 'precheck' | 'player' | 'summary';

interface WorkoutStats {
  totalTime: number;
  exercisesCompleted: number;
  caloriesBurned: number;
  xpEarned: number;
}

export function WorkoutHub() {
  const [currentScreen, setCurrentScreen] = useState<HubScreen>('browse');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutProgram | null>(null);
  const [userEnergy, setUserEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'all'>('all');
  
  const { onWorkoutCompleted, addXP } = useGamification();
  const { addActiveMinutes } = useUserProgress();
  const { setWorkoutActive } = useWorkout();

  // Update workout active state based on current screen
  useEffect(() => {
    const isActive = currentScreen !== 'browse';
    setWorkoutActive(isActive);
    
    return () => {
      setWorkoutActive(false);
    };
  }, [currentScreen, setWorkoutActive]);

  const handleSelectWorkout = (workout: WorkoutProgram) => {
    setSelectedWorkout(workout);
    setCurrentScreen('precheck');
  };

  const handleStartWorkout = (energy: 'low' | 'medium' | 'high') => {
    setUserEnergy(energy);
    setCurrentScreen('player');
  };

  const handleWorkoutComplete = (stats: WorkoutStats) => {
    setWorkoutStats(stats);
    addActiveMinutes(stats.totalTime);
    addXP(stats.xpEarned, 'workout');
    onWorkoutCompleted();
    setCurrentScreen('summary');
  };

  const handleFinish = () => {
    setCurrentScreen('browse');
    setSelectedWorkout(null);
    setWorkoutStats(null);
  };

  const handleBack = () => {
    if (currentScreen === 'precheck') {
      setCurrentScreen('browse');
      setSelectedWorkout(null);
    } else if (currentScreen === 'player') {
      setCurrentScreen('precheck');
    }
  };

  // Filter workouts
  const filteredWorkouts = selectedCategory === 'all' 
    ? workoutPrograms 
    : workoutPrograms.filter(w => w.category === selectedCategory);

  const recommendedWorkouts = workoutPrograms.filter(w => w.recommended);
  const quickWorkouts = workoutPrograms.filter(w => w.duration <= 7);

  const categories: (WorkoutCategory | 'all')[] = ['all', 'morning', 'evening', 'hiit', 'core', 'quick'];

  // Render based on current screen
  if (currentScreen === 'precheck' && selectedWorkout) {
    return (
      <PreWorkoutCheck 
        workout={selectedWorkout}
        onStart={handleStartWorkout}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'player' && selectedWorkout) {
    return (
      <EnhancedWorkoutPlayer
        workout={selectedWorkout}
        userEnergy={userEnergy}
        onComplete={handleWorkoutComplete}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'summary' && workoutStats && selectedWorkout) {
    return (
      <WorkoutSummary
        workout={selectedWorkout}
        stats={workoutStats}
        onFinish={handleFinish}
      />
    );
  }

  // Browse screen
  return (
    <div className="space-y-6 pb-6 pt-1">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-playful">
          <Flame className="w-5 h-5 text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{workoutPrograms.length}</p>
          <p className="text-xs text-muted-foreground">Treningów</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl p-4 border border-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-playful">
          <Clock className="w-5 h-5 text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">5-15</p>
          <p className="text-xs text-muted-foreground">Minut</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-4 border border-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-playful">
          <Trophy className="w-5 h-5 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">+XP</p>
          <p className="text-xs text-muted-foreground">Za każdy</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat === 'all' ? 'Wszystkie' : categoryNames[cat]}
          </button>
        ))}
      </div>

      {/* Recommended Section */}
      {selectedCategory === 'all' && recommendedWorkouts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Polecane dla Ciebie</h2>
          </div>
          <div className="space-y-3 pt-1">
            {recommendedWorkouts.map((workout) => (
              <div key={workout.id} className="transition-all duration-300 hover:-translate-y-1">
                <WorkoutProgramCard
                  workout={workout}
                  onSelect={() => handleSelectWorkout(workout)}
                  featured
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Workouts */}
      {selectedCategory === 'all' && quickWorkouts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-lg">Szybkie treningi (do 7 min)</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide">
            {quickWorkouts.map((workout) => (
              <div key={workout.id} className="min-w-[200px] transition-all duration-300 hover:-translate-y-1">
                <WorkoutProgramCard
                  workout={workout}
                  onSelect={() => handleSelectWorkout(workout)}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All/Filtered Workouts */}
      <section>
        <h2 className="font-bold text-lg mb-3">
          {selectedCategory === 'all' ? 'Wszystkie treningi' : categoryNames[selectedCategory]}
        </h2>
        <div className="space-y-3 pt-1">
          {filteredWorkouts.map((workout) => (
            <div key={workout.id} className="transition-all duration-300 hover:-translate-y-1">
              <WorkoutProgramCard
                workout={workout}
                onSelect={() => handleSelectWorkout(workout)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
