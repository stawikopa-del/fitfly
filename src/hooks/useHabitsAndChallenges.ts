import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { format, isToday, subDays, differenceInDays } from 'date-fns';
import { useGamification } from './useGamification';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  color: string;
  frequency: string;
  target_value: number;
  unit: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
  cue: string | null;
  reward: string | null;
  habit_stack_after: string | null;
  streak_current: number;
  streak_best: number;
  total_completions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed_value: number;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  duration_days: number;
  points: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_completed: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

// Suggested habits based on Atomic Habits principles
export const suggestedHabits = [
  {
    title: '2 minuty medytacji',
    description: 'Zacznij od małego - 2 minuty spokoju każdego ranka',
    category: 'zdrowie',
    icon: 'brain',
    color: 'purple',
    cue: 'Po przebudzeniu, zanim wstanę z łóżka',
    reward: 'Poczucie spokoju na cały dzień',
  },
  {
    title: 'Szklanka wody rano',
    description: 'Pierwsza rzecz po przebudzeniu - nawodnienie organizmu',
    category: 'zdrowie',
    icon: 'droplets',
    color: 'blue',
    cue: 'Zaraz po wstaniu z łóżka',
    reward: 'Energia i lepsze samopoczucie',
  },
  {
    title: '10 pompek dziennie',
    description: 'Mała dawka ruchu codziennie buduje siłę',
    category: 'fitness',
    icon: 'dumbbell',
    color: 'orange',
    cue: 'Po porannej kawie',
    reward: 'Więcej energii i siły',
  },
  {
    title: '5 minut czytania',
    description: 'Rozwijaj się codziennie przez czytanie',
    category: 'rozwój',
    icon: 'book-open',
    color: 'green',
    cue: 'Przed snem w łóżku',
    reward: 'Nowa wiedza i lepszy sen',
  },
  {
    title: '3 rzeczy za które jestem wdzięczny',
    description: 'Praktyka wdzięczności poprawia samopoczucie',
    category: 'mindset',
    icon: 'heart',
    color: 'pink',
    cue: 'Wieczorem przed snem',
    reward: 'Pozytywne nastawienie',
  },
  {
    title: 'Spacer 10 minut',
    description: 'Krótki spacer dla zdrowia i świeżego powietrza',
    category: 'fitness',
    icon: 'footprints',
    color: 'green',
    cue: 'Po obiedzie',
    reward: 'Lepsza koncentracja popołudniu',
  },
];

// Suggested challenges
export const suggestedChallenges = [
  {
    title: '10 000 kroków codziennie',
    description: 'Zrób 10 000 kroków każdego dnia przez tydzień',
    category: 'fitness',
    target: 7,
    unit: 'dni',
    duration_days: 7,
    points: 100,
  },
  {
    title: '2L wody dziennie',
    description: 'Pij minimum 2 litry wody każdego dnia przez 2 tygodnie',
    category: 'zdrowie',
    target: 14,
    unit: 'dni',
    duration_days: 14,
    points: 150,
  },
  {
    title: '7 dni bez słodyczy',
    description: 'Unikaj słodyczy przez cały tydzień',
    category: 'dieta',
    target: 7,
    unit: 'dni',
    duration_days: 7,
    points: 200,
  },
  {
    title: 'Poranny trening',
    description: 'Ćwicz rano przez 5 dni z rzędu',
    category: 'fitness',
    target: 5,
    unit: 'dni',
    duration_days: 5,
    points: 120,
  },
  {
    title: '21 dni nowego nawyku',
    description: 'Wykonuj wybrany nawyk przez 21 dni bez przerwy',
    category: 'rozwój',
    target: 21,
    unit: 'dni',
    duration_days: 21,
    points: 300,
  },
  {
    title: 'Tydzień bez telefonu przed snem',
    description: 'Nie używaj telefonu godzinę przed snem przez tydzień',
    category: 'zdrowie',
    target: 7,
    unit: 'dni',
    duration_days: 7,
    points: 150,
  },
];

export function useHabitsAndChallenges() {
  const { user } = useAuth();
  const { onHabitCompleted, onChallengeCompleted, awardBadge } = useGamification();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching habits:', error);
      return;
    }
    
    setHabits(data || []);
  }, [user]);

  const fetchTodayLogs = useCallback(async () => {
    if (!user) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today);
    
    if (error) {
      console.error('Error fetching today logs:', error);
      return;
    }
    
    setTodayLogs(data || []);
  }, [user]);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return;
    }
    
    setChallenges(data || []);
  }, [user]);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('habits')
      .insert([{
        title: habit.title || '',
        description: habit.description,
        category: habit.category || 'health',
        icon: habit.icon || 'target',
        color: habit.color || 'primary',
        frequency: habit.frequency || 'daily',
        target_value: habit.target_value || 1,
        unit: habit.unit || 'razy',
        reminder_time: habit.reminder_time,
        reminder_enabled: habit.reminder_enabled || false,
        cue: habit.cue,
        reward: habit.reward,
        habit_stack_after: habit.habit_stack_after,
        user_id: user.id,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding habit:', error);
      toast.error('Nie udało się dodać nawyku');
      return null;
    }
    
    toast.success('Nawyk dodany! 🎯');
    fetchHabits();
    return data;
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLog = todayLogs.find(log => log.habit_id === habitId);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    if (existingLog) {
      // Toggle completion
      const newCompleted = !existingLog.is_completed;
      
      const { error } = await supabase
        .from('habit_logs')
        .update({ 
          is_completed: newCompleted,
          completed_value: newCompleted ? habit.target_value : 0
        })
        .eq('id', existingLog.id);
      
      if (error) {
        console.error('Error updating habit log:', error);
        return;
      }
      
      // Update streak and award XP
      if (newCompleted) {
        await updateStreak(habitId, true);
        onHabitCompleted();
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          log_date: today,
          is_completed: true,
          completed_value: habit.target_value,
        });
      
      if (error) {
        console.error('Error creating habit log:', error);
        return;
      }
      
      await updateStreak(habitId, true);
      onHabitCompleted();
      
      // Check for habit streak badges
      const newStreak = habit.streak_current + 1;
      if (newStreak === 7) awardBadge('konsekwentny');
      if (newStreak === 30) awardBadge('niezniszczalny');
      if (habit.total_completions + 1 >= 100) awardBadge('mistrz_nawykow');
    }
    
    fetchTodayLogs();
    fetchHabits();
  };

  const updateStreak = async (habitId: string, completed: boolean) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    let newStreak = completed ? habit.streak_current + 1 : 0;
    let newBest = Math.max(habit.streak_best, newStreak);
    let newTotal = completed ? habit.total_completions + 1 : habit.total_completions;
    
    await supabase
      .from('habits')
      .update({
        streak_current: newStreak,
        streak_best: newBest,
        total_completions: newTotal,
      })
      .eq('id', habitId);
  };

  const deleteHabit = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);
    
    if (error) {
      console.error('Error deleting habit:', error);
      toast.error('Nie udało się usunąć nawyku');
      return;
    }
    
    toast.success('Nawyk usunięty');
    fetchHabits();
  };

  const addChallenge = async (challenge: Partial<Challenge>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('challenges')
      .insert([{
        title: challenge.title || '',
        description: challenge.description,
        category: challenge.category || 'fitness',
        icon: challenge.icon || 'trophy',
        target: challenge.target || 7,
        current: challenge.current || 0,
        unit: challenge.unit || 'dni',
        duration_days: challenge.duration_days || 7,
        points: challenge.points || 100,
        is_custom: challenge.is_custom || false,
        user_id: user.id,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding challenge:', error);
      toast.error('Nie udało się dodać wyzwania');
      return null;
    }
    
    toast.success('Wyzwanie dodane! 🏆');
    fetchChallenges();
    return data;
  };

  const startChallenge = async (challengeId: string) => {
    const today = new Date();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) return;
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + challenge.duration_days);
    
    const { error } = await supabase
      .from('challenges')
      .update({
        is_active: true,
        start_date: format(today, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      })
      .eq('id', challengeId);
    
    if (error) {
      console.error('Error starting challenge:', error);
      toast.error('Nie udało się rozpocząć wyzwania');
      return;
    }
    
    toast.success('Wyzwanie rozpoczęte! 💪');
    fetchChallenges();
  };

  const updateChallengeProgress = async (challengeId: string, newCurrent: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const isCompleted = newCurrent >= challenge.target;
    const wasNotCompleted = !challenge.is_completed;
    
    const { error } = await supabase
      .from('challenges')
      .update({
        current: newCurrent,
        is_completed: isCompleted,
        is_active: !isCompleted,
      })
      .eq('id', challengeId);
    
    if (error) {
      console.error('Error updating challenge:', error);
      return;
    }
    
    if (isCompleted && wasNotCompleted) {
      toast.success(`Wyzwanie ukończone! +${challenge.points} punktów 🎉`);
      onChallengeCompleted();
    }
    
    fetchChallenges();
  };

  const deleteChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);
    
    if (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Nie udało się usunąć wyzwania');
      return;
    }
    
    toast.success('Wyzwanie usunięte');
    fetchChallenges();
  };

  const isHabitCompletedToday = (habitId: string) => {
    return todayLogs.some(log => log.habit_id === habitId && log.is_completed);
  };

  const getTotalPoints = () => {
    return challenges
      .filter(c => c.is_completed)
      .reduce((sum, c) => sum + c.points, 0);
  };

  const getCompletedHabitsToday = () => {
    return todayLogs.filter(log => log.is_completed).length;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchHabits(), fetchTodayLogs(), fetchChallenges()])
        .finally(() => setLoading(false));
    }
  }, [user, fetchHabits, fetchTodayLogs, fetchChallenges]);

  return {
    habits,
    todayLogs,
    challenges,
    loading,
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    addChallenge,
    startChallenge,
    updateChallengeProgress,
    deleteChallenge,
    isHabitCompletedToday,
    getTotalPoints,
    getCompletedHabitsToday,
    suggestedHabits,
    suggestedChallenges,
    refetch: () => {
      fetchHabits();
      fetchTodayLogs();
      fetchChallenges();
    },
  };
}
