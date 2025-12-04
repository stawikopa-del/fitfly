import { NavLink } from 'react-router-dom';
import { TrendingUp, Trophy, User, Settings, HelpCircle, Info, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import mascotImage from '@/assets/fitfly-mascot.png';

const menuItems = [
  { to: '/postepy', icon: TrendingUp, label: 'Postępy', emoji: '📊', description: 'Sprawdź swoje statystyki' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania', emoji: '🏆', description: 'Podejmij nowe wyzwania' },
  { to: '/profil', icon: User, label: 'Profil', emoji: '👤', description: 'Twoje dane i cele' },
  { to: '/ustawienia', icon: Settings, label: 'Ustawienia', emoji: '⚙️', description: 'Dostosuj aplikację' },
];

const additionalItems = [
  { to: '#', icon: Heart, label: 'O nas', emoji: '💚', description: 'Poznaj FLYFIT' },
  { to: '#', icon: HelpCircle, label: 'Pomoc', emoji: '❓', description: 'FAQ i wsparcie' },
  { to: '#', icon: Info, label: 'Informacje', emoji: 'ℹ️', description: 'Wersja i licencje' },
];

export default function More() {
  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header z maskotką */}
      <header className="relative z-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative animate-float">
            <img 
              src={mascotImage} 
              alt="FLYFIT" 
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Więcej opcji ✨
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Odkryj wszystkie funkcje FLYFIT
        </p>
      </header>

      {/* Główne opcje */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Menu główne
        </h2>
        <div className="grid gap-3">
          {menuItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => soundFeedback.navTap()}
              className={({ isActive }) => cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300',
                'bg-card border-2 border-border/50 shadow-card-playful',
                'hover:-translate-y-0.5 hover:shadow-card-playful-hover',
                isActive && 'border-primary/50 bg-primary/5'
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-playful">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg flex items-center gap-2">
                  {label} <span>{emoji}</span>
                </p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Dodatkowe opcje */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Dodatkowe
        </h2>
        <div className="grid gap-3">
          {additionalItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <button
              key={label}
              onClick={() => soundFeedback.buttonClick()}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left',
                'bg-muted/50 border-2 border-border/30',
                'hover:-translate-y-0.5 hover:bg-muted'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center">
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground flex items-center gap-2">
                  {label} <span>{emoji}</span>
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wersja */}
      <p className="text-center text-xs text-muted-foreground relative z-10 pt-4">
        FLYFIT v1.0.0 • Made with 💚
      </p>
    </div>
  );
}
