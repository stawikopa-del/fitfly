import { useState, useCallback, useEffect } from 'react';
import { DailyProgress, MascotState, MascotEmotion } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const defaultProgress: DailyProgress = {
  steps: 3245,
  stepsGoal: 10000,
  water: 500,
  waterGoal: 2000,
  activeMinutes: 15,
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
  const [progress, setProgress] = useState<DailyProgress>(defaultProgress);
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'neutral',
    message: 'Cześć! Gotowy/a na świetny dzień?',
  });

  // Pobierz cele z profilu użytkownika
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_water, daily_calories, daily_steps_goal')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProgress(prev => ({
          ...prev,
          waterGoal: data.daily_water || 2000,
          caloriesGoal: data.daily_calories || 2000,
          stepsGoal: data.daily_steps_goal || 10000,
        }));
      }
    };

    fetchProfile();
  }, [user]);

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
      const newProgress = { ...prev, water: Math.min(prev.water + amount, prev.waterGoal + 500) };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState]);

  const addSteps = useCallback((steps: number) => {
    setProgress(prev => {
      const newProgress = { ...prev, steps: prev.steps + steps };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState]);

  const addActiveMinutes = useCallback((minutes: number) => {
    setProgress(prev => {
      const newProgress = { ...prev, activeMinutes: prev.activeMinutes + minutes };
      const emotion = getMascotEmotion(newProgress);
      updateMascotState(emotion);
      return newProgress;
    });
  }, [getMascotEmotion, updateMascotState]);

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
