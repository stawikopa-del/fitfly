import { useState, useCallback, useEffect, useRef } from 'react';
import { DailyProgress, MascotState, MascotEmotion } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';
import { toast } from 'sonner';

const defaultProgress: DailyProgress = {
  steps: 0,
  stepsGoal: 10000,
  water: 0,
  waterGoal: 2000,
  activeMinutes: 0,
  activeMinutesGoal: 30,
  calories: 0,
  caloriesGoal: 2000,
};

const motivationalMessages: Record<MascotEmotion, string[]> = {
  greeting: [
    'Cześć! Miło Cię widzieć! 👋',
    'Hej! Gotowy/a na nowy dzień?',
    'Witaj! Dzisiaj będzie super!',
  ],
  happy: [
    'Świetnie Ci idzie! 💪',
    'Jesteś niesamowity/a!',
    'Tak trzymaj!',
  ],
  proud: [
    'Jestem z Ciebie dumny/a!',
    'Osiągasz swoje cele!',
    'Brawo! Robisz postępy!',
  ],
  motivated: [
    'Dasz radę! Wierzę w Ciebie!',
    'Jeden krok naraz!',
    'Dziś jest Twój dzień!',
  ],
  tired: [
    'Pamiętaj o odpoczynku!',
    'Regeneracja też jest ważna!',
    'Nie zapominaj o sobie!',
  ],
  neutral: [
    'Cześć! Co dziś robimy?',
    'Gotowy/a na wyzwania?',
    'Zacznijmy razem!',
  ],
  celebrating: [
    '🎉 Cel osiągnięty!',
    'Niesamowite! Udało się!',
    'Jesteś mistrzem/mistrzynią!',
  ],
  cheering: [
    'Dajesz! Jeszcze trochę! 💪',
    'Nie poddawaj się!',
    'Jesteś na dobrej drodze!',
  ],
  sleeping: [
    'Zzz... dobranoc!',
    'Czas na odpoczynek...',
    'Sen to też trening!',
  ],
  excited: [
    'Wow! To będzie świetny dzień! ⭐',
    'Nie mogę się doczekać!',
    'Energia na maksa!',
  ],
};

// Debounce helper to prevent rapid consecutive saves
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function useUserProgress() {
  const { user, isInitialized } = useAuth();
  const { onWaterGoalReached } = useGamification();
  const [progress, setProgress] = useState<DailyProgress>(defaultProgress);
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'neutral',
    message: 'Cześć! Gotowy/a na świetny dzień?',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const waterGoalRewardedRef = useRef(false);
  const saveInProgressRef = useRef(false);
  const pendingUpdatesRef = useRef<Partial<{ water: number; steps: number; activeMinutes: number }> | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch user data with proper error handling
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      setProgress(defaultProgress);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile and daily progress in parallel
        const [profileResult, dailyResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('daily_water, daily_calories, daily_steps_goal')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('progress_date', today)
            .maybeSingle()
        ]);

        if (!mounted) return;

        if (profileResult.error) {
          console.error('Profile fetch error:', profileResult.error);
        }
        if (dailyResult.error) {
          console.error('Daily progress fetch error:', dailyResult.error);
        }

        const profile = profileResult.data;
        const dailyData = dailyResult.data;

        // Check if water goal was already reached today
        if (dailyData && profile) {
          const waterGoal = profile.daily_water || 2000;
          waterGoalRewardedRef.current = dailyData.water >= waterGoal;
        }

        setProgress(prev => ({
          ...prev,
          waterGoal: profile?.daily_water || 2000,
          caloriesGoal: profile?.daily_calories || 2000,
          stepsGoal: profile?.daily_steps_goal || 10000,
          water: dailyData?.water || 0,
          steps: dailyData?.steps || 0,
          activeMinutes: dailyData?.active_minutes || 0,
        }));

      } catch (err) {
        console.error('Failed to fetch user progress:', err);
        if (mounted) {
          setError('Nie udało się pobrać danych');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user, isInitialized, today]);

  // Save progress to database with retry and conflict handling
  const saveProgressToDb = useCallback(async (
    newProgress: Partial<{ water: number; steps: number; activeMinutes: number }>
  ) => {
    if (!user) return;

    // Prevent concurrent saves
    if (saveInProgressRef.current) {
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...newProgress };
      return;
    }

    saveInProgressRef.current = true;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('daily_progress')
        .select('id, water, steps, active_minutes')
        .eq('user_id', user.id)
        .eq('progress_date', today)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('daily_progress')
          .update({
            water: newProgress.water ?? existing.water,
            steps: newProgress.steps ?? existing.steps,
            active_minutes: newProgress.activeMinutes ?? existing.active_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .eq('user_id', user.id); // Extra safety check

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            progress_date: today,
            water: newProgress.water || 0,
            steps: newProgress.steps || 0,
            active_minutes: newProgress.activeMinutes || 0,
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
      toast.error('Nie udało się zapisać postępu');
    } finally {
      saveInProgressRef.current = false;

      // Process any pending updates
      if (pendingUpdatesRef.current) {
        const pending = pendingUpdatesRef.current;
        pendingUpdatesRef.current = null;
        saveProgressToDb(pending);
      }
    }
  }, [user, today]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((updates: Partial<{ water: number; steps: number; activeMinutes: number }>) => {
      saveProgressToDb(updates);
    }, 500),
    [saveProgressToDb]
  );

  const getMascotEmotion = useCallback((newProgress: DailyProgress): MascotEmotion => {
    const waterPercent = newProgress.water / newProgress.waterGoal;
    const stepsPercent = newProgress.steps / newProgress.stepsGoal;
    const activePercent = newProgress.activeMinutes / newProgress.activeMinutesGoal;

    const avgProgress = (waterPercent + stepsPercent + activePercent) / 3;

    if (avgProgress >= 1) return 'celebrating';
    if (avgProgress >= 0.8) return 'proud';
    if (avgProgress >= 0.5) return 'happy';
    if (avgProgress >= 0.3) return 'motivated';
    return 'neutral';
  }, []);

  const updateMascotState = useCallback((emotion: MascotEmotion) => {
    const messages = motivationalMessages[emotion];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMascotState({ emotion, message: randomMessage });
  }, []);

  const addWater = useCallback((amount: number = 250) => {
    setProgress(prev => {
      const newWater = Math.min(prev.water + amount, prev.waterGoal + 500);
      const newProgress = { ...prev, water: newWater };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      
      // Debounced save
      debouncedSave({ water: newWater, steps: prev.steps, activeMinutes: prev.activeMinutes });
      
      // Award XP when water goal is reached (only once per day)
      if (newWater >= prev.waterGoal && prev.water < prev.waterGoal && !waterGoalRewardedRef.current) {
        waterGoalRewardedRef.current = true;
        onWaterGoalReached();
      }
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave, onWaterGoalReached]);

  const addSteps = useCallback((steps: number) => {
    setProgress(prev => {
      const newSteps = prev.steps + steps;
      const newProgress = { ...prev, steps: newSteps };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      
      debouncedSave({ water: prev.water, steps: newSteps, activeMinutes: prev.activeMinutes });
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave]);

  const addActiveMinutes = useCallback((minutes: number) => {
    setProgress(prev => {
      const newActiveMinutes = prev.activeMinutes + minutes;
      const newProgress = { ...prev, activeMinutes: newActiveMinutes };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      
      debouncedSave({ water: prev.water, steps: prev.steps, activeMinutes: newActiveMinutes });
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave]);

  const addCalories = useCallback((calories: number) => {
    setProgress(prev => ({ ...prev, calories: prev.calories + calories }));
  }, []);

  return {
    progress,
    mascotState,
    loading,
    error,
    addWater,
    addSteps,
    addActiveMinutes,
    addCalories,
    setMascotState,
  };
}
