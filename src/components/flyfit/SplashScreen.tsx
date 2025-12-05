import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import fitekAvatar from '@/assets/fitek-avatar.png';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    console.log('[SplashScreen] Starting splash screen timer');
    const timer = setTimeout(() => {
      console.log('[SplashScreen] Timer finished, starting exit animation');
      setIsExiting(true);
      setTimeout(() => {
        console.log('[SplashScreen] Calling onComplete');
        onComplete();
      }, 500); // Wait for exit animation
    }, minDuration);

    return () => {
      console.log('[SplashScreen] Cleanup timer');
      clearTimeout(timer);
    };
  }, [onComplete, minDuration]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
        'bg-gradient-to-b from-background via-background to-primary/10',
        'transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* FITEK mascot */}
      <div className={cn(
        'relative mb-6 transition-all duration-700',
        isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      )}>
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-2 shadow-playful-lg animate-float">
          <img
            src={fitekAvatar}
            alt="FITEK"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        
        {/* Sparkles around mascot */}
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute -bottom-1 -left-3 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>💪</div>
        <div className="absolute top-1/2 -right-6 text-lg animate-bounce" style={{ animationDelay: '0.8s' }}>🌟</div>
      </div>

      {/* App name */}
      <h1 className={cn(
        'text-5xl font-extrabold font-display text-foreground mb-2',
        'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent',
        'transition-all duration-500',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        FITFLY
      </h1>
      
      <p className={cn(
        'text-muted-foreground font-medium text-lg',
        'transition-all duration-500 delay-100',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        Twój fitness companion 💚
      </p>

      {/* Loading indicator */}
      <div className={cn(
        'mt-10 flex flex-col items-center gap-3',
        'transition-all duration-500 delay-200',
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      )}>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Ładowanie...</span>
      </div>
    </div>
  );
}
