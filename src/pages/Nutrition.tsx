import { useState } from 'react';
import { Plus, Coffee, UtensilsCrossed, Moon, Cookie, Flame, Beef, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';
import { Meal } from '@/types/flyfit';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; gradient: string }> = {
  breakfast: { label: 'Śniadanie', icon: Coffee, gradient: 'from-accent/20 to-accent/5' },
  lunch: { label: 'Obiad', icon: UtensilsCrossed, gradient: 'from-secondary/20 to-secondary/5' },
  dinner: { label: 'Kolacja', icon: Moon, gradient: 'from-primary/20 to-primary/5' },
  snack: { label: 'Przekąski', icon: Cookie, gradient: 'from-purple-500/20 to-purple-500/5' },
};

export default function Nutrition() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', type: 'breakfast', name: 'Owsianka z owocami', calories: 350, protein: 12, carbs: 55, fat: 8, time: '08:00' },
    { id: '2', type: 'lunch', name: 'Kurczak z ryżem', calories: 550, protein: 40, carbs: 60, fat: 12, time: '13:00' },
  ]);

  const dailyGoals = { calories: 2000, protein: 120, carbs: 250, fat: 65 };
  
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const getMealsByType = (type: MealType) => meals.filter(m => m.type === type);

  const handleAddMeal = (type: MealType) => {
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
      {/* Header z maskotką */}
      <header className="flex items-center gap-3">
        <img src={mascotImage} alt="FitFly" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Odżywianie</h1>
          <p className="text-sm text-muted-foreground">Jedz zdrowo, żyj zdrowo! 🥗</p>
        </div>
      </header>

      {/* Podsumowanie kalorii */}
      <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-5 text-secondary-foreground shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Dzisiejsze kalorie</p>
            <p className="text-4xl font-extrabold">{totals.calories}</p>
            <p className="text-sm opacity-80">/ {dailyGoals.calories} kcal</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-secondary-foreground/30 flex items-center justify-center">
            <div className="text-center">
              <Flame className="w-6 h-6 mx-auto" />
              <span className="text-xs font-bold">{Math.round((totals.calories / dailyGoals.calories) * 100)}%</span>
            </div>
          </div>
        </div>
        <Progress value={(totals.calories / dailyGoals.calories) * 100} className="h-2 bg-secondary-foreground/20" />
      </div>

      {/* Makroskładniki */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Beef className="w-5 h-5 mx-auto mb-1 text-destructive" />
          <p className="text-lg font-bold text-foreground">{totals.protein}g</p>
          <p className="text-[10px] text-muted-foreground">Białko</p>
          <Progress value={(totals.protein / dailyGoals.protein) * 100} className="h-1 mt-2" />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Wheat className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold text-foreground">{totals.carbs}g</p>
          <p className="text-[10px] text-muted-foreground">Węglowodany</p>
          <Progress value={(totals.carbs / dailyGoals.carbs) * 100} className="h-1 mt-2" />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs">🧈</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totals.fat}g</p>
          <p className="text-[10px] text-muted-foreground">Tłuszcze</p>
          <Progress value={(totals.fat / dailyGoals.fat) * 100} className="h-1 mt-2" />
        </div>
      </div>

      {/* Lista posiłków */}
      <section className="space-y-3">
        <h2 className="font-bold text-foreground">Dzisiejsze posiłki</h2>
        
        {(Object.keys(mealConfig) as MealType[]).map(type => {
          const config = mealConfig[type];
          const Icon = config.icon;
          const typeMeals = getMealsByType(type);
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div 
              key={type}
              className={cn(
                'bg-gradient-to-r rounded-2xl p-4 border border-border',
                config.gradient
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{config.label}</h3>
                    <p className="text-xs text-muted-foreground">{typeCalories} kcal</p>
                  </div>
                </div>
                <Button 
                  size="icon"
                  variant="secondary"
                  onClick={() => handleAddMeal(type)}
                  className="rounded-full w-8 h-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {typeMeals.length > 0 ? (
                <div className="space-y-2">
                  {typeMeals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center py-2 px-3 bg-card/50 rounded-xl">
                      <span className="text-sm font-medium text-foreground">{meal.name}</span>
                      <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Dodaj posiłek
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
