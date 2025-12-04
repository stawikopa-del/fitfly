import { BadgeDefinition, UserBadge } from '@/types/gamification';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: UserBadge;
  showDetails?: boolean;
}

export function BadgeCard({ badge, earned, showDetails = false }: BadgeCardProps) {
  const isEarned = !!earned;

  return (
    <div 
      className={cn(
        "relative rounded-2xl p-4 transition-all duration-300",
        isEarned 
          ? "bg-card border border-border/50 hover:scale-105" 
          : "bg-muted/50 border border-dashed border-border/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all",
            isEarned ? badge.color : "bg-muted",
            !isEarned && "grayscale opacity-50"
          )}
        >
          {isEarned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-bold truncate",
            isEarned ? "text-foreground" : "text-muted-foreground"
          )}>
            {badge.name}
          </h4>
          
          {showDetails ? (
            <p className={cn(
              "text-sm line-clamp-2",
              isEarned ? "text-muted-foreground" : "text-muted-foreground/70"
            )}>
              {badge.description}
            </p>
          ) : (
            <p className={cn(
              "text-xs",
              isEarned ? "text-muted-foreground" : "text-muted-foreground/70"
            )}>
              {badge.requirement}
            </p>
          )}
          
          {isEarned && earned && (
            <p className="text-xs text-fitfly-green mt-1">
              Zdobyto {format(new Date(earned.earned_at), 'd MMM yyyy', { locale: pl })}
            </p>
          )}
        </div>
      </div>
      
      {isEarned && (
        <div className="absolute top-2 right-2">
          <span className="text-lg">✨</span>
        </div>
      )}
    </div>
  );
}
