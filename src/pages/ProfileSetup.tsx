import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Target, Scale, Ruler, Calendar, Droplets, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import fitekDetective from '@/assets/fitek-detective.png';
import { supabase } from '@/integrations/supabase/client';

type Gender = 'male' | 'female' | null;
type Goal = 'lose' | 'maintain' | 'gain' | null;

interface ProfileSetupData {
  displayName: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  goalWeight: number;
  goal: Goal;
}

const initialData: ProfileSetupData = {
  displayName: '',
  gender: null,
  age: 25,
  height: 170,
  weight: 70,
  goalWeight: 65,
  goal: null,
};

// Calculate BMI
const calculateBMI = (weight: number, height: number) => {
  const heightInM = height / 100;
  return weight / (heightInM * heightInM);
};

// Calculate daily calorie needs (Mifflin-St Jeor)
const calculateCalories = (weight: number, height: number, age: number, gender: Gender, goal: Goal) => {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const tdee = bmr * 1.55;
  
  if (goal === 'lose') return Math.round(tdee - 500);
  if (goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
};

// Calculate water intake
const calculateWater = (weight: number) => Math.round(weight * 35);

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProfileSetupData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or if profile is already complete
  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, age, height, weight, goal')
        .eq('user_id', user.id)
        .maybeSingle();

      const isComplete = profile && 
        profile.gender && 
        profile.age && 
        profile.height && 
        profile.weight && 
        profile.goal;
      
      if (isComplete) {
        navigate('/');
        return;
      }

      // Pre-fill display name from Google account
      if (user?.user_metadata?.full_name) {
        setData(prev => ({ ...prev, displayName: user.user_metadata.full_name }));
      } else if (user?.user_metadata?.name) {
        setData(prev => ({ ...prev, displayName: user.user_metadata.name }));
      }

      setLoading(false);
    };

    checkProfile();
  }, [user, authLoading, navigate]);

  const handleNextStep = () => {
    if (step === 1 && !data.gender) {
      toast.error('Wybierz płeć');
      return;
    }
    if (step === 2 && !data.goal) {
      toast.error('Wybierz cel');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const calories = calculateCalories(data.weight, data.height, data.age, data.gender, data.goal);
    const water = calculateWater(data.weight);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          gender: data.gender,
          age: data.age,
          height: data.height,
          weight: data.weight,
          goal_weight: data.goalWeight,
          goal: data.goal,
          daily_calories: calories,
          daily_water: water,
        })
        .eq('user_id', user.id);
      
      if (error) {
        // If no profile exists, insert one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: data.displayName,
            gender: data.gender,
            age: data.age,
            height: data.height,
            weight: data.weight,
            goal_weight: data.goalWeight,
            goal: data.goal,
            daily_calories: calories,
            daily_water: water,
          });
        
        if (insertError) {
          toast.error('Błąd zapisywania profilu');
          return;
        }
      }
      
      toast.success('Profil zapisany! 🎉');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const bmi = calculateBMI(data.weight, data.height);
  const calories = calculateCalories(data.weight, data.height, data.age, data.gender, data.goal);
  const water = calculateWater(data.weight);
  
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Niedowaga', color: 'text-accent' };
    if (bmi < 25) return { label: 'Prawidłowa waga', color: 'text-secondary' };
    if (bmi < 30) return { label: 'Nadwaga', color: 'text-accent' };
    return { label: 'Otyłość', color: 'text-destructive' };
  };
  
  const bmiCategory = getBMICategory(bmi);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const stepInfo = [
    { icon: '👋', title: 'Poznajmy się!', desc: 'Powiedz nam jak masz na imię i wybierz płeć' },
    { icon: '🎯', title: 'Twój cel', desc: 'Wybierz co chcesz osiągnąć z FITKIEM' },
    { icon: '📊', title: 'Dane ciała', desc: 'Podaj podstawowe informacje o sobie' },
    { icon: '🎉', title: 'Gotowe!', desc: 'Oto Twój spersonalizowany plan' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-background">
      {/* Welcome header for step 1 */}
      {step === 1 && (
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Witaj w FITFLY! 🍎
          </h1>
          <p className="text-muted-foreground text-sm">
            Uzupełnij profil w 4 prostych krokach
          </p>
        </div>
      )}

      {/* Step indicator with labels */}
      <div className="w-full max-w-sm mb-6">
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full mb-3 overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
        
        {/* Step circles with icons */}
        <div className="flex justify-between">
          {stepInfo.map((info, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 border-2',
                step > idx + 1
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : step === idx + 1
                    ? 'bg-primary/20 border-primary text-foreground scale-110'
                    : 'bg-muted/50 border-muted text-muted-foreground'
              )}>
                {step > idx + 1 ? <Check className="w-5 h-5" /> : info.icon}
              </div>
              <span className={cn(
                'text-[10px] mt-1 font-medium transition-colors',
                step === idx + 1 ? 'text-primary' : 'text-muted-foreground'
              )}>
                {idx + 1}/4
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current step info bubble */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 mb-4 animate-fade-in">
        <p className="text-sm font-medium text-foreground text-center">
          <span className="mr-1">{stepInfo[step - 1].icon}</span>
          {stepInfo[step - 1].desc}
        </p>
      </div>

      {/* FITEK */}
      <div className="w-28 h-28 mb-4 animate-float-slow relative z-10">
        <img src={fitekDetective} alt="FITEK" className="w-full h-full object-contain drop-shadow-2xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Step 1: Gender */}
        {step === 1 && (
          <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
            <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Uzupełnij profil 🎯</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Powiedz nam o sobie</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold">Jak mamy Cię wołać?</Label>
                <Input
                  value={data.displayName}
                  onChange={(e) => setData({ ...data, displayName: e.target.value })}
                  placeholder="Twoje imię"
                  className="h-12 rounded-2xl border-2"
                />
              </div>

              <Label className="font-bold block">Płeć</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setData({ ...data, gender: 'male' })}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all text-center',
                    data.gender === 'male' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-3xl mb-2 block">👨</span>
                  <span className="font-bold text-sm">Mężczyzna</span>
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, gender: 'female' })}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all text-center',
                    data.gender === 'female' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-3xl mb-2 block">👩</span>
                  <span className="font-bold text-sm">Kobieta</span>
                </button>
              </div>
            </div>
            
            <Button onClick={handleNextStep} className="w-full mt-6 h-12 rounded-2xl font-bold">
              Dalej <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
            <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Twój cel 🎯</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Co chcesz osiągnąć?</p>
            
            <div className="space-y-3">
              {[
                { value: 'lose' as Goal, icon: '🔥', label: 'Schudnąć', desc: 'Zrzucić zbędne kilogramy' },
                { value: 'maintain' as Goal, icon: '⚖️', label: 'Utrzymać wagę', desc: 'Zostać w formie' },
                { value: 'gain' as Goal, icon: '💪', label: 'Przytyć', desc: 'Zbudować masę' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setData({ ...data, goal: option.value })}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4',
                    data.goal === option.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <span className="font-bold block">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </div>
                  {data.goal === option.value && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
              </Button>
              <Button onClick={handleNextStep} className="flex-1 h-12 rounded-2xl font-bold">
                Dalej <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Body data */}
        {step === 3 && (
          <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
            <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Dane ciała 📊</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Pomoże nam to dopasować plan</p>
            
            <div className="space-y-5">
              {/* Age */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Wiek
                  </Label>
                  <span className="text-lg font-bold text-primary">{data.age} lat</span>
                </div>
                <Slider
                  value={[data.age]}
                  onValueChange={([v]) => setData({ ...data, age: v })}
                  min={14}
                  max={80}
                  step={1}
                  className="py-2"
                />
              </div>
              
              {/* Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Wzrost
                  </Label>
                  <span className="text-lg font-bold text-primary">{data.height} cm</span>
                </div>
                <Slider
                  value={[data.height]}
                  onValueChange={([v]) => setData({ ...data, height: v })}
                  min={140}
                  max={220}
                  step={1}
                  className="py-2"
                />
              </div>
              
              {/* Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Waga
                  </Label>
                  <span className="text-lg font-bold text-primary">{data.weight} kg</span>
                </div>
                <Slider
                  value={[data.weight]}
                  onValueChange={([v]) => setData({ ...data, weight: v })}
                  min={40}
                  max={150}
                  step={1}
                  className="py-2"
                />
              </div>
              
              {/* Goal Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold flex items-center gap-2">
                    <Target className="w-4 h-4" /> Waga docelowa
                  </Label>
                  <span className="text-lg font-bold text-secondary">{data.goalWeight} kg</span>
                </div>
                <Slider
                  value={[data.goalWeight]}
                  onValueChange={([v]) => setData({ ...data, goalWeight: v })}
                  min={40}
                  max={150}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
              </Button>
              <Button onClick={handleNextStep} className="flex-1 h-12 rounded-2xl font-bold">
                Dalej <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
            <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Twój plan! 🎉</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Oto Twoje spersonalizowane cele</p>
            
            {/* BMI */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Twoje BMI</span>
                <span className={cn('font-bold', bmiCategory.color)}>{bmi.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent via-secondary to-destructive"
                  style={{ width: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%` }}
                />
              </div>
              <p className={cn('text-xs mt-1 font-medium', bmiCategory.color)}>{bmiCategory.label}</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-primary/10 rounded-2xl p-4 text-center">
                <Flame className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-primary">{calories}</p>
                <p className="text-xs text-muted-foreground">kcal dziennie</p>
              </div>
              <div className="bg-secondary/10 rounded-2xl p-4 text-center">
                <Droplets className="w-6 h-6 mx-auto mb-1 text-secondary" />
                <p className="text-2xl font-bold text-secondary">{(water / 1000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground">wody dziennie</p>
              </div>
            </div>
            
            {/* Macros */}
            <div className="bg-muted/50 rounded-2xl p-4">
              <p className="text-sm font-bold mb-3">Rozkład makroskładników</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-primary">{Math.round(calories * 0.3 / 4)}g</p>
                  <p className="text-xs text-muted-foreground">Białko</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-secondary">{Math.round(calories * 0.4 / 4)}g</p>
                  <p className="text-xs text-muted-foreground">Węgle</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-accent">{Math.round(calories * 0.3 / 9)}g</p>
                  <p className="text-xs text-muted-foreground">Tłuszcze</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
              </Button>
              <Button onClick={handleSaveProfile} disabled={isLoading} className="flex-1 h-12 rounded-2xl font-bold">
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>Zaczynamy! 🚀</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
