import { useState, useRef } from 'react';
import { Camera, ChefHat, Sparkles, Plus, X, Loader2, Beef, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Recipe {
  name: string;
  ingredients: string[];
  description: string;
  servings: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RecipeResponse {
  detected_ingredients?: string[];
  recipes: Recipe[];
}

export function RecipesSection() {
  const [mode, setMode] = useState<'idle' | 'scan' | 'ingredients'>('idle');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanFridge = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMode('scan');
    setRecipes([]);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('generate-recipes', {
          body: { imageBase64: base64 }
        });

        if (error) throw error;

        if (data.error) {
          toast.error(data.error);
        } else {
          setRecipes(data.recipes || []);
          setDetectedIngredients(data.detected_ingredients || []);
          toast.success('Znaleziono przepisy!');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Nie udało się przeanalizować zdjęcia');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleGenerateFromIngredients = async () => {
    if (ingredients.length === 0) {
      toast.error('Dodaj przynajmniej jeden składnik');
      return;
    }

    setLoading(true);
    setRecipes([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: { ingredients }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
      } else {
        setRecipes(data.recipes || []);
        toast.success('Wygenerowano przepisy!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Nie udało się wygenerować przepisów');
    } finally {
      setLoading(false);
    }
  };

  const resetSection = () => {
    setMode('idle');
    setRecipes([]);
    setIngredients([]);
    setDetectedIngredients([]);
  };

  return (
    <section className="space-y-4 relative z-10">
      <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
        Przepisy AI
        <ChefHat className="w-5 h-5 text-accent" />
      </h2>

      {/* Opcje wyboru */}
      {mode === 'idle' && !recipes.length && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleScanFridge}
            className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl p-5 border-2 border-accent/30 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center mb-3 shadow-lg">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold font-display text-foreground mb-1">Skanuj lodówkę</h3>
            <p className="text-xs text-muted-foreground">Zrób zdjęcie i otrzymaj przepisy</p>
          </button>

          <button
            onClick={() => setMode('ingredients')}
            className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-fitfly-purple flex items-center justify-center mb-3 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold font-display text-foreground mb-1">Wpisz składniki</h3>
            <p className="text-xs text-muted-foreground">Podaj co masz i gotuj!</p>
          </button>
        </div>
      )}

      {/* Formularz składników */}
      {mode === 'ingredients' && !recipes.length && (
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Twoje składniki
            </h3>
            <button onClick={resetSection} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
              placeholder="np. kurczak, ryż, papryka..."
              className="rounded-xl"
            />
            <Button onClick={handleAddIngredient} size="icon" className="rounded-xl shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {ing}
                  <button onClick={() => handleRemoveIngredient(ing)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={handleGenerateFromIngredients}
            disabled={loading || ingredients.length === 0}
            className="w-full rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generuję przepisy...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5 mr-2" />
                Wygeneruj przepisy
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && mode === 'scan' && (
        <div className="bg-card rounded-3xl p-8 border-2 border-border/50 shadow-card-playful flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-foreground font-bold">Analizuję zdjęcie...</p>
          <p className="text-sm text-muted-foreground">To może chwilę potrwać</p>
        </div>
      )}

      {/* Wykryte składniki */}
      {detectedIngredients.length > 0 && (
        <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
          <p className="text-sm font-bold text-foreground mb-2">🔍 Wykryte składniki:</p>
          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map((ing, i) => (
              <span key={i} className="bg-accent/20 text-accent-foreground px-2 py-1 rounded-full text-xs">
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista przepisów */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">🍳 Propozycje przepisów:</p>
            <button onClick={resetSection} className="text-xs text-primary font-medium">
              Szukaj ponownie
            </button>
          </div>

          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful hover:-translate-y-1 transition-all duration-300"
            >
              <h4 className="font-bold font-display text-foreground text-lg mb-2">{recipe.name}</h4>
              
              {/* Makra */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-secondary/10 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-secondary">{recipe.macros.calories}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-destructive">{recipe.macros.protein}g</p>
                  <p className="text-[10px] text-muted-foreground">białko</p>
                </div>
                <div className="bg-accent/10 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-accent">{recipe.macros.carbs}g</p>
                  <p className="text-[10px] text-muted-foreground">węgle</p>
                </div>
                <div className="bg-primary/10 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-primary">{recipe.macros.fat}g</p>
                  <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                </div>
              </div>

              {/* Składniki */}
              <div className="mb-3">
                <p className="text-xs font-bold text-muted-foreground mb-1">Składniki:</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Opis */}
              <p className="text-sm text-muted-foreground">{recipe.description}</p>
              <p className="text-xs text-primary mt-2 font-medium">Porcje: {recipe.servings}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ukryty input do uploadu */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
    </section>
  );
}
