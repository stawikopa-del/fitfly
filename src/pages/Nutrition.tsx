import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Coffee, UtensilsCrossed, Moon, Cookie, Flame, Beef, Wheat, Sparkles, X, ScanBarcode, ChevronRight, Salad, ChefHat, Zap, Apple, Croissant } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Meal } from '@/types/flyfit';
import { AddMealDialog } from '@/components/flyfit/AddMealDialog';
import { BarcodeScanner } from '@/components/flyfit/BarcodeScanner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useGamification } from '@/hooks/useGamification';
import { soundFeedback } from '@/utils/soundFeedback';
import fitekJablko from '@/assets/fitek/fitek-jablko.png';
import fitekDetektyw from '@/assets/fitek/fitek-detektyw.png';
import fitekObiad from '@/assets/fitek/fitek-obiad.png';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snack2' | 'snack3';

interface MealScheduleItem {
  name: string;
  time: string;
}

// Default config for fallback - now includes icons based on index
const mealIconsAndGradients = [
  { icon: Coffee, gradient: 'from-accent/20 to-accent/5', emoji: '🌅' },
  { icon: UtensilsCrossed, gradient: 'from-secondary/20 to-secondary/5', emoji: '🍽️' },
  { icon: Moon, gradient: 'from-primary/20 to-primary/5', emoji: '🌙' },
  { icon: Cookie, gradient: 'from-fitfly-purple/20 to-fitfly-purple/5', emoji: '🍪' },
  { icon: Apple, gradient: 'from-destructive/20 to-destructive/5', emoji: '🍎' },
  { icon: Croissant, gradient: 'from-accent/30 to-accent/10', emoji: '🥐' },
];

const mealTypeMap: Record<number, MealType> = {
  0: 'breakfast',
  1: 'lunch',
  2: 'dinner',
  3: 'snack',
  4: 'snack2',
  5: 'snack3',
};

const defaultMealSchedule: MealScheduleItem[] = [
  { name: 'Śniadanie', time: '07:00' },
  { name: 'Obiad', time: '12:00' },
  { name: 'Kolacja', time: '18:00' },
  { name: 'Przekąska', time: '15:00' },
];

export default function Nutrition() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [selectedMealName, setSelectedMealName] = useState<string>('');
  const { user } = useAuth();
  const { progress } = useUserProgress();
  const { onMealLogged } = useGamification();
  
  // Meal schedule from user profile
  const [mealSchedule, setMealSchedule] = useState<MealScheduleItem[]>(defaultMealSchedule);
  const [mealsCount, setMealsCount] = useState(4);

  // Pobierz ustawienia posiłków z profilu
  useEffect(() => {
    if (!user) return;
    
    const fetchMealSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('meals_count, meal_schedule')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          if (data.meals_count) {
            setMealsCount(data.meals_count);
          }
          if (data.meal_schedule && Array.isArray(data.meal_schedule)) {
            setMealSchedule(data.meal_schedule as unknown as MealScheduleItem[]);
          }
        }
      } catch (e) {
        console.error('Error loading meal settings:', e);
      }
    };
    
    fetchMealSettings();
  }, [user]);

  // Pobierz posiłki z bazy danych
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchMeals = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .eq('meal_date', today)
          .order('created_at', { ascending: true });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error fetching meals:', error);
        } else {
          setMeals(data?.map(m => ({
            id: m.id,
            type: m.type as MealType,
            name: m.name,
            calories: m.calories || 0,
            protein: Number(m.protein) || 0,
            carbs: Number(m.carbs) || 0,
            fat: Number(m.fat) || 0,
            time: m.time || undefined,
          })) || []);
        }
      } catch (err) {
        console.error('Error fetching meals:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchMeals();
    
    return () => { mounted = false; };
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

  const handleOpenAddMeal = (type: MealType, name?: string) => {
    setSelectedMealType(type);
    setSelectedMealName(name || '');
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
      
      // Award XP for logging meal
      onMealLogged();
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

  // Pokaż skaner kodów kreskowych
  if (showBarcodeScanner) {
    return (
      <BarcodeScanner 
        onClose={() => setShowBarcodeScanner(false)}
        onAddMeal={async (mealData) => {
          if (!user) return;
          
          const today = new Date().toISOString().split('T')[0];
          const { data, error } = await supabase
            .from('meals')
            .insert({
              type: 'snack',
              name: mealData.name,
              calories: mealData.calories,
              protein: mealData.protein,
              carbs: mealData.carbs,
              fat: mealData.fat,
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
            onMealLogged();
          }
          setShowBarcodeScanner(false);
        }}
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

      {/* Przepisy i posiłki - nowa zakładka */}
      <button
        onClick={() => {
          soundFeedback.buttonClick();
          navigate('/przepisy');
        }}
        className="w-full bg-gradient-to-r from-accent/20 via-yellow-400/20 to-orange-400/20 rounded-3xl p-5 border-2 border-accent/30 shadow-card-playful hover:-translate-y-1 transition-all duration-300 relative z-10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-orange-400/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            <img src={fitekJablko} alt="FITEK z jabłkiem" className="w-12 h-12 object-contain" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
              Przepisy i posiłki
              <span>🍳</span>
            </h3>
            <p className="text-sm text-muted-foreground">Odkryj pyszne przepisy z AI i gotuj krok po kroku</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Zjedz coś na szybko */}
      <button
        onClick={() => {
          soundFeedback.buttonClick();
          navigate('/szybki-posilek');
        }}
        className="w-full bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30 rounded-3xl p-5 border-2 border-accent/40 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 shadow-card-playful relative z-10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-yellow-400/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            <img src={fitekObiad} alt="FITEK je obiad" className="w-12 h-12 object-contain" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
              Zjedz coś na szybko
              <span>⚡</span>
            </h3>
            <p className="text-sm text-muted-foreground">Skanuj lodówkę lub wpisz składniki i znajdź idealny przepis</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Skaner kodów kreskowych */}
      <button
        onClick={() => {
          soundFeedback.buttonClick();
          setShowBarcodeScanner(true);
        }}
        className="w-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-3xl p-5 border-2 border-violet-500/30 shadow-card-playful hover:-translate-y-1 transition-all duration-300 relative z-10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            <img src={fitekDetektyw} alt="FITEK detektyw" className="w-12 h-12 object-contain" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
              Skaner produktów
              <span>📦</span>
            </h3>
            <p className="text-sm text-muted-foreground">Zeskanuj kod kreskowy i sprawdź wartości odżywcze</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Konfigurator diety */}
      <button
        onClick={() => {
          soundFeedback.buttonClick();
          navigate('/konfiguracja-diety');
        }}
        className="w-full bg-gradient-to-r from-secondary/20 via-fitfly-green/20 to-fitfly-green-light/20 rounded-3xl p-5 border-2 border-secondary/30 shadow-card-playful hover:-translate-y-1 transition-all duration-300 relative z-10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-fitfly-green-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Salad className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
              Konfigurator diety
              <span>🥗</span>
            </h3>
            <p className="text-sm text-muted-foreground">Stwórz spersonalizowany plan żywieniowy z AI</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Lista posiłków */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
          Dzisiejsze posiłki
          <span className="text-xl">🍴</span>
        </h2>
        
        {mealSchedule.slice(0, mealsCount).map((scheduledMeal, index) => {
          const type = mealTypeMap[index] || 'snack';
          const iconConfig = mealIconsAndGradients[index % mealIconsAndGradients.length];
          const Icon = iconConfig.icon;
          const typeMeals = getMealsByType(type);
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div 
              key={`${type}-${index}`}
              className={cn(
                'bg-gradient-to-r rounded-3xl p-5 border-2 border-border/50 shadow-card-playful',
                'hover:-translate-y-1 transition-all duration-300',
                iconConfig.gradient
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-foreground flex items-center gap-2">
                      {scheduledMeal.name}
                      <span>{iconConfig.emoji}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {scheduledMeal.time} • {typeCalories} kcal
                    </p>
                  </div>
                </div>
              <Button 
                  size="icon"
                  onClick={() => handleOpenAddMeal(type, scheduledMeal.name)}
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
              ) : index === 0 ? (
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
        mealLabel={selectedMealName}
        onAddMeal={handleAddMeal}
      />
    </div>
  );
}
