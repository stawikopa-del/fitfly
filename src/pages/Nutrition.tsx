import { useState } from 'react';
import { Plus, Coffee, UtensilsCrossed, Moon, Cookie, Flame, Beef, Wheat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';
import { Meal } from '@/types/flyfit';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; gradient: string; emoji: string }> = {
  breakfast: { label: 'Śniadanie', icon: Coffee, gradient: 'from-accent/20 to-accent/5', emoji: '🌅' },
  lunch: { label: 'Obiad', icon: UtensilsCrossed, gradient: 'from-secondary/20 to-secondary/5', emoji: '🍽️' },
  dinner: { label: 'Kolacja', icon: Moon, gradient: 'from-primary/20 to-primary/5', emoji: '🌙' },
  snack: { label: 'Przekąski', icon: Cookie, gradient: 'from-fitfly-purple/20 to-fitfly-purple/5', emoji: '🍪' },
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
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-32 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-x-1/2" />

      {/* Header z maskotką */}
      <header className="flex items-center gap-3 relative z-10">
        <div className="relative animate-float">
          <img src={mascotImage} alt="FitFly" className="w-14 h-14 object-contain drop-shadow-md" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fitfly-yellow animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-secondary to-fitfly-green-light bg-clip-text text-transparent">
            Odżywianie
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Jedz zdrowo, żyj zdrowo! 🥗</p>
        </div>
      </header>

      {/* Podsumowanie kalorii */}
      <div className="animate-float relative z-10" style={{ animationDelay: '0.2s' }}>
        <div className="bg-gradient-to-br from-secondary to-fitfly-green-dark rounded-3xl p-6 text-secondary-foreground shadow-playful-green relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <p className="text-sm opacity-80 font-medium">Dzisiejsze kalorie</p>
              <p className="text-5xl font-extrabold font-display">{totals.calories}</p>
              <p className="text-sm opacity-80 font-medium">/ {dailyGoals.calories} kcal</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <Flame className="w-7 h-7 mx-auto" />
                <span className="text-sm font-bold">{Math.round((totals.calories / dailyGoals.calories) * 100)}%</span>
              </div>
            </div>
          </div>
          <Progress value={(totals.calories / dailyGoals.calories) * 100} className="h-3 bg-white/20" />
        </div>
      </div>

      {/* Makroskładniki */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[
          { icon: Beef, value: totals.protein, goal: dailyGoals.protein, label: 'Białko', color: 'text-destructive', unit: 'g' },
          { icon: Wheat, value: totals.carbs, goal: dailyGoals.carbs, label: 'Węgle', color: 'text-accent', unit: 'g' },
          { icon: null, value: totals.fat, goal: dailyGoals.fat, label: 'Tłuszcze', color: 'text-primary', unit: 'g', emoji: '🧈' },
        ].map((item, index) => (
          <div 
            key={item.label}
            className="bg-card rounded-3xl p-4 border-2 border-border/50 text-center shadow-card-playful hover:-translate-y-1 transition-all duration-300 animate-float"
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            {item.icon ? (
              <item.icon className={cn("w-6 h-6 mx-auto mb-2", item.color)} />
            ) : (
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-lg">{item.emoji}</div>
            )}
            <p className="text-xl font-extrabold font-display text-foreground">{item.value}{item.unit}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
            <Progress value={(item.value / item.goal) * 100} className="h-1.5 mt-2" />
          </div>
        ))}
      </div>

      {/* Lista posiłków */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
          Dzisiejsze posiłki
          <span className="text-xl">🍴</span>
        </h2>
        
        {(Object.keys(mealConfig) as MealType[]).map((type, index) => {
          const config = mealConfig[type];
          const Icon = config.icon;
          const typeMeals = getMealsByType(type);
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div 
              key={type}
              className={cn(
                'bg-gradient-to-r rounded-3xl p-5 border-2 border-border/50 shadow-card-playful',
                'hover:-translate-y-1 transition-all duration-300 animate-float',
                config.gradient
              )}
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-foreground flex items-center gap-2">
                      {config.label}
                      <span>{config.emoji}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">{typeCalories} kcal</p>
                  </div>
                </div>
                <Button 
                  size="icon"
                  onClick={() => handleAddMeal(type)}
                  className="rounded-2xl w-10 h-10"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              {typeMeals.length > 0 ? (
                <div className="space-y-2">
                  {typeMeals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center py-3 px-4 bg-card/80 rounded-2xl border border-border/30">
                      <span className="text-sm font-bold text-foreground">{meal.name}</span>
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3 font-medium">
                  Kliknij + aby dodać posiłek 😋
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
