import { useState, useEffect } from 'react';
import { Droplets, Footprints, Timer, TrendingUp, Calendar, Award, Target, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { PageHeader } from '@/components/flyfit/PageHeader';
import fitekWykresy from '@/assets/fitek/fitek-wykresy.png';

interface DailyData {
  date: string;
  dayName: string;
  water: number;
  steps: number;
  activeMinutes: number;
}

const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];

export default function Progress() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'water' | 'steps' | 'activeMinutes'>('water');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchWeeklyData = async () => {
      try {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);

        const { data, error } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('progress_date', weekAgo.toISOString().split('T')[0])
          .lte('progress_date', today.toISOString().split('T')[0])
          .order('progress_date', { ascending: true });

        if (!mounted) return;

        if (!error && data) {
          // Uzupełnij brakujące dni
          const filledData: DailyData[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = data.find(d => d.progress_date === dateStr);
            
            filledData.push({
              date: dateStr,
              dayName: dayNames[date.getDay()] || '',
              water: dayData?.water || 0,
              steps: dayData?.steps || 0,
              activeMinutes: dayData?.active_minutes || 0,
            });
          }
          setWeeklyData(filledData);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeeklyData();
    
    return () => { mounted = false; };
  }, [user]);

  const totals = weeklyData.reduce((acc, day) => ({
    water: acc.water + day.water,
    steps: acc.steps + day.steps,
    activeMinutes: acc.activeMinutes + day.activeMinutes,
  }), { water: 0, steps: 0, activeMinutes: 0 });

  const averages = {
    water: Math.round(totals.water / 7),
    steps: Math.round(totals.steps / 7),
    activeMinutes: Math.round(totals.activeMinutes / 7),
  };

  const activeDays = weeklyData.filter(d => d.water > 0 || d.steps > 0 || d.activeMinutes > 0).length;

  const metricConfig = {
    water: { 
      label: 'Woda', 
      color: 'hsl(var(--chart-1))', 
      unit: 'ml',
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-400',
      avg: averages.water,
      total: totals.water,
    },
    steps: { 
      label: 'Kroki', 
      color: 'hsl(var(--chart-2))', 
      unit: '',
      icon: Footprints,
      gradient: 'from-secondary to-fitfly-green-light',
      avg: averages.steps,
      total: totals.steps,
    },
    activeMinutes: { 
      label: 'Aktywność', 
      color: 'hsl(var(--chart-3))', 
      unit: 'min',
      icon: Timer,
      gradient: 'from-accent to-yellow-400',
      avg: averages.activeMinutes,
      total: totals.activeMinutes,
    },
  };

  const currentMetric = metricConfig[selectedMetric];
  const CurrentIcon = currentMetric.icon;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Twoje postępy" emoji="📊" icon={<TrendingUp className="w-5 h-5 text-primary" />} />
      <div className="px-4 py-4 space-y-6 pb-32">

      {/* Podsumowanie tygodnia */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        <div className="bg-gradient-to-br from-primary to-fitfly-purple rounded-3xl p-4 text-primary-foreground shadow-playful">
          <Calendar className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-extrabold font-display">{activeDays}</p>
          <p className="text-[10px] opacity-80 font-medium">aktywne dni</p>
        </div>
        <div className="bg-gradient-to-br from-secondary to-fitfly-green-dark rounded-3xl p-4 text-secondary-foreground shadow-playful-green">
          <Flame className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-extrabold font-display">{totals.activeMinutes}</p>
          <p className="text-[10px] opacity-80 font-medium">minut razem</p>
        </div>
        <div className="bg-gradient-to-br from-accent to-yellow-500 rounded-3xl p-4 text-accent-foreground shadow-card-playful">
          <Award className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-extrabold font-display">{Math.round(totals.steps / 1000)}k</p>
          <p className="text-[10px] opacity-80 font-medium">kroków</p>
        </div>
      </div>

      {/* Wybór metryki */}
      <div className="flex gap-2 relative z-10">
        {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
          const config = metricConfig[key];
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-300',
                selectedMetric === key
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : 'bg-card border-2 border-border/50 text-muted-foreground hover:border-border'
              )}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Wykres */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br', currentMetric.gradient)}>
              <CurrentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-display text-foreground">{currentMetric.label}</h3>
              <p className="text-xs text-muted-foreground">Ostatnie 7 dni</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold font-display text-foreground">
              {currentMetric.avg.toLocaleString()}{currentMetric.unit}
            </p>
            <p className="text-xs text-muted-foreground">średnio/dzień</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="dayName" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value.toLocaleString()}${currentMetric.unit}`, currentMetric.label]}
              />
              <Bar 
                dataKey={selectedMetric} 
                fill={currentMetric.color}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Szczegółowe statystyki */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
          Statystyki tygodnia
          <TrendingUp className="w-5 h-5 text-primary" />
        </h2>

        <div className="space-y-3">
          {/* Woda */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-400/5 rounded-3xl p-4 border-2 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Nawodnienie</h3>
                  <p className="text-xs text-muted-foreground">Suma: {(totals.water / 1000).toFixed(1)}L</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold font-display text-foreground">{averages.water}ml</p>
                <p className="text-xs text-muted-foreground">średnio/dzień</p>
              </div>
            </div>
          </div>

          {/* Kroki */}
          <div className="bg-gradient-to-r from-secondary/10 to-fitfly-green-light/5 rounded-3xl p-4 border-2 border-secondary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-fitfly-green-light flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Kroki</h3>
                  <p className="text-xs text-muted-foreground">Suma: {totals.steps.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold font-display text-foreground">{averages.steps.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">średnio/dzień</p>
              </div>
            </div>
          </div>

          {/* Aktywność */}
          <div className="bg-gradient-to-r from-accent/10 to-yellow-400/5 rounded-3xl p-4 border-2 border-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Aktywność</h3>
                  <p className="text-xs text-muted-foreground">Suma: {totals.activeMinutes} min</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold font-display text-foreground">{averages.activeMinutes} min</p>
                <p className="text-xs text-muted-foreground">średnio/dzień</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Motywacyjna karta z FITEK */}
      <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl p-6 border-2 border-primary/20 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/90 dark:bg-card shadow-lg border border-border/30 flex items-center justify-center shrink-0">
            <img 
              src={fitekWykresy} 
              alt="FITEK pokazuje wykresy" 
              className="w-18 h-18 object-contain animate-float"
            />
          </div>
          <div>
            <h3 className="font-bold font-display text-foreground mb-1">Tak trzymaj! 💪</h3>
            <p className="text-sm text-muted-foreground">
              {activeDays >= 5 
                ? 'Niesamowite! Byłeś aktywny przez większość tygodnia. Kontynuuj!' 
                : activeDays >= 3 
                  ? 'Dobra robota! Spróbuj być aktywny jeszcze częściej.' 
                  : 'Każdy krok się liczy! Zacznij od małych celów.'}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
