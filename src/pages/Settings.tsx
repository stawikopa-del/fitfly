import { useState, useEffect } from 'react';
import { Bell, Volume2, Shield, HelpCircle, ChevronRight, LogOut, Fingerprint, Trash2, Settings as SettingsIcon, Utensils, Clock, Plus, Minus } from 'lucide-react';
import { PageHeader } from '@/components/flyfit/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Default meal configurations
const defaultMealConfigs: Record<number, { name: string; time: string; emoji: string }[]> = {
  3: [
    { name: 'Śniadanie', time: '08:00', emoji: '🌅' },
    { name: 'Obiad', time: '13:00', emoji: '🍽️' },
    { name: 'Kolacja', time: '19:00', emoji: '🌙' },
  ],
  4: [
    { name: 'Śniadanie', time: '08:00', emoji: '🌅' },
    { name: 'Obiad', time: '13:00', emoji: '🍽️' },
    { name: 'Przekąska', time: '16:00', emoji: '🍪' },
    { name: 'Kolacja', time: '19:00', emoji: '🌙' },
  ],
  5: [
    { name: 'Śniadanie', time: '07:30', emoji: '🌅' },
    { name: 'Drugie śniadanie', time: '10:30', emoji: '🥐' },
    { name: 'Obiad', time: '13:00', emoji: '🍽️' },
    { name: 'Podwieczorek', time: '16:00', emoji: '☕' },
    { name: 'Kolacja', time: '19:00', emoji: '🌙' },
  ],
  6: [
    { name: 'Śniadanie', time: '07:00', emoji: '🌅' },
    { name: 'Drugie śniadanie', time: '10:00', emoji: '🥐' },
    { name: 'Obiad', time: '13:00', emoji: '🍽️' },
    { name: 'Podwieczorek', time: '16:00', emoji: '☕' },
    { name: 'Kolacja', time: '19:00', emoji: '🌙' },
    { name: 'Deser', time: '21:00', emoji: '🍰' },
  ],
};

const extraMealNames = [
  { name: 'Podwieczorek', emoji: '☕' },
  { name: 'Drugie śniadanie', emoji: '🥐' },
  { name: 'Deser', emoji: '🍰' },
  { name: 'Przekąska wieczorna', emoji: '🌜' },
  { name: 'Smoothie', emoji: '🥤' },
  { name: 'Lekka przekąska', emoji: '🥗' },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isSupported: isBiometricSupported, hasRegisteredBiometric, registerBiometric, removeBiometric, isRegistering } = useWebAuthn();
  
  const navigate = useNavigate();

  // Initialize from localStorage safely
  const getInitialSettings = () => {
    if (typeof window === 'undefined') {
      return {
        notifications: false,
        waterReminders: true,
        workoutReminders: true,
        challengeReminders: false,
        sounds: false,
        vibrations: true,
        darkMode: false,
        biometricLogin: false,
      };
    }
    try {
      const saved = localStorage.getItem('fitfly-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parsing errors
    }
    return {
      notifications: false,
      waterReminders: true,
      workoutReminders: true,
      challengeReminders: false,
      sounds: false,
      vibrations: true,
      darkMode: false,
      biometricLogin: false,
    };
  };

  const [settings, setSettings] = useState(getInitialSettings);

  // Meal personalization state
  const [mealsCount, setMealsCount] = useState(4);
  const [mealSchedule, setMealSchedule] = useState(defaultMealConfigs[4]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  // Load settings from localStorage on mount (SSR safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('fitfly-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Load meal settings from Supabase
  useEffect(() => {
    const loadMealSettings = async () => {
      if (!user) {
        setIsLoadingMeals(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('meals_count, meal_schedule')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          if (data.meals_count) {
            setMealsCount(data.meals_count);
          }
          if (data.meal_schedule && Array.isArray(data.meal_schedule)) {
            setMealSchedule(data.meal_schedule as typeof mealSchedule);
          }
        }
      } catch (e) {
        console.error('Error loading meal settings:', e);
      } finally {
        setIsLoadingMeals(false);
      }
    };
    
    loadMealSettings();
  }, [user]);

  // Save meal settings to Supabase
  const saveMealSettings = async (count: number, schedule: typeof mealSchedule) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          meals_count: count,
          meal_schedule: schedule,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Ustawienia posiłków zapisane! 🍽️');
    } catch (e) {
      console.error('Error saving meal settings:', e);
      toast.error('Nie udało się zapisać ustawień');
    }
  };

  const handleMealsCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 8) return;
    
    setMealsCount(newCount);
    
    // Use default config if available, otherwise generate custom
    if (defaultMealConfigs[newCount]) {
      setMealSchedule(defaultMealConfigs[newCount]);
      saveMealSettings(newCount, defaultMealConfigs[newCount]);
    } else {
      // Generate custom meal schedule
      const baseMeals = defaultMealConfigs[4];
      const newSchedule = [...baseMeals];
      
      // Add or remove meals as needed
      while (newSchedule.length < newCount) {
        const extraIndex = (newSchedule.length - 4) % extraMealNames.length;
        const extraMeal = extraMealNames[extraIndex];
        const lastMealTime = newSchedule[newSchedule.length - 1]?.time || '19:00';
        const [hours] = lastMealTime.split(':').map(Number);
        const newHours = Math.min(hours + 2, 22);
        newSchedule.push({
          name: extraMeal.name,
          time: `${newHours.toString().padStart(2, '0')}:00`,
          emoji: extraMeal.emoji,
        });
      }
      
      while (newSchedule.length > newCount) {
        newSchedule.pop();
      }
      
      setMealSchedule(newSchedule);
      saveMealSettings(newCount, newSchedule);
    }
  };

  const handleMealTimeChange = (index: number, newTime: string) => {
    const updated = [...mealSchedule];
    updated[index] = { ...updated[index], time: newTime };
    setMealSchedule(updated);
    saveMealSettings(mealsCount, updated);
  };

  const handleMealNameChange = (index: number, newName: string) => {
    const updated = [...mealSchedule];
    updated[index] = { ...updated[index], name: newName };
    setMealSchedule(updated);
    saveMealSettings(mealsCount, updated);
  };

  // Check if biometric is already registered
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      biometricLogin: hasRegisteredBiometric(),
    }));
  }, [hasRegisteredBiometric]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Wylogowano pomyślnie');
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete user data from profiles table - wrap each in try/catch
      const deleteOps = [
        supabase.from('profiles').delete().eq('user_id', user.id),
        supabase.from('daily_progress').delete().eq('user_id', user.id),
        supabase.from('meals').delete().eq('user_id', user.id),
        supabase.from('chat_messages').delete().eq('user_id', user.id),
        supabase.from('calendar_events').delete().eq('user_id', user.id),
        supabase.from('favorite_recipes').delete().eq('user_id', user.id),
      ];
      
      await Promise.allSettled(deleteOps);
      
      // Sign out the user
      await signOut();
      toast.success('Konto zostało usunięte');
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Nie udało się usunąć konta');
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // Persist to localStorage
    try {
      localStorage.setItem('fitfly-settings', JSON.stringify(newSettings));
    } catch {
      // Ignore storage errors
    }
    
    toast.success('Ustawienia zapisane');
  };

  const handleBiometricToggle = async () => {
    if (!user) return;

    if (settings.biometricLogin) {
      // Disable biometric - only remove WebAuthn credential
      removeBiometric();
      setSettings(prev => ({ ...prev, biometricLogin: false }));
      toast.success('Face ID wyłączone');
    } else {
      // Enable biometric - register WebAuthn credential (no token storage for security)
      const result = await registerBiometric(user.id, user.email || '');
      if (result.success) {
        setSettings(prev => ({ ...prev, biometricLogin: true }));
        toast.success('Face ID włączone! 🎉');
      } else {
        toast.error(result.error || 'Nie udało się włączyć Face ID');
      }
    }
  };

  const settingsSections = [
    {
      title: 'Powiadomienia',
      icon: Bell,
      emoji: '🔔',
      items: [
        { key: 'notifications', label: 'Włącz powiadomienia', emoji: '📲', disabled: true, note: '(wkrótce)' },
        { key: 'waterReminders', label: 'Przypomnienia o piciu wody', emoji: '💧', disabled: true, note: '(wkrótce)' },
        { key: 'workoutReminders', label: 'Przypomnienia o treningu', emoji: '🏃', disabled: true, note: '(wkrótce)' },
        { key: 'challengeReminders', label: 'Nowe wyzwania', emoji: '🏆', disabled: true, note: '(wkrótce)' },
      ],
    },
    {
      title: 'Dźwięki i wibracje',
      icon: Volume2,
      emoji: '🔊',
      items: [
        { key: 'sounds', label: 'Dźwięki aplikacji', emoji: '🎵' },
        { key: 'vibrations', label: 'Wibracje', emoji: '📳' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Ustawienia" emoji="⚙️" icon={<SettingsIcon className="w-5 h-5 text-primary" />} />
      <div className="px-4 py-4 space-y-6 pb-24">

      {/* Biometric Login Section */}
      {isBiometricSupported && (
        <div className="bg-card rounded-3xl p-5 border-2 border-primary/30 shadow-card-playful animate-float">
          <h2 className="font-bold font-display text-foreground mb-4 flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-primary" />
            </div>
            Logowanie biometryczne 🔐
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
              <div className="flex-1">
                <Label 
                  htmlFor="biometricLogin" 
                  className="text-sm text-foreground font-medium flex items-center gap-2 cursor-pointer"
                >
                  Face ID / Touch ID 📱
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Loguj się szybciej używając biometrii
                </p>
              </div>
              <Switch 
                id="biometricLogin"
                checked={settings.biometricLogin}
                onCheckedChange={handleBiometricToggle}
                disabled={isRegistering}
              />
            </div>
          </div>
        </div>
      )}

      {/* Meal Personalization Section */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10 animate-float">
        <h2 className="font-bold font-display text-foreground mb-4 flex items-center gap-2 text-lg">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary" />
          </div>
          Personalizacja posiłków 🍽️
        </h2>
        
        {/* Meals count selector */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-foreground font-medium">
              Liczba posiłków dziennie
            </Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMealsCountChange(mealsCount - 1)}
                disabled={mealsCount <= 2}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  mealsCount <= 2 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-foreground w-8 text-center">{mealsCount}</span>
              <button
                onClick={() => handleMealsCountChange(mealsCount + 1)}
                disabled={mealsCount >= 8}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  mealsCount >= 8 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Dostosuj ilość posiłków do swojego planu żywieniowego
          </p>
        </div>

        {/* Meal schedule */}
        <div className="space-y-2">
          <Label className="text-sm text-foreground font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Harmonogram posiłków
          </Label>
          <div className="space-y-2">
            {mealSchedule.map((meal, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-muted/30 rounded-xl p-3"
              >
                <span className="text-lg">{meal.emoji}</span>
                <Input
                  value={meal.name}
                  onChange={(e) => handleMealNameChange(index, e.target.value)}
                  className="flex-1 h-9 rounded-xl border-border/50 bg-background text-sm font-medium"
                  placeholder="Nazwa posiłku"
                  maxLength={30}
                />
                <Input
                  type="time"
                  value={meal.time}
                  onChange={(e) => handleMealTimeChange(index, e.target.value)}
                  className="w-24 h-9 rounded-xl border-border/50 bg-background text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Settings sections */}
      {settingsSections.map((section) => (
        <div 
          key={section.title}
          className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10 animate-float"
        >
          <h2 className="font-bold font-display text-foreground mb-4 flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <section.icon className="w-5 h-5 text-primary" />
            </div>
            {section.title} {section.emoji}
          </h2>
          
          <div className="space-y-3">
            {section.items.map((item: any) => (
              <div 
                key={item.key}
                className={cn(
                  "flex items-center justify-between bg-muted/50 rounded-2xl p-4",
                  item.disabled && "opacity-60"
                )}
              >
                <Label 
                  htmlFor={item.key} 
                  className="text-sm text-foreground font-medium flex items-center gap-2 cursor-pointer"
                >
                  {item.label} {item.emoji} {item.note && <span className="text-xs text-muted-foreground">{item.note}</span>}
                </Label>
                <Switch 
                  id={item.key}
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={() => toggleSetting(item.key as keyof typeof settings)}
                  disabled={item.disabled}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Inne opcje */}
      <div className="space-y-3 relative z-10">
        <Button 
          variant="outline" 
          className="w-full justify-between rounded-3xl h-14 border-2 font-bold hover:-translate-y-1 transition-all"
          onClick={() => navigate('/profil')}
        >
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            Edytuj profil 👤
          </span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-between rounded-3xl h-14 border-2 font-bold hover:-translate-y-1 transition-all"
          onClick={() => navigate('/prywatnosc')}
        >
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            Prywatność i bezpieczeństwo 🔒
          </span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-between rounded-3xl h-14 border-2 font-bold hover:-translate-y-1 transition-all"
          onClick={() => navigate('/pomoc')}
        >
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            Pomoc i wsparcie ❓
          </span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Wyloguj i Usuń konto */}
      <div className="space-y-3 relative z-10">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full justify-between rounded-3xl h-14 border-2 border-destructive/30 text-destructive font-bold hover:-translate-y-1 transition-all hover:bg-destructive/10"
        >
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            Wyloguj się
          </span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between rounded-3xl h-14 border-2 border-destructive text-destructive font-bold hover:-translate-y-1 transition-all hover:bg-destructive hover:text-destructive-foreground"
            >
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                Usuń konto 🗑️
              </span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl">
                Czy na pewno chcesz usunąć konto? 😢
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Ta akcja jest nieodwracalna. Wszystkie Twoje dane, postępy, przepisy i historia czatu zostaną trwale usunięte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Anuluj</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl"
              >
                Usuń konto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Wersja */}
      <p className="text-center text-xs text-muted-foreground relative z-10">
        FITFLY v1.0.0 • Made with 💚
      </p>
      </div>
    </div>
  );
}
