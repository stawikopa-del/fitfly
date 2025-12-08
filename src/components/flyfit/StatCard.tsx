import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springBouncy } from '@/lib/animations';

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
};

export function StatCard({ icon, label, value, subValue, color, onClick }: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={springBouncy}
      className={cn(
        'bg-card rounded-3xl p-5 border-2 text-left w-full',
        'shadow-card-playful transition-shadow duration-300',
        'hover:shadow-card-playful-hover',
        colorClasses[color].border
      )}
    >
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springBouncy, delay: 0.1 }}
        className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
          colorClasses[color].icon
        )}
      >
        {icon}
      </motion.div>
      <p className="text-3xl font-extrabold font-display text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground font-semibold mt-1">{label}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">{subValue}</p>
      )}
    </motion.button>
  );
}
