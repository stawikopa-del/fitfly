// Typy dla aplikacji FLYFIT

export type MascotEmotion = 'happy' | 'proud' | 'motivated' | 'tired' | 'neutral' | 'celebrating';

export interface MascotState {
  emotion: MascotEmotion;
  message: string;
}

export interface DailyProgress {
  steps: number;
  stepsGoal: number;
  water: number; // w ml
  waterGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  calories: number;
  caloriesGoal: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number; // w minutach
  difficulty: 'easy' | 'medium' | 'hard';
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  duration?: number; // w sekundach
  reps?: number;
  sets?: number;
  restTime: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  duration: number; // w dniach
  points: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  goalWeight: number;
  dailyWaterGoal: number; // ml
  dailyStepsGoal: number;
  dailyCaloriesGoal: number;
}
