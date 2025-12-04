import { useState } from 'react';
import { Search, Clock, Flame, ChevronRight, Play, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WorkoutSession } from '@/components/flyfit/WorkoutSession';
import { workouts, categories, difficultyConfig, WorkoutData } from '@/data/workouts';
import { useToast } from '@/hooks/use-toast';

export default function Workouts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutData | null>(null);
  const { toast } = useToast();

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartWorkout = (workout: WorkoutData) => {
    setActiveWorkout(workout);
  };

  const handleCloseWorkout = () => {
    setActiveWorkout(null);
  };

  const handleCompleteWorkout = () => {
    setActiveWorkout(null);
    toast({
      title: "Brawo! 🎉",
      description: "Ukończyłeś trening! FITEK jest z ciebie dumny!",
    });
  };

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
      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
          Treningi
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Ćwicz ze mną! 💪</p>
      </header>

      {/* Wyszukiwarka */}
      <div className="relative z-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Szukaj treningów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 rounded-2xl border-2 border-border/50 bg-card shadow-card-playful"
        />
      </div>

      {/* Filtry kategorii */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide relative z-10">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'whitespace-nowrap rounded-2xl font-bold h-10 px-4',
              selectedCategory === category ? 'shadow-playful' : 'border-2'
            )}
          >
            {category}
          </Button>
        ))}
      </div>

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
