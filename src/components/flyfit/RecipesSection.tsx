import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';

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

interface RecipesSectionProps {
  onStartCooking: (recipe: DetailedRecipe) => void;
}

export function RecipesSection({ onStartCooking }: RecipesSectionProps) {
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchFavoritesCount = async () => {
      try {
        const { count, error } = await supabase
          .from('favorite_recipes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!error && count !== null) {
          setFavoritesCount(count);
        }
      } catch (error) {
        console.error('Error fetching favorites count:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavoritesCount();
  }, [user]);

  const handleClick = () => {
    soundFeedback.buttonClick();
    navigate('/ulubione-przepisy');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded-3xl p-5 border-2 transition-all duration-300",
        "bg-gradient-to-r from-red-500 via-pink-500 to-orange-400",
        "border-transparent hover:scale-[1.02]",
        "hover:shadow-xl hover:shadow-red-500/25",
        "flex items-center justify-between gap-4",
        "animate-pulse-slow group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Heart className="w-7 h-7 text-white fill-white" />
        </div>
        <div className="text-left">
          <h3 className="font-bold font-display text-white text-lg flex items-center gap-2">
            Ulubione przepisy
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </h3>
          <p className="text-sm text-white/80">
            {loading ? 'Ładowanie...' : `${favoritesCount} zapisanych przepisów`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </button>
  );
}
