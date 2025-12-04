import { useGamification } from '@/hooks/useGamification';
import { LevelProgress } from '@/components/flyfit/LevelProgress';
import { BadgeCard } from '@/components/flyfit/BadgeCard';
import { TrophyRoad } from '@/components/flyfit/TrophyRoad';
import { BADGE_DEFINITIONS, XP_REWARDS } from '@/types/gamification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Flame, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/flyfit/PageHeader';

export default function Achievements() {
  const { gamification, badges, loading } = useGamification();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Osiągnięcia" emoji="🏆" icon={<Trophy className="w-5 h-5 text-primary" />} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const earnedBadges = badges.map(b => b.badge_type);
  const earnedCount = earnedBadges.length;
  const totalBadges = BADGE_DEFINITIONS.length;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Osiągnięcia" 
        emoji="🏆" 
        subtitle={`Zdobyto ${earnedCount}/${totalBadges} odznak`}
        icon={<Trophy className="w-5 h-5 text-primary" />} 
      />
      <div className="p-4 space-y-6 pb-24">

        {/* Level Progress */}
        {gamification && (
          <LevelProgress 
            level={gamification.current_level} 
            totalXP={gamification.total_xp} 
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border/50">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{gamification?.current_level || 1}</p>
            <p className="text-xs text-muted-foreground">Poziom</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border/50">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">{gamification?.daily_login_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Seria dni</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border/50">
            <Target className="w-5 h-5 mx-auto mb-1 text-fitfly-green" />
            <p className="text-lg font-bold">{earnedCount}</p>
            <p className="text-xs text-muted-foreground">Odznaki</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="badges">Odznaki</TabsTrigger>
            <TabsTrigger value="rewards">Nagrody XP</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-4">
            <TrophyRoad badges={BADGE_DEFINITIONS} earnedBadges={badges} />
          </TabsContent>

          <TabsContent value="rewards" className="mt-4">
            <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4">
              <h3 className="font-bold text-foreground">Jak zdobywać XP?</h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Ukończony trening', xp: XP_REWARDS.workout_completed, icon: '🏃' },
                  { label: 'Ukończone wyzwanie', xp: XP_REWARDS.challenge_completed, icon: '🎯' },
                  { label: 'Osiągnięty cel wody', xp: XP_REWARDS.water_goal_reached, icon: '💧' },
                  { label: 'Ukończony nawyk', xp: XP_REWARDS.habit_completed, icon: '✅' },
                  { label: 'Zalogowany posiłek', xp: XP_REWARDS.meal_logged, icon: '🍽️' },
                  { label: 'Codzienny login', xp: XP_REWARDS.daily_login, icon: '📅' },
                  { label: 'Za każde 1000 kroków', xp: XP_REWARDS.steps_1000, icon: '👟' },
                  { label: '100% dziennych celów', xp: XP_REWARDS.all_daily_goals, icon: '💯' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="font-bold text-fitfly-green">+{item.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
