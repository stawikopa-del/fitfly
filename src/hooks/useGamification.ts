import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { handleApiError } from '@/lib/errorHandler';
import { AsyncQueue } from '@/lib/asyncQueue';

export function useGamification() {
  const { user, isInitialized } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchedRef = useRef(false);
  const mountedRef = useRef(true);
  const userIdRef = useRef<string | null>(null);
  
  // Separate queues for XP and badge operations
  const xpQueue = useMemo(() => new AsyncQueue(), []);
  const badgeQueue = useMemo(() => new AsyncQueue(), []);

  const fetchGamification = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (fetchedRef.current && userIdRef.current === user.id) {
      setLoading(false);
      return;
    }

    try {
      userIdRef.current = user.id;
      fetchedRef.current = true;
      
      const { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mountedRef.current) return;
      
      if (gamError) {
        handleApiError(gamError, 'useGamification.fetchGamification', { silent: true });
        setLoading(false);
        return;
      }

      if (!gamData) {
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
            handleApiError(insertError, 'useGamification.createRecord', { silent: true });
          } else if (newData) {
            setGamification(newData);
          }
        } catch (err) {
          handleApiError(err, 'useGamification.createRecord', { silent: true });
        }
      } else {
        setGamification(gamData);
        
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
          handleApiError(err, 'useGamification.updateLoginStreak', { silent: true });
        }
      }

      try {
        const { data: badgeData } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id);

        if (mountedRef.current) {
          setBadges(badgeData || []);
        }
      } catch (err) {
        handleApiError(err, 'useGamification.fetchBadges', { silent: true });
      }

    } catch (error) {
      handleApiError(error, 'useGamification.fetchGamification', { silent: true });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isInitialized && user) {
      if (userIdRef.current !== user.id) {
        fetchedRef.current = false;
      }
      fetchGamification();
    } else if (isInitialized && !user) {
      setGamification(null);
      setBadges([]);
      setLoading(false);
      fetchedRef.current = false;
      userIdRef.current = null;
    }

    return () => {
      mountedRef.current = false;
      xpQueue.abort();
      badgeQueue.abort();
    };
  }, [isInitialized, user, fetchGamification, xpQueue, badgeQueue]);

  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!user || !mountedRef.current) return;
    
    // Get current gamification state
    const currentGamification = gamification;
    if (!currentGamification) return;

    // Queue the XP operation
    return xpQueue.enqueue(async () => {
      if (!mountedRef.current) return;

      try {
        await supabase
          .from('xp_transactions')
          .insert({
            user_id: user.id,
            amount,
            source,
            description
          });

        // Fetch fresh gamification data for accurate calculation
        const { data: freshData } = await supabase
          .from('user_gamification')
          .select('total_xp, current_level')
          .eq('user_id', user.id)
          .single();

        if (!freshData || !mountedRef.current) return;

        const newTotalXP = freshData.total_xp + amount;
        const newLevel = getLevelFromXP(newTotalXP);
        const leveledUp = newLevel > freshData.current_level;

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
          handleApiError(error, 'useGamification.addXP', { fallbackMessage: 'Nie udało się dodać XP' });
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
            // Confetti might fail
          }
          toast.success(`🎉 Nowy poziom: ${newLevel}!`, {
            description: 'Gratulacje!',
            duration: 4000
          });
        }
      } catch (error) {
        handleApiError(error, 'useGamification.addXP', { silent: true });
      }
    });
  }, [user, gamification, xpQueue]);

  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user || !mountedRef.current) return;
    
    // Check if badge already exists (from current state)
    if (badges.some(b => b.badge_type === badgeType)) return;

    // Queue the badge operation
    return badgeQueue.enqueue(async () => {
      if (!mountedRef.current) return;

      // Double-check badge doesn't exist in DB
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', badgeType)
        .maybeSingle();

      if (existingBadge) return; // Already has badge

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
          if (error.code === '23505') return; // Duplicate key
          handleApiError(error, 'useGamification.awardBadge', { silent: true });
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
        handleApiError(error, 'useGamification.awardBadge', { silent: true });
      }
    });
  }, [user, badges, badgeQueue]);

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
