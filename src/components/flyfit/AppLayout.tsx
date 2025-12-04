import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Main content area with padding for floating bottom nav */}
      <main className="pb-28 max-w-md mx-auto min-h-screen overflow-x-hidden">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
