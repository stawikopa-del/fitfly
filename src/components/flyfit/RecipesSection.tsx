import { useState, useEffect } from 'react';
import { PlayCircle, Heart, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { ShareDialog } from './ShareDialog';

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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareRecipe, setShareRecipe] = useState<FavoriteRecipe | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);

  const removeFavorite = async (favorite: FavoriteRecipe) => {
    if (!user) return;

    soundFeedback.buttonClick();
    
    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .delete()
        .eq('id', favorite.id);
      
      if (error) throw error;
      
      setFavorites(favorites.filter(f => f.id !== favorite.id));
      toast.success('Usunięto z ulubionych 💔');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Wystąpił błąd');
    }
  };

  const handleStartCooking = (recipe: DetailedRecipe) => {
    soundFeedback.buttonClick();
    setIsOpen(false);
    onStartCooking(recipe);
  };

  const handleShare = (favorite: FavoriteRecipe) => {
    soundFeedback.buttonClick();
    setShareRecipe(favorite);
  };

  return (
    <>
      {/* Wyróżniający się przycisk */}
      <button
        onClick={() => {
          soundFeedback.buttonClick();
          setIsOpen(true);
        }}
        className={cn(
          "w-full rounded-3xl p-4 border-2 transition-all duration-300",
          "bg-gradient-to-r from-red-500/10 via-pink-500/10 to-orange-500/10",
          "border-red-400/30 hover:border-red-400/50",
          "hover:-translate-y-1 hover:shadow-lg",
          "flex items-center justify-between gap-3"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold font-display text-foreground">Ulubione przepisy</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Ładowanie...' : `${favorites.length} zapisanych przepisów`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-400" />
        </div>
      </button>

      {/* Dialog z ulubionymi przepisami */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Ulubione przepisy
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h4 className="font-bold text-foreground mb-1">Brak ulubionych przepisów</h4>
                <p className="text-sm text-muted-foreground">
                  Dodaj przepisy do ulubionych klikając serduszko ❤️
                </p>
              </div>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="rounded-2xl p-4 border-2 border-red-400/20 bg-red-500/5 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍽️</span>
                      <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400">
                        Ulubione
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFavorite(fav)}
                        className="p-1.5 rounded-full text-red-500 hover:text-red-600 transition-colors"
                        title="Usuń z ulubionych"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      <span className="text-xs font-bold text-foreground bg-card px-2 py-1 rounded-full shadow-sm">
                        {fav.recipe_data.macros?.calories || 0} kcal
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-foreground mb-1">{fav.recipe_name}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {fav.recipe_data.description || 'Pyszny przepis z Twoich ulubionych'}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartCooking(fav.recipe_data)}
                      className="rounded-xl text-xs flex-1"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Gotuj
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(fav)}
                      className="rounded-xl text-xs"
                      title="Wyślij przepis"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog udostępniania przepisu */}
      {shareRecipe && (
        <ShareDialog
          open={!!shareRecipe}
          onOpenChange={(open) => !open && setShareRecipe(null)}
          type="recipe"
          itemId={shareRecipe.id}
          itemName={shareRecipe.recipe_name}
        />
      )}
    </>
  );
}
