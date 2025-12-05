import { useState, useEffect, useCallback, useRef } from 'react';
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
import { triggerLevelUpConfetti, triggerBadgeConfetti } from '@/utils/confetti';

export function useGamification() {
  const { user, isInitialized } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Prevent concurrent operations
  const operationInProgressRef = useRef(false);
  const pendingXPRef = useRef<Array<{ amount: number; source: string; description?: string }>>([]);

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
        // Create initial gamification record with conflict handling
        const { data: newData, error: insertError } = await supabase
          .from('user_gamification')
          .upsert({ 
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            daily_login_streak: 0
          }, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (insertError && insertError.code !== '23505') {
          throw insertError;
        }
        
        if (newData) {
          setGamification(newData);
        } else {
          // Fetch again if upsert returned no data
          const { data: refetchData } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single();
          setGamification(refetchData);
        }
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
              daily_login_streak: newStreak,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (!updateError) {
            setGamification(prev => prev ? { 
              ...prev, 
              last_login_date: today,
              daily_login_streak: newStreak
            } : null);
            
            // Award daily login XP (defer to prevent deadlock)
            setTimeout(() => {
              addXP(XP_REWARDS.daily_login, 'daily_login', 'Codzienny login');
              
              // Check streak badges
              if (newStreak === 7) awardBadge('konsekwentny');
              if (newStreak === 30) awardBadge('niezniszczalny');
            }, 100);
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
    if (isInitialized) {
      fetchGamification();
    }
  }, [isInitialized, fetchGamification]);

  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!user) return;
    
    // Queue XP if operation in progress
    if (operationInProgressRef.current) {
      pendingXPRef.current.push({ amount, source, description });
      return;
    }

    // Get latest gamification state
    const currentGamification = gamification;
    if (!currentGamification) return;

    operationInProgressRef.current = true;

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

      const newTotalXP = currentGamification.total_xp + amount;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > currentGamification.current_level;

      // Update gamification with optimistic locking pattern
      const { data: updatedData, error } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (updatedData) {
        setGamification(updatedData);
      }

      // Show toast
      toast.success(`+${amount} XP`, {
        description: description || source,
        duration: 2000
      });

      if (leveledUp) {
        triggerLevelUpConfetti();
        toast.success(`🎉 Nowy poziom: ${newLevel}!`, {
          description: 'Gratulacje!',
          duration: 4000
        });
        
        // Check level badges (defer)
        setTimeout(() => {
          if (newLevel >= 10) awardBadge('zdrowy_duch');
          if (newLevel >= 25) awardBadge('legenda');
        }, 100);
      }

      // Check XP badges (defer)
      setTimeout(() => {
        if (newTotalXP >= 10000) awardBadge('fit_guru');
      }, 100);

    } catch (error) {
      console.error('Error adding XP:', error);
    } finally {
      operationInProgressRef.current = false;

      // Process pending XP
      if (pendingXPRef.current.length > 0) {
        const pending = pendingXPRef.current.shift();
        if (pending) {
          addXP(pending.amount, pending.source, pending.description);
        }
      }
    }
  }, [user, gamification]);

  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user) return;
    
    // Check if already has badge (from current state)
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
        triggerBadgeConfetti();
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
    await awardBadge('wodny_wojownik');
  }, [addXP, awardBadge]);

  const onMealLogged = useCallback(async () => {
    await addXP(XP_REWARDS.meal_logged, 'meal', 'Zalogowano posiłek');
    await awardBadge('dietetyk');
  }, [addXP, awardBadge]);

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
