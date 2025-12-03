import { useState } from 'react';
import { Search, Clock, Flame, ChevronRight, Play, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';

interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
}

const workouts: Workout[] = [
  { id: '1', name: 'Poranny rozruch', category: 'Domowe 10 min', duration: 10, difficulty: 'easy', calories: 80 },
  { id: '2', name: 'Trening na start', category: 'Dla początkujących', duration: 15, difficulty: 'easy', calories: 120 },
  { id: '3', name: 'Spalanie kalorii', category: 'Cardio', duration: 20, difficulty: 'medium', calories: 200 },
  { id: '4', name: 'Siłownia - podstawy', category: 'Siła', duration: 30, difficulty: 'medium', calories: 250 },
  { id: '5', name: 'HIIT Express', category: 'Intensywny', duration: 15, difficulty: 'hard', calories: 180 },
  { id: '6', name: 'Joga wieczorna', category: 'Relaks', duration: 20, difficulty: 'easy', calories: 60 },
];

const categories = ['Wszystkie', 'Domowe 10 min', 'Dla początkujących', 'Cardio', 'Siła'];

const difficultyConfig = {
  easy: { label: 'Łatwy', color: 'bg-secondary text-secondary-foreground' },
  medium: { label: 'Średni', color: 'bg-accent text-accent-foreground' },
  hard: { label: 'Trudny', color: 'bg-destructive text-destructive-foreground' },
};

export default function Workouts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header z maskotką */}
      <header className="flex items-center gap-3 relative z-10">
        <div className="relative animate-float">
          <img src={mascotImage} alt="FitFly" className="w-14 h-14 object-contain drop-shadow-md" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fitfly-yellow animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
            Treningi
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Ćwicz ze mną! 💪</p>
        </div>
      </header>

      {/* Wyszukiwarka */}
      <div className="relative z-10 animate-float" style={{ animationDelay: '0.2s' }}>
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
        {categories.map((category, index) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'whitespace-nowrap rounded-2xl font-bold h-10 px-4 animate-float',
              selectedCategory === category ? 'shadow-playful' : 'border-2'
            )}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Lista treningów */}
      <section className="space-y-4 relative z-10">
        {filteredWorkouts.map((workout, index) => (
          <button
            key={workout.id}
            className="w-full bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful 
                       hover:-translate-y-1 hover:shadow-card-playful-hover transition-all duration-300 
                       text-left flex items-center gap-4 animate-float active:scale-[0.98]"
            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
          >
            {/* Ikona/Placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fitfly-blue-light flex items-center justify-center shrink-0 shadow-playful-sm">
              <Play className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold font-display text-foreground truncate text-lg">{workout.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{workout.category}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {workout.duration} min
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Flame className="w-3.5 h-3.5" />
                  {workout.calories} kcal
                </span>
                <span className={cn(
                  'text-xs px-3 py-1 rounded-full font-bold',
                  difficultyConfig[workout.difficulty].color
                )}>
                  {difficultyConfig[workout.difficulty].label}
                </span>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
