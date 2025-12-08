export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instruction: string;
}

export interface WorkoutData {
  id: string;
  name: string;
  category: string;
  duration: number; // total in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  exercises: Exercise[];
}

export const workouts: WorkoutData[] = [];

export const categories = ['Wszystkie'];

export const difficultyConfig = {
  easy: { label: 'Łatwy', color: 'bg-secondary text-secondary-foreground' },
  medium: { label: 'Średni', color: 'bg-accent text-accent-foreground' },
  hard: { label: 'Trudny', color: 'bg-destructive text-destructive-foreground' },
};
