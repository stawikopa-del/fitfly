import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springBouncy } from '@/lib/animations';

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent',
    border: 'border-primary/30',
    icon: 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm',
    hover: 'hover:from-primary/20 hover:via-primary/15',
  },
  green: {
    bg: 'bg-gradient-to-r from-secondary/15 via-secondary/10 to-transparent',
    border: 'border-secondary/30',
    icon: 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm',
    hover: 'hover:from-secondary/20 hover:via-secondary/15',
  },
  orange: {
    bg: 'bg-gradient-to-r from-accent/15 via-accent/10 to-transparent',
    border: 'border-accent/30',
    icon: 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm',
    hover: 'hover:from-accent/20 hover:via-accent/15',
  },
  purple: {
    bg: 'bg-gradient-to-r from-fitfly-purple/15 via-fitfly-purple/10 to-transparent',
    border: 'border-fitfly-purple/30',
    icon: 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm',
    hover: 'hover:from-fitfly-purple/20 hover:via-fitfly-purple/15',
  },
  pink: {
    bg: 'bg-gradient-to-r from-pink-500/15 via-pink-400/10 to-transparent',
    border: 'border-pink-400/30',
    icon: 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm',
    hover: 'hover:from-pink-500/20 hover:via-pink-400/15',
  },
};

export function QuickAction({ icon, title, description, color, onClick }: QuickActionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={springBouncy}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-3xl border-2',
        'transition-shadow duration-300',
        'hover:shadow-card-playful',
        colorClasses[color].bg,
        colorClasses[color].border,
        colorClasses[color].hover
      )}
    >
      <motion.div 
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springBouncy, delay: 0.1 }}
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
          colorClasses[color].icon
        )}
      >
        {icon}
      </motion.div>
      <div className="flex-1 text-left">
        <h4 className="font-bold font-display text-foreground text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
      </div>
      <motion.div 
        whileHover={{ x: 4 }}
        className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border/30"
      >
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.div>
    </motion.button>
  );
}
