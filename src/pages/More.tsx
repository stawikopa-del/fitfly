import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Trophy, User, Settings, HelpCircle, Info, Heart, Download, Check, Share, Award, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { to: '/postepy', icon: TrendingUp, label: 'Postępy', emoji: '📊', description: 'Sprawdź swoje statystyki' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania', emoji: '🏆', description: 'Podejmij nowe wyzwania' },
  { to: '/osiagniecia', icon: Award, label: 'Osiągnięcia', emoji: '🎖️', description: 'Poziomy, odznaki i XP' },
  { to: '/profil', icon: User, label: 'Profil', emoji: '👤', description: 'Twoje dane i cele' },
  { to: '/ustawienia', icon: Settings, label: 'Ustawienia', emoji: '⚙️', description: 'Dostosuj aplikację' },
];

const additionalItems = [
  { to: '/o-nas', icon: Heart, label: 'O nas', emoji: '💚', description: 'Poznaj FITFLY' },
  { to: '/pomoc', icon: HelpCircle, label: 'Pomoc', emoji: '❓', description: 'FAQ i wsparcie' },
  { to: '/informacje', icon: Info, label: 'Informacje', emoji: 'ℹ️', description: 'Wersja i licencje' },
];

export default function More() {
  const { isInstallable, isInstalled, promptInstall, showIOSInstructions } = usePWAInstall();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  const handleInstallClick = async () => {
    soundFeedback.buttonClick();
    
    if (isInstalled) {
      toast.success('Aplikacja jest już zainstalowana! 🎉');
      return;
    }

    if (showIOSInstructions) {
      setShowIOSDialog(true);
      return;
    }

    if (isInstallable) {
      const success = await promptInstall();
      if (success) {
        toast.success('Aplikacja zainstalowana! 🎉');
      }
    } else {
      // Fallback for browsers that don't support PWA install
      toast.info('Użyj opcji "Dodaj do ekranu głównego" w menu przeglądarki 📱');
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Więcej opcji ✨
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Odkryj wszystkie funkcje FITFLY
        </p>
      </header>

      {/* Główne opcje */}
      <div className="space-y-3">
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

      {/* Pakiety Premium */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Pakiety FITFLY 💎
        </h2>
        <div className="grid gap-3">
          {/* START */}
          <button
            onClick={() => { soundFeedback.buttonClick(); toast.info('Pakiet START - wkrótce dostępny!'); }}
            className="relative p-4 rounded-2xl bg-card border-2 border-border/50 shadow-card-playful hover:-translate-y-0.5 transition-all text-left overflow-hidden group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Zap className="w-7 h-7 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg flex items-center gap-2">
                  START <span>⚡</span>
                </p>
                <p className="text-sm text-muted-foreground">Podstawowe funkcje za darmo</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-xl text-foreground">0 zł</p>
                <p className="text-xs text-muted-foreground">na zawsze</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Podstawowe treningi</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Tracker wody</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Dziennik posiłków</span>
            </div>
          </button>

          {/* FIT - Popularny */}
          <button
            onClick={() => { soundFeedback.buttonClick(); toast.info('Pakiet FIT - wkrótce dostępny!'); }}
            className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/50 shadow-lg hover:-translate-y-0.5 transition-all text-left overflow-hidden group"
          >
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              POPULARNE ⭐
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg flex items-center gap-2">
                  FIT <span>🌟</span>
                </p>
                <p className="text-sm text-muted-foreground">Wszystko czego potrzebujesz</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-xl text-primary">19,99 zł</p>
                <p className="text-xs text-muted-foreground">/miesiąc</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-primary/20 flex flex-wrap gap-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Wszystko z START</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">AI przepisy</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Spersonalizowane plany</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Brak reklam</span>
            </div>
          </button>

          {/* PREMIUM */}
          <button
            onClick={() => { soundFeedback.buttonClick(); toast.info('Pakiet PREMIUM - wkrótce dostępny!'); }}
            className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 shadow-lg hover:-translate-y-0.5 transition-all text-left overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg flex items-center gap-2">
                  PREMIUM <span>👑</span>
                </p>
                <p className="text-sm text-muted-foreground">Pełna moc FITFLY</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-xl text-amber-600">39,99 zł</p>
                <p className="text-xs text-muted-foreground">/miesiąc</p>
              </div>
            </div>
            <div className="relative mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">Wszystko z FIT</span>
              <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">1-na-1 z trenerem AI</span>
              <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">Priorytetowe wsparcie</span>
              <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">Ekskluzywne wyzwania</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dodatkowe opcje */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Dodatkowe
        </h2>
        <div className="grid gap-3">
          {/* Przycisk pobierania aplikacji */}
          <button
            onClick={handleInstallClick}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left',
              'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30',
              'hover:-translate-y-0.5 hover:shadow-playful',
              isInstalled && 'from-green-500/20 to-green-400/20 border-green-500/30'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isInstalled ? 'bg-green-500' : 'bg-gradient-to-br from-primary to-secondary'
            )}>
              {isInstalled ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground flex items-center gap-2">
                {isInstalled ? 'Zainstalowano' : 'Pobierz aplikację'} <span>📲</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {isInstalled ? 'FITFLY jest na Twoim telefonie!' : 'Dodaj FITFLY do ekranu głównego'}
              </p>
            </div>
          </button>

          {additionalItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => soundFeedback.navTap()}
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
            </NavLink>
          ))}
        </div>
      </div>

      {/* Wersja */}
      <p className="text-center text-xs text-muted-foreground relative z-10 pt-4">
        FITFLY v1.0.0 • Made with 💚
      </p>

      {/* iOS Installation Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold font-display text-center">
              Zainstaluj na iPhone 📱
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Aby zainstalować FITFLY na iPhone:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  1
                </div>
                <p className="text-sm">
                  Kliknij ikonę <Share className="w-4 h-4 inline mx-1" /> <strong>Udostępnij</strong> na dole ekranu
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  2
                </div>
                <p className="text-sm">
                  Przewiń w dół i wybierz <strong>„Dodaj do ekranu głównego"</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  3
                </div>
                <p className="text-sm">
                  Kliknij <strong>„Dodaj"</strong> w prawym górnym rogu
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowIOSDialog(false)}
              className="w-full rounded-2xl font-bold"
            >
              Rozumiem! 👍
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
