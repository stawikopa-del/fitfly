import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import fitekSplash from '@/assets/fitek-splash.png';
import { getRandomLoadingMessage } from '@/data/loadingMessages';

// Losowe gradienty tła
const backgroundGradients = [
  'from-emerald-100 via-teal-50 to-cyan-100',
  'from-amber-100 via-orange-50 to-yellow-100',
  'from-violet-100 via-purple-50 to-fuchsia-100',
  'from-sky-100 via-blue-50 to-indigo-100',
  'from-rose-100 via-pink-50 to-red-100',
  'from-lime-100 via-green-50 to-emerald-100',
  'from-cyan-100 via-teal-50 to-green-100',
  'from-fuchsia-100 via-pink-50 to-rose-100',
  'from-indigo-100 via-violet-50 to-purple-100',
  'from-orange-100 via-amber-50 to-yellow-100',
];

const getRandomGradient = (): string => {
  try {
    const index = Math.floor(Math.random() * backgroundGradients.length);
    return backgroundGradients[index] || backgroundGradients[0];
  } catch {
    return backgroundGradients[0];
  }
};

const safeGetMessage = (): string => {
  try {
    return getRandomLoadingMessage();
  } catch {
    return 'Ładowanie...';
  }
};

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(() => safeGetMessage());
  
  // Losowy gradient tylko raz przy renderowaniu
  const randomGradient = useMemo(() => getRandomGradient(), []);

  // Zmiana hasełka co 2 sekundy
  useEffect(() => {
    const messageInterval = setInterval(() => {
      try {
        setLoadingMessage(safeGetMessage());
      } catch {
        // Ignore errors
      }
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
        'bg-gradient-to-br',
        randomGradient,
        'transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* FITEK mascot z animacją */}
      <div className={cn(
        'relative mb-8 transition-all duration-700',
        isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      )}>
        <div className="w-48 h-48 animate-float">
          <img
            src={fitekSplash}
            alt="FITEK"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Delikatne iskierki */}
        <div className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute -bottom-1 -left-3 text-lg animate-bounce" style={{ animationDelay: '0.6s' }}>💪</div>
        <div className="absolute top-1/2 -right-6 text-lg animate-bounce" style={{ animationDelay: '1s' }}>🌟</div>
      </div>

      {/* App name */}
      <h1 className={cn(
        'text-5xl font-extrabold font-display text-foreground mb-3',
        'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent',
        'transition-all duration-500',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        FITFLY
      </h1>

      {/* Skaczące kropki ładowania */}
      <div className={cn(
        'flex gap-2 mb-6',
        'transition-all duration-500 delay-100',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary shadow-lg"
            style={{
              animation: 'bounce 0.6s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Losowe hasełko ładowania */}
      <div className={cn(
        'px-6 max-w-sm text-center',
        'transition-all duration-500 delay-200',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        <p className="text-muted-foreground font-medium text-base animate-fade-in">
          {loadingMessage}
        </p>
      </div>
    </div>
  );
}
