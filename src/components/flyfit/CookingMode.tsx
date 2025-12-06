import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Timer, Utensils, ChefHat, Play, Pause, RotateCcw, Check, ListChecks, AlertCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';

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
  const [timerEnded, setTimerEnded] = useState(false);
  const timerEndedRef = useRef(false);

  const totalSteps = recipe.steps?.length || 0;
  const step = currentStep >= 0 ? recipe.steps?.[currentStep] : null;

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerEnded(true);
            timerEndedRef.current = true;
            
            // Play sound and vibrate when timer ends
            try {
              soundFeedback.success();
            } catch (e) {
              // Sound not supported
            }
            
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
              } catch (e) {
                // Vibration not supported
              }
            }
            return 0;
          }
          
          // Tick sound every second when timer < 10 seconds
          if (prev <= 10 && prev > 1) {
            try {
              soundFeedback.buttonClick();
            } catch (e) {}
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
    setTimerEnded(false);
    timerEndedRef.current = false;
  }, []);

  const toggleTimer = () => {
    if (!timerRunning && timerSeconds === 0 && step?.duration_minutes) {
      // Start fresh timer
      startTimer(step.duration_minutes);
    } else {
      setTimerRunning(!timerRunning);
    }
    setTimerEnded(false);
  };
  
  const resetTimer = () => {
    if (step?.duration_minutes) {
      setTimerSeconds(step.duration_minutes * 60);
      setTimerRunning(false);
      setTimerEnded(false);
      timerEndedRef.current = false;
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
    setTimerEnded(false);
    timerEndedRef.current = false;
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
      soundFeedback.success();
    }
  };

  const prevStep = () => {
    if (currentStep > -1) {
      goToStep(currentStep - 1);
      soundFeedback.buttonClick();
    }
  };

  const markStepComplete = () => {
    if (currentStep >= 0 && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    nextStep();
  };

  // Determine if step requires waiting/timing
  const stepRequiresTimer = step?.duration_minutes && step.duration_minutes > 0;
  const stepIsWaiting = step?.instruction?.toLowerCase().includes('poczekaj') || 
                        step?.instruction?.toLowerCase().includes('odczekaj') ||
                        step?.instruction?.toLowerCase().includes('gotuj przez') ||
                        step?.instruction?.toLowerCase().includes('piecz przez') ||
                        step?.instruction?.toLowerCase().includes('smaż przez') ||
                        step?.instruction?.toLowerCase().includes('odstaw na') ||
                        step?.instruction?.toLowerCase().includes('pozostaw na');

  // Overview screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold font-display text-lg text-foreground truncate">{recipe.name}</h1>
            <p className="text-xs text-muted-foreground">Przegląd przepisu</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
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
                  <p className="text-lg font-bold text-secondary">{recipe.macros?.calories || 0}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-destructive">{recipe.macros?.protein || 0}g</p>
                  <p className="text-[10px] text-muted-foreground">białko</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-accent">{recipe.macros?.carbs || 0}g</p>
                  <p className="text-[10px] text-muted-foreground">węgle</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{recipe.macros?.fat || 0}g</p>
                  <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                </div>
              </div>
            </div>

            {/* Tools needed */}
            {recipe.tools_needed && recipe.tools_needed.length > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" />
                  Potrzebny sprzęt
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tools_needed.map((tool, i) => (
                    <span key={i} className="bg-accent/20 text-foreground px-3 py-1.5 rounded-full text-sm font-medium">
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
                {recipe.ingredients?.map((ing, i) => (
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
                      {s.duration_minutes && s.duration_minutes > 0 && (
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
        <div className="p-4 bg-background border-t border-border shrink-0">
          <Button 
            onClick={() => {
              goToStep(0);
              soundFeedback.buttonClick();
            }} 
            className="w-full rounded-2xl h-14 text-lg"
          >
            <Play className="w-6 h-6 mr-2" />
            Zacznij gotować
          </Button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (currentStep >= totalSteps) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-fitfly-purple flex items-center justify-center mb-6 animate-bounce">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Gotowe! 🎉</h1>
          <p className="text-muted-foreground mb-8">
            Udało Ci się przygotować <span className="font-bold text-foreground">{recipe.name}</span>!
          </p>
          <p className="text-sm text-muted-foreground mb-2">Ukończono {completedSteps.length} z {totalSteps} kroków</p>
          <div className="w-full max-w-xs bg-muted rounded-full h-2 mb-8">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
            />
          </div>
          <Button onClick={onClose} size="lg" className="rounded-2xl">
            Zakończ
          </Button>
        </div>
      </div>
    );
  }

  // Step view
  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
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
      <div className="h-1.5 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary to-fitfly-purple transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
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

        {/* Timer - pokazuj tylko gdy krok wymaga czasu */}
        {stepRequiresTimer && (
          <div className={cn(
            "rounded-3xl p-5 border-2 transition-all duration-300",
            timerEnded 
              ? "bg-gradient-to-br from-primary/30 to-primary/10 border-primary/50 animate-pulse" 
              : timerRunning 
                ? "bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/40"
                : "bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className={cn(
                  "w-5 h-5",
                  timerEnded ? "text-primary" : "text-secondary"
                )} />
                <span className="font-bold text-foreground">
                  {timerEnded ? "Czas minął!" : stepIsWaiting ? "Czas oczekiwania" : "Timer"}
                </span>
              </div>
              {!timerEnded && (
                <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                  {step?.duration_minutes} min
                </span>
              )}
            </div>
            
            <div className="text-center mb-4">
              <span className={cn(
                "text-5xl font-mono font-bold transition-all",
                timerEnded 
                  ? "text-primary animate-pulse" 
                  : timerRunning 
                    ? "text-secondary"
                    : "text-foreground"
              )}>
                {formatTime(timerSeconds)}
              </span>
            </div>

            {timerEnded && (
              <div className="flex items-center justify-center gap-2 mb-4 text-primary">
                <Volume2 className="w-5 h-5 animate-bounce" />
                <span className="font-medium">Gotowe! Przejdź do następnego kroku</span>
              </div>
            )}

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
                ) : timerEnded ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Od nowa
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {timerSeconds === 0 ? 'Rozpocznij' : 'Wznów'}
                  </>
                )}
              </Button>
              {!timerEnded && (
                <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Ingredients for this step */}
        {step?.ingredients_needed && step.ingredients_needed.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Utensils className="w-4 h-4 text-primary" />
              Składniki potrzebne teraz
            </h4>
            <div className="space-y-2">
              {step.ingredients_needed.map((ing, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-primary/5 rounded-xl">
                  <div className="w-3 h-3 rounded-full bg-primary/50 shrink-0" />
                  <span className="text-sm text-foreground font-medium">{ing}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hint if no specific ingredients for this step */}
        {(!step?.ingredients_needed || step.ingredients_needed.length === 0) && currentStep > 0 && (
          <div className="bg-muted/30 rounded-2xl p-3 border border-border/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Ten krok wykorzystuje składniki z poprzednich etapów
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-background border-t border-border p-4 flex gap-3 shrink-0">
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
          <Button 
            onClick={markStepComplete} 
            size="lg" 
            className={cn(
              "rounded-xl flex-[2]",
              timerEnded && "animate-pulse bg-gradient-to-r from-primary to-fitfly-purple"
            )}
          >
            {timerEnded ? "Czas minął! Dalej" : "Gotowe, dalej"}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={() => {
              markStepComplete();
              soundFeedback.success();
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
