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
  const hasFetchedRef = useRef(false);

  // Standalone function to add XP (not in useCallback to avoid circular deps)
  const addXPInternal = async (
    userId: string, 
    currentGamification: UserGamification,
    amount: number, 
    source: string, 
    description?: string
  ) => {
    try {
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount,
          source,
          description
        });

      const newTotalXP = currentGamification.total_xp + amount;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > currentGamification.current_level;

      const { data: updatedData, error } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (updatedData) {
        setGamification(updatedData);
      }

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
      }

      return { newTotalXP, newLevel, leveledUp };
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  };

  // Standalone function to award badge
  const awardBadgeInternal = async (userId: string, badgeType: BadgeType, currentBadges: UserBadge[]) => {
    if (currentBadges.some(b => b.badge_type === badgeType)) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badgeType
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return;
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
  };

  useEffect(() => {
    if (!isInitialized || !user || hasFetchedRef.current) return;
    
    hasFetchedRef.current = true;

    const fetchGamification = async () => {
      try {
        // Fetch gamification data
        const { data: gamData, error: gamError } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (gamError) throw gamError;

        let currentGamification = gamData;

        if (!gamData) {
          // Create initial gamification record
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
            currentGamification = newData;
            setGamification(newData);
          } else {
            const { data: refetchData } = await supabase
              .from('user_gamification')
              .select('*')
              .eq('user_id', user.id)
              .single();
            currentGamification = refetchData;
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
              const updatedGam = { 
                ...gamData, 
                last_login_date: today,
                daily_login_streak: newStreak
              };
              setGamification(updatedGam);
              currentGamification = updatedGam;
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
    };

    fetchGamification();
  }, [isInitialized, user]);

  // Reset on user change
  useEffect(() => {
    if (!user) {
      hasFetchedRef.current = false;
      setGamification(null);
      setBadges([]);
      setLoading(true);
    }
  }, [user]);

  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!user || !gamification) return;
    
    if (operationInProgressRef.current) {
      pendingXPRef.current.push({ amount, source, description });
      return;
    }

    operationInProgressRef.current = true;

    try {
      const result = await addXPInternal(user.id, gamification, amount, source, description);
      
      if (result) {
        // Check level badges
        if (result.newLevel >= 10) {
          await awardBadgeInternal(user.id, 'zdrowy_duch', badges);
        }
        if (result.newLevel >= 25) {
          await awardBadgeInternal(user.id, 'legenda', badges);
        }
        if (result.newTotalXP >= 10000) {
          await awardBadgeInternal(user.id, 'fit_guru', badges);
        }
      }
    } finally {
      operationInProgressRef.current = false;

      if (pendingXPRef.current.length > 0) {
        const pending = pendingXPRef.current.shift();
        if (pending) {
          addXP(pending.amount, pending.source, pending.description);
        }
      }
    }
  }, [user, gamification, badges]);

  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user) return;
    await awardBadgeInternal(user.id, badgeType, badges);
  }, [user, badges]);

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

  const refresh = useCallback(async () => {
    if (!user) return;
    
    hasFetchedRef.current = false;
    setLoading(true);
    
    // Trigger re-fetch
    const { data: gamData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (gamData) setGamification(gamData);
    
    const { data: badgeData } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);
    
    if (badgeData) setBadges(badgeData);
    
    setLoading(false);
  }, [user]);

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
    refresh
  };
}
