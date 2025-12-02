import { MascotState } from '@/types/flyfit';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';

interface MascotDisplayProps {
  state: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMessage?: boolean;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const animationClasses = {
  happy: 'animate-bounce-soft',
  proud: 'animate-wiggle',
  motivated: 'animate-bounce-soft',
  tired: '',
  neutral: '',
  celebrating: 'animate-celebrate',
};

export function MascotDisplay({ state, size = 'md', showMessage = true, animate = true }: MascotDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Maskotka FitFly */}
      <div className="relative">
        {/* Pulse ring effect when celebrating */}
        {state.emotion === 'celebrating' && (
          <div className="absolute inset-0 rounded-full bg-secondary/30 animate-pulse-ring" />
        )}
        
        <div 
          className={cn(
            'relative transition-all duration-300',
            sizeClasses[size],
            animate && animationClasses[state.emotion]
          )}
        >
          <img 
            src={mascotImage} 
            alt="FitFly - Twój przyjaciel fitness" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
          
          {/* Emotion indicator */}
          {state.emotion === 'tired' && (
            <div className="absolute -top-1 -right-1 text-lg">💤</div>
          )}
          {state.emotion === 'celebrating' && (
            <div className="absolute -top-2 -right-2 text-xl animate-bounce">🎉</div>
          )}
        </div>
      </div>
      
      {/* Dymek z komunikatem */}
      {showMessage && (
        <div className="relative bg-card border-2 border-primary/20 rounded-2xl px-5 py-3 shadow-fitfly max-w-[220px]">
          {/* Strzałka dymka */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-card border-l-2 border-t-2 border-primary/20 rotate-45" />
          </div>
          <p className="text-sm text-foreground text-center font-semibold relative z-10">
            {state.message}
          </p>
        </div>
      )}
    </div>
  );
}
