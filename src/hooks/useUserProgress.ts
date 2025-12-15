import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DailyProgress, MascotState, MascotEmotion } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { handleApiError } from '@/lib/errorHandler';
import { createDebouncedAsync } from '@/lib/asyncQueue';

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
  greeting: ['Cześć! Miło Cię widzieć! 👋', 'Hej! Gotowy/a na nowy dzień?', 'Witaj! Dzisiaj będzie super!'],
  happy: ['Świetnie Ci idzie! 💪', 'Jesteś niesamowity/a!', 'Tak trzymaj!'],
  proud: ['Jestem z Ciebie dumny/a!', 'Osiągasz swoje cele!', 'Brawo! Robisz postępy!'],
  motivated: ['Dasz radę! Wierzę w Ciebie!', 'Jeden krok naraz!', 'Dziś jest Twój dzień!'],
  tired: ['Pamiętaj o odpoczynku!', 'Regeneracja też jest ważna!', 'Nie zapominaj o sobie!'],
  neutral: ['Cześć! Co dziś robimy?', 'Gotowy/a na wyzwania?', 'Zacznijmy razem!'],
  celebrating: ['🎉 Cel osiągnięty!', 'Niesamowite! Udało się!', 'Jesteś mistrzem/mistrzynią!'],
  cheering: ['Dajesz! Jeszcze trochę! 💪', 'Nie poddawaj się!', 'Jesteś na dobrej drodze!'],
  sleeping: ['Zzz... dobranoc!', 'Czas na odpoczynek...', 'Sen to też trening!'],
  excited: ['Wow! To będzie świetny dzień! ⭐', 'Nie mogę się doczekać!', 'Energia na maksa!'],
};

export function useUserProgress() {
  const { user, isInitialized } = useAuth();
  const [progress, setProgress] = useState<DailyProgress>(defaultProgress);
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'neutral',
    message: 'Cześć! Gotowy/a na świetny dzień?',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);
  const latestProgressRef = useRef<{ water: number; steps: number; activeMinutes: number } | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Get today's date safely
  const getToday = useCallback(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toLocaleDateString('en-CA');
    }
  }, []);

  // Core save function
  const saveToDb = useCallback(async (updates: { water: number; steps: number; activeMinutes: number }) => {
    const userId = userIdRef.current;
    if (!userId || !mountedRef.current) return;

    const today = getToday();

    try {
      const { data: existing } = await supabase
        .from('daily_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('progress_date', today)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (existing) {
        await supabase
          .from('daily_progress')
          .update({
            water: updates.water,
            steps: updates.steps,
            active_minutes: updates.activeMinutes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_progress')
          .insert({
            user_id: userId,
            progress_date: today,
            water: updates.water,
            steps: updates.steps,
            active_minutes: updates.activeMinutes,
          });
      }
    } catch (err) {
      handleApiError(err, 'saveProgress', { fallbackMessage: 'Nie udało się zapisać postępu' });
    }
  }, [getToday]);

  // Create debounced save - memoized to prevent recreation
  const debouncedSave = useMemo(() => {
    return createDebouncedAsync(saveToDb, 500);
  }, [saveToDb]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Flush any pending saves before unmount
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!isInitialized) return;
    if (!user) {
      setProgress(defaultProgress);
      setLoading(false);
      userIdRef.current = null;
      return;
    }

    userIdRef.current = user.id;
    const today = getToday();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

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

        if (!mountedRef.current) return;

        const profile = profileResult.data;
        const dailyData = dailyResult.data;

        const newProgress = {
          ...defaultProgress,
          waterGoal: profile?.daily_water || 2000,
          caloriesGoal: profile?.daily_calories || 2000,
          stepsGoal: profile?.daily_steps_goal || 10000,
          water: dailyData?.water || 0,
          steps: dailyData?.steps || 0,
          activeMinutes: dailyData?.active_minutes || 0,
        };

        setProgress(newProgress);
        latestProgressRef.current = {
          water: newProgress.water,
          steps: newProgress.steps,
          activeMinutes: newProgress.activeMinutes,
        };

      } catch (err) {
        handleApiError(err, 'fetchUserProgress', { fallbackMessage: 'Nie udało się pobrać danych' });
        if (mountedRef.current) setError('Nie udało się pobrać danych');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchData();

    return () => { 
      mountedRef.current = false;
      debouncedSave.cancel();
    };
  }, [user, isInitialized, getToday, debouncedSave]);

  const getMascotEmotion = useCallback((newProgress: DailyProgress): MascotEmotion => {
    const waterProgress = newProgress.waterGoal > 0 ? newProgress.water / newProgress.waterGoal : 0;
    const stepsProgress = newProgress.stepsGoal > 0 ? newProgress.steps / newProgress.stepsGoal : 0;
    const activeProgress = newProgress.activeMinutesGoal > 0 ? newProgress.activeMinutes / newProgress.activeMinutesGoal : 0;
    
    const avgProgress = (waterProgress + stepsProgress + activeProgress) / 3;

    if (avgProgress >= 1) return 'celebrating';
    if (avgProgress >= 0.8) return 'proud';
    if (avgProgress >= 0.5) return 'happy';
    if (avgProgress >= 0.3) return 'motivated';
    return 'neutral';
  }, []);

  const updateMascotState = useCallback((emotion: MascotEmotion) => {
    const messages = motivationalMessages[emotion] || motivationalMessages.neutral;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMascotState({ emotion, message: randomMessage });
  }, []);

  const scheduleDbSave = useCallback((newProgress: { water: number; steps: number; activeMinutes: number }) => {
    latestProgressRef.current = newProgress;
    debouncedSave.call(newProgress);
  }, [debouncedSave]);

  const addWater = useCallback((amount: number = 250) => {
    setProgress(prev => {
      const newWater = Math.min(Math.max(0, prev.water + amount), prev.waterGoal + 500);
      const newProgress = { ...prev, water: newWater };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      scheduleDbSave({ water: newWater, steps: prev.steps, activeMinutes: prev.activeMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, scheduleDbSave]);

  const addSteps = useCallback((steps: number) => {
    setProgress(prev => {
      const newSteps = Math.max(0, prev.steps + steps);
      const newProgress = { ...prev, steps: newSteps };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      scheduleDbSave({ water: prev.water, steps: newSteps, activeMinutes: prev.activeMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, scheduleDbSave]);

  const addActiveMinutes = useCallback((minutes: number) => {
    setProgress(prev => {
      const newActiveMinutes = Math.max(0, prev.activeMinutes + minutes);
      const newProgress = { ...prev, activeMinutes: newActiveMinutes };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      scheduleDbSave({ water: prev.water, steps: prev.steps, activeMinutes: newActiveMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, scheduleDbSave]);

  const addCalories = useCallback((calories: number) => {
    setProgress(prev => ({ ...prev, calories: Math.max(0, prev.calories + calories) }));
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
