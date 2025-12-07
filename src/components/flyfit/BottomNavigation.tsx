import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Menu, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';

const navItems = [
  { to: '/', icon: Home, label: 'Główna' },
  { to: '/treningi', icon: Dumbbell, label: 'Treningi' },
  { to: '/czat', icon: MessageCircle, label: 'Chaty', isCenter: true },
  { to: '/odzywianie', icon: Utensils, label: 'Dieta' },
  { to: '/inne', icon: Menu, label: 'Inne' },
];

// Sub-routes that belong to each main category
const homeSubRoutes = [
  '/', '/kalendarz', '/planowanie'
];

const inneSubRoutes = [
  '/inne', '/profil', '/postepy', '/wyzwania', '/cele', '/ustawienia', '/o-nas', '/pomoc', 
  '/informacje', '/prywatnosc', '/osiagniecia', '/znajomi', '/lista-zakupow',
  '/zaproszenie'
];

const dietaSubRoutes = [
  '/odzywianie', '/przepisy', '/konfiguracja-diety', '/szybki-posilek'
];

const treningiSubRoutes = [
  '/treningi', '/trening'
];

const chatySubRoutes = [
  '/czat', '/wiadomosci', '/chat'
];

export function BottomNavigation() {
  const location = useLocation();

  const isRouteActive = (to: string) => {
    const pathname = location.pathname;
    
    if (to === '/') {
      return homeSubRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route + '/')));
    }
    if (to === '/inne') {
      return inneSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/odzywianie') {
      return dietaSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/treningi') {
      return treningiSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/czat') {
      return chatySubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    return pathname === to;
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
      <div className="bg-card/95 backdrop-blur-xl rounded-3xl border-2 border-border/50 shadow-card-playful-hover max-w-md mx-auto">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map(({ to, icon: Icon, label, isCenter }) => {
            const isActive = isRouteActive(to);
            
            // Center Chaty button
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
                    'bg-fitfly-cream border-2 border-fitfly-blue/20',
                    'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                    'hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
                    isActive && 'ring-4 ring-fitfly-blue/40 scale-105 shadow-[0_0_35px_rgba(59,130,246,0.6)]'
                  )}>
                    <MessageCircle className={cn(
                      "w-7 h-7 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
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
