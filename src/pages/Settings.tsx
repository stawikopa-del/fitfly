import { useState } from 'react';
import { Bell, Moon, Volume2, Vibrate, Shield, HelpCircle, ChevronRight, LogOut, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    notifications: true,
    waterReminders: true,
    workoutReminders: true,
    challengeReminders: false,
    sounds: true,
    vibrations: true,
    darkMode: false,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Wylogowano pomyślnie');
    navigate('/auth');
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Ustawienia zapisane');
  };

  const settingsSections = [
    {
      title: 'Powiadomienia',
      icon: Bell,
      emoji: '🔔',
      items: [
        { key: 'notifications', label: 'Włącz powiadomienia', emoji: '📲' },
        { key: 'waterReminders', label: 'Przypomnienia o piciu wody', emoji: '💧' },
        { key: 'workoutReminders', label: 'Przypomnienia o treningu', emoji: '🏃' },
        { key: 'challengeReminders', label: 'Nowe wyzwania', emoji: '🏆' },
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
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Ustawienia ⚙️
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Dostosuj aplikację do swoich potrzeb
        </p>
      </header>

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
            {section.items.map((item) => (
              <div 
                key={item.key}
                className="flex items-center justify-between bg-muted/50 rounded-2xl p-4"
              >
                <Label 
                  htmlFor={item.key} 
                  className="text-sm text-foreground font-medium flex items-center gap-2 cursor-pointer"
                >
                  {item.label} {item.emoji}
                </Label>
                <Switch 
                  id={item.key}
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={() => toggleSetting(item.key as keyof typeof settings)}
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
              <Smartphone className="w-5 h-5" />
            </div>
            Edytuj profil 👤
          </span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-between rounded-3xl h-14 border-2 font-bold hover:-translate-y-1 transition-all"
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

      {/* Wyloguj */}
      <Button 
        variant="outline" 
        onClick={handleSignOut}
        className="w-full justify-between rounded-3xl h-14 border-2 border-destructive/30 text-destructive font-bold relative z-10 hover:-translate-y-1 transition-all hover:bg-destructive/10"
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          Wyloguj się
        </span>
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Wersja */}
      <p className="text-center text-xs text-muted-foreground relative z-10">
        FLYFIT v1.0.0 • Made with 💚
      </p>
    </div>
  );
}
