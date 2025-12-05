import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Sparkles, Plus, X, Loader2, ChefHat, PlayCircle, Clock, Utensils, Heart, Share2, Cookie, Salad, Flame, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';
import { CookingMode } from '@/components/flyfit/CookingMode';
import { ShareDialog } from '@/components/flyfit/ShareDialog';
import { DetailedRecipe } from '@/components/flyfit/RecipesSection';

interface FavoriteRecipe {
  id: string;
  recipe_name: string;
  recipe_data: DetailedRecipe;
  created_at: string;
}

export default function QuickMealMethod() {
  const navigate = useNavigate();
  const { method: rawMethod } = useParams<{ method: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Extract clean method name (remove any query params that might be attached)
  const method = rawMethod?.split('?')[0] || '';

  // Determine if this is ingredients or scan method
  const isIngredientsMethod = method === 'ingredients';
  const isScanMethod = method === 'scan';

  // Get preferences from URL
  const preferences = {
    taste: searchParams.get('taste') || '',
    maxTime: parseInt(searchParams.get('maxTime') || '30'),
    maxCalories: parseInt(searchParams.get('maxCalories') || '500'),
    description: searchParams.get('description') || ''
  };

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<DetailedRecipe[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);
  const [shareRecipe, setShareRecipe] = useState<{ id: string; name: string } | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<DetailedRecipe | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate suggested ingredients based on description
  const getSuggestedIngredients = () => {
    const desc = preferences.description.toLowerCase();
    const suggestions: string[] = [];
    
    // Common ingredient mappings
    const ingredientMappings: Record<string, string[]> = {
      'ser': ['ser żółty', 'ser mozzarella', 'ser feta', 'ser parmezan'],
      'cheese': ['ser żółty', 'ser mozzarella'],
      'mięso': ['kurczak', 'wołowina', 'wieprzowina', 'indyk'],
      'kurczak': ['pierś z kurczaka', 'udka kurczaka'],
      'warzywa': ['pomidor', 'ogórek', 'papryka', 'cebula', 'czosnek'],
      'sałatka': ['sałata', 'pomidor', 'ogórek', 'oliwki'],
      'makaron': ['makaron spaghetti', 'makaron penne', 'sos pomidorowy'],
      'pizza': ['ciasto na pizzę', 'ser mozzarella', 'sos pomidorowy'],
      'jajka': ['jajka', 'masło', 'sól'],
      'śniadanie': ['jajka', 'chleb', 'masło', 'pomidor'],
      'kanapka': ['chleb', 'masło', 'ser', 'szynka'],
      'zupa': ['marchewka', 'pietruszka', 'seler', 'cebula'],
      'ryż': ['ryż', 'kurczak', 'warzywa mrożone'],
      'słodkie': ['mąka', 'cukier', 'jajka', 'masło'],
      'ciasto': ['mąka', 'cukier', 'jajka', 'masło', 'proszek do pieczenia'],
      'zdrowe': ['warzywa', 'oliwa z oliwek', 'orzech'],
      'fit': ['pierś z kurczaka', 'ryż brązowy', 'brokuły'],
    };
    
    // Check description for keywords
    Object.entries(ingredientMappings).forEach(([keyword, items]) => {
      if (desc.includes(keyword)) {
        items.forEach(item => {
          if (!suggestions.includes(item) && !ingredients.includes(item)) {
            suggestions.push(item);
          }
        });
      }
    });
    
    // Default suggestions if no keywords matched
    if (suggestions.length === 0) {
      const defaultSuggestions = ['jajka', 'chleb', 'ser', 'masło', 'pomidor', 'cebula'];
      defaultSuggestions.forEach(item => {
        if (!ingredients.includes(item)) {
          suggestions.push(item);
        }
      });
    }
    
    return suggestions.slice(0, 8);
  };

  const addSuggestedIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
      soundFeedback.buttonClick();
    }
  };

  // Fetch favorites
  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setFavorites(data.map(f => ({
          ...f,
          recipe_data: f.recipe_data as unknown as DetailedRecipe
        })));
      }
    };
    
    fetchFavorites();
  }, [user]);

  // Auto-open camera for scan method
  useEffect(() => {
    if (isScanMethod) {
      setTimeout(() => fileInputRef.current?.click(), 500);
    }
  }, [isScanMethod]);

  const isFavorite = (recipeName: string) => favorites.some(f => f.recipe_name === recipeName);

  const toggleFavorite = async (recipe: DetailedRecipe) => {
    if (!user) {
      toast.error('Musisz być zalogowany');
      return;
    }

    setSavingFavorite(recipe.name);

    try {
      const existing = favorites.find(f => f.recipe_name === recipe.name);
      
      if (existing) {
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        
        setFavorites(favorites.filter(f => f.id !== existing.id));
        toast.success('Usunięto z ulubionych');
      } else {
        const { data, error } = await supabase
          .from('favorite_recipes')
          .insert({
            user_id: user.id,
            recipe_name: recipe.name,
            recipe_data: recipe as unknown as Record<string, unknown>
          } as any)
          .select()
          .single();
        
        if (error) throw error;
        
        setFavorites([{
          ...data,
          recipe_data: data.recipe_data as unknown as DetailedRecipe
        }, ...favorites]);
        toast.success('Dodano do ulubionych! ❤️');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Wystąpił błąd');
    } finally {
      setSavingFavorite(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setRecipes([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('generate-recipes', {
          body: { 
            imageBase64: base64,
            preferences: {
              taste: preferences.taste,
              maxTime: preferences.maxTime,
              maxCalories: preferences.maxCalories,
              description: preferences.description
            }
          }
        });

        if (error) throw error;

        if (data.error) {
          toast.error(data.error);
        } else {
          setRecipes(data.recipes || []);
          setDetectedIngredients(data.detected_ingredients || []);
          soundFeedback.success();
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
      soundFeedback.buttonClick();
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
    soundFeedback.buttonClick();
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
        body: { 
          ingredients,
          preferences: {
            taste: preferences.taste,
            maxTime: preferences.maxTime,
            maxCalories: preferences.maxCalories,
            description: preferences.description
          }
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
      } else {
        setRecipes(data.recipes || []);
        soundFeedback.success();
        toast.success('Wygenerowano przepisy!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Nie udało się wygenerować przepisów');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRecipe = async (index: number) => {
    setSwappingIndex(index);
    const currentRecipe = recipes[index];
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: { 
          ingredients: ingredients.length > 0 ? ingredients : detectedIngredients,
          preferences: {
            taste: preferences.taste,
            maxTime: preferences.maxTime,
            maxCalories: preferences.maxCalories,
            description: `Wygeneruj przepis INNY niż "${currentRecipe.name}". ${preferences.description || ''}`
          },
          singleRecipe: true,
          excludeRecipes: recipes.map(r => r.name)
        }
      });

      if (error) throw error;

      if (data.recipes && data.recipes.length > 0) {
        const newRecipes = [...recipes];
        newRecipes[index] = data.recipes[0];
        setRecipes(newRecipes);
        soundFeedback.success();
        toast.success('Zmieniono przepis! 🔄');
      } else {
        toast.error('Nie udało się znaleźć alternatywnego przepisu');
      }
    } catch (error) {
      console.error('Error swapping recipe:', error);
      toast.error('Nie udało się zmienić przepisu');
    } finally {
      setSwappingIndex(null);
    }
  };

  // Cooking mode
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

  const methodTitle = isScanMethod ? 'Skanuj lodówkę' : 'Wpisz składniki';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/szybki-posilek');
            }}
            className="w-10 h-10 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold font-display bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              {methodTitle}
            </h1>
            <p className="text-xs text-muted-foreground">Znajdź idealny przepis! 🍳</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Debug info - remove after fixing */}
        {!isScanMethod && !isIngredientsMethod && (
          <div className="bg-destructive/20 rounded-xl p-4 border border-destructive/50">
            <p className="text-sm text-destructive font-bold">Błąd: Nierozpoznana metoda "{method}"</p>
            <p className="text-xs text-muted-foreground">Spodziewano: "scan" lub "ingredients"</p>
          </div>
        )}

        {/* Preferences Summary */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
          <p className="text-xs font-bold text-muted-foreground mb-2">Twoje preferencje:</p>
          <div className="flex flex-wrap gap-2">
            {preferences.taste && (
              <span className="bg-card px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-border/50">
                {preferences.taste === 'sweet' ? <Cookie className="w-3 h-3 text-pink-500" /> : <Salad className="w-3 h-3 text-amber-500" />}
                {preferences.taste === 'sweet' ? 'Słodkie' : 'Słone'}
              </span>
            )}
            <span className="bg-card px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-border/50">
              <Clock className="w-3 h-3 text-secondary" />
              Max {preferences.maxTime} min
            </span>
            <span className="bg-card px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-border/50">
              <Flame className="w-3 h-3 text-destructive" />
              Max {preferences.maxCalories} kcal
            </span>
          </div>
          {preferences.description && (
            <p className="text-xs text-muted-foreground mt-2 italic">"{preferences.description}"</p>
          )}
        </div>

        {/* Scan Method */}
        {isScanMethod && !recipes.length && (
          <div className="bg-card rounded-3xl p-6 border-2 border-accent/30 shadow-card-playful">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center mb-4 shadow-lg">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold font-display text-foreground text-lg mb-2">Zrób zdjęcie lodówki</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI przeanalizuje zawartość i zaproponuje przepisy dopasowane do Twoich preferencji
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="rounded-2xl px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizuję...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Wybierz zdjęcie
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Ingredients Method */}
        {isIngredientsMethod && !loading && recipes.length === 0 && (
          <div className="bg-card rounded-3xl p-5 border-2 border-primary/30 shadow-card-playful space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-fitfly-purple flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Twoje składniki</h3>
                <p className="text-xs text-muted-foreground">Dodaj co masz pod ręką</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                placeholder="np. kurczak, ryż, papryka..."
                className="rounded-xl"
                autoFocus
              />
              <Button onClick={handleAddIngredient} size="icon" className="rounded-xl shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Suggested ingredients */}
            {getSuggestedIngredients().length > 0 && (
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs font-bold text-muted-foreground mb-2">💡 Sugerowane składniki:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedIngredients().map((ing) => (
                    <button
                      key={ing}
                      onClick={() => addSuggestedIngredient(ing)}
                      disabled={ingredients.includes(ing)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        ingredients.includes(ing)
                          ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                          : "bg-accent/20 text-accent hover:bg-accent/30 hover:scale-105"
                      )}
                    >
                      + {ing}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Added ingredients */}
            {ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-2">Twoje składniki ({ingredients.length}):</p>
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

        {/* Loading */}
        {loading && isScanMethod && (
          <div className="bg-card rounded-3xl p-8 border-2 border-border/50 shadow-card-playful flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-bold">Analizuję zdjęcie...</p>
            <p className="text-sm text-muted-foreground">To może chwilę potrwać</p>
          </div>
        )}

        {/* Detected Ingredients */}
        {detectedIngredients.length > 0 && (
          <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
            <p className="text-sm font-bold text-foreground mb-2">🔍 Wykryte składniki:</p>
            <div className="flex flex-wrap gap-2">
              {detectedIngredients.map((ing, i) => (
                <span key={i} className="bg-accent/20 text-foreground px-2 py-1 rounded-full text-xs">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recipes List */}
        {recipes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">🍳 {recipes.length} propozycje przepisów:</p>
              <button 
                onClick={() => {
                  setRecipes([]);
                  setDetectedIngredients([]);
                  setIngredients([]);
                }} 
                className="text-xs text-primary font-medium"
              >
                Szukaj ponownie
              </button>
            </div>

            {recipes.map((recipe, index) => (
              <div
                key={`${recipe.name}-${index}`}
                className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful"
              >
                {/* Recipe number badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-bold font-display text-foreground text-lg flex-1">{recipe.name}</h4>
                </div>
                
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  {recipe.total_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.total_time_minutes} min
                    </span>
                  )}
                  {recipe.tools_needed && recipe.tools_needed.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5" />
                      {recipe.tools_needed.length} narzędzi
                    </span>
                  )}
                  {recipe.steps && (
                    <span className="text-primary font-medium">
                      {recipe.steps.length} kroków
                    </span>
                  )}
                </div>

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

                <div className="bg-muted/30 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-foreground mb-1">Składniki:</p>
                  <p className="text-xs text-muted-foreground">
                    {recipe.ingredients.slice(0, 5).join(', ')}
                    {recipe.ingredients.length > 5 && ` +${recipe.ingredients.length - 5} więcej`}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{recipe.description}</p>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {recipe.steps && recipe.steps.length > 0 && (
                    <Button 
                      onClick={() => {
                        soundFeedback.buttonClick();
                        setCookingRecipe(recipe);
                      }}
                      className="w-full rounded-2xl"
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Gotuj krok po kroku
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        soundFeedback.buttonClick();
                        handleSwapRecipe(index);
                      }}
                      disabled={swappingIndex === index}
                      className="rounded-xl"
                    >
                      {swappingIndex === index ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Zamień
                    </Button>
                    
                    <Button 
                      variant={isFavorite(recipe.name) ? "default" : "outline"}
                      onClick={() => {
                        soundFeedback.buttonClick();
                        toggleFavorite(recipe);
                      }}
                      disabled={savingFavorite === recipe.name}
                      className={cn(
                        "rounded-xl",
                        isFavorite(recipe.name) && "bg-destructive hover:bg-destructive/90"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "w-4 h-4 mr-2",
                          isFavorite(recipe.name) && "fill-current",
                          savingFavorite === recipe.name && "animate-pulse"
                        )} 
                      />
                      {isFavorite(recipe.name) ? 'W ulubionych' : 'Do ulubionych'}
                    </Button>
                  </div>
                  
                  {isFavorite(recipe.name) && (
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        const fav = favorites.find(f => f.recipe_name === recipe.name);
                        if (fav) {
                          soundFeedback.buttonClick();
                          setShareRecipe({ id: fav.id, name: recipe.name });
                        }
                      }}
                      className="rounded-xl text-muted-foreground"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Udostępnij znajomemu
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Share Dialog */}
      {shareRecipe && (
        <ShareDialog
          open={!!shareRecipe}
          onOpenChange={() => setShareRecipe(null)}
          type="recipe"
          itemId={shareRecipe.id}
          itemName={shareRecipe.name}
        />
      )}
    </div>
  );
}
