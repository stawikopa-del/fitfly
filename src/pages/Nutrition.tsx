import { useState, useEffect } from 'react';
import { Plus, Coffee, UtensilsCrossed, Moon, Cookie, Flame, Beef, Wheat, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Meal } from '@/types/flyfit';
import { AddMealDialog } from '@/components/flyfit/AddMealDialog';
import { RecipesSection, DetailedRecipe } from '@/components/flyfit/RecipesSection';
import { CookingMode } from '@/components/flyfit/CookingMode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; gradient: string; emoji: string }> = {
  breakfast: { label: 'Śniadanie', icon: Coffee, gradient: 'from-accent/20 to-accent/5', emoji: '🌅' },
  lunch: { label: 'Obiad', icon: UtensilsCrossed, gradient: 'from-secondary/20 to-secondary/5', emoji: '🍽️' },
  dinner: { label: 'Kolacja', icon: Moon, gradient: 'from-primary/20 to-primary/5', emoji: '🌙' },
  snack: { label: 'Przekąski', icon: Cookie, gradient: 'from-fitfly-purple/20 to-fitfly-purple/5', emoji: '🍪' },
};

export default function Nutrition() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [cookingRecipe, setCookingRecipe] = useState<DetailedRecipe | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const { user } = useAuth();
  const { progress } = useUserProgress();

  // Pobierz posiłki z bazy danych
  useEffect(() => {
    if (!user) return;
    
    const fetchMeals = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_date', today)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching meals:', error);
        toast.error('Nie udało się pobrać posiłków');
      } else {
        setMeals(data?.map(m => ({
          id: m.id,
          type: m.type as MealType,
          name: m.name,
          calories: m.calories,
          protein: Number(m.protein),
          carbs: Number(m.carbs),
          fat: Number(m.fat),
          time: m.time || undefined,
        })) || []);
      }
      setLoading(false);
    };
    
    fetchMeals();
  }, [user]);

  // Oblicz makra proporcjonalnie do kalorii z profilu
  const dailyCalories = progress.caloriesGoal;
  const dailyGoals = { 
    calories: dailyCalories, 
    protein: Math.round(dailyCalories * 0.25 / 4), // 25% kalorii z białka (4 kcal/g)
    carbs: Math.round(dailyCalories * 0.50 / 4),   // 50% kalorii z węglowodanów (4 kcal/g)
    fat: Math.round(dailyCalories * 0.25 / 9),      // 25% kalorii z tłuszczu (9 kcal/g)
  };
  
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const getMealsByType = (type: MealType) => meals.filter(m => m.type === type);

  const handleOpenAddMeal = (type: MealType) => {
    setSelectedMealType(type);
    setDialogOpen(true);
  };

  const handleAddMeal = async (mealData: Omit<Meal, 'id'>) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('meals')
      .insert({
        type: mealData.type,
        name: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        time: mealData.time,
        meal_date: today,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding meal:', error);
      toast.error('Nie udało się dodać posiłku');
    } else if (data) {
      setMeals([...meals, {
        id: data.id,
        type: data.type as MealType,
        name: data.name,
        calories: data.calories,
        protein: Number(data.protein),
        carbs: Number(data.carbs),
        fat: Number(data.fat),
        time: data.time || undefined,
      }]);
      toast.success('Posiłek dodany!');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);
    
    if (error) {
      console.error('Error deleting meal:', error);
      toast.error('Nie udało się usunąć posiłku');
    } else {
      setMeals(meals.filter(m => m.id !== mealId));
      toast.success('Posiłek usunięty');
    }
  };

  // Pokaż tryb gotowania jeśli aktywny
  if (cookingRecipe && cookingRecipe.steps) {
    return (
      <CookingMode 
        recipe={{
          ...cookingRecipe,
          total_time_minutes: cookingRecipe.total_time_minutes || 30,
          tools_needed: cookingRecipe.tools_needed || [],
          steps: cookingRecipe.steps
        }} 
        onClose={() => setCookingRecipe(null)} 
      />
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-secondary to-fitfly-green-light bg-clip-text text-transparent">
          Odżywianie
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Jedz zdrowo, żyj zdrowo! 🥗</p>
      </header>

      {/* Podsumowanie kalorii */}
      <div className="relative z-10">
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
        ].map((item) => (
          <div 
            key={item.label}
            className="bg-card rounded-3xl p-4 border-2 border-border/50 text-center shadow-card-playful hover:-translate-y-1 transition-all duration-300"
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

      {/* Sekcja przepisów AI */}
      <RecipesSection onStartCooking={setCookingRecipe} />

      {/* Lista posiłków */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
          Dzisiejsze posiłki
          <span className="text-xl">🍴</span>
        </h2>
        
        {(Object.keys(mealConfig) as MealType[]).map((type) => {
          const config = mealConfig[type];
          const Icon = config.icon;
          const typeMeals = getMealsByType(type);
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div 
              key={type}
              className={cn(
                'bg-gradient-to-r rounded-3xl p-5 border-2 border-border/50 shadow-card-playful',
                'hover:-translate-y-1 transition-all duration-300',
                config.gradient
              )}
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
                  onClick={() => handleOpenAddMeal(type)}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">{meal.calories} kcal</span>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : type === 'breakfast' ? (
                <div 
                  onClick={() => handleOpenAddMeal(type)}
                  className="bg-card/60 rounded-2xl p-4 border-2 border-dashed border-accent/40 cursor-pointer hover:border-accent hover:bg-card/80 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Opisz co jadłeś</p>
                      <p className="text-xs text-muted-foreground">AI oszacuje kalorie i makro!</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['🥣 Owsianka', '🍳 Jajecznica', '🥪 Kanapki'].map((example) => (
                      <span key={example} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                        {example}
                      </span>
                    ))}
                  </div>
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

      <AddMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mealType={selectedMealType}
        onAddMeal={handleAddMeal}
      />
    </div>
  );
}
