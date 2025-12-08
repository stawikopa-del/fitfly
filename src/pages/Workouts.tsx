import { WorkoutHub } from '@/components/flyfit/WorkoutHub';

export default function Workouts() {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
          Treningi
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Ćwicz ze mną! 💪</p>
      </header>

      <WorkoutHub />
    </div>
  );
}
