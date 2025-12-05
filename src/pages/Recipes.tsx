import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ChefHat } from 'lucide-react';
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
        {/* Zjedz coś na szybko - główny przycisk */}
        <button
          onClick={() => {
            soundFeedback.buttonClick();
            navigate('/szybki-posilek');
          }}
          className="w-full bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30 rounded-3xl p-6 border-2 border-accent/40 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 text-left shadow-card-playful"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center shadow-lg shrink-0">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold font-display text-foreground text-xl mb-1">Zjedz coś na szybko</h2>
              <p className="text-sm text-muted-foreground">Skanuj lodówkę lub wpisz składniki i znajdź idealny przepis ⚡</p>
            </div>
            <ChefHat className="w-6 h-6 text-accent" />
          </div>
        </button>

        {/* Kalendarz posiłków */}
        <MealCalendar onStartCooking={setCookingRecipe} />
        
        {/* Sekcja przepisów AI - ulubione */}
        <RecipesSection onStartCooking={setCookingRecipe} />
      </main>
    </div>
  );
}
