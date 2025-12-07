import { useState, useCallback, useEffect, useRef } from 'react';
import { DailyProgress, MascotState, MascotEmotion } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
  greeting: ['Cześć! Miło Cię widzieć! 👋', 'Hej! Gotowy/a na nowy dzień?', 'Witaj! Dzisiaj będzie super!'],
  happy: ['Świetnie Ci idzie! 💪', 'Jesteś niesamowity/a!', 'Tak trzymaj!'],
  proud: ['Jestem z Ciebie dumny/a!', 'Osiągasz swoje cele!', 'Brawo! Robisz postępy!'],
  motivated: ['Dasz radę! Wierzę w Ciebie!', 'Jeden krok naraz!', 'Dziś jest Twój dzień!'],
  tired: ['Pamiętaj o odpoczynku!', 'Regeneracja też jest ważna!', 'Nie zapominaj o sobie!'],
  neutral: ['Cześć! Co dziś robimy?', 'Gotowy/a na nowe cele?', 'Zacznijmy razem!'],
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<{ water?: number; steps?: number; activeMinutes?: number } | null>(null);
  const mountedRef = useRef(true);
  const saveInProgressRef = useRef(false);

  // Get today's date safely
  const getToday = useCallback(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!isInitialized) return;
    if (!user) {
      setProgress(defaultProgress);
      setLoading(false);
      return;
    }

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
        if (mountedRef.current) setError('Nie udało się pobrać danych');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchData();

    return () => { 
      mountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, isInitialized, getToday]);

  const saveProgressToDb = useCallback(async (updates: { water?: number; steps?: number; activeMinutes?: number }) => {
    if (!user || saveInProgressRef.current) return;

    saveInProgressRef.current = true;
    const today = getToday();

    try {
      const { data: existing } = await supabase
        .from('daily_progress')
        .select('id, water, steps, active_minutes')
        .eq('user_id', user.id)
        .eq('progress_date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('daily_progress')
          .update({
            water: updates.water ?? existing.water,
            steps: updates.steps ?? existing.steps,
            active_minutes: updates.activeMinutes ?? existing.active_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            progress_date: today,
            water: updates.water || 0,
            steps: updates.steps || 0,
            active_minutes: updates.activeMinutes || 0,
          });
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
      if (mountedRef.current) {
        toast.error('Nie udało się zapisać postępu');
      }
    } finally {
      saveInProgressRef.current = false;
    }
  }, [user, getToday]);

  const debouncedSave = useCallback((updates: { water?: number; steps?: number; activeMinutes?: number }) => {
    pendingUpdateRef.current = { ...pendingUpdateRef.current, ...updates };
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current && mountedRef.current) {
        saveProgressToDb(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
    }, 500);
  }, [saveProgressToDb]);

  const getMascotEmotion = useCallback((newProgress: DailyProgress): MascotEmotion => {
    // Safe division to prevent NaN
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

  const addWater = useCallback((amount: number = 250) => {
    setProgress(prev => {
      const newWater = Math.min(Math.max(0, prev.water + amount), prev.waterGoal + 500);
      const newProgress = { ...prev, water: newWater };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      debouncedSave({ water: newWater, steps: prev.steps, activeMinutes: prev.activeMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave]);

  const addSteps = useCallback((steps: number) => {
    setProgress(prev => {
      const newSteps = Math.max(0, prev.steps + steps);
      const newProgress = { ...prev, steps: newSteps };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      debouncedSave({ water: prev.water, steps: newSteps, activeMinutes: prev.activeMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave]);

  const addActiveMinutes = useCallback((minutes: number) => {
    setProgress(prev => {
      const newActiveMinutes = Math.max(0, prev.activeMinutes + minutes);
      const newProgress = { ...prev, activeMinutes: newActiveMinutes };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      debouncedSave({ water: prev.water, steps: prev.steps, activeMinutes: newActiveMinutes });
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, debouncedSave]);

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