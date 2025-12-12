import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Users, Flame, ChefHat, PlayCircle, Heart, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { CookingMode } from '@/components/flyfit/CookingMode';
import { recipesDatabase, DatabaseRecipe, getRecipesByCategory } from '@/data/recipesDatabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  all: { label: 'Wszystkie', emoji: '🍽️' },
  breakfast: { label: 'Śniadania', emoji: '🌅' },
  lunch: { label: 'Obiady', emoji: '🍲' },
  dinner: { label: 'Kolacje', emoji: '🌙' },
  snack: { label: 'Przekąski', emoji: '🍪' },
  dessert: { label: 'Desery', emoji: '🍰' },
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: 'Łatwy', color: 'text-green-500 bg-green-500/10' },
  medium: { label: 'Średni', color: 'text-amber-500 bg-amber-500/10' },
  hard: { label: 'Trudny', color: 'text-red-500 bg-red-500/10' },
};

export default function RecipesDatabase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cookingRecipe, setCookingRecipe] = useState<DatabaseRecipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    let recipes = selectedCategory === 'all' 
      ? recipesDatabase 
      : getRecipesByCategory(selectedCategory as DatabaseRecipe['category']);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      recipes = recipes.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query)) ||
        r.ingredients.some(i => i.toLowerCase().includes(query))
      );
    }
    
    return recipes;
  }, [selectedCategory, searchQuery]);

  const handleStartCooking = (recipe: DatabaseRecipe) => {
    soundFeedback.buttonClick();
    setCookingRecipe(recipe);
  };

  const handleSaveToFavorites = async (recipe: DatabaseRecipe) => {
    if (!user) {
      toast.error('Zaloguj się, aby zapisywać przepisy');
      return;
    }
    
    setSavingId(recipe.id);
    soundFeedback.buttonClick();
    
    try {
      // Check if already saved
      const { data: existing } = await supabase
        .from('favorite_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_name', recipe.name)
        .single();
      
      if (existing) {
        toast.info('Ten przepis jest już w ulubionych! ❤️');
        setSavingId(null);
        return;
      }
      
      const recipeData = {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        servings: recipe.servings,
        total_time_minutes: recipe.total_time_minutes,
        tools_needed: recipe.tools_needed,
        steps: recipe.steps,
        macros: recipe.macros,
        mealType: recipe.category === 'snack' || recipe.category === 'dessert' ? 'snack' : recipe.category
      };
      
      const { error } = await supabase
        .from('favorite_recipes')
        .insert([{
          user_id: user.id,
          recipe_name: recipe.name,
          recipe_data: recipeData as unknown as Record<string, unknown>
        }]);
      
      if (error) throw error;
      
      toast.success('Dodano do ulubionych! ❤️');
      soundFeedback.success();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Nie udało się zapisać przepisu');
    } finally {
      setSavingId(null);
    }
  };

  if (cookingRecipe) {
    return (
      <CookingMode 
        recipe={{
          ...cookingRecipe,
          total_time_minutes: cookingRecipe.total_time_minutes || 30,
          tools_needed: cookingRecipe.tools_needed || [],
          steps: cookingRecipe.steps || []
        }} 
        onClose={() => setCookingRecipe(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/odzywianie');
            }}
            className="w-10 h-10 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              Przepisy i posiłki
            </h1>
            <p className="text-xs text-muted-foreground">{recipesDatabase.length} przepisów do odkrycia! 🍳</p>
          </div>
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              setShowFilters(!showFilters);
            }}
            className={cn(
              "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-colors",
              showFilters 
                ? "bg-primary border-primary text-primary-foreground" 
                : "bg-card border-border/50 text-foreground hover:bg-muted"
            )}
          >
            {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj przepisów, składników..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl border-2 border-border/50 bg-card"
          />
        </div>
        
        {/* Category filters */}
        {showFilters && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {Object.entries(categoryLabels).map(([key, { label, emoji }]) => (
              <button
                key={key}
                onClick={() => {
                  soundFeedback.buttonClick();
                  setSelectedCategory(key);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
                  selectedCategory === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border/50 hover:border-primary/50"
                )}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Recipe Grid */}
      <main className="px-4 py-6 pb-24">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Brak przepisów</h2>
            <p className="text-muted-foreground">Spróbuj zmienić filtry lub wyszukiwanie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-3xl p-4 border-2 border-border/50 bg-card shadow-card-playful hover:-translate-y-1 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{recipe.image_emoji}</span>
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground">
                        {categoryLabels[recipe.category]?.label}
                      </span>
                      <h3 className="font-bold text-foreground text-lg leading-tight">{recipe.name}</h3>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    difficultyLabels[recipe.difficulty].color
                  )}>
                    {difficultyLabels[recipe.difficulty].label}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {recipe.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{recipe.total_time_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{recipe.servings} porcji</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-destructive" />
                    <span>{recipe.macros.calories} kcal</span>
                  </div>
                </div>
                
                {/* Macros */}
                <div className="flex gap-2 mb-4">
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
                    B: {recipe.macros.protein}g
                  </span>
                  <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full font-medium">
                    W: {recipe.macros.carbs}g
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    T: {recipe.macros.fat}g
                  </span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartCooking(recipe)}
                    className="flex-1 rounded-xl"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Gotuj
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSaveToFavorites(recipe)}
                    disabled={savingId === recipe.id}
                    className="rounded-xl"
                  >
                    <Heart className={cn(
                      "w-4 h-4",
                      savingId === recipe.id && "animate-pulse"
                    )} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
