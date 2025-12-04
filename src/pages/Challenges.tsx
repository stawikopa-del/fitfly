import { useState } from 'react';
import { Trophy, Star, Play, Check, Zap, Target, Flame, Calendar, Trash2, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHabitsAndChallenges } from '@/hooks/useHabitsAndChallenges';
import { AddHabitDialog } from '@/components/flyfit/AddHabitDialog';
import { AddChallengeDialog } from '@/components/flyfit/AddChallengeDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Challenges() {
  const navigate = useNavigate();
  const {
    habits,
    challenges,
    loading,
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    addChallenge,
    startChallenge,
    updateChallengeProgress,
    deleteChallenge,
    isHabitCompletedToday,
    getTotalPoints,
    getCompletedHabitsToday,
  } = useHabitsAndChallenges();

  const [challengeFilter, setChallengeFilter] = useState<'all' | 'active' | 'completed'>('all');

  const totalPoints = getTotalPoints();
  const completedToday = getCompletedHabitsToday();
  const totalHabits = habits.length;

  const filteredChallenges = challenges.filter(c => {
    if (challengeFilter === 'active') return c.is_active && !c.is_completed;
    if (challengeFilter === 'completed') return c.is_completed;
    return true;
  });

  const activeChallenges = challenges.filter(c => c.is_active && !c.is_completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-accent to-fitfly-orange-light bg-clip-text text-transparent">
          Nawyki i Wyzwania
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Buduj lepszą wersję siebie! 🏆</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-accent to-fitfly-orange-light rounded-3xl p-4 text-accent-foreground shadow-playful-orange relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Star className="w-8 h-8 mb-2" />
          <p className="text-3xl font-extrabold font-display">{totalPoints}</p>
          <p className="text-xs opacity-80 font-medium">Punkty</p>
        </div>

        {/* Habits Progress */}
        <div className="bg-gradient-to-br from-primary to-fitfly-blue-light rounded-3xl p-4 text-primary-foreground shadow-playful relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Flame className="w-8 h-8 mb-2" />
          <p className="text-3xl font-extrabold font-display">{completedToday}/{totalHabits}</p>
          <p className="text-xs opacity-80 font-medium">Nawyki dziś</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="w-full rounded-2xl h-12 p-1">
          <TabsTrigger value="habits" className="flex-1 rounded-xl font-bold">
            <Target className="w-4 h-4 mr-2" />
            Nawyki
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1 rounded-xl font-bold">
            <Trophy className="w-4 h-4 mr-2" />
            Wyzwania
          </TabsTrigger>
        </TabsList>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-4 mt-4">
          {/* Add Habit Button */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-display text-foreground text-lg">
              Dzisiejsze nawyki 🎯
            </h2>
            <AddHabitDialog onAdd={addHabit} />
          </div>

          {/* Atomic Habits Tip */}
          {habits.length === 0 && (
            <div className="bg-primary/10 rounded-3xl p-5 border-2 border-primary/30">
              <h3 className="font-bold text-primary mb-2">💡 Tip z "Atomowych Nawyków"</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Zasada 2 minut:</strong> Kiedy zaczynasz nowy nawyk, powinien trwać mniej niż 2 minuty.
                "Czytaj 30 stron" staje się "Przeczytaj jedną stronę".
              </p>
            </div>
          )}

          {/* Habits List */}
          <div className="space-y-3">
            {habits.map((habit) => {
              const isCompleted = isHabitCompletedToday(habit.id);
              
              return (
                <div
                  key={habit.id}
                  className={cn(
                    'bg-card rounded-3xl p-4 border-2 shadow-card-playful transition-all',
                    'hover:-translate-y-0.5',
                    isCompleted 
                      ? 'border-secondary/50 bg-gradient-to-r from-secondary/10 to-secondary/5' 
                      : 'border-border/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                        'hover:scale-105 active:scale-95',
                        isCompleted 
                          ? 'bg-secondary text-secondary-foreground shadow-playful-green' 
                          : 'bg-muted border-2 border-dashed border-border'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-7 h-7" />
                      ) : (
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'font-bold font-display text-foreground',
                        isCompleted && 'line-through opacity-60'
                      )}>
                        {habit.title}
                      </h3>
                      {habit.cue && (
                        <p className="text-xs text-muted-foreground truncate">
                          📍 {habit.cue}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          🔥 {habit.streak_current} dni
                        </span>
                        {habit.streak_best > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Najlepszy: {habit.streak_best}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usunąć nawyk?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Utracisz całą historię i serie dla tego nawyku.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-2xl">Anuluj</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteHabit(habit.id)}
                            className="bg-destructive rounded-2xl"
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {habit.reward && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        🎁 Nagroda: <span className="text-foreground">{habit.reward}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {habits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border-2 border-dashed border-border">
              <Target className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-display font-bold text-lg">Nie masz jeszcze nawyków</p>
              <p className="text-sm mt-1">Dodaj pierwszy nawyk i zacznij budować lepsze życie!</p>
            </div>
          )}

          {/* Calendar Integration */}
          <Button
            variant="outline"
            className="w-full rounded-2xl h-14 border-2 justify-between"
            onClick={() => navigate('/kalendarz')}
          >
            <span className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              Zaplanuj nawyki w kalendarzu
            </span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4 mt-4">
          {/* Add Challenge Button */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-display text-foreground text-lg">
              Twoje wyzwania 🏆
            </h2>
            <AddChallengeDialog onAdd={addChallenge} />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Wszystkie' },
              { key: 'active', label: 'Aktywne' },
              { key: 'completed', label: 'Ukończone' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={challengeFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChallengeFilter(key as typeof challengeFilter)}
                className={cn(
                  "rounded-2xl font-bold h-10 px-4",
                  challengeFilter === key ? 'shadow-playful' : 'border-2'
                )}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Active Challenges Alert */}
          {activeChallenges.length > 0 && challengeFilter !== 'completed' && (
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/30">
              <p className="text-sm font-medium text-primary">
                💪 Masz {activeChallenges.length} aktywne wyzwani{activeChallenges.length === 1 ? 'e' : 'a'}! Nie poddawaj się!
              </p>
            </div>
          )}

          {/* Challenges List */}
          <div className="space-y-4">
            {filteredChallenges.map((challenge) => {
              const percentage = Math.min((challenge.current / challenge.target) * 100, 100);
              
              return (
                <div 
                  key={challenge.id}
                  className={cn(
                    'bg-card rounded-3xl p-5 border-2 shadow-card-playful transition-all',
                    'hover:-translate-y-0.5',
                    challenge.is_completed 
                      ? 'border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/5' 
                      : challenge.is_active 
                        ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5' 
                        : 'border-border/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm',
                        challenge.is_completed 
                          ? 'bg-secondary text-secondary-foreground shadow-playful-green' 
                          : challenge.is_active 
                            ? 'bg-primary text-primary-foreground shadow-playful' 
                            : 'bg-accent/20 text-accent'
                      )}>
                        {challenge.is_completed ? (
                          <Check className="w-7 h-7" />
                        ) : challenge.is_active ? (
                          <Zap className="w-7 h-7 animate-pulse" />
                        ) : (
                          <Trophy className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold font-display text-foreground text-lg">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{challenge.duration_days} dni</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                        +{challenge.points} pkt
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl w-8 h-8">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Usunąć wyzwanie?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Utracisz cały postęp dla tego wyzwania.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-2xl">Anuluj</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteChallenge(challenge.id)}
                              className="bg-destructive rounded-2xl"
                            >
                              Usuń
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {challenge.description && (
                    <p className="text-sm text-muted-foreground mb-4 font-medium">{challenge.description}</p>
                  )}
                  
                  {(challenge.is_active || challenge.is_completed) && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground font-medium">Postęp</span>
                        <span className="font-bold text-foreground">{challenge.current}/{challenge.target} {challenge.unit}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            challenge.is_completed 
                              ? 'bg-gradient-to-r from-secondary to-fitfly-green-light' 
                              : 'bg-gradient-to-r from-primary to-fitfly-blue-light'
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {challenge.is_active && !challenge.is_completed && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => updateChallengeProgress(challenge.id, challenge.current + 1)}
                        size="sm"
                        className="flex-1 rounded-2xl"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        +1 {challenge.unit}
                      </Button>
                    </div>
                  )}
                  
                  {!challenge.is_active && !challenge.is_completed && (
                    <Button 
                      onClick={() => startChallenge(challenge.id)}
                      variant="accent"
                      className="w-full"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Rozpocznij wyzwanie
                    </Button>
                  )}
                  
                  {challenge.is_completed && (
                    <div className="text-center text-sm text-secondary font-bold flex items-center justify-center gap-2 bg-secondary/10 py-3 rounded-2xl">
                      <Check className="w-5 h-5" />
                      Ukończone! 🎉
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredChallenges.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border-2 border-dashed border-border">
              <Trophy className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-display font-bold text-lg">
                {challengeFilter === 'completed' 
                  ? 'Brak ukończonych wyzwań' 
                  : challengeFilter === 'active'
                    ? 'Brak aktywnych wyzwań'
                    : 'Brak wyzwań'
                }
              </p>
              <p className="text-sm mt-1">Dodaj wyzwanie i zdobywaj punkty!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
