import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { useWorkout } from '@/contexts/WorkoutContext';

export interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const { isWorkoutActive } = useWorkout();
  const shouldHideNav = hideNav || isWorkoutActive;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Main content area with padding for floating bottom nav */}
      <main className={`${shouldHideNav ? 'pb-8' : 'pb-28'} max-w-md mx-auto min-h-screen overflow-x-hidden`}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {!shouldHideNav && <BottomNavigation />}
    </div>
  );
}
