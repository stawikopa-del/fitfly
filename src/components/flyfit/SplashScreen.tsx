import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import fitekSplash from '@/assets/fitek-splash.png';
import { getRandomLoadingMessage } from '@/data/loadingMessages';

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
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background',
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
