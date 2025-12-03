import { useState } from 'react';
import { Sparkles, PenLine, Loader2, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Meal } from '@/types/flyfit';
import { supabase } from '@/integrations/supabase/client';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
};

export function AddMealDialog({ open, onOpenChange, mealType, onAddMeal }: AddMealDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  
  // AI estimation state
  const [description, setDescription] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedMeal, setEstimatedMeal] = useState<EstimatedMeal | null>(null);
  
  // Manual input state
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const resetForm = () => {
    setDescription('');
    setEstimatedMeal(null);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
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
      
      if (data.error) {
        throw new Error(data.error);
      }

      setEstimatedMeal(data);
      toast({
        title: "Oszacowano! 🎉",
        description: `${data.name} - ${data.calories} kcal`,
      });
    } catch (error) {
      console.error('Estimation error:', error);
      toast({
        title: "Błąd szacowania",
        description: error instanceof Error ? error.message : "Spróbuj ponownie",
        variant: "destructive"
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAddEstimated = () => {
    if (!estimatedMeal) return;
    
    onAddMeal({
      type: mealType,
      name: estimatedMeal.name,
      calories: Math.round(estimatedMeal.calories),
      protein: Math.round(estimatedMeal.protein),
      carbs: Math.round(estimatedMeal.carbs),
      fat: Math.round(estimatedMeal.fat),
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    });
    
    resetForm();
    onOpenChange(false);
    toast({
      title: "Posiłek dodany! 🍽️",
      description: `${estimatedMeal.name} zapisany`,
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

    const calories = parseInt(manualCalories) || 0;
    const protein = parseInt(manualProtein) || 0;
    const carbs = parseInt(manualCarbs) || 0;
    const fat = parseInt(manualFat) || 0;

    onAddMeal({
      type: mealType,
      name: manualName.trim(),
      calories,
      protein,
      carbs,
      fat,
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    });
    
    resetForm();
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl border-2 border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            Dodaj {mealTypeLabels[mealType].toLowerCase()}
            <span>🍴</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ai' | 'manual')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12">
            <TabsTrigger value="ai" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4" />
              Opisz posiłek
            </TabsTrigger>
            <TabsTrigger value="manual" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PenLine className="w-4 h-4" />
              Wpisz ręcznie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Co jadłeś/aś? 🤔
              </Label>
              <Textarea
                id="description"
                placeholder="np. Duża porcja spaghetti bolognese z parmezanem i sałatką..."
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

            {estimatedMeal && (
              <div className="bg-secondary/10 rounded-2xl p-4 space-y-3 border-2 border-secondary/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground">{estimatedMeal.name}</h4>
                  {estimatedMeal.confidence && (
                    <span className={`text-xs font-medium ${confidenceLabels[estimatedMeal.confidence].color}`}>
                      {confidenceLabels[estimatedMeal.confidence].text}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-card rounded-xl p-2">
                    <p className="text-lg font-bold text-foreground">{Math.round(estimatedMeal.calories)}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div className="bg-card rounded-xl p-2">
                    <p className="text-lg font-bold text-destructive">{Math.round(estimatedMeal.protein)}g</p>
                    <p className="text-[10px] text-muted-foreground">białko</p>
                  </div>
                  <div className="bg-card rounded-xl p-2">
                    <p className="text-lg font-bold text-accent">{Math.round(estimatedMeal.carbs)}g</p>
                    <p className="text-[10px] text-muted-foreground">węgle</p>
                  </div>
                  <div className="bg-card rounded-xl p-2">
                    <p className="text-lg font-bold text-primary">{Math.round(estimatedMeal.fat)}g</p>
                    <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                  </div>
                </div>

                <Button onClick={handleAddEstimated} className="w-full rounded-2xl h-11 bg-secondary hover:bg-secondary/90">
                  <Check className="w-4 h-4 mr-2" />
                  Dodaj ten posiłek
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
