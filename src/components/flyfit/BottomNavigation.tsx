import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/treningi', icon: Dumbbell, label: 'Treningi' },
  { to: '/odzywianie', icon: Utensils, label: 'Jedzenie' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t-2 border-border/50 z-50 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-18 max-w-md mx-auto px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/15 rounded-2xl border-2 border-primary/20" />
              )}
              <div className={cn(
                'relative z-10 transition-all duration-300',
                isActive && 'animate-pop'
              )}>
                <Icon 
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                'text-[10px] font-bold relative z-10',
                isActive && 'font-extrabold'
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-6 h-1 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
