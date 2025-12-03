import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Timer, Utensils, ChefHat, Play, Pause, RotateCcw, Check, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
  ingredients_needed?: string[];
  tip?: string;
}

interface DetailedRecipe {
  name: string;
  ingredients: string[];
  description: string;
  servings: number;
  total_time_minutes: number;
  tools_needed: string[];
  steps: RecipeStep[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface CookingModeProps {
  recipe: DetailedRecipe;
  onClose: () => void;
}

export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = overview
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = recipe.steps?.length || 0;
  const step = currentStep >= 0 ? recipe.steps?.[currentStep] : null;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Vibrate when timer ends
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const startTimer = useCallback((minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  }, []);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  
  const resetTimer = () => {
    if (step?.duration_minutes) {
      setTimerSeconds(step.duration_minutes * 60);
      setTimerRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setTimerRunning(false);
    const newStep = recipe.steps?.[stepIndex];
    if (newStep?.duration_minutes) {
      setTimerSeconds(newStep.duration_minutes * 60);
    } else {
      setTimerSeconds(0);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      if (currentStep >= 0 && !completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > -1) {
      goToStep(currentStep - 1);
    }
  };

  const markStepComplete = () => {
    if (currentStep >= 0 && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    nextStep();
  };

  // Overview screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-3 z-10">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold font-display text-lg text-foreground truncate">{recipe.name}</h1>
              <p className="text-xs text-muted-foreground">Przegląd przepisu</p>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-6">
            {/* Time & Servings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{recipe.total_time_minutes} min</p>
                <p className="text-xs text-muted-foreground">Całkowity czas</p>
              </div>
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-4 border border-accent/20">
                <Utensils className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground">{recipe.servings}</p>
                <p className="text-xs text-muted-foreground">Porcje</p>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                Wartości odżywcze (na porcję)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-secondary">{recipe.macros.calories}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-destructive">{recipe.macros.protein}g</p>
                  <p className="text-[10px] text-muted-foreground">białko</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-accent">{recipe.macros.carbs}g</p>
                  <p className="text-[10px] text-muted-foreground">węgle</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{recipe.macros.fat}g</p>
                  <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                </div>
              </div>
            </div>

            {/* Tools needed */}
            {recipe.tools_needed && recipe.tools_needed.length > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" />
                  Potrzebne narzędzia
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tools_needed.map((tool, i) => (
                    <span key={i} className="bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-full text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* All ingredients */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Wszystkie składniki
              </h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                    <span className="text-sm text-foreground">{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps overview */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3">{totalSteps} kroków do wykonania</h3>
              <div className="space-y-2">
                {recipe.steps?.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                      completedSteps.includes(i) 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      completedSteps.includes(i) 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {completedSteps.includes(i) ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{s.instruction}</p>
                      {s.duration_minutes && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {s.duration_minutes} min
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start button */}
          <div className="sticky bottom-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
            <Button onClick={() => goToStep(0)} className="w-full rounded-2xl h-14 text-lg">
              <Play className="w-6 h-6 mr-2" />
              Zacznij gotować
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step view
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center gap-3">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold font-display text-foreground truncate">{recipe.name}</h1>
          <p className="text-xs text-muted-foreground">Krok {currentStep + 1} z {totalSteps}</p>
        </div>
        <button 
          onClick={() => goToStep(-1)} 
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
        >
          <ListChecks className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Step number badge */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-primary to-fitfly-purple w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{currentStep + 1}</span>
          </div>
        </div>

        {/* Instruction */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border shadow-card-playful">
          <p className="text-lg text-foreground leading-relaxed">{step?.instruction}</p>
          
          {step?.tip && (
            <div className="mt-4 bg-accent/10 rounded-xl p-3 border border-accent/20">
              <p className="text-sm text-accent-foreground">
                💡 <span className="font-medium">Wskazówka:</span> {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Timer */}
        {step?.duration_minutes && step.duration_minutes > 0 && (
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-3xl p-5 border-2 border-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-secondary" />
                <span className="font-bold text-foreground">Timer</span>
              </div>
              <span className="text-xs text-muted-foreground">{step.duration_minutes} min</span>
            </div>
            
            <div className="text-center mb-4">
              <span className={cn(
                "text-5xl font-mono font-bold transition-colors",
                timerSeconds === 0 && step.duration_minutes > 0 ? "text-primary animate-pulse" : "text-foreground"
              )}>
                {formatTime(timerSeconds)}
              </span>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={toggleTimer}
                variant={timerRunning ? "secondary" : "default"}
                size="lg"
                className="rounded-xl flex-1"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pauza
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Ingredients for this step */}
        {step?.ingredients_needed && step.ingredients_needed.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Utensils className="w-4 h-4 text-primary" />
              Składniki potrzebne w tym kroku
            </h4>
            <div className="flex flex-wrap gap-2">
              {step.ingredients_needed.map((ing, i) => (
                <span key={i} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-background border-t border-border p-4 flex gap-3">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          disabled={currentStep <= -1}
          className="rounded-xl flex-1"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {currentStep === 0 ? "Przegląd" : "Wstecz"}
        </Button>
        
        {currentStep < totalSteps - 1 ? (
          <Button onClick={markStepComplete} size="lg" className="rounded-xl flex-[2]">
            Gotowe, dalej
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={() => {
              markStepComplete();
              onClose();
            }} 
            size="lg" 
            className="rounded-xl flex-[2] bg-gradient-to-r from-primary to-fitfly-purple"
          >
            <Check className="w-5 h-5 mr-2" />
            Zakończ gotowanie
          </Button>
        )}
      </div>
    </div>
  );
}
