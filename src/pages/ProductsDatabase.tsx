import { useState, useMemo, useRef } from 'react';
import { Search, Scale, X, Package, ChevronRight, Check, Flame, ArrowLeft, Plus, Camera, ScanBarcode, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { productsDatabase, productCategories, Product } from '@/data/productsDatabase';
import { soundFeedback } from '@/utils/soundFeedback';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { BarcodeScanner } from '@/components/flyfit/BarcodeScanner';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
};

export default function ProductsDatabase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [servingGrams, setServingGrams] = useState('');
  const [showMealTypeDialog, setShowMealTypeDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // AI i skaner
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ 
    name: string; 
    calories: number; 
    protein: number; 
    carbs: number; 
    fat: number;
    confidence?: 'low' | 'medium' | 'high';
    ingredients?: string[];
    portion_estimate?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrowanie produktów
  const filteredProducts = useMemo(() => {
    let products = productsDatabase;
    
    if (selectedCategory !== 'Wszystkie') {
      products = products.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }
    
    return products;
  }, [searchQuery, selectedCategory]);

  // Obliczanie makro dla wybranej porcji
  const calculatedNutrition = useMemo(() => {
    if (!selectedProduct || !servingGrams) return null;
    
    const grams = parseFloat(servingGrams) || 0;
    const multiplier = grams / 100;
    
    return {
      calories: Math.round(selectedProduct.calories * multiplier),
      protein: Math.round(selectedProduct.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedProduct.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedProduct.fat * multiplier * 10) / 10,
    };
  }, [selectedProduct, servingGrams]);

  const handleSelectProduct = (product: Product) => {
    soundFeedback.buttonClick();
    setSelectedProduct(product);
    setServingGrams(product.defaultServing.toString());
  };

  const handleQuickServing = (grams: number) => {
    soundFeedback.buttonClick();
    setServingGrams(grams.toString());
  };

  // Analiza zdjęcia AI
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setShowPhotoDialog(false);
    soundFeedback.buttonClick();

    try {
      // Konwersja do base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          const { data, error } = await supabase.functions.invoke('scan-meal', {
            body: { imageBase64: base64 }
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          // scan-meal zwraca bezpośrednio obiekt (nie zagnieżdżony w .meal)
          if (data?.name) {
            setAiResult({
              name: data.name || 'Posiłek',
              calories: data.calories || 0,
              protein: data.protein || 0,
              carbs: data.carbs || 0,
              fat: data.fat || 0,
              confidence: data.confidence,
              ingredients: data.ingredients,
              portion_estimate: data.portion_estimate,
            });
            soundFeedback.success();
            toast({
              title: "Zeskanowano! 📸",
              description: `${data.name}: ~${data.calories} kcal`,
            });
          } else {
            throw new Error('Brak danych o posiłku');
          }
        } catch (err) {
          console.error('AI scan error:', err);
          soundFeedback.error();
          toast({
            title: "Błąd analizy",
            description: err instanceof Error ? err.message : "Nie udało się przeanalizować zdjęcia",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setIsAnalyzing(false);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Dodaj AI wynik do posiłku
  const handleAddAiResult = async (mealType: MealType) => {
    if (!aiResult || !user) return;
    
    setIsAdding(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        name: aiResult.name,
        type: mealType,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        meal_date: today,
        time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      });

      if (error) throw error;

      soundFeedback.success();
      toast({
        title: "Dodano! 🍽️",
        description: `${aiResult.name} zapisany jako ${mealTypeLabels[mealType].toLowerCase()}`,
      });
      
      setShowMealTypeDialog(false);
      setAiResult(null);
    } catch (error) {
      console.error('Error adding meal:', error);
      soundFeedback.error();
      toast({
        title: "Błąd",
        description: "Nie udało się dodać posiłku",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToMeal = async (mealType: MealType) => {
    if (!selectedProduct || !calculatedNutrition || !user) return;
    
    setIsAdding(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const productName = `${selectedProduct.name}${selectedProduct.brand ? ` (${selectedProduct.brand})` : ''} - ${servingGrams}g`;
      
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        name: productName,
        type: mealType,
        calories: calculatedNutrition.calories,
        protein: Math.round(calculatedNutrition.protein),
        carbs: Math.round(calculatedNutrition.carbs),
        fat: Math.round(calculatedNutrition.fat),
        meal_date: today,
        time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      });

      if (error) throw error;

      soundFeedback.success();
      toast({
        title: "Produkt dodany! 🍽️",
        description: `${productName} zapisany jako ${mealTypeLabels[mealType].toLowerCase()}`,
      });
      
      setShowMealTypeDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding meal:', error);
      soundFeedback.error();
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Widok szczegółów produktu
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                soundFeedback.buttonClick();
                setSelectedProduct(null);
              }}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-foreground truncate">{selectedProduct.name}</h1>
              {selectedProduct.brand && (
                <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
              )}
            </div>
          </div>

          {/* Wartości na 100g */}
          <div className="bg-muted/30 rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Wartości odżywcze na 100g:</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-card rounded-xl p-3">
                <p className="text-2xl font-bold text-foreground">{selectedProduct.calories}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="bg-card rounded-xl p-3">
                <p className="text-2xl font-bold text-destructive">{selectedProduct.protein}g</p>
                <p className="text-xs text-muted-foreground">białko</p>
              </div>
              <div className="bg-card rounded-xl p-3">
                <p className="text-2xl font-bold text-accent">{selectedProduct.carbs}g</p>
                <p className="text-xs text-muted-foreground">węgle</p>
              </div>
              <div className="bg-card rounded-xl p-3">
                <p className="text-2xl font-bold text-primary">{selectedProduct.fat}g</p>
                <p className="text-xs text-muted-foreground">tłuszcz</p>
              </div>
            </div>
          </div>

          {/* Wybór porcji */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Scale className="w-5 h-5 text-muted-foreground" />
              Waga porcji (g)
            </Label>
            
            <Input
              type="number"
              value={servingGrams}
              onChange={(e) => setServingGrams(e.target.value)}
              placeholder="Wpisz wagę w gramach"
              className="rounded-2xl h-14 text-lg border-2"
              min="1"
              max="2000"
            />
            
            {/* Szybki wybór */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full h-10 px-4",
                  servingGrams === selectedProduct.defaultServing.toString() && "border-primary bg-primary/10 text-primary"
                )}
                onClick={() => handleQuickServing(selectedProduct.defaultServing)}
              >
                {selectedProduct.defaultServing}g ({selectedProduct.servingUnit || '1 porcja'})
              </Button>
              {selectedProduct.defaultServing !== 50 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full h-10 px-4",
                    servingGrams === '50' && "border-primary bg-primary/10 text-primary"
                  )}
                  onClick={() => handleQuickServing(50)}
                >
                  50g
                </Button>
              )}
              {selectedProduct.defaultServing !== 100 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full h-10 px-4",
                    servingGrams === '100' && "border-primary bg-primary/10 text-primary"
                  )}
                  onClick={() => handleQuickServing(100)}
                >
                  100g
                </Button>
              )}
              {selectedProduct.defaultServing !== 150 && selectedProduct.defaultServing < 150 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full h-10 px-4",
                    servingGrams === '150' && "border-primary bg-primary/10 text-primary"
                  )}
                  onClick={() => handleQuickServing(150)}
                >
                  150g
                </Button>
              )}
            </div>
          </div>

          {/* Obliczone wartości */}
          {calculatedNutrition && (
            <div className="bg-gradient-to-br from-secondary/20 to-fitfly-green/10 rounded-2xl p-5 border-2 border-secondary/30">
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                Wartości dla {servingGrams}g:
              </p>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-card rounded-xl p-3 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{calculatedNutrition.calories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm">
                  <p className="text-2xl font-bold text-destructive">{calculatedNutrition.protein}g</p>
                  <p className="text-xs text-muted-foreground">białko</p>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm">
                  <p className="text-2xl font-bold text-accent">{calculatedNutrition.carbs}g</p>
                  <p className="text-xs text-muted-foreground">węgle</p>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm">
                  <p className="text-2xl font-bold text-primary">{calculatedNutrition.fat}g</p>
                  <p className="text-xs text-muted-foreground">tłuszcz</p>
                </div>
              </div>
            </div>
          )}

          {/* Przycisk dodania */}
          <Button 
            onClick={() => {
              soundFeedback.buttonClick();
              setShowMealTypeDialog(true);
            }}
            disabled={!calculatedNutrition || calculatedNutrition.calories === 0 || !user}
            className="w-full rounded-2xl h-14 text-lg bg-secondary hover:bg-secondary/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj do posiłku
          </Button>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              Zaloguj się, aby dodawać produkty do posiłków
            </p>
          )}
        </div>

        {/* Dialog wyboru typu posiłku */}
        <Dialog open={showMealTypeDialog} onOpenChange={setShowMealTypeDialog}>
          <DialogContent className="max-w-sm rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Dodaj do posiłku</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {(Object.keys(mealTypeLabels) as MealType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-16 rounded-2xl flex flex-col gap-1"
                  onClick={() => handleAddToMeal(type)}
                  disabled={isAdding}
                >
                  <span className="text-lg">
                    {type === 'breakfast' && '🌅'}
                    {type === 'lunch' && '🍽️'}
                    {type === 'dinner' && '🌙'}
                    {type === 'snack' && '🍪'}
                  </span>
                  <span className="text-sm font-medium">{mealTypeLabels[type]}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Widok skanera kodów kreskowych
  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        onClose={() => setShowBarcodeScanner(false)}
        onAddMeal={(meal) => {
          setShowBarcodeScanner(false);
          setAiResult({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
          });
        }}
      />
    );
  }

  // Widok główny - lista produktów
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/odzywianie');
            }}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Baza produktów</h1>
            <p className="text-sm text-muted-foreground">Wyszukaj i dodaj do posiłku</p>
          </div>
        </div>

        {/* Wyszukiwarka z przyciskami AI i skanera */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Szukaj produktu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 rounded-2xl h-14 border-2 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Przycisk AI - zdjęcie */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setShowPhotoDialog(true);
              }}
              disabled={isAnalyzing}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-bold mt-0.5">AI</span>
                </>
              )}
            </button>
            
            {/* Przycisk skanera kodu kreskowego */}
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setShowBarcodeScanner(true);
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex flex-col items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
            >
              <ScanBarcode className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">SKAN</span>
            </button>
          </div>
          
          {/* Ukryty input dla zdjęcia */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          
          {/* Widok skanowania AI - styl jak w AddMealDialog */}
          {showPhotoDialog && !aiResult && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Zrób zdjęcie posiłku, a AI oszacuje kalorie
              </p>
              
              <button
                onClick={() => {
                  soundFeedback.buttonClick();
                  fileInputRef.current?.click();
                }}
                disabled={isAnalyzing}
                className="w-full h-32 rounded-2xl bg-gradient-to-br from-accent/20 to-yellow-400/20 border-2 border-dashed border-accent/50 hover:border-accent flex flex-col items-center justify-center gap-2 transition-colors"
              >
                {isAnalyzing ? (
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
              </button>
              
              <Button
                variant="ghost"
                onClick={() => setShowPhotoDialog(false)}
                className="w-full text-muted-foreground"
              >
                Anuluj
              </Button>
            </div>
          )}
          
          {/* Wynik AI - styl jak w AddMealDialog */}
          {aiResult && (
            <div className="bg-secondary/10 rounded-2xl p-4 space-y-3 border-2 border-secondary/30 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground">{aiResult.name}</h4>
                <div className="flex items-center gap-2">
                  {aiResult.confidence && (
                    <span className={cn(
                      "text-xs font-medium",
                      aiResult.confidence === 'high' ? "text-secondary" :
                      aiResult.confidence === 'medium' ? "text-accent" : "text-destructive"
                    )}>
                      {aiResult.confidence === 'high' ? 'Wysoka pewność' :
                       aiResult.confidence === 'medium' ? 'Średnia pewność' : 'Niska pewność'}
                    </span>
                  )}
                  <Button
                    onClick={() => setAiResult(null)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {aiResult.ingredients && aiResult.ingredients.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Składniki: {aiResult.ingredients.join(', ')}
                </p>
              )}
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-card rounded-xl p-2">
                  <p className="text-lg font-bold text-foreground">{Math.round(aiResult.calories)}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="bg-card rounded-xl p-2">
                  <p className="text-lg font-bold text-destructive">{Math.round(aiResult.protein)}g</p>
                  <p className="text-[10px] text-muted-foreground">białko</p>
                </div>
                <div className="bg-card rounded-xl p-2">
                  <p className="text-lg font-bold text-accent">{Math.round(aiResult.carbs)}g</p>
                  <p className="text-[10px] text-muted-foreground">węgle</p>
                </div>
                <div className="bg-card rounded-xl p-2">
                  <p className="text-lg font-bold text-primary">{Math.round(aiResult.fat)}g</p>
                  <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                </div>
              </div>

              <Button 
                onClick={() => {
                  soundFeedback.buttonClick();
                  setShowMealTypeDialog(true);
                }}
                className="w-full rounded-2xl h-11 bg-secondary hover:bg-secondary/90"
                disabled={!user}
              >
                <Check className="w-4 h-4 mr-2" />
                Dodaj ten posiłek
              </Button>
            </div>
          )}
          
          {/* Loading state for AI analysis */}
          {isAnalyzing && (
            <div className="bg-secondary/10 rounded-2xl p-6 border-2 border-secondary/30 animate-fade-in">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Analizuję zdjęcie...</p>
              </div>
            </div>
          )}
        </div>

        {/* Kategorie */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {productCategories.map(category => (
              <button
                key={category}
                onClick={() => {
                  soundFeedback.buttonClick();
                  setSelectedCategory(category);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Lista produktów */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground font-medium">Nie znaleziono produktów</p>
            <p className="text-sm text-muted-foreground mt-1">
              Spróbuj wpisać inną nazwę
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="w-full p-4 rounded-2xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4 text-left group"
              >
                {/* Kalorie po lewej */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-orange-200/20 flex flex-col items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-accent mb-0.5" />
                  <span className="text-base font-bold text-foreground">{product.calories}</span>
                  <span className="text-[9px] text-muted-foreground -mt-0.5">kcal/100g</span>
                </div>
                
                {/* Info produktu */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-base truncate">{product.name}</p>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  )}
                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="text-destructive font-medium">B: {product.protein}g</span>
                    <span className="text-accent font-medium">W: {product.carbs}g</span>
                    <span className="text-primary font-medium">T: {product.fat}g</span>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center pt-2">
          {filteredProducts.length} produktów w bazie
        </p>
      </div>

      {/* Dialog wyboru typu posiłku dla AI */}
      <Dialog open={showMealTypeDialog && !!aiResult} onOpenChange={(open) => !open && setShowMealTypeDialog(false)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Dodaj do posiłku</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {(Object.keys(mealTypeLabels) as MealType[]).map((type) => (
              <Button
                key={type}
                variant="outline"
                className="h-16 rounded-2xl flex flex-col gap-1"
                onClick={() => handleAddAiResult(type)}
                disabled={isAdding}
              >
                <span className="text-lg">
                  {type === 'breakfast' && '🌅'}
                  {type === 'lunch' && '🍽️'}
                  {type === 'dinner' && '🌙'}
                  {type === 'snack' && '🍪'}
                </span>
                <span className="text-sm font-medium">{mealTypeLabels[type]}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
