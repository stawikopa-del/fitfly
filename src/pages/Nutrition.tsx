import { useState } from 'react';
import { MealCard } from '@/components/flyfit/MealCard';
import { Meal } from '@/types/flyfit';
import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function Nutrition() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', type: 'breakfast', name: 'Owsianka z owocami', calories: 350, protein: 12, carbs: 55, fat: 8, time: '08:00' },
    { id: '2', type: 'lunch', name: 'Kurczak z ryżem', calories: 550, protein: 40, carbs: 60, fat: 12, time: '13:00' },
  ]);

  const dailyGoals = {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65,
  };

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const getMealsByType = (type: MealType) => meals.filter(m => m.type === type);

  const handleAddMeal = (type: MealType) => {
    // TODO: Open modal to add meal
    const newMeal: Meal = {
      id: Date.now().toString(),
      type,
      name: 'Nowy posiłek',
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 5,
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals([...meals, newMeal]);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground mb-1">Odżywianie</h1>
        <p className="text-sm text-muted-foreground">Śledź swoje posiłki</p>
      </header>

      {/* Daily Summary Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Podsumowanie dnia</h2>
          <Flame className="w-5 h-5" />
        </div>
        
        <div className="text-center mb-4">
          <p className="text-4xl font-bold">{totals.calories}</p>
          <p className="text-sm text-white/80">/ {dailyGoals.calories} kcal</p>
        </div>
        
        <Progress 
          value={(totals.calories / dailyGoals.calories) * 100} 
          className="h-2 bg-white/20"
        />
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Beef className="w-5 h-5 mx-auto mb-1 text-red-500" />
          <p className="text-lg font-bold text-foreground">{totals.protein}g</p>
          <p className="text-xs text-muted-foreground">Białko</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Wheat className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-lg font-bold text-foreground">{totals.carbs}g</p>
          <p className="text-xs text-muted-foreground">Węglowodany</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Droplet className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-bold text-foreground">{totals.fat}g</p>
          <p className="text-xs text-muted-foreground">Tłuszcze</p>
        </div>
      </div>

      {/* Meals */}
      <section className="space-y-3">
        <MealCard type="breakfast" meals={getMealsByType('breakfast')} onAddMeal={handleAddMeal} />
        <MealCard type="lunch" meals={getMealsByType('lunch')} onAddMeal={handleAddMeal} />
        <MealCard type="dinner" meals={getMealsByType('dinner')} onAddMeal={handleAddMeal} />
        <MealCard type="snack" meals={getMealsByType('snack')} onAddMeal={handleAddMeal} />
      </section>
    </div>
  );
}
