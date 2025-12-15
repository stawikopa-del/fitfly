import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-primary/20 to-primary/5',
    icon: 'bg-primary text-primary-foreground shadow-playful-sm',
    border: 'border-primary/20',
  },
  green: {
    bg: 'bg-gradient-to-br from-secondary/20 to-secondary/5',
    icon: 'bg-secondary text-secondary-foreground shadow-playful-green',
    border: 'border-secondary/20',
  },
  orange: {
    bg: 'bg-gradient-to-br from-accent/20 to-accent/5',
    icon: 'bg-accent text-accent-foreground shadow-playful-orange',
    border: 'border-accent/20',
  },
  purple: {
    bg: 'bg-gradient-to-br from-fitfly-purple/20 to-fitfly-purple/5',
    icon: 'bg-fitfly-purple text-white shadow-md',
    border: 'border-fitfly-purple/20',
  },
} as const;

export const StatCard = memo(function StatCard({ icon, label, value, subValue, color, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'bg-card rounded-3xl p-5 border-2 text-left w-full',
        'shadow-card-playful transition-all duration-300 will-change-transform',
        'hover:-translate-y-1 hover:shadow-card-playful-hover active:translate-y-0 active:scale-95',
        colorClasses[color].border
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
        colorClasses[color].icon
      )}>
        {icon}
      </div>
      <p className="text-3xl font-extrabold font-display text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground font-semibold mt-1">{label}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">{subValue}</p>
      )}
    </button>
  );
});
