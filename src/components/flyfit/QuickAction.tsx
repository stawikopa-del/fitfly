import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent',
    border: 'border-primary/30',
    icon: 'bg-primary text-primary-foreground shadow-playful-sm',
    hover: 'hover:from-primary/20 hover:via-primary/15',
  },
  green: {
    bg: 'bg-gradient-to-r from-secondary/15 via-secondary/10 to-transparent',
    border: 'border-secondary/30',
    icon: 'bg-secondary text-secondary-foreground shadow-playful-green',
    hover: 'hover:from-secondary/20 hover:via-secondary/15',
  },
  orange: {
    bg: 'bg-gradient-to-r from-accent/15 via-accent/10 to-transparent',
    border: 'border-accent/30',
    icon: 'bg-accent text-accent-foreground shadow-playful-orange',
    hover: 'hover:from-accent/20 hover:via-accent/15',
  },
  purple: {
    bg: 'bg-gradient-to-r from-fitfly-purple/15 via-fitfly-purple/10 to-transparent',
    border: 'border-fitfly-purple/30',
    icon: 'bg-fitfly-purple text-white shadow-md',
    hover: 'hover:from-fitfly-purple/20 hover:via-fitfly-purple/15',
  },
};

export function QuickAction({ icon, title, description, color, onClick }: QuickActionProps) {
  // Check if icon is an img element (FITEK image)
  const isFitekImage = typeof icon === 'object' && icon !== null && 'type' in (icon as any) && (icon as any).type === 'img';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-3xl border-2',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-card-playful active:translate-y-0 active:scale-[0.98]',
        colorClasses[color].bg,
        colorClasses[color].border,
        colorClasses[color].hover
      )}
    >
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
        isFitekImage 
          ? 'bg-white/90 dark:bg-card shadow-sm border border-border/30' 
          : colorClasses[color].icon
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-bold font-display text-foreground text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border/30">
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}
