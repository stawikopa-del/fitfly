import { useState, useRef, useEffect } from 'react';
import { Sparkles, PenLine, Loader2, Check, Camera, UtensilsCrossed, ArrowLeft, X, ChefHat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Meal } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type MethodType = 'select' | 'diet' | 'scan' | 'describe' | 'manual';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: MealType;
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
}

interface EstimatedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: 'low' | 'medium' | 'high';
  ingredients?: string[];
  portion_estimate?: string;
}

interface DietMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
};

const mealTypeToSlot: Record<MealType, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snack',
};

export function AddMealDialog({ open, onOpenChange, mealType, onAddMeal }: AddMealDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [method, setMethod] = useState<MethodType>('select');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Diet meal state
  const [dietMeal, setDietMeal] = useState<DietMeal | null>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMeal, setScannedMeal] = useState<EstimatedMeal | null>(null);
  
  // AI description state
  const [description, setDescription] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedMeal, setEstimatedMeal] = useState<EstimatedMeal | null>(null);
  
  // Manual input state
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Load diet meal when method is 'diet'
  useEffect(() => {
    if (method === 'diet' && user) {
      loadDietMeal();
    }
  }, [method, user]);

  const loadDietMeal = async () => {
    if (!user) return;
    setLoadingDiet(true);
    
    try {
      // Get the most recent saved diet plan
      const { data: plans, error } = await supabase
        .from('saved_diet_plans')
        .select('plan_data, daily_calories')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (plans && plans.length > 0) {
        const planData = plans[0].plan_data as any;
        const dailyCalories = plans[0].daily_calories;
        
        // Check if we have dailyMeals structure (new format)
        if (planData?.dailyMeals) {
          const slot = mealTypeToSlot[mealType];
          const slotKey = slot === 'snack' ? 'snacks' : slot;
          const meals = planData.dailyMeals[slotKey as keyof typeof planData.dailyMeals];
          
          if (meals && meals.length > 0) {
            // Pick the first meal from the slot
            const meal = meals[0];
            // Estimate macros based on calories (approximate)
            const calories = meal.calories || 0;
            const protein = Math.round(calories * 0.25 / 4); // 25% from protein
            const carbs = Math.round(calories * 0.50 / 4); // 50% from carbs
            const fat = Math.round(calories * 0.25 / 9); // 25% from fat
            
            setDietMeal({
              name: meal.name || 'Posiłek z diety',
              calories: calories,
              protein: protein,
              carbs: carbs,
              fat: fat,
            });
          } else {
            setDietMeal(null);
          }
        } 
        // Fallback to old format with days
        else if (planData?.days) {
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const today = days[new Date().getDay()];
          const todayPlan = planData.days.find((d: any) => d.day?.toLowerCase() === today);
          const slot = mealTypeToSlot[mealType];
          
          if (todayPlan?.meals) {
            const meal = todayPlan.meals.find((m: any) => 
              m.slot?.toLowerCase() === slot || 
              m.type?.toLowerCase() === slot
            );
            
            if (meal) {
              setDietMeal({
                name: meal.name || meal.title || 'Posiłek z diety',
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs || 0,
                fat: meal.fat || 0,
              });
            } else {
              setDietMeal(null);
            }
          }
        } else {
          setDietMeal(null);
        }
      } else {
        setDietMeal(null);
      }
    } catch (error) {
      console.error('Error loading diet meal:', error);
      setDietMeal(null);
    } finally {
      setLoadingDiet(false);
    }
  };

  const resetForm = () => {
    setMethod('select');
    setDescription('');
    setEstimatedMeal(null);
    setScannedMeal(null);
    setDietMeal(null);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Nieprawidłowy plik",
        description: "Wybierz zdjęcie",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScannedMeal(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('scan-meal', {
          body: { imageBase64: base64 }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setScannedMeal(data);
        soundFeedback.success();
        toast({
          title: "Zeskanowano! 📸",
          description: `${data.name} - ${data.calories} kcal`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Scan error:', error);
      soundFeedback.error();
      toast({
        title: "Błąd skanowania",
        description: error instanceof Error ? error.message : "Spróbuj ponownie",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEstimate = async () => {
    if (!description.trim() || description.length < 3) {
      toast({
        title: "Za krótki opis",
        description: "Opisz posiłek bardziej szczegółowo",
        variant: "destructive"
      });
      return;
    }

    setIsEstimating(true);
    setEstimatedMeal(null);

    try {
      const { data, error } = await supabase.functions.invoke('estimate-meal', {
        body: { description: description.trim() }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEstimatedMeal(data);
      soundFeedback.success();
      toast({
        title: "Oszacowano! 🎉",
        description: `${data.name} - ${data.calories} kcal`,
      });
    } catch (error) {
      console.error('Estimation error:', error);
      soundFeedback.error();
      toast({
        title: "Błąd szacowania",
        description: error instanceof Error ? error.message : "Spróbuj ponownie",
        variant: "destructive"
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAddMeal = (meal: EstimatedMeal | DietMeal) => {
    soundFeedback.success();
    onAddMeal({
      type: mealType,
      name: meal.name,
      calories: Math.round(meal.calories),
      protein: Math.round(meal.protein),
      carbs: Math.round(meal.carbs),
      fat: Math.round(meal.fat),
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    });
    
    handleClose();
    toast({
      title: "Posiłek dodany! 🍽️",
      description: `${meal.name} zapisany`,
    });
  };

  const handleAddManual = () => {
    if (!manualName.trim()) {
      toast({
        title: "Brak nazwy",
        description: "Wpisz nazwę posiłku",
        variant: "destructive"
      });
      return;
    }

    soundFeedback.success();
    onAddMeal({
      type: mealType,
      name: manualName.trim(),
      calories: parseInt(manualCalories) || 0,
      protein: parseInt(manualProtein) || 0,
      carbs: parseInt(manualCarbs) || 0,
      fat: parseInt(manualFat) || 0,
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    });
    
    handleClose();
    toast({
      title: "Posiłek dodany! 🍽️",
      description: `${manualName} zapisany`,
    });
  };

  const confidenceLabels = {
    low: { text: 'Niska pewność', color: 'text-destructive' },
    medium: { text: 'Średnia pewność', color: 'text-accent' },
    high: { text: 'Wysoka pewność', color: 'text-secondary' },
  };

  const renderMealPreview = (meal: EstimatedMeal | DietMeal, onAdd: () => void) => (
    <div className="bg-secondary/10 rounded-2xl p-4 space-y-3 border-2 border-secondary/30">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-foreground">{meal.name}</h4>
        {'confidence' in meal && meal.confidence && (
          <span className={`text-xs font-medium ${confidenceLabels[meal.confidence].color}`}>
            {confidenceLabels[meal.confidence].text}
          </span>
        )}
      </div>
      
      {'ingredients' in meal && meal.ingredients && meal.ingredients.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Składniki: {meal.ingredients.join(', ')}
        </p>
      )}
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-card rounded-xl p-2">
          <p className="text-lg font-bold text-foreground">{Math.round(meal.calories)}</p>
          <p className="text-[10px] text-muted-foreground">kcal</p>
        </div>
        <div className="bg-card rounded-xl p-2">
          <p className="text-lg font-bold text-destructive">{Math.round(meal.protein)}g</p>
          <p className="text-[10px] text-muted-foreground">białko</p>
        </div>
        <div className="bg-card rounded-xl p-2">
          <p className="text-lg font-bold text-accent">{Math.round(meal.carbs)}g</p>
          <p className="text-[10px] text-muted-foreground">węgle</p>
        </div>
        <div className="bg-card rounded-xl p-2">
          <p className="text-lg font-bold text-primary">{Math.round(meal.fat)}g</p>
          <p className="text-[10px] text-muted-foreground">tłuszcz</p>
        </div>
      </div>

      <Button onClick={onAdd} className="w-full rounded-2xl h-11 bg-secondary hover:bg-secondary/90">
        <Check className="w-4 h-4 mr-2" />
        Dodaj ten posiłek
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto rounded-3xl border-2 border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {method !== 'select' && (
              <button 
                onClick={() => {
                  soundFeedback.buttonClick();
                  setMethod('select');
                }}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            Dodaj {mealTypeLabels[mealType].toLowerCase()}
            <span>🍴</span>
          </DialogTitle>
        </DialogHeader>

        {/* Method Selection */}
        {method === 'select' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Jak chcesz dodać posiłek?
            </p>
            
            {/* 1. Posiłek z diety */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setMethod('diet');
              }}
              className="w-full p-4 rounded-2xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Posiłek z diety</h3>
                <p className="text-xs text-muted-foreground">Wybierz z Twojego planu żywieniowego</p>
              </div>
            </button>

            {/* 2. Zeskanuj posiłek */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setMethod('scan');
              }}
              className="w-full p-4 rounded-2xl border-2 border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Zeskanuj posiłek</h3>
                <p className="text-xs text-muted-foreground">Zrób zdjęcie - AI oszacuje kalorie</p>
              </div>
            </button>

            {/* 3. Opisz posiłek */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setMethod('describe');
              }}
              className="w-full p-4 rounded-2xl border-2 border-border/50 hover:border-secondary/50 hover:bg-secondary/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-fitfly-green-dark flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Opisz posiłek</h3>
                <p className="text-xs text-muted-foreground">Napisz co jadłeś - AI oszacuje wartości</p>
              </div>
            </button>

            {/* 4. Manualne dodawanie */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setMethod('manual');
              }}
              className="w-full p-4 rounded-2xl border-2 border-border/50 hover:border-fitfly-purple/50 hover:bg-fitfly-purple/5 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fitfly-purple to-violet-500 flex items-center justify-center shrink-0">
                <PenLine className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Wpisz ręcznie</h3>
                <p className="text-xs text-muted-foreground">Podaj kalorie i makro samodzielnie</p>
              </div>
            </button>
          </div>
        )}

        {/* Diet Meal View */}
        {method === 'diet' && (
          <div className="space-y-4">
            {loadingDiet ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Ładowanie planu diety...</p>
              </div>
            ) : dietMeal ? (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Posiłek na dziś z Twojego planu diety:
                </p>
                {renderMealPreview(dietMeal, () => handleAddMeal(dietMeal))}
              </>
            ) : (
              <div className="text-center py-8">
                <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Brak zapisanego planu diety</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Skonfiguruj dietę w sekcji "Konfigurator diety"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Scan Meal View */}
        {method === 'scan' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!scannedMeal && (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Zrób zdjęcie posiłku, a AI oszacuje kalorie
                </p>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full h-32 rounded-2xl bg-gradient-to-br from-accent/20 to-yellow-400/20 border-2 border-dashed border-accent/50 hover:border-accent flex flex-col items-center justify-center gap-2"
                  variant="ghost"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                      <span className="text-sm text-muted-foreground">Analizuję zdjęcie...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-accent" />
                      <span className="text-sm font-medium text-foreground">Zrób zdjęcie posiłku</span>
                      <span className="text-xs text-muted-foreground">lub wybierz z galerii</span>
                    </>
                  )}
                </Button>
              </>
            )}

            {scannedMeal && renderMealPreview(scannedMeal, () => handleAddMeal(scannedMeal))}
          </div>
        )}

        {/* Describe Meal View */}
        {method === 'describe' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Co jadłeś/aś? 🤔
              </Label>
              <Textarea
                id="description"
                placeholder="np. Duża porcja spaghetti bolognese z parmezanem, do tego sałatka z pomidorami i ogórkiem..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-2xl border-2 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>

            <Button 
              onClick={handleEstimate} 
              disabled={isEstimating || description.length < 3}
              className="w-full rounded-2xl h-12"
            >
              {isEstimating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Szacuję...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Oszacuj kalorie
                </>
              )}
            </Button>

            {estimatedMeal && renderMealPreview(estimatedMeal, () => handleAddMeal(estimatedMeal))}
          </div>
        )}

        {/* Manual Input View */}
        {method === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa posiłku</Label>
              <Input
                id="name"
                placeholder="np. Kurczak z ryżem"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="rounded-2xl h-11"
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="calories">Kalorie (kcal)</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="0"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  className="rounded-2xl h-11"
                  min="0"
                  max="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Białko (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="0"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="rounded-2xl h-11"
                  min="0"
                  max="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Węglowodany (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(e.target.value)}
                  className="rounded-2xl h-11"
                  min="0"
                  max="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Tłuszcze (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="0"
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  className="rounded-2xl h-11"
                  min="0"
                  max="500"
                />
              </div>
            </div>

            <Button onClick={handleAddManual} className="w-full rounded-2xl h-12">
              <Check className="w-4 h-4 mr-2" />
              Dodaj posiłek
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
