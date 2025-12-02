import { useState } from 'react';
import { Search, Clock, Flame, ChevronRight, Play } from 'lucide-react';
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
  easy: { label: 'Łatwy', color: 'bg-secondary/20 text-secondary' },
  medium: { label: 'Średni', color: 'bg-accent/20 text-accent' },
  hard: { label: 'Trudny', color: 'bg-destructive/20 text-destructive' },
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
    <div className="px-4 py-6 space-y-6">
      {/* Header z maskotką */}
      <header className="flex items-center gap-3">
        <img src={mascotImage} alt="FitFly" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Treningi</h1>
          <p className="text-sm text-muted-foreground">Ćwicz ze mną! 💪</p>
        </div>
      </header>

      {/* Wyszukiwarka */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Szukaj treningów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl border-border bg-card"
        />
      </div>

      {/* Filtry kategorii */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'whitespace-nowrap rounded-full font-semibold',
              selectedCategory === category && 'shadow-fitfly'
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Lista treningów */}
      <section className="space-y-3">
        {filteredWorkouts.map(workout => (
          <button
            key={workout.id}
            className="w-full bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4"
          >
            {/* Ikona/Placeholder */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Play className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{workout.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{workout.category}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {workout.duration} min
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  {workout.calories} kcal
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  difficultyConfig[workout.difficulty].color
                )}>
                  {difficultyConfig[workout.difficulty].label}
                </span>
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        ))}
        
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nie znaleziono treningów</p>
            <p className="text-sm">Spróbuj innej kategorii</p>
          </div>
        )}
      </section>
    </div>
  );
}
