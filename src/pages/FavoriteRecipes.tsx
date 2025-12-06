import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Heart, Send, ArrowLeft, Loader2, Users, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { soundFeedback } from '@/utils/soundFeedback';
import { CookingMode } from '@/components/flyfit/CookingMode';
import { ShareDialog } from '@/components/flyfit/ShareDialog';
import { DetailedRecipe } from '@/components/flyfit/RecipesSection';

interface CookingRecipe {
  name: string;
  ingredients: string[];
  description: string;
  servings: number;
  total_time_minutes: number;
  tools_needed: string[];
  steps: { step_number: number; instruction: string; duration_minutes?: number; ingredients_needed?: string[]; tip?: string; }[];
  macros: { calories: number; protein: number; carbs: number; fat: number; };
}

interface FavoriteRecipe {
  id: string;
  recipe_name: string;
  recipe_data: DetailedRecipe & { mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' };
  created_at: string;
}

const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Śniadanie', emoji: '🌅' },
  lunch: { label: 'Obiad', emoji: '🍽️' },
  dinner: { label: 'Kolacja', emoji: '🌙' },
  snack: { label: 'Przekąska', emoji: '🍪' },
};

// Helper function to calculate calories from macros if missing
const getCalories = (recipe: DetailedRecipe & { mealType?: string }): number => {
  if (recipe.macros?.calories && recipe.macros.calories > 0) {
    return recipe.macros.calories;
  }
  if (recipe.macros) {
    const protein = recipe.macros.protein || 0;
    const carbs = recipe.macros.carbs || 0;
    const fat = recipe.macros.fat || 0;
    const calculated = (protein * 4) + (carbs * 4) + (fat * 9);
    if (calculated > 0) return Math.round(calculated);
  }
  return 350;
};

export default function FavoriteRecipes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [cookingRecipe, setCookingRecipe] = useState<CookingRecipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<FavoriteRecipe | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

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
    // Upewnij się, że wszystkie wymagane pola są ustawione
    const fullRecipe = {
      ...recipe,
      total_time_minutes: recipe.total_time_minutes || 30,
      tools_needed: recipe.tools_needed || [],
      steps: recipe.steps || []
    };
    setCookingRecipe(fullRecipe);
  };

  const handleShareFriend = (favorite: FavoriteRecipe) => {
    soundFeedback.buttonClick();
    setShareMenuOpen(null);
    setShareRecipe(favorite);
  };

  const handleCopyLink = async (favorite: FavoriteRecipe) => {
    soundFeedback.buttonClick();
    setShareMenuOpen(null);
    
    try {
      // Generuj publiczny link
      const shareToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from('shared_recipes')
        .insert({
          owner_id: user!.id,
          recipe_id: favorite.id,
          share_token: shareToken,
          is_public: true
        });
      
      if (error) throw error;
      
      const link = `${window.location.origin}/przepis/${shareToken}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link skopiowany do schowka! 📋');
      soundFeedback.success();
    } catch (error) {
      console.error('Error creating public link:', error);
      toast.error('Wystąpił błąd');
    }
  };

  const handleNativeShare = async (favorite: FavoriteRecipe) => {
    soundFeedback.buttonClick();
    setShareMenuOpen(null);
    
    try {
      // Generuj publiczny link
      const shareToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from('shared_recipes')
        .insert({
          owner_id: user!.id,
          recipe_id: favorite.id,
          share_token: shareToken,
          is_public: true
        });
      
      if (error) throw error;
      
      const link = `${window.location.origin}/przepis/${shareToken}`;
      
      if (navigator.share) {
        await navigator.share({
          title: favorite.recipe_name,
          text: `Sprawdź ten przepis: ${favorite.recipe_name}`,
          url: link
        });
        soundFeedback.success();
      } else {
        await navigator.clipboard.writeText(link);
        toast.success('Link skopiowany do schowka! 📋');
        soundFeedback.success();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Wystąpił błąd');
      }
    }
  };

  const getCalories = (recipe: DetailedRecipe): number => {
    if (recipe.macros?.calories && recipe.macros.calories > 0) {
      return recipe.macros.calories;
    }
    // Oblicz kalorie z makroskładników jeśli są dostępne
    if (recipe.macros) {
      const protein = recipe.macros.protein || 0;
      const carbs = recipe.macros.carbs || 0;
      const fat = recipe.macros.fat || 0;
      const calculated = (protein * 4) + (carbs * 4) + (fat * 9);
      if (calculated > 0) return Math.round(calculated);
    }
    return 350; // Domyślna wartość dla przepisu
  };

  if (cookingRecipe) {
    return <CookingMode recipe={cookingRecipe} onClose={() => setCookingRecipe(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/przepisy');
            }}
            className="rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h1 className="text-xl font-bold font-display text-foreground">Ulubione przepisy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Brak ulubionych przepisów</h2>
            <p className="text-muted-foreground">
              Dodaj przepisy do ulubionych klikając serduszko ❤️
            </p>
          </div>
        ) : (
          favorites.map((fav) => {
            const calories = getCalories(fav.recipe_data);
            const mealType = fav.recipe_data.mealType || 'lunch';
            
            return (
            <div
              key={fav.id}
              className="rounded-2xl p-4 border-2 border-red-400/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 transition-all duration-200 hover:-translate-y-0.5 relative"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {mealTypeLabels[mealType]?.emoji || '🍽️'}
                  </span>
                  <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400">
                    {mealTypeLabels[mealType]?.label || 'Posiłek'}
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
                    {calories} kcal
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
                
                {/* Menu udostępniania */}
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      soundFeedback.buttonClick();
                      setShareMenuOpen(shareMenuOpen === fav.id ? null : fav.id);
                    }}
                    className="rounded-xl text-xs"
                    title="Udostępnij przepis"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  {shareMenuOpen === fav.id && (
                    <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-2 min-w-48 z-20">
                      <button
                        onClick={() => handleShareFriend(fav)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                      >
                        <Users className="w-4 h-4 text-primary" />
                        <span>Wyślij znajomemu</span>
                      </button>
                      <button
                        onClick={() => handleCopyLink(fav)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                      >
                        <Link2 className="w-4 h-4 text-primary" />
                        <span>Kopiuj link</span>
                      </button>
                      <button
                        onClick={() => handleNativeShare(fav)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-primary" />
                        <span>Więcej opcji...</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* ShareDialog dla znajomych */}
      {shareRecipe && (
        <ShareDialog
          open={!!shareRecipe}
          onOpenChange={(open) => !open && setShareRecipe(null)}
          type="recipe"
          itemId={shareRecipe.id}
          itemName={shareRecipe.recipe_name}
        />
      )}
    </div>
  );
}