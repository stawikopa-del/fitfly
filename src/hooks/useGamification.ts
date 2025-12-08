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
  const [loading, setLoading] = useState(false); // No initial loading delay
  
  const operationInProgressRef = useRef(false);
  const pendingXPRef = useRef<Array<{ amount: number; source: string; description?: string }>>([]);
  const fetchedRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchGamification = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchedRef.current) {
      setLoading(false);
      return;
    }

    try {
      fetchedRef.current = true;
      
      // Fetch gamification data
      const { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mountedRef.current) return;
      
      if (gamError) {
        console.error('Error fetching gamification:', gamError);
        setLoading(false);
        return;
      }

      if (!gamData) {
        // Create initial gamification record
        try {
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

          if (!mountedRef.current) return;

          if (insertError && insertError.code !== '23505') {
            console.error('Error creating gamification:', insertError);
          } else if (newData) {
            setGamification(newData);
          }
        } catch (err) {
          console.error('Error creating gamification record:', err);
        }
      } else {
        setGamification(gamData);
        
        // Check and update daily login streak
        try {
          const today = new Date().toISOString().split('T')[0];
          if (gamData.last_login_date !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const newStreak = gamData.last_login_date === yesterdayStr 
              ? gamData.daily_login_streak + 1 
              : 1;

            await supabase
              .from('user_gamification')
              .update({ 
                last_login_date: today,
                daily_login_streak: newStreak,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (mountedRef.current) {
              setGamification(prev => prev ? { 
                ...prev, 
                last_login_date: today,
                daily_login_streak: newStreak
              } : null);
            }
          }
        } catch (err) {
          console.error('Error updating login streak:', err);
        }
      }

      // Fetch badges
      try {
        const { data: badgeData } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id);

        if (mountedRef.current) {
          setBadges(badgeData || []);
        }
      } catch (err) {
        console.error('Error fetching badges:', err);
      }

    } catch (error) {
      console.error('Error fetching gamification:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isInitialized && user) {
      fetchedRef.current = false;
      fetchGamification();
    } else if (isInitialized && !user) {
      setGamification(null);
      setBadges([]);
      setLoading(false);
      fetchedRef.current = false;
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isInitialized, user, fetchGamification]);

  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!user || !gamification || !mountedRef.current) return;
    
    if (operationInProgressRef.current) {
      pendingXPRef.current.push({ amount, source, description });
      return;
    }

    operationInProgressRef.current = true;

    try {
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

      if (error) {
        console.error('Error updating XP:', error);
        return;
      }

      if (updatedData && mountedRef.current) {
        setGamification(updatedData);
      }

      toast.success(`+${amount} XP`, {
        description: description || source,
        duration: 2000
      });

      if (leveledUp) {
        try {
          triggerLevelUpConfetti();
        } catch {
          // Confetti might fail in some environments
        }
        toast.success(`🎉 Nowy poziom: ${newLevel}!`, {
          description: 'Gratulacje!',
          duration: 4000
        });
      }

    } catch (error) {
      console.error('Error adding XP:', error);
    } finally {
      operationInProgressRef.current = false;

      if (pendingXPRef.current.length > 0 && mountedRef.current) {
        const pending = pendingXPRef.current.shift();
        if (pending) {
          addXP(pending.amount, pending.source, pending.description);
        }
      }
    }
  }, [user, gamification]);

  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user || !mountedRef.current) return;
    
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
        if (error.code === '23505') return;
        console.error('Error awarding badge:', error);
        return;
      }

      if (mountedRef.current) {
        setBadges(prev => [...prev, data]);
      }

      const badge = BADGE_DEFINITIONS.find(b => b.type === badgeType);
      if (badge) {
        try {
          triggerBadgeConfetti();
        } catch {
          // Confetti might fail
        }
        toast.success(`🏆 Nowa odznaka: ${badge.name}!`, {
          description: badge.description,
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }, [user, badges]);

  const onWorkoutCompleted = useCallback(async () => {
    await addXP(XP_REWARDS.workout_completed, 'workout', 'Ukończony trening');
    await awardBadge('pierwszy_krok');
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