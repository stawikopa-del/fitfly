import { createContext, useContext, useState, ReactNode } from 'react';

interface WorkoutContextType {
  isWorkoutActive: boolean;
  setWorkoutActive: (active: boolean) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  return (
    <WorkoutContext.Provider value={{ isWorkoutActive, setWorkoutActive: setIsWorkoutActive }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
