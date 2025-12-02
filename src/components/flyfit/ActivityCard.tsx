import { Timer, Flame } from 'lucide-react';

interface ActivityCardProps {
  activeMinutes: number;
  activeMinutesGoal: number;
  caloriesBurned?: number;
}

export function ActivityCard({ activeMinutes, activeMinutesGoal, caloriesBurned = 0 }: ActivityCardProps) {
  const percentage = Math.min((activeMinutes / activeMinutesGoal) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Aktywność dnia</h3>
        <Timer className="w-5 h-5" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold">{activeMinutes}</p>
          <p className="text-sm text-white/80">minut / {activeMinutesGoal}</p>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6" />
          <div>
            <p className="text-xl font-bold">{caloriesBurned}</p>
            <p className="text-xs text-white/80">kcal</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-white/20 rounded-full h-2">
        <div 
          className="bg-white rounded-full h-2 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
