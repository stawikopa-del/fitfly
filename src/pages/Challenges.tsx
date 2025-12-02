import { useState } from 'react';
import { Trophy, Star, Play, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';
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
      {/* Header z maskotką */}
      <header className="flex items-center gap-3">
        <img src={mascotImage} alt="FitFly" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Wyzwania</h1>
          <p className="text-sm text-muted-foreground">Zdobywaj punkty ze mną! 🏆</p>
        </div>
      </header>

      {/* Karta punktów */}
      <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-5 text-accent-foreground shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 font-medium">Twoje punkty</p>
            <p className="text-4xl font-extrabold">{totalPoints}</p>
            <p className="text-xs opacity-70">Tak trzymaj!</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex gap-2">
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
            className="rounded-full font-semibold"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Lista wyzwań */}
      <section className="space-y-3">
        {filteredChallenges.map(challenge => {
          const percentage = Math.min((challenge.current / challenge.target) * 100, 100);
          
          return (
            <div 
              key={challenge.id}
              className={cn(
                'bg-card rounded-2xl p-4 border shadow-sm transition-all',
                challenge.isCompleted 
                  ? 'border-secondary/50 bg-secondary/5' 
                  : challenge.isActive 
                    ? 'border-primary/30' 
                    : 'border-border'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    challenge.isCompleted 
                      ? 'bg-secondary/20' 
                      : challenge.isActive 
                        ? 'bg-primary/10' 
                        : 'bg-accent/10'
                  )}>
                    {challenge.isCompleted ? (
                      <Check className="w-6 h-6 text-secondary" />
                    ) : challenge.isActive ? (
                      <Zap className="w-6 h-6 text-primary" />
                    ) : (
                      <Trophy className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground">{challenge.duration} dni</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-accent">+{challenge.points} pkt</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
              
              {(challenge.isActive || challenge.isCompleted) && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Postęp</span>
                    <span className="font-bold">{challenge.current}/{challenge.target} {challenge.unit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        challenge.isCompleted ? 'bg-secondary' : 'bg-primary'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              {!challenge.isActive && !challenge.isCompleted && (
                <Button 
                  onClick={() => handleStartChallenge(challenge.id)}
                  className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Rozpocznij wyzwanie
                </Button>
              )}
              
              {challenge.isCompleted && (
                <div className="text-center text-sm text-secondary font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Ukończone!
                </div>
              )}
            </div>
          );
        })}
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Brak wyzwań w tej kategorii</p>
          </div>
        )}
      </section>
    </div>
  );
}
