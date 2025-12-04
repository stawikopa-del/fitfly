import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import fitekAvatar from '@/assets/fitek-avatar.png';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/treningi', icon: Dumbbell, label: 'Treningi' },
  { to: '/czat', icon: null, label: 'FITEK', isCenter: true },
  { to: '/odzywianie', icon: Utensils, label: 'Dieta' },
  { to: '/inne', icon: Menu, label: 'Inne' },
];

// Sub-routes that belong to "Inne" section
const inneSubRoutes = ['/inne', '/profil', '/postepy', '/wyzwania', '/ustawienia', '/o-nas', '/pomoc', '/informacje', '/prywatnosc'];

export function BottomNavigation() {
  const location = useLocation();

  const isRouteActive = (to: string) => {
    if (to === '/inne') {
      return inneSubRoutes.includes(location.pathname);
    }
    return location.pathname === to;
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
      <div className="bg-card/95 backdrop-blur-xl rounded-3xl border-2 border-border/50 shadow-card-playful-hover max-w-md mx-auto">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map(({ to, icon: Icon, label, isCenter }) => {
            const isActive = isRouteActive(to);
            
            // Center FITEK button
            if (isCenter) {
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => soundFeedback.navTap()}
                  className="relative flex flex-col items-center -mt-6"
                >
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                    'bg-[#fdfeea] border-4 border-primary/20 shadow-lg',
                    'hover:scale-105 hover:shadow-xl hover:border-primary/40',
                    isActive && 'ring-4 ring-primary/30 scale-105 border-primary/50'
                  )}>
                    <img 
                      src={fitekAvatar} 
                      alt="FITEK" 
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold mt-1',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </NavLink>
              );
            }

            // Regular nav items
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => soundFeedback.navTap()}
                className="relative flex flex-col items-center w-16"
              >
                <div className={cn(
                  'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
                  isActive 
                    ? 'bg-primary shadow-playful -translate-y-1' 
                    : 'hover:bg-muted'
                )}>
                  {Icon && (
                    <Icon 
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-bold mt-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
