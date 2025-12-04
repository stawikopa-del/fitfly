import { useState, useCallback, useEffect, useRef } from 'react';
import { DailyProgress, MascotState, MascotEmotion } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';

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

export function useUserProgress() {
  const { user } = useAuth();
  const { onWaterGoalReached } = useGamification();
  const [progress, setProgress] = useState<DailyProgress>(defaultProgress);
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'neutral',
    message: 'Cześć! Gotowy/a na świetny dzień?',
  });
  const waterGoalRewardedRef = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  // Pobierz cele z profilu i dzisiejszy postęp
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Pobierz cele z profilu
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_water, daily_calories, daily_steps_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      // Pobierz dzisiejszy postęp
      const { data: dailyData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('progress_date', today)
        .maybeSingle();

      setProgress(prev => ({
        ...prev,
        waterGoal: profile?.daily_water || 2000,
        caloriesGoal: profile?.daily_calories || 2000,
        stepsGoal: profile?.daily_steps_goal || 10000,
        water: dailyData?.water || 0,
        steps: dailyData?.steps || 0,
        activeMinutes: dailyData?.active_minutes || 0,
      }));
    };

    fetchData();
  }, [user, today]);

  // Zapisz postęp do bazy
  const saveProgress = useCallback(async (newProgress: Partial<{ water: number; steps: number; activeMinutes: number }>) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('daily_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('progress_date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('daily_progress')
        .update({
          water: newProgress.water,
          steps: newProgress.steps,
          active_minutes: newProgress.activeMinutes,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('daily_progress')
        .insert({
          user_id: user.id,
          progress_date: today,
          water: newProgress.water || 0,
          steps: newProgress.steps || 0,
          active_minutes: newProgress.activeMinutes || 0,
        });
    }
  }, [user, today]);

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
      
      saveProgress({ water: newWater, steps: prev.steps, activeMinutes: prev.activeMinutes });
      
      // Award XP when water goal is reached (only once per day)
      if (newWater >= prev.waterGoal && prev.water < prev.waterGoal && !waterGoalRewardedRef.current) {
        waterGoalRewardedRef.current = true;
        onWaterGoalReached();
      }
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, saveProgress, onWaterGoalReached]);

  const addSteps = useCallback((steps: number) => {
    setProgress(prev => {
      const newSteps = prev.steps + steps;
      const newProgress = { ...prev, steps: newSteps };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      
      saveProgress({ water: prev.water, steps: newSteps, activeMinutes: prev.activeMinutes });
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, saveProgress]);

  const addActiveMinutes = useCallback((minutes: number) => {
    setProgress(prev => {
      const newActiveMinutes = prev.activeMinutes + minutes;
      const newProgress = { ...prev, activeMinutes: newActiveMinutes };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      
      saveProgress({ water: prev.water, steps: prev.steps, activeMinutes: newActiveMinutes });
      
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState, saveProgress]);

  const addCalories = useCallback((calories: number) => {
    setProgress(prev => ({ ...prev, calories: prev.calories + calories }));
  }, []);

  return {
    progress,
    mascotState,
    addWater,
    addSteps,
    addActiveMinutes,
    addCalories,
    setMascotState,
  };
}
