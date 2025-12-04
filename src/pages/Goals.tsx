import { useState, useEffect } from 'react';
import { ArrowLeft, Target, Plus, Trash2, Calculator, TrendingDown, TrendingUp, Loader2, Scale, Flame, Trophy, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { soundFeedback } from '@/utils/soundFeedback';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Goal {
  id: string;
  goal_type: string;
  current_value: number | null;
  target_value: number;
  target_date: string | null;
  daily_calories_recommendation: number | null;
  estimated_weeks: number | null;
  notes: string | null;
  is_achieved: boolean;
  created_at: string;
}

const GOAL_TYPES = [
  { value: 'weight_loss', label: 'Schudnąć', icon: TrendingDown, emoji: '🏃', color: 'text-blue-500' },
  { value: 'weight_gain', label: 'Przytyć', icon: TrendingUp, emoji: '💪', color: 'text-orange-500' },
  { value: 'maintain', label: 'Utrzymać wagę', icon: Scale, emoji: '⚖️', color: 'text-green-500' },
  { value: 'fitness', label: 'Poprawić kondycję', icon: Flame, emoji: '🔥', color: 'text-red-500' },
  { value: 'strength', label: 'Zbudować siłę', icon: Trophy, emoji: '🏆', color: 'text-purple-500' },
  { value: 'custom', label: 'Własny cel', icon: Target, emoji: '🎯', color: 'text-primary' },
];

export default function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{ weight: number | null; daily_calories: number | null } | null>(null);

  // Form state
  const [goalType, setGoalType] = useState('weight_loss');
  const [currentValue, setCurrentValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated values
  const [calculatedWeeks, setCalculatedWeeks] = useState<number | null>(null);
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchProfile();
    }
  }, [user]);

  // Calculate estimates when values change
  useEffect(() => {
    if (goalType === 'weight_loss' || goalType === 'weight_gain') {
      const current = parseFloat(currentValue);
      const target = parseFloat(targetValue);
      
      if (!isNaN(current) && !isNaN(target) && current !== target) {
        const diff = Math.abs(current - target);
        // Safe weight change: 0.5-1kg per week
        const weeksMin = Math.ceil(diff / 1);
        const weeksMax = Math.ceil(diff / 0.5);
        setCalculatedWeeks(Math.round((weeksMin + weeksMax) / 2));
        
        // Calorie adjustment: ~500-1000 kcal deficit/surplus per day for 0.5-1kg/week
        const baseCalories = profile?.daily_calories || 2000;
        if (goalType === 'weight_loss') {
          setCalculatedCalories(Math.max(1200, baseCalories - 500));
        } else {
          setCalculatedCalories(baseCalories + 400);
        }
      } else {
        setCalculatedWeeks(null);
        setCalculatedCalories(null);
      }
    }
  }, [currentValue, targetValue, goalType, profile]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('weight, daily_calories')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data && !error) {
      setProfile(data);
      if (data.weight) {
        setCurrentValue(data.weight.toString());
      }
    }
  };

  const fetchGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('goals' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals((data as unknown as Goal[]) || []);
    }
    setLoading(false);
  };

  const handleAddGoal = async () => {
    if (!user || !targetValue) return;

    soundFeedback.buttonClick();
    setSaving(true);

    const { error } = await supabase.from('goals' as any).insert({
      user_id: user.id,
      goal_type: goalType,
      current_value: currentValue ? parseFloat(currentValue) : null,
      target_value: parseFloat(targetValue),
      target_date: targetDate || null,
      daily_calories_recommendation: calculatedCalories,
      estimated_weeks: calculatedWeeks,
      notes: notes || null,
    });

    if (error) {
      console.error('Error adding goal:', error);
      toast.error('Nie udało się dodać celu');
    } else {
      toast.success('Cel dodany! 🎯');
      setShowAddDialog(false);
      resetForm();
      fetchGoals();
    }

    setSaving(false);
  };

  const handleDeleteGoal = async (id: string) => {
    soundFeedback.buttonClick();
    
    const { error } = await supabase.from('goals' as any).delete().eq('id', id);
    
    if (error) {
      toast.error('Nie udało się usunąć celu');
    } else {
      toast.success('Cel usunięty');
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleToggleAchieved = async (goal: Goal) => {
    soundFeedback.success();
    
    const { error } = await supabase
      .from('goals' as any)
      .update({ is_achieved: !goal.is_achieved })
      .eq('id', goal.id);
    
    if (error) {
      toast.error('Błąd aktualizacji');
    } else {
      if (!goal.is_achieved) {
        toast.success('Gratulacje! Cel osiągnięty! 🎉');
      }
      fetchGoals();
    }
  };

  const resetForm = () => {
    setGoalType('weight_loss');
    setCurrentValue(profile?.weight?.toString() || '');
    setTargetValue('');
    setTargetDate('');
    setNotes('');
    setCalculatedWeeks(null);
    setCalculatedCalories(null);
  };

  const getGoalTypeConfig = (type: string) => {
    return GOAL_TYPES.find(g => g.value === type) || GOAL_TYPES[5];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              soundFeedback.navTap();
              navigate('/inne');
            }}
            className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display text-foreground">
              Twoje Cele 🎯
            </h1>
            <p className="text-sm text-muted-foreground">Ustal i śledź swoje cele</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              soundFeedback.buttonClick();
              resetForm();
              setShowAddDialog(true);
            }}
            className="rounded-xl bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" /> Dodaj
          </Button>
        </div>
      </header>

      <div className="px-5 py-6 pb-32 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              resetForm();
              setShowAddDialog(true);
            }}
            className="w-full p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">Ustaw swój pierwszy cel!</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Określ cel wagowy lub fitness i sprawdź ile czasu zajmie jego osiągnięcie
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mt-2">
                <Plus className="w-5 h-5" /> Dodaj cel
              </div>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
                <p className="text-2xl font-bold text-foreground">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Wszystkie</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
                <p className="text-2xl font-bold text-green-500">{goals.filter(g => g.is_achieved).length}</p>
                <p className="text-xs text-muted-foreground">Osiągnięte</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
                <p className="text-2xl font-bold text-primary">{goals.filter(g => !g.is_achieved).length}</p>
                <p className="text-xs text-muted-foreground">W trakcie</p>
              </div>
            </div>

            {/* Goals list */}
            {goals.map((goal) => {
              const config = getGoalTypeConfig(goal.goal_type);
              
              return (
                <div
                  key={goal.id}
                  className={cn(
                    "p-5 rounded-2xl bg-card border-2 shadow-card-playful transition-all",
                    goal.is_achieved 
                      ? "border-green-500/50 bg-green-500/5" 
                      : "border-border/50 hover:-translate-y-0.5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      goal.is_achieved ? "bg-green-500" : "bg-primary/10"
                    )}>
                      <span className="text-3xl">{config.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("font-bold text-foreground text-lg", goal.is_achieved && "line-through opacity-70")}>
                          {config.label}
                        </p>
                        {goal.is_achieved && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                            ✓ Osiągnięty!
                          </span>
                        )}
                      </div>
                      
                      {(goal.goal_type === 'weight_loss' || goal.goal_type === 'weight_gain') && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">{goal.current_value} kg</span>
                          <ChevronRight className="w-4 h-4" />
                          <span className="font-bold text-foreground">{goal.target_value} kg</span>
                          <span className="text-xs">({goal.goal_type === 'weight_loss' ? '-' : '+'}{Math.abs((goal.current_value || 0) - goal.target_value).toFixed(1)} kg)</span>
                        </div>
                      )}
                      
                      {goal.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{goal.notes}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {goal.estimated_weeks && (
                          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            ~{goal.estimated_weeks} tyg.
                          </span>
                        )}
                        {goal.daily_calories_recommendation && (
                          <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-medium flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5" />
                            {goal.daily_calories_recommendation} kcal/dzień
                          </span>
                        )}
                        {goal.target_date && (
                          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 text-xs font-medium">
                            📅 Do: {formatDate(goal.target_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAchieved(goal)}
                      className={cn(
                        "flex-1 rounded-xl",
                        goal.is_achieved ? "text-green-500 border-green-500/50" : ""
                      )}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {goal.is_achieved ? 'Przywróć' : 'Oznacz jako osiągnięty'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="rounded-xl text-destructive hover:text-destructive border-destructive/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold font-display text-center flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Nowy cel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Goal Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Typ celu</Label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setGoalType(type.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all flex items-center gap-2",
                      goalType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    <span className="text-xl">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight fields for weight goals */}
            {(goalType === 'weight_loss' || goalType === 'weight_gain' || goalType === 'maintain') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Aktualna waga (kg)</Label>
                  <Input
                    type="number"
                    placeholder="np. 75"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Cel wagowy (kg)</Label>
                  <Input
                    type="number"
                    placeholder="np. 70"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Target value for other goals */}
            {(goalType === 'fitness' || goalType === 'strength' || goalType === 'custom') && (
              <div className="space-y-2">
                <Label className="text-sm font-bold">Wartość docelowa</Label>
                <Input
                  type="number"
                  placeholder="np. 10 (powtórzeń, km, itd.)"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Calculated estimates */}
            {(calculatedWeeks || calculatedCalories) && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">Szacunkowe obliczenia</span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="space-y-2 text-sm">
                  {calculatedWeeks && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Czas osiągnięcia:</span>
                      <span className="font-bold text-foreground">~{calculatedWeeks} tygodni</span>
                    </div>
                  )}
                  {calculatedCalories && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Zalecane kalorie:</span>
                      <span className="font-bold text-foreground">{calculatedCalories} kcal/dzień</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    💡 Bezpieczne tempo to 0.5-1 kg tygodniowo. Dostosuj dietę i aktywność do swoich możliwości.
                  </p>
                </div>
              </div>
            )}

            {/* Target date */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Data docelowa (opcjonalnie)</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="rounded-xl"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Notatka (opcjonalnie)</Label>
              <Input
                placeholder="np. Chcę schudnąć na wakacje"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleAddGoal}
              disabled={saving || !targetValue}
              className="w-full rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              Dodaj cel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
