import { useState } from 'react';
import { Trophy, Star, Play, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/flyfit';

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
    description: 'Pij minimum 2 litry wody każdego dnia przez 2 tygodnie',
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
];

export default function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const totalPoints = challenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.points, 0);

  const handleStartChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isActive: true } : c));
  };

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'active') return c.isActive && !c.isCompleted;
    if (filter === 'completed') return c.isCompleted;
    return true;
  });

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-accent to-fitfly-orange-light bg-clip-text text-transparent">
          Wyzwania
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Zdobywaj punkty ze mną! 🏆</p>
      </header>

      {/* Karta punktów */}
      <div className="relative z-10">
        <div className="bg-gradient-to-br from-accent to-fitfly-orange-light rounded-3xl p-6 text-accent-foreground shadow-playful-orange relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 font-medium">Twoje punkty</p>
              <p className="text-5xl font-extrabold font-display">{totalPoints}</p>
              <p className="text-sm opacity-80 font-medium">Tak trzymaj! ⭐</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center shadow-lg animate-bounce-soft">
              <Star className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex gap-2 relative z-10">
        {[
          { key: 'all', label: 'Wszystkie' },
          { key: 'active', label: 'Aktywne' },
          { key: 'completed', label: 'Ukończone' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              "rounded-2xl font-bold h-10 px-4",
              filter === key ? 'shadow-playful' : 'border-2'
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Lista wyzwań */}
      <section className="space-y-4 relative z-10">
        {filteredChallenges.map((challenge) => {
          const percentage = Math.min((challenge.current / challenge.target) * 100, 100);
          
          return (
            <div 
              key={challenge.id}
              className={cn(
                'bg-card rounded-3xl p-5 border-2 shadow-card-playful transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-card-playful-hover',
                challenge.isCompleted 
                  ? 'border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/5' 
                  : challenge.isActive 
                    ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5' 
                    : 'border-border/50'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm',
                    challenge.isCompleted 
                      ? 'bg-secondary text-secondary-foreground shadow-playful-green' 
                      : challenge.isActive 
                        ? 'bg-primary text-primary-foreground shadow-playful' 
                        : 'bg-accent/20 text-accent'
                  )}>
                    {challenge.isCompleted ? (
                      <Check className="w-7 h-7" />
                    ) : challenge.isActive ? (
                      <Zap className="w-7 h-7 animate-pulse" />
                    ) : (
                      <Trophy className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-foreground text-lg">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{challenge.duration} dni</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                  +{challenge.points} pkt
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 font-medium">{challenge.description}</p>
              
              {(challenge.isActive || challenge.isCompleted) && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium">Postęp</span>
                    <span className="font-bold text-foreground">{challenge.current}/{challenge.target} {challenge.unit}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        challenge.isCompleted 
                          ? 'bg-gradient-to-r from-secondary to-fitfly-green-light' 
                          : 'bg-gradient-to-r from-primary to-fitfly-blue-light'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              {!challenge.isActive && !challenge.isCompleted && (
                <Button 
                  onClick={() => handleStartChallenge(challenge.id)}
                  variant="accent"
                  className="w-full"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Rozpocznij wyzwanie
                </Button>
              )}
              
              {challenge.isCompleted && (
                <div className="text-center text-sm text-secondary font-bold flex items-center justify-center gap-2 bg-secondary/10 py-3 rounded-2xl">
                  <Check className="w-5 h-5" />
                  Ukończone! 🎉
                </div>
              )}
            </div>
          );
        })}
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border-2 border-border/50">
            <Trophy className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="font-display font-bold text-lg">Brak wyzwań w tej kategorii 🤔</p>
          </div>
        )}
      </section>
    </div>
  );
}
