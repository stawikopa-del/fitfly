import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from '@/components/flyfit/WorkoutCard';
import { Workout } from '@/types/flyfit';

const sampleWorkouts: Omit<Workout, 'exercises'>[] = [
  { id: '1', name: 'Poranny rozruch', category: 'Domowe 10 min', duration: 10, difficulty: 'easy' },
  { id: '2', name: 'Trening na start', category: 'Dla początkujących', duration: 15, difficulty: 'easy' },
  { id: '3', name: 'Spalanie kalorii', category: 'Cardio', duration: 20, difficulty: 'medium' },
  { id: '4', name: 'Siłownia - podstawy', category: 'Siła', duration: 30, difficulty: 'medium' },
  { id: '5', name: 'HIIT Express', category: 'Intensywny', duration: 15, difficulty: 'hard' },
  { id: '6', name: 'Joga wieczorna', category: 'Relaks', duration: 20, difficulty: 'easy' },
];

const categories = ['Wszystkie', 'Domowe 10 min', 'Dla początkujących', 'Cardio', 'Siła', 'Intensywny', 'Relaks'];

export default function Workouts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

  const filteredWorkouts = sampleWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground mb-1">Treningi</h1>
        <p className="text-sm text-muted-foreground">Wybierz trening dla siebie</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj treningów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Workout List */}
      <section className="space-y-3">
        {filteredWorkouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            {...workout}
            onClick={() => {
              // TODO: Navigate to workout detail
              console.log('Open workout:', workout.id);
            }}
          />
        ))}
        
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nie znaleziono treningów</p>
          </div>
        )}
      </section>
    </div>
  );
}
