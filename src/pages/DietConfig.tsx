import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, Dumbbell, Scale, Target, ChevronRight, Loader2, Check, Salad, Beef, Leaf, Fish, Apple, Croissant, Heart, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { soundFeedback } from '@/utils/soundFeedback';

interface DietType {
  id: string;
  name: string;
  icon: typeof Salad;
  emoji: string;
  description: string;
  macros: { protein: number; carbs: number; fat: number };
}

const dietTypes: DietType[] = [
  {
    id: 'balanced',
    name: 'Zbalansowana',
    icon: Apple,
    emoji: '⚖️',
    description: 'Równowaga wszystkich makroskładników. Idealna na start!',
    macros: { protein: 25, carbs: 50, fat: 25 },
  },
  {
    id: 'keto',
    name: 'Keto',
    icon: Beef,
    emoji: '🥓',
    description: 'Niskie węglowodany, wysokie tłuszcze. Spalanie tłuszczu jako główne źródło energii.',
    macros: { protein: 25, carbs: 5, fat: 70 },
  },
  {
    id: 'vege',
    name: 'Wegetariańska',
    icon: Leaf,
    emoji: '🥬',
    description: 'Bez mięsa, ale z nabiałem i jajkami. Zdrowo i etycznie!',
    macros: { protein: 20, carbs: 55, fat: 25 },
  },
  {
    id: 'vegan',
    name: 'Wegańska',
    icon: Salad,
    emoji: '🌱',
    description: 'Całkowicie roślinna. Bez produktów odzwierzęcych.',
    macros: { protein: 15, carbs: 60, fat: 25 },
  },
  {
    id: 'highprotein',
    name: 'Wysokobiałkowa',
    icon: Fish,
    emoji: '💪',
    description: 'Dla budujących mięśnie. Wysoka zawartość białka!',
    macros: { protein: 40, carbs: 35, fat: 25 },
  },
  {
    id: 'mediterranean',
    name: 'Śródziemnomorska',
    icon: Croissant,
    emoji: '🫒',
    description: 'Oliwa, ryby, warzywa. Zdrowe tłuszcze i świeże składniki.',
    macros: { protein: 20, carbs: 45, fat: 35 },
  },
];

const activityLevels = [
  { value: 1, label: 'Siedzący', emoji: '🪑', description: 'Mało lub brak ćwiczeń' },
  { value: 2, label: 'Lekki', emoji: '🚶', description: '1-2 treningi w tygodniu' },
  { value: 3, label: 'Umiarkowany', emoji: '🏃', description: '3-4 treningi w tygodniu' },
  { value: 4, label: 'Aktywny', emoji: '🔥', description: '5-6 treningów w tygodniu' },
  { value: 5, label: 'Bardzo aktywny', emoji: '💪', description: 'Codzienne intensywne treningi' },
];

interface MealItem {
  name: string;
  calories: number;
  description: string;
}

interface GeneratedDietPlan {
  summary: string;
  dailyMeals: {
    breakfast?: MealItem[];
    secondBreakfast?: MealItem[];
    lunch?: MealItem[];
    dinner?: MealItem[];
    snacks?: MealItem[];
    afternoonSnack?: MealItem[];
    [key: string]: MealItem[] | undefined;
  };
  tips: string[];
  weeklySchedule: {
    day: string;
    meals: string[];
    workoutSuggestion?: string;
  }[];
}

const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Śniadanie', emoji: '🌅' },
  secondBreakfast: { label: 'Drugie śniadanie', emoji: '🥐' },
  lunch: { label: 'Obiad', emoji: '🍽️' },
  dinner: { label: 'Kolacja', emoji: '🌙' },
  snacks: { label: 'Przekąski', emoji: '🍪' },
  afternoonSnack: { label: 'Podwieczorek', emoji: '🍎' },
};

export default function DietConfig() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // User data from profile
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  
  // Diet preferences
  const [selectedDiet, setSelectedDiet] = useState<string>('balanced');
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [activityLevel, setActivityLevel] = useState(2);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedDietPlan | null>(null);
  const [step, setStep] = useState<'config' | 'result'>('config');
  
  // Loading profile data
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Saved plans state
  const [savedPlans, setSavedPlans] = useState<Array<{
    id: string;
    name: string;
    diet_type: string;
    daily_calories: number;
    plan_data: GeneratedDietPlan;
    created_at: string;
  }>>([]);
  const [loadingSavedPlans, setLoadingSavedPlans] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingSavedPlan, setViewingSavedPlan] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('weight, height, age, gender, goal, daily_calories')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile) {
          if (profile.weight) setWeight(Number(profile.weight));
          if (profile.height) setHeight(profile.height);
          if (profile.age) setAge(profile.age);
          if (profile.gender) setGender(profile.gender === 'female' ? 'female' : 'male');
          if (profile.goal) {
            if (profile.goal.includes('schud') || profile.goal.includes('redukcj')) {
              setGoal('lose');
            } else if (profile.goal.includes('mas') || profile.goal.includes('przyty')) {
              setGoal('gain');
            } else {
              setGoal('maintain');
            }
          }
          if (profile.daily_calories) setDailyCalories(profile.daily_calories);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Fetch saved diet plans
  useEffect(() => {
    const fetchSavedPlans = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('saved_diet_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSavedPlans((data || []).map(d => ({
          id: d.id,
          name: d.name,
          diet_type: d.diet_type,
          daily_calories: d.daily_calories,
          plan_data: d.plan_data as unknown as GeneratedDietPlan,
          created_at: d.created_at,
        })));
      } catch (error) {
        console.error('Error fetching saved plans:', error);
      } finally {
        setLoadingSavedPlans(false);
      }
    };
    
    fetchSavedPlans();
  }, [user]);

  // Save plan to favorites
  const handleSavePlan = async () => {
    if (!user || !generatedPlan) return;
    
    soundFeedback.buttonClick();
    setIsSaving(true);
    
    try {
      const selectedDietType = dietTypes.find(d => d.id === selectedDiet);
      const planName = `${selectedDietType?.name || 'Dieta'} - ${dailyCalories} kcal`;
      
      const { data, error } = await supabase
        .from('saved_diet_plans')
        .insert([{
          user_id: user.id,
          name: planName,
          diet_type: selectedDiet,
          daily_calories: dailyCalories,
          plan_data: JSON.parse(JSON.stringify(generatedPlan)),
          preferences: JSON.parse(JSON.stringify({
            weight,
            height,
            age,
            gender,
            goal,
            activityLevel,
            mealsPerDay,
            workoutsPerWeek,
          })),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setSavedPlans([{
        id: data.id,
        name: data.name,
        diet_type: data.diet_type,
        daily_calories: data.daily_calories,
        plan_data: data.plan_data as unknown as GeneratedDietPlan,
        created_at: data.created_at,
      }, ...savedPlans]);
      setCurrentPlanId(data.id);
      soundFeedback.success();
      toast.success('Plan diety zapisany! ✅');
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Nie udało się zapisać planu');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved plan
  const handleDeletePlan = async (planId: string) => {
    if (!user) return;
    
    soundFeedback.buttonClick();
    
    try {
      const { error } = await supabase
        .from('saved_diet_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      
      setSavedPlans(savedPlans.filter(p => p.id !== planId));
      toast.success('Plan usunięty');
      
      if (viewingSavedPlan === planId) {
        setViewingSavedPlan(null);
        setGeneratedPlan(null);
        setStep('config');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Nie udało się usunąć planu');
    }
  };

  // View saved plan
  const handleViewSavedPlan = (plan: typeof savedPlans[0]) => {
    soundFeedback.buttonClick();
    setGeneratedPlan(plan.plan_data);
    setViewingSavedPlan(plan.id);
    setCurrentPlanId(plan.id);
    setSelectedDiet(plan.diet_type);
    setDailyCalories(plan.daily_calories);
    setStep('result');
  };

  // Calculate suggested calories based on BMR and activity
  const calculateSuggestedCalories = () => {
    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const activityMultipliers = [1.2, 1.375, 1.55, 1.725, 1.9];
    const tdee = bmr * activityMultipliers[activityLevel - 1];
    
    let suggested: number;
    if (goal === 'lose') {
      suggested = tdee - 500; // Deficit for weight loss
    } else if (goal === 'gain') {
      suggested = tdee + 300; // Surplus for muscle gain
    } else {
      suggested = tdee;
    }
    
    return Math.round(suggested);
  };

  const suggestedCalories = calculateSuggestedCalories();

  // Generate meal schedule based on mealsPerDay
  const generateMealSchedule = (mealsCount: number) => {
    const baseSchedule = [
      { name: 'Śniadanie', time: '07:00' },
      { name: 'Obiad', time: '12:00' },
      { name: 'Kolacja', time: '18:00' },
      { name: 'Przekąska', time: '15:00' },
      { name: 'Drugie śniadanie', time: '10:00' },
      { name: 'Podwieczorek', time: '16:00' },
    ];
    
    // Arrange meals in logical order based on count
    if (mealsCount === 3) {
      return [
        { name: 'Śniadanie', time: '08:00' },
        { name: 'Obiad', time: '13:00' },
        { name: 'Kolacja', time: '19:00' },
      ];
    } else if (mealsCount === 4) {
      return [
        { name: 'Śniadanie', time: '07:00' },
        { name: 'Obiad', time: '12:00' },
        { name: 'Przekąska', time: '15:00' },
        { name: 'Kolacja', time: '18:00' },
      ];
    } else if (mealsCount === 5) {
      return [
        { name: 'Śniadanie', time: '07:00' },
        { name: 'Drugie śniadanie', time: '10:00' },
        { name: 'Obiad', time: '13:00' },
        { name: 'Przekąska', time: '16:00' },
        { name: 'Kolacja', time: '19:00' },
      ];
    } else if (mealsCount === 6) {
      return [
        { name: 'Śniadanie', time: '07:00' },
        { name: 'Drugie śniadanie', time: '09:30' },
        { name: 'Obiad', time: '12:00' },
        { name: 'Przekąska', time: '15:00' },
        { name: 'Podwieczorek', time: '17:00' },
        { name: 'Kolacja', time: '19:30' },
      ];
    }
    
    return baseSchedule.slice(0, mealsCount);
  };

  // Sync meal settings to user profile
  const syncMealSettingsToProfile = async (mealsCount: number) => {
    if (!user) return;
    
    try {
      const mealSchedule = generateMealSchedule(mealsCount);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          meals_count: mealsCount,
          meal_schedule: mealSchedule,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      console.log('Meal settings synced to profile:', { mealsCount, mealSchedule });
    } catch (error) {
      console.error('Error syncing meal settings:', error);
    }
  };

  const handleGenerateDiet = async () => {
    if (!user) return;
    
    soundFeedback.buttonClick();
    setIsGenerating(true);
    
    try {
      const selectedDietType = dietTypes.find(d => d.id === selectedDiet);
      
      const { data, error } = await supabase.functions.invoke('generate-diet-plan', {
        body: {
          userProfile: {
            weight,
            height,
            age,
            gender,
            goal,
          },
          preferences: {
            dietType: selectedDiet,
            dietName: selectedDietType?.name,
            dailyCalories,
            activityLevel,
            mealsPerDay,
            workoutsPerWeek,
            macros: selectedDietType?.macros,
          },
        },
      });
      
      if (error) throw error;
      
      // Sync meal settings to profile
      await syncMealSettingsToProfile(mealsPerDay);
      
      setGeneratedPlan(data);
      setStep('result');
      soundFeedback.success();
      toast.success('Plan diety wygenerowany! 🎉');
    } catch (error) {
      console.error('Error generating diet:', error);
      toast.error('Nie udało się wygenerować planu diety');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Result view
  if (step === 'result' && generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setStep('config');
              }}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold font-display text-lg">Twój plan diety</h1>
              <p className="text-xs text-muted-foreground">Spersonalizowany plan żywieniowy</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6 pb-32">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-secondary to-fitfly-green-dark rounded-3xl p-6 text-secondary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold font-display">Podsumowanie</h2>
                <p className="text-sm opacity-80">{dailyCalories} kcal dziennie</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-90">{generatedPlan.summary}</p>
          </div>

          {/* Daily Meals */}
          <section className="space-y-4">
            <h3 className="font-bold font-display text-foreground flex items-center gap-2">
              Przykładowe posiłki <span>🍽️</span>
            </h3>
            
            {Object.entries(generatedPlan.dailyMeals).map(([mealType, meals]) => {
              if (!meals || meals.length === 0) return null;
              const config = mealTypeLabels[mealType] || { label: mealType, emoji: '🍴' };
              
              return (
                <div key={mealType} className="bg-card rounded-2xl p-4 border border-border/50">
                  <h4 className="font-bold text-sm mb-3">
                    {config.emoji} {config.label}
                  </h4>
                  <div className="space-y-2">
                    {meals.map((meal, idx) => (
                      <div key={idx} className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{meal.name}</p>
                          <p className="text-xs text-muted-foreground">{meal.description}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">
                          {meal.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Weekly Schedule */}
          <section className="space-y-4">
            <h3 className="font-bold font-display text-foreground flex items-center gap-2">
              Plan tygodniowy <span>📅</span>
            </h3>
            
            <div className="space-y-3">
              {generatedPlan.weeklySchedule.map((day, idx) => (
                <div key={idx} className="bg-card rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm">{day.day}</h4>
                    {day.workoutSuggestion && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {day.workoutSuggestion}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {day.meals.map((meal, mealIdx) => (
                      <span key={mealIdx} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="space-y-4">
            <h3 className="font-bold font-display text-foreground flex items-center gap-2">
              Wskazówki <span>💡</span>
            </h3>
            
            <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-2xl p-4 border border-accent/30">
              <ul className="space-y-2">
                {generatedPlan.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Save to favorites button */}
            {!currentPlanId || !savedPlans.find(p => p.id === currentPlanId) ? (
              <Button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="w-full rounded-2xl h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zapisuję...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Zapisz w ulubionych
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-secondary" />
                Plan zapisany w ulubionych
              </div>
            )}
            
            {/* Back to config button */}
            <Button
              onClick={() => {
                soundFeedback.buttonClick();
                setStep('config');
                setViewingSavedPlan(null);
                setCurrentPlanId(null);
              }}
              variant="outline"
              className="w-full rounded-2xl h-12"
            >
              {viewingSavedPlan ? 'Wróć do listy' : 'Zmień preferencje'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Config view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/odzywianie');
            }}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold font-display text-lg">Konfigurator diety</h1>
            <p className="text-xs text-muted-foreground">Stwórz swój idealny plan żywieniowy</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 pb-32">
        {/* Saved Plans Section */}
        {savedPlans.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold font-display text-foreground flex items-center gap-2">
              Zapisane plany <span>❤️</span>
            </h2>
            
            <div className="space-y-3">
              {savedPlans.map((plan) => {
                const dietType = dietTypes.find(d => d.id === plan.diet_type);
                const createdDate = new Date(plan.created_at);
                const formattedDate = createdDate.toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                });
                
                return (
                  <div
                    key={plan.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleViewSavedPlan(plan)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-fitfly-green/20 flex items-center justify-center">
                          <span className="text-xl">{dietType?.emoji || '🥗'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{plan.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {plan.daily_calories} kcal
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formattedDate}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="ml-2 w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Personal Data Section */}
        <section className="space-y-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2">
            Twoje dane <span>📊</span>
          </h2>
          
          <div className="bg-card rounded-3xl p-5 border border-border/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Waga (kg)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Wzrost (cm)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Wiek</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Płeć</Label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setGender('male')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                      gender === 'male'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    👨 M
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                      gender === 'female'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    👩 K
                  </button>
                </div>
              </div>
            </div>

            {/* Goal Selection */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Cel</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Schudnąć', emoji: '📉' },
                  { id: 'maintain', label: 'Utrzymać', emoji: '⚖️' },
                  { id: 'gain', label: 'Przytyć', emoji: '📈' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as 'lose' | 'maintain' | 'gain')}
                    className={cn(
                      "py-3 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1",
                      goal === g.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Diet Type Section */}
        <section className="space-y-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2">
            Typ diety <span>🥗</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {dietTypes.map((diet) => {
              const Icon = diet.icon;
              const isSelected = selectedDiet === diet.id;
              
              return (
                <button
                  key={diet.id}
                  onClick={() => {
                    soundFeedback.buttonClick();
                    setSelectedDiet(diet.id);
                  }}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border/50 bg-card hover:border-border"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-lg">{diet.emoji}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{diet.name}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{diet.description}</p>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                      B: {diet.macros.protein}%
                    </span>
                    <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                      W: {diet.macros.carbs}%
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      T: {diet.macros.fat}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Calories Section */}
        <section className="space-y-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2">
            Kalorie <span>🔥</span>
          </h2>
          
          <div className="bg-card rounded-3xl p-5 border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dzienne kalorie</p>
                <p className="text-xs text-muted-foreground">Sugerowane: {suggestedCalories} kcal</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold font-display text-primary">{dailyCalories}</span>
                <span className="text-sm text-muted-foreground ml-1">kcal</span>
              </div>
            </div>
            
            <Slider
              value={[dailyCalories]}
              onValueChange={(v) => setDailyCalories(v[0])}
              min={1200}
              max={4000}
              step={50}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1200 kcal</span>
              <button
                onClick={() => setDailyCalories(suggestedCalories)}
                className="text-primary font-medium hover:underline"
              >
                Użyj sugerowanej
              </button>
              <span>4000 kcal</span>
            </div>
          </div>
        </section>

        {/* Activity Level Section */}
        <section className="space-y-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2">
            Poziom aktywności <span>🏃</span>
          </h2>
          
          <div className="space-y-2">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  soundFeedback.buttonClick();
                  setActivityLevel(level.value);
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                  activityLevel === level.value
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-border"
                )}
              >
                <span className="text-2xl">{level.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
                {activityLevel === level.value && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Additional Preferences */}
        <section className="space-y-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2">
            Dodatkowe preferencje <span>⚙️</span>
          </h2>
          
          <div className="bg-card rounded-3xl p-5 border border-border/50 space-y-6">
            {/* Meals per day */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Posiłki dziennie</p>
                <span className="text-lg font-bold text-primary">{mealsPerDay}</span>
              </div>
              <Slider
                value={[mealsPerDay]}
                onValueChange={(v) => setMealsPerDay(v[0])}
                min={3}
                max={6}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>3</span>
                <span>6</span>
              </div>
            </div>

            {/* Workouts per week */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Treningi tygodniowo</p>
                <span className="text-lg font-bold text-primary">{workoutsPerWeek}</span>
              </div>
              <Slider
                value={[workoutsPerWeek]}
                onValueChange={(v) => setWorkoutsPerWeek(v[0])}
                min={0}
                max={7}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>7</span>
              </div>
            </div>
          </div>
        </section>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateDiet}
          disabled={isGenerating}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-secondary to-fitfly-green-dark hover:opacity-90 shadow-playful-green"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generuję plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Wygeneruj dietę
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
