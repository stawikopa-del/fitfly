import { useState, useRef, useEffect } from 'react';
import { ChefHat, PlayCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface RecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
  ingredients_needed?: string[];
  tip?: string;
}

export interface DetailedRecipe {
  name: string;
  ingredients: string[];
  description: string;
  servings: number;
  total_time_minutes?: number;
  tools_needed?: string[];
  steps?: RecipeStep[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FavoriteRecipe {
  id: string;
  recipe_name: string;
  recipe_data: DetailedRecipe;
  created_at: string;
}

interface RecipesSectionProps {
  onStartCooking: (recipe: DetailedRecipe) => void;
}

export function RecipesSection({ onStartCooking }: RecipesSectionProps) {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const { user } = useAuth();

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

  const toggleFavorite = async (recipe: DetailedRecipe) => {
    if (!user) {
      toast.error('Musisz być zalogowany');
      return;
    }

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
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Wystąpił błąd');
    }
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 relative z-10">
      <h2 className="font-bold font-display text-foreground text-lg flex items-center gap-2">
        <Heart className="w-5 h-5 text-destructive fill-destructive" />
        Ulubione przepisy
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-card rounded-2xl p-4 border-2 border-destructive/20 shadow-card-playful min-w-[200px] shrink-0"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-foreground text-sm line-clamp-2 flex-1">{fav.recipe_name}</h4>
              <button
                onClick={() => toggleFavorite(fav.recipe_data)}
                className="p-1 text-destructive"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>{fav.recipe_data.macros?.calories} kcal</span>
              {fav.recipe_data.total_time_minutes && (
                <>
                  <span>•</span>
                  <span>{fav.recipe_data.total_time_minutes} min</span>
                </>
              )}
            </div>
            
            {fav.recipe_data.steps && fav.recipe_data.steps.length > 0 && (
              <Button 
                onClick={() => onStartCooking(fav.recipe_data)}
                size="sm"
                className="w-full rounded-xl text-xs"
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Gotuj
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
