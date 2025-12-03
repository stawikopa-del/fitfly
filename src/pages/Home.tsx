import { Footprints, Flame, Target, Dumbbell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MascotDisplay } from '@/components/flyfit/MascotDisplay';
import { StatCard } from '@/components/flyfit/StatCard';
import { WaterTracker } from '@/components/flyfit/WaterTracker';
import { QuickAction } from '@/components/flyfit/QuickAction';
import { useUserProgress } from '@/hooks/useUserProgress';
import mascotImage from '@/assets/fitfly-mascot.png';

export default function Home() {
  const navigate = useNavigate();
  const { progress, mascotState, addWater } = useUserProgress();

  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2" />
      
      {/* Header z logo */}
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative animate-float">
            <img src={mascotImage} alt="FitFly" className="w-12 h-12 object-contain drop-shadow-md" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fitfly-yellow animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-display text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FLYFIT
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Cześć! Jak się dziś czujesz?</p>
          </div>
        </div>
        <div className="text-right bg-card/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-border/50 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dzisiaj</p>
          <p className="text-sm font-bold text-foreground capitalize">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
          </p>
        </div>
      </header>

      {/* Maskotka - centralny element z animacją powitania */}
      <section className="py-4 relative z-10">
        <MascotDisplay 
          state={{ emotion: 'greeting', message: 'Cześć! Miło Cię widzieć! 👋' }} 
          size="hero" 
          showMessage 
          animate 
        />
      </section>

      {/* Statystyki w gridzie */}
      <section className="grid grid-cols-2 gap-4 relative z-10">
        <div className="animate-float" style={{ animationDelay: '0s' }}>
          <StatCard
            icon={<Footprints className="w-5 h-5" />}
            label="Kroki"
            value={progress.steps.toLocaleString()}
            subValue={`/ ${progress.stepsGoal.toLocaleString()}`}
            color="green"
          />
        </div>
        <div className="animate-float" style={{ animationDelay: '0.5s' }}>
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Aktywność"
            value={`${progress.activeMinutes} min`}
            subValue={`/ ${progress.activeMinutesGoal} min`}
            color="orange"
          />
        </div>
      </section>

      {/* Tracker wody */}
      <section className="relative z-10 animate-float" style={{ animationDelay: '1s' }}>
        <WaterTracker 
          current={progress.water} 
          goal={progress.waterGoal} 
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
