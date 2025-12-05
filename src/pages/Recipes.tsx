import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RecipesSection, DetailedRecipe } from '@/components/flyfit/RecipesSection';
import { CookingMode } from '@/components/flyfit/CookingMode';
import { MealCalendar } from '@/components/flyfit/MealCalendar';
import { soundFeedback } from '@/utils/soundFeedback';

export default function Recipes() {
  const navigate = useNavigate();
  const [cookingRecipe, setCookingRecipe] = useState<DetailedRecipe | null>(null);

  // Pokaż tryb gotowania jeśli aktywny
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header z nawigacją */}
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
          <div>
            <h1 className="text-xl font-extrabold font-display bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              Przepisy i posiłki
            </h1>
            <p className="text-xs text-muted-foreground">Odkryj pyszne i zdrowe przepisy! 🍳</p>
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="px-4 py-6 space-y-6">
        {/* Kalendarz posiłków */}
        <MealCalendar onStartCooking={setCookingRecipe} />
        
        {/* Sekcja przepisów AI */}
        <RecipesSection onStartCooking={setCookingRecipe} />
      </main>
    </div>
  );
}
