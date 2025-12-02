import { MascotDisplay } from '@/components/flyfit/MascotDisplay';
import { StepCounter } from '@/components/flyfit/StepCounter';
import { WaterCounter } from '@/components/flyfit/WaterCounter';
import { ActivityCard } from '@/components/flyfit/ActivityCard';
import { DailyChallenge } from '@/components/flyfit/DailyChallenge';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function Home() {
  const { progress, mascotState, addWater } = useUserProgress();

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-1">FLYFIT</h1>
        <p className="text-sm text-muted-foreground">Twój dzień na zdrowie!</p>
      </header>

      {/* Mascot Section */}
      <section className="flex justify-center py-4">
        <MascotDisplay state={mascotState} size="lg" showMessage />
      </section>

      {/* Quick Stats Grid */}
      <section className="space-y-4">
        <StepCounter 
          current={progress.steps} 
          goal={progress.stepsGoal} 
        />
        
        <WaterCounter 
          current={progress.water} 
          goal={progress.waterGoal}
          onAdd={addWater}
        />
        
        <ActivityCard 
          activeMinutes={progress.activeMinutes}
          activeMinutesGoal={progress.activeMinutesGoal}
          caloriesBurned={245}
        />
        
        <DailyChallenge 
          title="10 000 kroków"
          description="Zrób dziś 10 000 kroków i zdobądź punkty!"
          progress={progress.steps}
          target={10000}
        />
      </section>
    </div>
  );
}
