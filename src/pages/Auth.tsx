import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Lock, User, Sparkles, ArrowLeft, ArrowRight, Check, Target, Activity, Scale, Ruler, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import fitekDetective from '@/assets/fitek-detective.png';

const emailSchema = z.string().email('Nieprawidłowy adres email');
const passwordSchema = z.string().min(6, 'Hasło musi mieć minimum 6 znaków');

type AuthMode = 'login' | 'register' | 'forgot';
type Gender = 'male' | 'female' | null;
type Goal = 'lose' | 'maintain' | 'gain' | null;

interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  goalWeight: number;
  goal: Goal;
}

const initialRegistrationData: RegistrationData = {
  email: '',
  password: '',
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
  
  // Moderate activity multiplier
  const tdee = bmr * 1.55;
  
  if (goal === 'lose') return Math.round(tdee - 500);
  if (goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
};

// Calculate water intake
const calculateWater = (weight: number) => Math.round(weight * 35);

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState(1);
  const [regData, setRegData] = useState<RegistrationData>(initialRegistrationData);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateLoginForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(loginEmail);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(loginPassword);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterStep1 = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(regData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(regData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Nieprawidłowy email lub hasło');
        } else {
          toast.error('Błąd logowania');
        }
      } else {
        toast.success('Zalogowano! 🎉');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailResult = emailSchema.safeParse(loginEmail);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await resetPassword(loginEmail);
      if (error) {
        toast.error('Nie udało się wysłać emaila');
      } else {
        setResetSent(true);
        toast.success('Email wysłany! Sprawdź skrzynkę 📧');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (registerStep === 1 && !validateRegisterStep1()) return;
    if (registerStep === 2 && !regData.gender) {
      toast.error('Wybierz płeć');
      return;
    }
    if (registerStep === 3 && !regData.goal) {
      toast.error('Wybierz cel');
      return;
    }
    setRegisterStep(prev => prev + 1);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    // Calculate values before registration
    const calories = calculateCalories(regData.weight, regData.height, regData.age, regData.gender, regData.goal);
    const water = calculateWater(regData.weight);
    
    try {
      const { error } = await signUp(regData.email, regData.password, {
        displayName: regData.displayName,
        gender: regData.gender || undefined,
        age: regData.age,
        height: regData.height,
        weight: regData.weight,
        goalWeight: regData.goalWeight,
        goal: regData.goal || undefined,
        dailyCalories: calories,
        dailyWater: water,
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ten email jest już zarejestrowany');
        } else {
          toast.error('Błąd rejestracji');
        }
      } else {
        toast.success('Konto utworzone! 🎉');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Reset sent success view
  if (resetSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-40 h-40 mb-6 animate-float-slow">
          <img src={fitekDetective} alt="FITEK Detektyw" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        
        <div className="bg-card border-2 border-secondary/50 rounded-3xl p-8 shadow-card-playful text-center max-w-sm">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-xl font-bold font-display text-foreground mb-2">Sprawdź email! 📧</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Wysłaliśmy link do resetu hasła na adres <strong>{loginEmail}</strong>
          </p>
          <Button onClick={() => { setResetSent(false); setMode('login'); }} variant="outline" className="rounded-2xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do logowania
          </Button>
        </div>
      </div>
    );
  }

  // Registration multi-step form
  if (mode === 'register') {
    const bmi = calculateBMI(regData.weight, regData.height);
    const calories = calculateCalories(regData.weight, regData.height, regData.age, regData.gender, regData.goal);
    const water = calculateWater(regData.weight);
    
    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Niedowaga', color: 'text-accent' };
      if (bmi < 25) return { label: 'Prawidłowa waga', color: 'text-secondary' };
      if (bmi < 30) return { label: 'Nadwaga', color: 'text-accent' };
      return { label: 'Otyłość', color: 'text-destructive' };
    };
    
    const bmiCategory = getBMICategory(bmi);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6 relative z-10">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                registerStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {registerStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 5 && (
                <div className={cn(
                  'w-6 h-1 rounded-full mx-1 transition-all',
                  registerStep > step ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* FITEK */}
        <div className="w-32 h-32 mb-4 animate-float-slow relative z-10">
          <img src={fitekDetective} alt="FITEK" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Step 1: Account */}
          {registerStep === 1 && (
            <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
              <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Stwórz konto 🚀</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Dołącz do FLYFIT!</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Jak mamy Cię wołać?</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={regData.displayName}
                      onChange={(e) => setRegData({ ...regData, displayName: e.target.value })}
                      placeholder="Twoje imię"
                      className="pl-12 h-12 rounded-2xl border-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={regData.email}
                      onChange={(e) => { setRegData({ ...regData, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                      placeholder="twoj@email.pl"
                      className="pl-12 h-12 rounded-2xl border-2"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-xs font-medium">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold">Hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={regData.password}
                      onChange={(e) => { setRegData({ ...regData, password: e.target.value }); setErrors({ ...errors, password: undefined }); }}
                      placeholder="••••••••"
                      className="pl-12 h-12 rounded-2xl border-2"
                    />
                  </div>
                  {errors.password && <p className="text-destructive text-xs font-medium">{errors.password}</p>}
                </div>
              </div>
              
              <Button onClick={handleNextStep} className="w-full h-12 rounded-2xl font-bold mt-6">
                Dalej <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Gender */}
          {registerStep === 2 && (
            <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
              <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Kim jesteś? 🌟</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Pomoże nam to lepiej dopasować plan</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRegData({ ...regData, gender: 'female' })}
                  className={cn(
                    'p-6 rounded-3xl border-2 transition-all hover:-translate-y-1',
                    regData.gender === 'female'
                      ? 'border-pink-400 bg-pink-50 shadow-lg'
                      : 'border-border/50 bg-muted/30 hover:border-pink-300'
                  )}
                >
                  <div className="text-5xl mb-2">👩</div>
                  <p className="font-bold text-foreground">Kobieta</p>
                </button>
                
                <button
                  onClick={() => setRegData({ ...regData, gender: 'male' })}
                  className={cn(
                    'p-6 rounded-3xl border-2 transition-all hover:-translate-y-1',
                    regData.gender === 'male'
                      ? 'border-blue-400 bg-blue-50 shadow-lg'
                      : 'border-border/50 bg-muted/30 hover:border-blue-300'
                  )}
                >
                  <div className="text-5xl mb-2">👨</div>
                  <p className="font-bold text-foreground">Mężczyzna</p>
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setRegisterStep(1)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
                </Button>
                <Button onClick={handleNextStep} className="flex-1 h-12 rounded-2xl font-bold">
                  Dalej <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {registerStep === 3 && (
            <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
              <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Jaki jest Twój cel? 🎯</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Dopasujemy plan do Twoich potrzeb</p>
              
              <div className="space-y-3">
                {[
                  { id: 'lose', icon: '🔥', label: 'Schudnąć', desc: 'Redukcja masy ciała' },
                  { id: 'maintain', icon: '⚖️', label: 'Utrzymać wagę', desc: 'Zdrowy tryb życia' },
                  { id: 'gain', icon: '💪', label: 'Przytyć', desc: 'Budowa masy mięśniowej' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRegData({ ...regData, goal: item.id as Goal })}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all hover:-translate-y-0.5',
                      regData.goal === item.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border/50 bg-muted/30 hover:border-primary/50'
                    )}
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {regData.goal === item.id && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setRegisterStep(2)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
                </Button>
                <Button onClick={handleNextStep} className="flex-1 h-12 rounded-2xl font-bold">
                  Dalej <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Body data */}
          {registerStep === 4 && (
            <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
              <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Twoje dane 📊</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Potrzebujemy ich do obliczeń</p>
              
              <div className="space-y-6">
                {/* Age */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Wiek
                    </Label>
                    <span className="text-2xl font-extrabold font-display text-primary">{regData.age} lat</span>
                  </div>
                  <Slider
                    value={[regData.age]}
                    onValueChange={([val]) => setRegData({ ...regData, age: val })}
                    min={14}
                    max={80}
                    step={1}
                    className="py-2"
                  />
                </div>
                
                {/* Height */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-secondary" /> Wzrost
                    </Label>
                    <span className="text-2xl font-extrabold font-display text-secondary">{regData.height} cm</span>
                  </div>
                  <Slider
                    value={[regData.height]}
                    onValueChange={([val]) => setRegData({ ...regData, height: val })}
                    min={140}
                    max={220}
                    step={1}
                    className="py-2"
                  />
                </div>
                
                {/* Weight */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2">
                      <Scale className="w-4 h-4 text-accent" /> Waga
                    </Label>
                    <span className="text-2xl font-extrabold font-display text-accent">{regData.weight} kg</span>
                  </div>
                  <Slider
                    value={[regData.weight]}
                    onValueChange={([val]) => setRegData({ ...regData, weight: val })}
                    min={40}
                    max={150}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Goal weight */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-fitfly-purple" /> Waga docelowa
                    </Label>
                    <span className="text-2xl font-extrabold font-display text-fitfly-purple">{regData.goalWeight} kg</span>
                  </div>
                  <Slider
                    value={[regData.goalWeight]}
                    onValueChange={([val]) => setRegData({ ...regData, goalWeight: val })}
                    min={40}
                    max={150}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setRegisterStep(3)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
                </Button>
                <Button onClick={handleNextStep} className="flex-1 h-12 rounded-2xl font-bold">
                  Dalej <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {registerStep === 5 && (
            <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful animate-fade-in">
              <h2 className="text-xl font-bold font-display text-foreground text-center mb-1">Twój plan! 🎉</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Oto Twoje spersonalizowane wyniki</p>
              
              <div className="space-y-4">
                {/* BMI */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">BMI</span>
                    <span className={cn('text-sm font-bold', bmiCategory.color)}>{bmiCategory.label}</span>
                  </div>
                  <p className="text-3xl font-extrabold font-display text-foreground">{bmi.toFixed(1)}</p>
                </div>
                
                {/* Daily targets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <p className="text-2xl font-extrabold font-display text-secondary">{calories}</p>
                    <p className="text-xs text-muted-foreground font-medium">kcal/dzień</p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <p className="text-2xl font-extrabold font-display text-primary">{water}</p>
                    <p className="text-xs text-muted-foreground font-medium">ml wody/dzień</p>
                  </div>
                </div>
                
                {/* Macros */}
                <div className="bg-muted/50 rounded-2xl p-4">
                  <p className="text-sm font-bold text-foreground mb-3">Zalecane makro 🍽️</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-destructive">{Math.round(calories * 0.3 / 4)}g</p>
                      <p className="text-[10px] text-muted-foreground">Białko</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{Math.round(calories * 0.45 / 4)}g</p>
                      <p className="text-[10px] text-muted-foreground">Węgle</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">{Math.round(calories * 0.25 / 9)}g</p>
                      <p className="text-[10px] text-muted-foreground">Tłuszcze</p>
                    </div>
                  </div>
                </div>
                
                {/* Goal summary */}
                <div className="bg-fitfly-purple/10 rounded-2xl p-4 flex items-center gap-3">
                  <Target className="w-8 h-8 text-fitfly-purple" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {regData.goal === 'lose' ? 'Schudniesz' : regData.goal === 'gain' ? 'Przytyjesz' : 'Utrzymasz wagę'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {regData.weight !== regData.goalWeight 
                        ? `${Math.abs(regData.weight - regData.goalWeight)} kg ${regData.weight > regData.goalWeight ? 'mniej' : 'więcej'}`
                        : 'Idealna waga!'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setRegisterStep(4)} variant="outline" className="flex-1 h-12 rounded-2xl font-bold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
                </Button>
                <Button onClick={handleRegister} disabled={isLoading} className="flex-1 h-12 rounded-2xl font-bold bg-secondary hover:bg-secondary/90">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    </span>
                  ) : (
                    <>Zaczynamy! 🚀</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Back to login */}
        <button
          onClick={() => { setMode('login'); setRegisterStep(1); setRegData(initialRegistrationData); }}
          className="mt-6 text-muted-foreground text-sm font-medium hover:text-primary transition-colors relative z-10"
        >
          Masz już konto? <span className="font-bold text-primary">Zaloguj się</span>
        </button>
      </div>
    );
  }

  // Login / Forgot password form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="w-64 h-64 mb-4 animate-float-slow relative z-10">
        <img src={fitekDetective} alt="FITEK Detektyw" className="w-full h-full object-contain drop-shadow-2xl" />
      </div>

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-extrabold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
          {mode === 'forgot' ? 'Reset hasła' : 'FLYFIT'}
          <Sparkles className="w-6 h-6 text-fitfly-yellow" />
        </h1>
        <p className="text-muted-foreground font-medium">
          {mode === 'forgot' ? 'Wyślemy Ci link do zmiany hasła' : 'Witaj ponownie, przyjacielu!'}
        </p>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful">
          <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                  placeholder="twoj@email.pl"
                  className="pl-12 h-12 rounded-2xl border-2"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs font-medium">{errors.email}</p>}
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label className="font-bold">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                    placeholder="••••••••"
                    className="pl-12 h-12 rounded-2xl border-2"
                  />
                </div>
                {errors.password && <p className="text-destructive text-xs font-medium">{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                Nie pamiętasz hasła?
              </button>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl font-bold text-base">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                  {mode === 'login' ? 'Logowanie...' : 'Wysyłanie...'}
                </span>
              ) : (
                mode === 'login' ? 'Zaloguj się' : 'Wyślij link'
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          {mode === 'forgot' ? (
            <button onClick={() => setMode('login')} className="font-bold text-primary hover:underline flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Wróć do logowania
            </button>
          ) : (
            <>
              <p className="text-muted-foreground text-sm font-medium">Nie masz konta?</p>
              <button onClick={() => setMode('register')} className="mt-1 font-bold text-primary hover:underline">
                Zarejestruj się
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
