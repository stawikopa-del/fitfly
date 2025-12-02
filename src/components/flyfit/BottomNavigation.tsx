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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon 
                className={cn(
                  'w-6 h-6 transition-transform',
                  isActive && 'scale-110'
                )} 
              />
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
