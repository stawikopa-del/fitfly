import { useState } from 'react';
import { Shield, Eye, Lock, Trash2, Download, Server, ChevronRight, ArrowLeft, Mail, Key, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Privacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Hasło musi mieć minimum 8 znaków');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Hasła nie są identyczne');
      return;
    }
    
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error('Nie udało się zmienić hasła');
    } else {
      toast.success('Hasło zostało zmienione! 🔒');
      setNewPassword('');
      setConfirmPassword('');
      setLoginDialogOpen(false);
    }
    setIsChangingPassword(false);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/inne')}
          className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold font-display text-foreground">
            Prywatność 🔒
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Twoje dane są u nas bezpieczne
          </p>
        </div>
      </header>

      {/* Główna sekcja */}
      <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-bold font-display text-foreground text-center text-lg mb-3">
          Twoja prywatność to nasz priorytet
        </h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          W FITFLY dbamy o bezpieczeństwo Twoich danych. Nigdy nie sprzedajemy 
          ani nie udostępniamy Twoich informacji osobom trzecim.
        </p>
      </div>

      {/* Co zbieramy - interaktywne */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Jakie dane zbieramy? 📋
        </h2>
        
        <div className="space-y-3">
          {/* Dane profilowe */}
          <button 
            onClick={() => setProfileDialogOpen(true)}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Dane profilowe</p>
                <p className="text-xs text-muted-foreground">Imię, wiek, wzrost, waga - do personalizacji celów</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
          
          {/* Dane aktywności */}
          <button 
            onClick={() => setActivityDialogOpen(true)}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Dane aktywności</p>
                <p className="text-xs text-muted-foreground">Kroki, posiłki, treningi - do śledzenia postępów</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
          
          {/* Dane logowania */}
          <button 
            onClick={() => setLoginDialogOpen(true)}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-fitfly-purple mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Dane logowania</p>
                <p className="text-xs text-muted-foreground">Email i hasło - bezpiecznie szyfrowane</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Twoje prawa */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Twoje prawa ⚖️
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-muted/50 rounded-2xl p-4">
            <Download className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">Prawo do dostępu do swoich danych</p>
          </div>
          
          <div className="flex items-center gap-3 bg-muted/50 rounded-2xl p-4">
            <Trash2 className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-foreground">Prawo do usunięcia konta i danych</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => navigate('/ustawienia')}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Usuń konto w Ustawieniach
        </Button>
      </div>

      {/* Bezpieczeństwo */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-5 border-2 border-primary/30 relative z-10">
        <h2 className="font-bold font-display text-foreground mb-3 text-lg text-center">
          Jak chronimy Twoje dane? 🛡️
        </h2>
        
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Szyfrowanie SSL/TLS dla wszystkich połączeń
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Bezpieczne przechowywanie haseł (hash + salt)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Row Level Security (RLS) w bazie danych
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Regularne audyty bezpieczeństwa
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center relative z-10 pt-4">
        <p className="text-xs text-muted-foreground">
          Ostatnia aktualizacja: Grudzień 2024
        </p>
      </div>

      {/* Dialog - Dane profilowe */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Eye className="w-5 h-5 text-primary" />
              Dane profilowe
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Zbieramy następujące dane profilowe do personalizacji Twoich celów:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" /> Imię / nazwa użytkownika
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" /> Wiek
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" /> Wzrost
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" /> Waga aktualna i docelowa
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" /> Cel fitness
              </li>
            </ul>
            <Button 
              onClick={() => {
                setProfileDialogOpen(false);
                navigate('/profil');
              }}
              className="w-full rounded-2xl"
            >
              Edytuj dane profilowe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Dane aktywności */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Server className="w-5 h-5 text-secondary" />
              Dane aktywności
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Zbieramy dane o Twojej aktywności, aby śledzić postępy:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-secondary" /> Liczba kroków dziennie
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-secondary" /> Spożyte posiłki i kalorie
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-secondary" /> Ukończone treningi
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-secondary" /> Spożycie wody
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-secondary" /> Nawyki i wyzwania
              </li>
            </ul>
            <Button 
              onClick={() => {
                setActivityDialogOpen(false);
                navigate('/postepy');
              }}
              className="w-full rounded-2xl"
              variant="secondary"
            >
              Zobacz postępy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Dane logowania */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-fitfly-purple" />
              Dane logowania
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Email */}
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Twój email</Label>
              </div>
              <p className="font-medium text-foreground">{user?.email || 'Brak emaila'}</p>
            </div>

            {/* Zmiana hasła */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-foreground">Zmień hasło</Label>
              </div>
              
              <Input
                type="password"
                placeholder="Nowe hasło (min. 8 znaków)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
              />
              
              <Input
                type="password"
                placeholder="Potwierdź nowe hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
              />
              
              <Button 
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="w-full rounded-2xl"
              >
                {isChangingPassword ? 'Zmieniam...' : 'Zmień hasło'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
