import { MascotState, MascotEmotion } from '@/types/flyfit';
import { cn } from '@/lib/utils';

interface MascotDisplayProps {
  state: MascotState;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

// Emoji placeholders dla różnych emocji maskotki
// TODO: Zamienić na prawdziwe grafiki FitFly
const emotionEmojis: Record<MascotEmotion, string> = {
  happy: '😊',
  proud: '🤩',
  motivated: '💪',
  tired: '😴',
  neutral: '🙂',
  celebrating: '🎉',
};

const sizeClasses = {
  sm: 'w-16 h-16 text-3xl',
  md: 'w-24 h-24 text-5xl',
  lg: 'w-32 h-32 text-6xl',
};

export function MascotDisplay({ state, size = 'md', showMessage = true }: MascotDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Placeholder dla maskotki FitFly */}
      <div 
        className={cn(
          'rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center',
          'border-4 border-primary/30 shadow-lg animate-pulse',
          'transition-all duration-300',
          sizeClasses[size]
        )}
      >
        <span className="animate-bounce">{emotionEmojis[state.emotion]}</span>
      </div>
      
      {/* Dymek z komunikatem */}
      {showMessage && (
        <div className="relative bg-card border border-border rounded-2xl px-4 py-2 shadow-md max-w-[200px]">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
          <p className="text-sm text-foreground text-center font-medium relative z-10">
            {state.message}
          </p>
        </div>
      )}
    </div>
  );
}
