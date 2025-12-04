import { BadgeDefinition, UserBadge } from '@/types/gamification';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface TrophyRoadProps {
  badges: BadgeDefinition[];
  earnedBadges: UserBadge[];
}

export function TrophyRoad({ badges, earnedBadges }: TrophyRoadProps) {
  const earnedTypes = earnedBadges.map(b => b.badge_type);

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
        <span>🏆</span> Trophy Road
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Zdobywaj odznaki i awansuj na ścieżce!
      </p>

      <div className="relative">
        {/* Road Path */}
        <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-fitfly-green via-yellow-400 to-muted/30 rounded-full" />

        <div className="space-y-1">
          {badges.map((badge, index) => {
            const isEarned = earnedTypes.includes(badge.type);
            const previousEarned = index === 0 || earnedTypes.includes(badges[index - 1].type);
            const isNext = !isEarned && previousEarned;

            return (
              <div key={badge.type}>
                <div 
                  className={cn(
                    "relative flex items-center gap-4 p-3 rounded-2xl transition-all",
                    isEarned && "bg-card border border-fitfly-green/30",
                    isNext && "bg-card border-2 border-dashed border-yellow-400 animate-pulse",
                    !isEarned && !isNext && "opacity-60"
                  )}
                >
                  {/* Badge Icon */}
                  <div 
                    className={cn(
                      "relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg",
                      isEarned ? badge.color : "bg-muted border-2 border-border",
                      isEarned && "ring-2 ring-fitfly-green ring-offset-2 ring-offset-background",
                      isNext && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background"
                    )}
                  >
                    {badge.icon}
                    {!isEarned && (
                      <span className="absolute -bottom-1 -right-1 text-sm">🔒</span>
                    )}
                    {isEarned && (
                      <span className="absolute -top-1 -right-1 text-sm">✅</span>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-bold truncate",
                        isEarned ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {badge.name}
                      </h4>
                      {isNext && (
                        <span className="text-xs bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
                          Następna!
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm",
                      isEarned ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}>
                      {badge.requirement}
                    </p>
                  </div>

                  {/* Level indicator */}
                  <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg",
                    isEarned ? "bg-fitfly-green/20 text-fitfly-green" : "bg-muted text-muted-foreground"
                  )}>
                    #{index + 1}
                  </div>
                </div>

                {/* Arrow connector */}
                {index < badges.length - 1 && (
                  <div className="flex justify-start pl-5 py-1">
                    <ChevronDown className={cn(
                      "w-5 h-5",
                      isEarned ? "text-fitfly-green" : "text-muted-foreground/30"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
