import { useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import { ChallengeCard } from '@/components/flyfit/ChallengeCard';
import { Challenge } from '@/types/flyfit';
import { Button } from '@/components/ui/button';

const initialChallenges: Challenge[] = [
  {
    id: '1',
    title: '10 000 kroków',
    description: 'Zrób 10 000 kroków dziennie przez 7 dni',
    target: 7,
    current: 3,
    unit: 'dni',
    duration: 7,
    points: 100,
    isActive: true,
    isCompleted: false,
  },
  {
    id: '2',
    title: '2L wody dziennie',
    description: 'Pij minimum 2 litry wody każdego dnia',
    target: 14,
    current: 14,
    unit: 'dni',
    duration: 14,
    points: 150,
    isActive: false,
    isCompleted: true,
  },
  {
    id: '3',
    title: '7 dni bez słodyczy',
    description: 'Unikaj słodyczy przez cały tydzień',
    target: 7,
    current: 0,
    unit: 'dni',
    duration: 7,
    points: 200,
    isActive: false,
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Poranny trening',
    description: 'Ćwicz rano przez 5 dni z rzędu',
    target: 5,
    current: 0,
    unit: 'dni',
    duration: 5,
    points: 120,
    isActive: false,
    isCompleted: false,
  },
  {
    id: '5',
    title: 'Mistrz nawodnienia',
    description: 'Wypij 3L wody w jeden dzień',
    target: 3000,
    current: 0,
    unit: 'ml',
    duration: 1,
    points: 50,
    isActive: false,
    isCompleted: false,
  },
];

export default function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const totalPoints = challenges
    .filter(c => c.isCompleted)
    .reduce((sum, c) => sum + c.points, 0);

  const handleStartChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: true } : c
    ));
  };

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'active') return c.isActive && !c.isCompleted;
    if (filter === 'completed') return c.isCompleted;
    return true;
  });

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground mb-1">Wyzwania</h1>
        <p className="text-sm text-muted-foreground">Podejmij wyzwanie i zdobądź punkty!</p>
      </header>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Twoje punkty</p>
            <p className="text-3xl font-bold">{totalPoints}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-full"
        >
          Wszystkie
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
          className="rounded-full"
        >
          Aktywne
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className="rounded-full"
        >
          Ukończone
        </Button>
      </div>

      {/* Challenges List */}
      <section className="space-y-3">
        {filteredChallenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onStart={handleStartChallenge}
          />
        ))}
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Brak wyzwań w tej kategorii</p>
          </div>
        )}
      </section>
    </div>
  );
}
