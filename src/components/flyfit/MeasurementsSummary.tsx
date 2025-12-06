import { Scale, Smile, Zap, Brain, Moon, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeasurements } from '@/hooks/useMeasurements';
import { AddMeasurementDialog } from './AddMeasurementDialog';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const energyEmojis = ['😴', '🥱', '😌', '💪', '⚡'];

interface MeasurementBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  emoji?: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MeasurementBadge({ icon, label, value, emoji, color, trend }: MeasurementBadgeProps) {
  if (value === null) return null;
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-2xl',
      color
    )}>
      <span className="text-lg">{emoji || icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-bold text-sm flex items-center gap-1">
          {value}
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-muted-foreground" />}
        </span>
      </div>
    </div>
  );
}

export function MeasurementsSummary() {
  const { todayMeasurement, measurements, loading, getLatestWeight } = useMeasurements();

  // Calculate weight trend
  const getWeightTrend = (): 'up' | 'down' | 'neutral' | undefined => {
    if (measurements.length < 2) return undefined;
    const current = measurements[0]?.weight;
    const previous = measurements[1]?.weight;
    if (current === null || previous === null) return undefined;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const latestWeight = getLatestWeight();
  const weightTrend = getWeightTrend();

  if (loading) {
    return (
      <div className="bg-card border border-border/50 rounded-3xl p-4 animate-pulse">
        <div className="h-20 bg-muted rounded-2xl" />
      </div>
    );
  }

  const hasAnyMeasurement = todayMeasurement && (
    todayMeasurement.weight !== null ||
    todayMeasurement.mood !== null ||
    todayMeasurement.energy !== null ||
    todayMeasurement.stress !== null ||
    todayMeasurement.sleep_quality !== null
  );

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-4 shadow-card-playful">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-display text-lg flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Dzisiejsze pomiary
        </h3>
        <AddMeasurementDialog
          trigger={
            <button className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />
              {hasAnyMeasurement ? 'Edytuj' : 'Dodaj'}
            </button>
          }
        />
      </div>

      {hasAnyMeasurement ? (
        <div className="flex flex-wrap gap-2">
          {todayMeasurement.weight !== null && (
            <MeasurementBadge
              icon={<Scale className="w-4 h-4" />}
              label="Waga"
              value={`${todayMeasurement.weight} kg`}
              color="bg-primary/10"
              trend={weightTrend}
            />
          )}
          {todayMeasurement.mood !== null && (
            <MeasurementBadge
              icon={<Smile className="w-4 h-4" />}
              label="Humor"
              value={`${todayMeasurement.mood}/5`}
              emoji={moodEmojis[todayMeasurement.mood - 1]}
              color="bg-yellow-100 dark:bg-yellow-500/20"
            />
          )}
          {todayMeasurement.energy !== null && (
            <MeasurementBadge
              icon={<Zap className="w-4 h-4" />}
              label="Energia"
              value={`${todayMeasurement.energy}/5`}
              emoji={energyEmojis[todayMeasurement.energy - 1]}
              color="bg-amber-100 dark:bg-amber-500/20"
            />
          )}
          {todayMeasurement.stress !== null && (
            <MeasurementBadge
              icon={<Brain className="w-4 h-4" />}
              label="Stres"
              value={`${todayMeasurement.stress}/5`}
              color="bg-purple-100 dark:bg-purple-500/20"
            />
          )}
          {todayMeasurement.sleep_hours !== null && (
            <MeasurementBadge
              icon={<Moon className="w-4 h-4" />}
              label="Sen"
              value={`${todayMeasurement.sleep_hours}h`}
              color="bg-indigo-100 dark:bg-indigo-500/20"
            />
          )}
        </div>
      ) : latestWeight ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm mb-2">
            Ostatnia waga: <span className="font-bold text-foreground">{latestWeight} kg</span>
          </p>
          <AddMeasurementDialog
            trigger={
              <button className="text-primary font-bold text-sm hover:underline">
                Dodaj dzisiejsze pomiary →
              </button>
            }
          />
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-3">
            Śledź swoją wagę, samopoczucie i jakość snu
          </p>
          <AddMeasurementDialog
            trigger={
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors">
                Dodaj pierwszy pomiar
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
