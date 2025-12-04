import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Menu, TrendingUp, Trophy, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import fitekAvatar from '@/assets/fitek-avatar.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const mainNavItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/treningi', icon: Dumbbell, label: 'Treningi' },
];

const rightNavItems = [
  { to: '/odzywianie', icon: Utensils, label: 'Dieta' },
];

const moreItems = [
  { to: '/postepy', icon: TrendingUp, label: 'Postępy', emoji: '📊' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania', emoji: '🏆' },
  { to: '/profil', icon: User, label: 'Profil', emoji: '👤' },
  { to: '/ustawienia', icon: Settings, label: 'Ustawienia', emoji: '⚙️' },
];

export function BottomNavigation() {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isMoreActive = moreItems.some(item => location.pathname === item.to);

  const renderNavItem = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => {
    const isActive = location.pathname === to;
    
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
        {isActive && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-2xl shadow-playful flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
        )}
        {!isActive && (
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
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
      <div className="bg-card/95 backdrop-blur-xl rounded-3xl border-2 border-border/50 shadow-card-playful-hover max-w-md mx-auto">
        <div className="flex items-center justify-around h-20 px-2">
          {/* Left items: Home, Treningi */}
          {mainNavItems.map(renderNavItem)}
          
          {/* Center: FITEK Chat Button */}
          <NavLink
            to="/czat"
            onClick={() => soundFeedback.navTap()}
            className="relative flex flex-col items-center -mt-6"
          >
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
              'bg-[#fdfeea] border-4 border-primary/20 shadow-lg',
              'hover:scale-105 hover:shadow-xl hover:border-primary/40',
              location.pathname === '/czat' && 'ring-4 ring-primary/30 scale-105 border-primary/50'
            )}>
              <img 
                src={fitekAvatar} 
                alt="FITEK" 
                className="w-11 h-11 rounded-full object-cover"
              />
            </div>
            <span className={cn(
              'text-[10px] font-bold mt-1',
              location.pathname === '/czat' ? 'text-primary' : 'text-muted-foreground'
            )}>
              FITEK
            </span>
          </NavLink>
          
          {/* Right items: Dieta */}
          {rightNavItems.map(renderNavItem)}
          
          {/* More menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                onClick={() => soundFeedback.navTap()}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300',
                  isMoreActive 
                    ? 'text-primary -translate-y-1' 
                    : 'text-muted-foreground hover:text-foreground hover:-translate-y-0.5'
                )}
              >
                {isMoreActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-2xl shadow-playful flex items-center justify-center">
                    <Menu className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                )}
                {!isMoreActive && (
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    'hover:bg-muted'
                  )}>
                    <Menu className="w-5 h-5" strokeWidth={2} />
                  </div>
                )}
                <span className={cn(
                  'text-[10px] font-bold',
                  isMoreActive ? 'mt-10 text-primary' : 'mt-0'
                )}>
                  Inne
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-xl font-display font-extrabold text-center">
                  Więcej opcji ✨
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 pb-6">
                {moreItems.map(({ to, icon: Icon, label, emoji }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => {
                      soundFeedback.navTap();
                      setSheetOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-2xl transition-all duration-300',
                      'bg-muted/50 hover:bg-muted hover:-translate-y-0.5',
                      location.pathname === to && 'bg-primary/10 border-2 border-primary/30'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center',
                      location.pathname === to 
                        ? 'bg-primary text-primary-foreground shadow-playful' 
                        : 'bg-card'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{label}</p>
                      <p className="text-lg">{emoji}</p>
                    </div>
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
