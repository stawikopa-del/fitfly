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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl" />
              )}
              <Icon 
                className={cn(
                  'w-6 h-6 relative z-10 transition-transform duration-200',
                  isActive && 'scale-110'
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-[10px] font-semibold relative z-10',
                isActive && 'font-bold'
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
