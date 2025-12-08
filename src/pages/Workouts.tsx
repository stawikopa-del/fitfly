import { useState } from 'react';
import { Clock, Flame, ChevronRight, Play, Trophy, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutSession } from '@/components/flyfit/WorkoutSession';
import { MorningWorkoutModule } from '@/components/flyfit/MorningWorkout';
import { workouts, difficultyConfig, WorkoutData } from '@/data/workouts';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { useUserProgress } from '@/hooks/useUserProgress';
import fitekPoranek from '@/assets/fitek/fitek-poranek.png';
import fitekPajacyki from '@/assets/fitek-pajacyki.png';

export default function Workouts() {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutData | null>(null);
  const [showMorningWorkout, setShowMorningWorkout] = useState(false);
  const { toast } = useToast();
  const { onWorkoutCompleted } = useGamification();
  const { addActiveMinutes } = useUserProgress();

  const filteredWorkouts = workouts;

  const handleStartWorkout = (workout: WorkoutData) => {
    setActiveWorkout(workout);
  };

  const handleCloseWorkout = () => {
    setActiveWorkout(null);
  };

  const handleCompleteWorkout = () => {
    if (activeWorkout) {
      // Add active minutes based on workout duration
      addActiveMinutes(activeWorkout.duration);
      
      // Award XP for completing workout
      onWorkoutCompleted();
    }
    
    setActiveWorkout(null);
    toast({
      title: "Brawo! 🎉",
      description: "Ukończyłeś trening! FITEK jest z ciebie dumny!",
    });
  };

  // Show morning workout module (rendered outside AppLayout to hide nav)
  if (showMorningWorkout) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <MorningWorkoutModule
          onClose={() => {
            setShowMorningWorkout(false);
            toast({
              title: "Brawo! 🎉",
              description: "Ukończyłeś poranny trening! FITEK jest z ciebie dumny!",
            });
          }}
        />
      </div>
    );
  }

  // Show workout session if active
  if (activeWorkout) {
    return (
      <WorkoutSession
        workout={activeWorkout}
        onClose={handleCloseWorkout}
        onComplete={handleCompleteWorkout}
      />
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header z FITEK */}
      <header className="relative z-10 flex items-center gap-4">
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-primary/20 to-fitfly-blue-light/20 shadow-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/15 blur-2xl" />
          <img 
            src={fitekPoranek} 
            alt="FITEK poranny" 
            className="w-14 h-14 object-contain animate-float"
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
            Treningi
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Ćwicz ze mną! 💪</p>
        </div>
      </header>

      {/* Poranny trening - featured */}
      <section className="relative z-10">
        <button
          onClick={() => setShowMorningWorkout(true)}
          className="w-full bg-gradient-to-br from-primary/10 via-fitfly-blue-light/10 to-secondary/10 rounded-3xl p-6 border-2 border-primary/30 shadow-playful
                     hover:-translate-y-1 hover:shadow-playful-hover transition-all duration-300 
                     text-left active:scale-[0.98]"
        >
          {/* Mascot - much bigger */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-125" />
              <img 
                src={fitekPajacyki} 
                alt="FITEK poranny" 
                className="w-64 h-64 object-contain relative z-10 animate-float"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sunrise className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">Polecane</span>
            </div>
            <h3 className="font-extrabold font-display text-foreground text-xl mb-3">Poranny trening 10 minut</h3>
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <Clock className="w-4 h-4" />
                10 min
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <Flame className="w-4 h-4" />
                45–70 kcal
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <Trophy className="w-4 h-4" />
                11 ćwiczeń
              </span>
            </div>
            <span className="text-xs px-4 py-1.5 rounded-full font-bold inline-block bg-secondary text-secondary-foreground">
              Łatwy
            </span>
          </div>

          {/* Start button */}
          <div className="mt-5">
            <div className="w-full h-14 rounded-2xl bg-primary flex items-center justify-center shadow-playful gap-2">
              <Play className="w-6 h-6 text-primary-foreground" />
              <span className="font-bold text-primary-foreground text-lg">Rozpocznij trening</span>
            </div>
          </div>
        </button>
      </section>

      {/* Lista treningów */}
      <section className="space-y-4 relative z-10">
        {filteredWorkouts.map((workout) => (
          <button
            key={workout.id}
            onClick={() => handleStartWorkout(workout)}
            className="w-full bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful 
                       hover:-translate-y-1 hover:shadow-card-playful-hover transition-all duration-300 
                       text-left flex items-center gap-4 active:scale-[0.98]"
          >
            {/* Ikona/Placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fitfly-blue-light flex items-center justify-center shrink-0 shadow-playful-sm">
              <Play className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold font-display text-foreground truncate text-lg">{workout.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{workout.category}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {workout.duration} min
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Flame className="w-3.5 h-3.5" />
                  {workout.calories} kcal
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Trophy className="w-3.5 h-3.5" />
                  {workout.exercises.length} ćwiczeń
                </span>
              </div>
              <span className={cn(
                'text-xs px-3 py-1 rounded-full font-bold inline-block mt-2',
                difficultyConfig[workout.difficulty].color
              )}>
                {difficultyConfig[workout.difficulty].label}
              </span>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          </button>
        ))}
        
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border-2 border-border/50">
            <p className="text-lg font-display font-bold">Nie znaleziono treningów 😅</p>
            <p className="text-sm">Spróbuj innej kategorii</p>
          </div>
        )}
      </section>
    </div>
  );
}
