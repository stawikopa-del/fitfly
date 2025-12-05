import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Sparkles, Utensils, Cookie, Salad, Clock, Flame, ChefHat, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { soundFeedback } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';

interface MealPreferences {
  description: string;
  taste: 'sweet' | 'salty' | null;
  maxTime: number;
  maxCalories: number;
}

export default function QuickMeal() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<MealPreferences>({
    description: '',
    taste: null,
    maxTime: 30,
    maxCalories: 500
  });

  const timeOptions = [5, 10, 30, 60];

  const handleNavigateToMethod = (method: 'scan' | 'ingredients') => {
    soundFeedback.buttonClick();
    const params = new URLSearchParams({
      taste: preferences.taste || '',
      maxTime: preferences.maxTime.toString(),
      maxCalories: preferences.maxCalories.toString(),
      description: preferences.description
    });
    navigate(`/szybki-posilek/${method}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/przepisy');
            }}
            className="w-10 h-10 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold font-display bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              Zjedz coś na szybko
            </h1>
            <p className="text-xs text-muted-foreground">Znajdź idealny przepis dla siebie! ⚡</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/20 rounded-3xl p-6 border-2 border-accent/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold font-display text-foreground">Na co masz ochotę?</h2>
              <p className="text-xs text-muted-foreground">Opisz swoje pragnienia kulinarnie 🍽️</p>
            </div>
          </div>
          
          <Textarea
            value={preferences.description}
            onChange={(e) => setPreferences({ ...preferences, description: e.target.value })}
            placeholder="np. Chcę coś lekkiego i zdrowego na obiad, może z warzywami... Albo coś na słodko po treningu..."
            className="min-h-[100px] rounded-2xl border-2 border-border/50 bg-card/80 text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Taste Selection */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Słodkie czy słone?
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setPreferences({ ...preferences, taste: preferences.taste === 'sweet' ? null : 'sweet' });
              }}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                preferences.taste === 'sweet'
                  ? "bg-pink-500/20 border-pink-500 shadow-lg"
                  : "bg-card border-border/50 hover:border-pink-500/50"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                preferences.taste === 'sweet'
                  ? "bg-pink-500 text-white"
                  : "bg-pink-500/10 text-pink-500"
              )}>
                <Cookie className="w-7 h-7" />
              </div>
              <span className={cn(
                "font-bold text-sm",
                preferences.taste === 'sweet' ? "text-pink-500" : "text-foreground"
              )}>Słodkie</span>
            </button>

            <button
              onClick={() => {
                soundFeedback.buttonClick();
                setPreferences({ ...preferences, taste: preferences.taste === 'salty' ? null : 'salty' });
              }}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                preferences.taste === 'salty'
                  ? "bg-amber-500/20 border-amber-500 shadow-lg"
                  : "bg-card border-border/50 hover:border-amber-500/50"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                preferences.taste === 'salty'
                  ? "bg-amber-500 text-white"
                  : "bg-amber-500/10 text-amber-500"
              )}>
                <Salad className="w-7 h-7" />
              </div>
              <span className={cn(
                "font-bold text-sm",
                preferences.taste === 'salty' ? "text-amber-500" : "text-foreground"
              )}>Słone</span>
            </button>
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Ile masz czasu?
          </h3>
          
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => {
                  soundFeedback.buttonClick();
                  setPreferences({ ...preferences, maxTime: time });
                }}
                className={cn(
                  "p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1",
                  preferences.maxTime === time
                    ? "bg-secondary/20 border-secondary shadow-lg"
                    : "bg-card border-border/50 hover:border-secondary/50"
                )}
              >
                <span className={cn(
                  "font-bold text-lg",
                  preferences.maxTime === time ? "text-secondary" : "text-foreground"
                )}>{time}</span>
                <span className="text-[10px] text-muted-foreground">min</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calories Selection */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Flame className="w-5 h-5 text-destructive" />
              Maksimum kalorii
            </h3>
            <span className="text-lg font-bold text-destructive">{preferences.maxCalories} kcal</span>
          </div>
          
          <Slider
            value={[preferences.maxCalories]}
            onValueChange={([value]) => setPreferences({ ...preferences, maxCalories: value })}
            min={100}
            max={1500}
            step={50}
            className="w-full"
          />
          
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>100 kcal</span>
            <span>1500 kcal</span>
          </div>
        </div>

        {/* Method Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2 px-1">
            <ChefHat className="w-5 h-5 text-accent" />
            Wybierz metodę
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleNavigateToMethod('scan')}
              className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl p-5 border-2 border-accent/30 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 text-left flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center shadow-lg shrink-0">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-foreground text-lg mb-1">Skanuj lodówkę</h3>
                <p className="text-sm text-muted-foreground">Zrób zdjęcie zawartości lodówki i otrzymaj przepisy dopasowane do Twoich preferencji</p>
              </div>
            </button>

            <button
              onClick={() => handleNavigateToMethod('ingredients')}
              className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 text-left flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fitfly-purple flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-foreground text-lg mb-1">Wpisz składniki</h3>
                <p className="text-sm text-muted-foreground">Podaj składniki które masz pod ręką i wygeneruj idealne przepisy</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-muted/50 rounded-3xl p-5 border border-border/30">
          <h4 className="font-bold text-foreground text-sm mb-3">💡 Wskazówki</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Im dokładniej opiszesz swoje preferencje, tym lepsze przepisy otrzymasz</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Możesz pominąć niektóre filtry jeśli nie masz preferencji</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>FITEK dopasuje przepisy do Twoich celów zdrowotnych</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
