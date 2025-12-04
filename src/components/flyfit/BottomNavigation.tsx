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
const inneSubRoutes = ['/inne', '/profil', '/postepy', '/wyzwania', '/ustawienia', '/o-nas', '/pomoc', '/informacje'];

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
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300',
                  isActive 
                    ? 'text-primary -translate-y-1' 
                    : 'text-muted-foreground hover:text-foreground hover:-translate-y-0.5'
                )}
              >
                {isActive && Icon && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-2xl shadow-playful flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                )}
                {!isActive && Icon && (
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    'hover:bg-muted'
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                )}
                <span className={cn(
                  'text-[10px] font-bold',
                  isActive ? 'mt-10 text-primary' : 'mt-0'
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
