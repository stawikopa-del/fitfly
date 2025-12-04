import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { 
  UserGamification, 
  UserBadge, 
  BadgeType, 
  XP_REWARDS, 
  getLevelFromXP,
  BADGE_DEFINITIONS
} from '@/types/gamification';

export function useGamification() {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGamification = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch gamification data
      const { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (gamError) throw gamError;

      if (!gamData) {
        // Create initial gamification record
        const { data: newData, error: insertError } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setGamification(newData);
      } else {
        setGamification(gamData);
        
        // Check and update daily login streak
        const today = new Date().toISOString().split('T')[0];
        if (gamData.last_login_date !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const newStreak = gamData.last_login_date === yesterdayStr 
            ? gamData.daily_login_streak + 1 
            : 1;

          const { error: updateError } = await supabase
            .from('user_gamification')
            .update({ 
              last_login_date: today,
              daily_login_streak: newStreak
            })
            .eq('user_id', user.id);

          if (!updateError) {
            setGamification(prev => prev ? { 
              ...prev, 
              last_login_date: today,
              daily_login_streak: newStreak
            } : null);
            
            // Award daily login XP
            await addXP(XP_REWARDS.daily_login, 'daily_login', 'Codzienny login');
            
            // Check streak badges
            if (newStreak === 7) await awardBadge('konsekwentny');
            if (newStreak === 30) await awardBadge('niezniszczalny');
          }
        }
      }

      // Fetch badges
      const { data: badgeData, error: badgeError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (badgeError) throw badgeError;
      setBadges(badgeData || []);

    } catch (error) {
      console.error('Error fetching gamification:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamification();
  }, [fetchGamification]);

  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!user || !gamification) return;

    try {
      // Add XP transaction
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: user.id,
          amount,
          source,
          description
        });

      const newTotalXP = gamification.total_xp + amount;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > gamification.current_level;

      // Update gamification
      const { error } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setGamification(prev => prev ? {
        ...prev,
        total_xp: newTotalXP,
        current_level: newLevel
      } : null);

      // Show toast
      toast.success(`+${amount} XP`, {
        description: description || source,
        duration: 2000
      });

      if (leveledUp) {
        toast.success(`🎉 Nowy poziom: ${newLevel}!`, {
          description: 'Gratulacje!',
          duration: 4000
        });
        
        // Check level badges
        if (newLevel >= 10) await awardBadge('zdrowy_duch');
        if (newLevel >= 25) await awardBadge('legenda');
      }

      // Check XP badges
      if (newTotalXP >= 10000) await awardBadge('fit_guru');

    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }, [user, gamification]);

  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user) return;
    
    // Check if already has badge
    if (badges.some(b => b.badge_type === badgeType)) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_type: badgeType
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return; // Duplicate, already has badge
        throw error;
      }

      setBadges(prev => [...prev, data]);

      const badge = BADGE_DEFINITIONS.find(b => b.type === badgeType);
      if (badge) {
        toast.success(`🏆 Nowa odznaka: ${badge.name}!`, {
          description: badge.description,
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }, [user, badges]);

  // Helper functions for awarding XP
  const onWorkoutCompleted = useCallback(async () => {
    await addXP(XP_REWARDS.workout_completed, 'workout', 'Ukończony trening');
    await awardBadge('pierwszy_krok');
    
    const hour = new Date().getHours();
    if (hour < 8) await awardBadge('wczesny_ptaszek');
    if (hour >= 22) await awardBadge('nocny_marek');
  }, [addXP, awardBadge]);

  const onWaterGoalReached = useCallback(async () => {
    await addXP(XP_REWARDS.water_goal_reached, 'water', 'Osiągnięto cel wody');
  }, [addXP]);

  const onMealLogged = useCallback(async () => {
    await addXP(XP_REWARDS.meal_logged, 'meal', 'Zalogowano posiłek');
  }, [addXP]);

  const onHabitCompleted = useCallback(async () => {
    await addXP(XP_REWARDS.habit_completed, 'habit', 'Ukończono nawyk');
  }, [addXP]);

  const onChallengeCompleted = useCallback(async () => {
    await addXP(XP_REWARDS.challenge_completed, 'challenge', 'Ukończono wyzwanie');
  }, [addXP]);

  const onStepsAdded = useCallback(async (steps: number) => {
    const xpFromSteps = Math.floor(steps / 1000) * XP_REWARDS.steps_1000;
    if (xpFromSteps > 0) {
      await addXP(xpFromSteps, 'steps', `${steps} kroków`);
    }
  }, [addXP]);

  return {
    gamification,
    badges,
    loading,
    addXP,
    awardBadge,
    onWorkoutCompleted,
    onWaterGoalReached,
    onMealLogged,
    onHabitCompleted,
    onChallengeCompleted,
    onStepsAdded,
    refresh: fetchGamification
  };
}
