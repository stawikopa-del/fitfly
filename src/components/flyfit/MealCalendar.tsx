import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, RefreshCw, Loader2, UtensilsCrossed } from 'lucide-react';
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
}

interface MealCalendarProps {
  onStartCooking: (recipe: DetailedRecipe) => void;
}

const dayNames = ['NIE', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB'];
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
          .single();
        
        if (!error && data) {
          setSavedPlan({
            id: data.id,
            name: data.name,
            diet_type: data.diet_type,
            daily_calories: data.daily_calories,
            plan_data: data.plan_data as unknown as SavedDietPlan['plan_data'],
          });
        }
      } catch (error) {
        console.error('Error fetching diet plan:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
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

  // Get meals for selected day based on day of week from weekly schedule
  const getMealsForDay = (): MealItem[] => {
    if (!savedPlan?.plan_data?.dailyMeals) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to index 6
    
    const { dailyMeals } = savedPlan.plan_data;
    const meals: MealItem[] = [];
    
    // Rotate meals based on day index for variety
    const breakfastIdx = dayIndex % (dailyMeals.breakfast?.length || 1);
    const lunchIdx = dayIndex % (dailyMeals.lunch?.length || 1);
    const dinnerIdx = dayIndex % (dailyMeals.dinner?.length || 1);
    const snackIdx = dayIndex % (dailyMeals.snacks?.length || 1);
    
    if (dailyMeals.breakfast?.[breakfastIdx]) {
      meals.push({ ...dailyMeals.breakfast[breakfastIdx], type: 'breakfast' });
    }
    if (dailyMeals.lunch?.[lunchIdx]) {
      meals.push({ ...dailyMeals.lunch[lunchIdx], type: 'lunch' });
    }
    if (dailyMeals.dinner?.[dinnerIdx]) {
      meals.push({ ...dailyMeals.dinner[dinnerIdx], type: 'dinner' });
    }
    if (dailyMeals.snacks?.[snackIdx]) {
      meals.push({ ...dailyMeals.snacks[snackIdx], type: 'snack' });
    }
    
    return meals;
  };

  // Handle swap meal with another option
  const handleSwapMeal = async (meal: MealItem, mealIndex: number) => {
    if (!savedPlan?.plan_data?.dailyMeals) return;
    
    soundFeedback.buttonClick();
    setSwappingMeal(`${meal.type}-${mealIndex}`);
    
    // Simulate finding alternative meal (in real app, could call AI)
    setTimeout(() => {
      const mealTypeArray = savedPlan.plan_data.dailyMeals[meal.type === 'snack' ? 'snacks' : meal.type];
      if (mealTypeArray && mealTypeArray.length > 1) {
        toast.success('Zamieniono przepis na alternatywę! 🔄');
      } else {
        toast.info('Brak alternatywnych przepisów. Wygeneruj nową dietę!');
      }
      setSwappingMeal(null);
    }, 500);
  };

  // Start cooking mode for a meal
  const handleStartCooking = (meal: MealItem) => {
    soundFeedback.buttonClick();
    
    // Convert meal to DetailedRecipe format
    const recipe: DetailedRecipe = {
      name: meal.name,
      description: meal.description,
      ingredients: ['Składniki zgodne z przepisem'],
      servings: 1,
      total_time_minutes: 30,
      tools_needed: ['Garnek', 'Patelnia'],
      macros: {
        calories: meal.calories,
        protein: Math.round(meal.calories * 0.25 / 4),
        carbs: Math.round(meal.calories * 0.5 / 4),
        fat: Math.round(meal.calories * 0.25 / 9),
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
          duration_minutes: 15,
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
            
            return (
              <div 
                key={`${meal.type}-${index}`}
                className={cn(
                  "rounded-2xl p-4 border-2 border-border/30 transition-all duration-200 hover:-translate-y-0.5",
                  mealConfig.bgClass
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mealConfig.emoji}</span>
                    <span className={cn("text-xs font-bold uppercase", mealConfig.textClass)}>
                      {mealConfig.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground bg-card px-2 py-1 rounded-full shadow-sm">
                    {meal.calories} kcal
                  </span>
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
