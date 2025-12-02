import { Footprints, Flame, Target, Dumbbell } from 'lucide-react';
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
    <div className="px-4 py-6 space-y-6">
      {/* Header z logo */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={mascotImage} alt="FitFly" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">FLYFIT</h1>
            <p className="text-xs text-muted-foreground">Cześć! Jak się dziś czujesz?</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Dzisiaj</p>
          <p className="text-sm font-bold text-foreground">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
          </p>
        </div>
      </header>

      {/* Maskotka - centralny element */}
      <section className="py-4">
        <MascotDisplay state={mascotState} size="xl" showMessage animate />
      </section>

      {/* Statystyki w gridzie */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Footprints className="w-5 h-5" />}
          label="Kroki"
          value={progress.steps.toLocaleString()}
          subValue={`/ ${progress.stepsGoal.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Aktywność"
          value={`${progress.activeMinutes} min`}
          subValue={`/ ${progress.activeMinutesGoal} min`}
          color="orange"
        />
      </section>

      {/* Tracker wody */}
      <section>
        <WaterTracker 
          current={progress.water} 
          goal={progress.waterGoal} 
          onAdd={addWater}
        />
      </section>

      {/* Szybkie akcje */}
      <section className="space-y-3">
        <h2 className="font-bold text-foreground">Co dziś robimy?</h2>
        
        <QuickAction
          icon={<Dumbbell className="w-6 h-6" />}
          title="Szybki trening"
          description="10 minut ćwiczeń na start dnia"
          color="blue"
          onClick={() => navigate('/treningi')}
        />
        
        <QuickAction
          icon={<Target className="w-6 h-6" />}
          title="Wyzwanie dnia"
          description="10 000 kroków - 3/7 dni ukończone"
          color="purple"
          onClick={() => navigate('/wyzwania')}
        />
      </section>
    </div>
  );
}
