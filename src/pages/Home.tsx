import { Footprints, Flame, Target, Dumbbell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatHeroBubble } from '@/components/flyfit/ChatHeroBubble';
import { StatCard } from '@/components/flyfit/StatCard';
import { WaterTracker } from '@/components/flyfit/WaterTracker';
import { QuickAction } from '@/components/flyfit/QuickAction';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useGamification } from '@/hooks/useGamification';
import { LevelProgress } from '@/components/flyfit/LevelProgress';

export default function Home() {
  const navigate = useNavigate();
  const { progress, addWater, loading: progressLoading } = useUserProgress();
  const { gamification, loading: gamificationLoading } = useGamification();

  // Loading state
  if (progressLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header z logo */}
      <header className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FITFLY
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Cześć! Jak się dziś czujesz?</p>
        </div>
        
        <button 
          onClick={() => navigate('/kalendarz')}
          className="relative text-center bg-card/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Calendar className="w-3 h-3" />
            Kalendarz
          </span>
          
          <p className="text-xs font-bold text-foreground capitalize group-hover:text-primary transition-colors">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} • {new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
          </p>
        </button>
      </header>

      {/* Level Progress - compact */}
      {!gamificationLoading && gamification && (
        <section 
          className="relative z-10 cursor-pointer" 
          onClick={() => navigate('/osiagniecia')}
        >
          <LevelProgress 
            level={gamification.current_level} 
            totalXP={gamification.total_xp} 
            compact 
          />
        </section>
      )}

      {/* Chat Hero - zachęta do rozmowy z FITEK */}
      <section className="py-2 relative z-10">
        <ChatHeroBubble />
      </section>

      {/* Statystyki w gridzie */}
      <section className="grid grid-cols-2 gap-4 relative z-10">
        <div className="animate-float" style={{ animationDelay: '0s' }}>
          <StatCard
            icon={<Footprints className="w-5 h-5" />}
            label="Kroki"
            value={(progress?.steps || 0).toLocaleString()}
            subValue={`/ ${(progress?.stepsGoal || 10000).toLocaleString()}`}
            color="green"
          />
        </div>
        <div className="animate-float" style={{ animationDelay: '0.5s' }}>
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Aktywność"
            value={`${progress?.activeMinutes || 0} min`}
            subValue={`/ ${progress?.activeMinutesGoal || 30} min`}
            color="orange"
          />
        </div>
      </section>

      {/* Tracker wody */}
      <section className="relative z-10 animate-float" style={{ animationDelay: '1s' }}>
        <WaterTracker 
          current={progress?.water || 0} 
          goal={progress?.waterGoal || 2000} 
          onAdd={addWater}
        />
      </section>

      {/* Szybkie akcje */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-lg text-foreground flex items-center gap-2">
          <span>Co dziś robimy?</span>
          <span className="text-xl">🚀</span>
        </h2>
        
        <div className="space-y-3">
          <div className="animate-float" style={{ animationDelay: '1.2s' }}>
            <QuickAction
              icon={<Dumbbell className="w-6 h-6" />}
              title="Szybki trening"
              description="10 minut ćwiczeń na start dnia"
              color="blue"
              onClick={() => navigate('/treningi')}
            />
          </div>
          
          <div className="animate-float" style={{ animationDelay: '1.4s' }}>
            <QuickAction
              icon={<Target className="w-6 h-6" />}
              title="Wyzwanie dnia"
              description="10 000 kroków - 3/7 dni ukończone"
              color="purple"
              onClick={() => navigate('/wyzwania')}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
