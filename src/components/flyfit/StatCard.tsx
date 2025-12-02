import { ReactNode } from 'react';
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
  blue: 'bg-primary/10 text-primary',
  green: 'bg-secondary/10 text-secondary',
  orange: 'bg-accent/10 text-accent',
  purple: 'bg-purple-500/10 text-purple-500',
};

export function StatCard({ icon, label, value, subValue, color, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'bg-card rounded-2xl p-4 border border-border shadow-sm text-left w-full',
        'transition-all duration-200',
        onClick && 'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{subValue}</p>
      )}
    </button>
  );
}
