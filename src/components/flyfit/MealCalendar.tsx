import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, RefreshCw, Loader2, UtensilsCrossed, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';
import { toast } from 'sonner';
import { DetailedRecipe } from './RecipesSection';

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  isSelected: boolean;
}

interface MealItem {
  name: string;
  calories: number;
  description: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients?: string[];
  preparationTime?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface SavedDietPlan {
  id: string;
  name: string;
  diet_type: string;
  daily_calories: number;
  plan_data: {
    dailyMeals: {
      breakfast: MealItem[];
      lunch: MealItem[];
      dinner: MealItem[];
      snacks: MealItem[];
    };
    weeklySchedule: {
      day: string;
      meals: string[];
    }[];
  };
  preferences?: {
    dietType?: string;
    goal?: 'lose' | 'maintain' | 'gain';
    gender?: 'male' | 'female';
    dailyCalories?: number;
    mealsPerDay?: number;
  };
}

interface SwappedMeals {
  [key: string]: MealItem; // key format: "date-mealType" e.g. "2024-01-15-breakfast"
}

interface MealCalendarProps {
  onStartCooking: (recipe: DetailedRecipe) => void;
}

const dayNames = ['NIE', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB'];
// Helper function to calculate calories from macros if missing
const getCalories = (meal: MealItem): number => {
  if (meal.calories && meal.calories > 0) {
    return meal.calories;
  }
  // Calculate from macros if available
  if (meal.macros) {
    const protein = meal.macros.protein || 0;
    const carbs = meal.macros.carbs || 0;
    const fat = meal.macros.fat || 0;
    const calculated = (protein * 4) + (carbs * 4) + (fat * 9);
    if (calculated > 0) return Math.round(calculated);
  }
  // Default fallback based on meal type
  const defaults: Record<string, number> = {
    breakfast: 400,
    lunch: 500,
    dinner: 450,
    snack: 200,
  };
  return defaults[meal.type] || 350;
};

const mealTypeLabels = {
  breakfast: { label: 'Śniadanie', emoji: '🌅', bgClass: 'bg-amber-500/10', textClass: 'text-amber-700 dark:text-amber-400' },
  lunch: { label: 'Obiad', emoji: '🍽️', bgClass: 'bg-blue-500/10', textClass: 'text-blue-700 dark:text-blue-400' },
  dinner: { label: 'Kolacja', emoji: '🌙', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-700 dark:text-indigo-400' },
  snack: { label: 'Przekąska', emoji: '🍪', bgClass: 'bg-pink-500/10', textClass: 'text-pink-700 dark:text-pink-400' },
};

export function MealCalendar({ onStartCooking }: MealCalendarProps) {
  const { user } = useAuth();
  const [savedPlan, setSavedPlan] = useState<SavedDietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [swappingMeal, setSwappingMeal] = useState<string | null>(null);
  const [swappedMeals, setSwappedMeals] = useState<SwappedMeals>({});
  const [favoriteNames, setFavoriteNames] = useState<Set<string>>(new Set());
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch the most recent saved diet plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('saved_diet_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!mountedRef.current) return;
        
        if (!error && data) {
          setSavedPlan({
            id: data.id,
            name: data.name,
            diet_type: data.diet_type,
            daily_calories: data.daily_calories,
            plan_data: data.plan_data as unknown as SavedDietPlan['plan_data'],
            preferences: data.preferences as unknown as SavedDietPlan['preferences'],
          });
        }
      } catch (error) {
        console.error('Error fetching diet plan:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };
    
    fetchPlan();
  }, [user]);

  // Fetch favorite recipe names
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('favorite_recipes')
          .select('recipe_name')
          .eq('user_id', user.id);
        
        if (!mountedRef.current) return;
        
        if (data) {
          setFavoriteNames(new Set(data.map(f => f.recipe_name)));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    
    fetchFavorites();
  }, [user]);

  // Generate days for the calendar (current week + offset)
  const generateDays = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      days.push({
        date,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate().toString().padStart(2, '0') + '.' + (date.getMonth() + 1).toString().padStart(2, '0'),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return days;
  };

  const days = generateDays();
  const maxWeekOffset = 4; // Max 1 month ahead

  const handlePrevWeek = () => {
    soundFeedback.buttonClick();
    if (weekOffset > 0) {
      setWeekOffset(weekOffset - 1);
    }
  };

  const handleNextWeek = () => {
    soundFeedback.buttonClick();
    if (weekOffset < maxWeekOffset) {
      setWeekOffset(weekOffset + 1);
    }
  };

  const handleSelectDay = (day: DayData) => {
    soundFeedback.buttonClick();
    setSelectedDate(day.date);
  };

  // Get date key for swapped meals
  const getDateMealKey = (date: Date, mealType: string) => {
    return `${date.toISOString().split('T')[0]}-${mealType}`;
  };

  // Get meals for selected day based on day of week from weekly schedule
  const getMealsForDay = (): MealItem[] => {
    if (!savedPlan?.plan_data?.dailyMeals) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to index 6
    
    const { dailyMeals } = savedPlan.plan_data;
    const meals: MealItem[] = [];
    
    // Check for swapped meals first, then use default from plan
    const mealTypes: Array<{ key: keyof typeof dailyMeals; type: MealItem['type'] }> = [
      { key: 'breakfast', type: 'breakfast' },
      { key: 'lunch', type: 'lunch' },
      { key: 'dinner', type: 'dinner' },
      { key: 'snacks', type: 'snack' },
    ];

    for (const { key, type } of mealTypes) {
      const swapKey = getDateMealKey(selectedDate, type);
      
      // Check if there's a swapped meal for this date and type
      if (swappedMeals[swapKey]) {
        meals.push(swappedMeals[swapKey]);
      } else {
        // Use meal from plan based on day index
        const mealArray = dailyMeals[key];
        const idx = dayIndex % (mealArray?.length || 1);
        if (mealArray?.[idx]) {
          meals.push({ ...mealArray[idx], type });
        }
      }
    }
    
    return meals;
  };

  // Handle swap meal with AI-generated alternative
  const handleSwapMeal = async (meal: MealItem, mealIndex: number) => {
    if (!savedPlan) return;
    
    soundFeedback.buttonClick();
    setSwappingMeal(`${meal.type}-${mealIndex}`);
    
    try {
      // Collect all current meals to exclude from generation
      const excludeMeals = getMealsForDay().map(m => m.name);
      
      // Call the AI to generate a new meal
      const { data, error } = await supabase.functions.invoke('swap-meal', {
        body: {
          currentMeal: {
            name: meal.name,
            calories: meal.calories,
            description: meal.description,
            type: meal.type,
          },
          userPreferences: {
            dietType: savedPlan.diet_type || savedPlan.preferences?.dietType,
            dailyCalories: savedPlan.daily_calories || savedPlan.preferences?.dailyCalories,
            goal: savedPlan.preferences?.goal,
            gender: savedPlan.preferences?.gender,
            mealsPerDay: savedPlan.preferences?.mealsPerDay,
          },
          excludeMeals,
        },
      });
      
      if (!mountedRef.current) return;
      
      if (error) throw error;
      
      if (data) {
        // Save the swapped meal for this date
        const swapKey = getDateMealKey(selectedDate, meal.type);
        const newMeal: MealItem = {
          name: data.name,
          calories: data.calories,
          description: data.description,
          type: meal.type,
          ingredients: data.ingredients,
          preparationTime: data.preparationTime,
          macros: data.macros,
        };
        
        setSwappedMeals(prev => ({
          ...prev,
          [swapKey]: newMeal,
        }));
        
        soundFeedback.success();
        toast.success(`Zamieniono na: ${data.name} 🔄`);
      }
    } catch (error) {
      console.error('Error swapping meal:', error);
      toast.error('Nie udało się zamienić przepisu. Spróbuj ponownie.');
    } finally {
      if (mountedRef.current) {
        setSwappingMeal(null);
      }
    }
  };

  // Start cooking mode for a meal
  const handleStartCooking = (meal: MealItem) => {
    soundFeedback.buttonClick();
    
    // Convert meal to DetailedRecipe format
    const recipe: DetailedRecipe = {
      name: meal.name,
      description: meal.description,
      ingredients: meal.ingredients || ['Składniki zgodne z przepisem'],
      servings: 1,
      total_time_minutes: meal.preparationTime || 30,
      tools_needed: ['Garnek', 'Patelnia'],
      macros: {
        calories: meal.calories,
        protein: meal.macros?.protein || Math.round(meal.calories * 0.25 / 4),
        carbs: meal.macros?.carbs || Math.round(meal.calories * 0.5 / 4),
        fat: meal.macros?.fat || Math.round(meal.calories * 0.25 / 9),
      },
      steps: [
        {
          step_number: 1,
          instruction: `Przygotuj składniki do: ${meal.name}`,
          duration_minutes: 5,
        },
        {
          step_number: 2,
          instruction: meal.description || 'Przygotuj posiłek zgodnie z przepisem',
          duration_minutes: Math.max(10, (meal.preparationTime || 30) - 10),
        },
        {
          step_number: 3,
          instruction: 'Podaj i smacznego!',
          duration_minutes: 5,
        },
      ],
    };
    
    onStartCooking(recipe);
  };

  // Add meal to favorites
  const handleAddToFavorites = async (meal: MealItem) => {
    if (!user) return;
    
    soundFeedback.buttonClick();
    setSavingFavorite(meal.name);
    
    try {
      // Check if already in favorites
      if (favoriteNames.has(meal.name)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_name', meal.name);
        
        if (error) throw error;
        
        setFavoriteNames(prev => {
          const next = new Set(prev);
          next.delete(meal.name);
          return next;
        });
        toast.success('Usunięto z ulubionych 💔');
      } else {
        // Add to favorites
        const recipeData = {
          name: meal.name,
          description: meal.description,
          calories: getCalories(meal),
          ingredients: meal.ingredients || [],
          preparationTime: meal.preparationTime || 30,
          mealType: meal.type, // breakfast, lunch, dinner, snack
          macros: meal.macros || {
            protein: Math.round(getCalories(meal) * 0.25 / 4),
            carbs: Math.round(getCalories(meal) * 0.5 / 4),
            fat: Math.round(getCalories(meal) * 0.25 / 9),
          },
        };
        
        const { error } = await supabase
          .from('favorite_recipes')
          .insert([{
            user_id: user.id,
            recipe_name: meal.name,
            recipe_data: recipeData,
          }]);
        
        if (error) throw error;
        
        setFavoriteNames(prev => new Set([...prev, meal.name]));
        soundFeedback.success();
        toast.success('Dodano do ulubionych! ❤️');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Nie udało się zaktualizować ulubionych');
    } finally {
      if (mountedRef.current) {
        setSavingFavorite(null);
      }
    }
  };

  const mealsForDay = getMealsForDay();

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 border-2 border-border/50 shadow-card-playful">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!savedPlan) {
    return (
      <div className="bg-card rounded-3xl p-6 border-2 border-border/50 shadow-card-playful">
        <div className="text-center py-6">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold font-display text-foreground mb-2">Brak zapisanego planu diety</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Wygeneruj plan diety w konfiguratorze, aby zobaczyć posiłki w kalendarzu
          </p>
          <Button
            onClick={() => {
              soundFeedback.buttonClick();
              window.location.href = '/konfiguracja-diety';
            }}
            className="rounded-2xl"
          >
            Skonfiguruj dietę
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
        Twoje posiłki
        <span>📅</span>
      </h2>

      {/* Calendar strip */}
      <div className="bg-card rounded-3xl p-4 border-2 border-border/50 shadow-card-playful">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            disabled={weekOffset === 0}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              weekOffset === 0 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-bold text-sm text-foreground">
            {weekOffset === 0 ? 'Ten tydzień' : `+${weekOffset} tyg.`}
          </span>
          
          <button
            onClick={handleNextWeek}
            disabled={weekOffset >= maxWeekOffset}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              weekOffset >= maxWeekOffset 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days strip */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {days.map((day) => (
            <button
              key={day.date.toISOString()}
              onClick={() => handleSelectDay(day)}
              className={cn(
                "flex flex-col items-center min-w-[52px] py-3 px-2 rounded-2xl transition-all duration-200",
                day.isSelected
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : day.isToday
                  ? "bg-secondary/20 text-secondary-foreground border-2 border-secondary"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              )}
            >
              <span className={cn(
                "text-xs font-bold",
                day.isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {day.dayName}
              </span>
              <span className={cn(
                "text-[10px] mt-1",
                day.isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {day.dayNumber}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Meals for selected day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {savedPlan.daily_calories} kcal
          </span>
        </div>

        {mealsForDay.length > 0 ? (
          mealsForDay.map((meal, index) => {
            const mealConfig = mealTypeLabels[meal.type];
            const isSwapping = swappingMeal === `${meal.type}-${index}`;
            const isSwapped = !!swappedMeals[getDateMealKey(selectedDate, meal.type)];
            const isFavorite = favoriteNames.has(meal.name);
            
            return (
              <div 
                key={`${meal.type}-${index}`}
                className={cn(
                  "rounded-2xl p-4 border-2 transition-all duration-200 hover:-translate-y-0.5",
                  isSwapped ? "border-secondary/50" : "border-border/30",
                  mealConfig.bgClass
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mealConfig.emoji}</span>
                    <span className={cn("text-xs font-bold uppercase", mealConfig.textClass)}>
                      {mealConfig.label}
                    </span>
                    {isSwapped && (
                      <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full">
                        zamienione
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToFavorites(meal)}
                      disabled={savingFavorite === meal.name}
                      className={cn(
                        "p-1.5 rounded-full transition-all duration-200",
                        isFavorite 
                          ? "text-red-500 hover:text-red-600" 
                          : "text-muted-foreground hover:text-red-400"
                      )}
                      title={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                    >
                      {savingFavorite === meal.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                      )}
                    </button>
                    <span className="text-xs font-bold text-foreground bg-card px-2 py-1 rounded-full shadow-sm">
                      {getCalories(meal)} kcal
                    </span>
                  </div>
                </div>
                
                <h4 className="font-bold text-foreground mb-1">{meal.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{meal.description}</p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStartCooking(meal)}
                    className="rounded-xl text-xs flex-1"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Gotuj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSwapMeal(meal, index)}
                    disabled={isSwapping}
                    className="rounded-xl text-xs"
                    title="Zamień na inny przepis"
                  >
                    {isSwapping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-muted/50 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Brak posiłków dla tego dnia. Wygeneruj nowy plan diety!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
