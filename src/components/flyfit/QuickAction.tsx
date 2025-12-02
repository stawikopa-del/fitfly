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
  blue: 'from-primary/20 to-primary/5 border-primary/20',
  green: 'from-secondary/20 to-secondary/5 border-secondary/20',
  orange: 'from-accent/20 to-accent/5 border-accent/20',
  purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
};

const iconColors = {
  blue: 'text-primary',
  green: 'text-secondary',
  orange: 'text-accent',
  purple: 'text-purple-500',
};

export function QuickAction({ icon, title, description, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl border',
        'bg-gradient-to-r transition-all duration-200',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        colorClasses[color]
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm', iconColors[color])}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
