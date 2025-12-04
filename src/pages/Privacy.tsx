import { Shield, Eye, Lock, Trash2, Download, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Prywatność 🔒
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Twoje dane są u nas bezpieczne
        </p>
      </header>

      {/* Główna sekcja */}
      <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-bold font-display text-foreground text-center text-lg mb-3">
          Twoja prywatność to nasz priorytet
        </h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          W FLYFIT dbamy o bezpieczeństwo Twoich danych. Nigdy nie sprzedajemy 
          ani nie udostępniamy Twoich informacji osobom trzecim.
        </p>
      </div>

      {/* Co zbieramy */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Jakie dane zbieramy? 📋
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-muted/50 rounded-2xl p-4">
            <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Dane profilowe</p>
              <p className="text-xs text-muted-foreground">Imię, wiek, wzrost, waga - do personalizacji celów</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-muted/50 rounded-2xl p-4">
            <Server className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Dane aktywności</p>
              <p className="text-xs text-muted-foreground">Kroki, posiłki, treningi - do śledzenia postępów</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-muted/50 rounded-2xl p-4">
            <Lock className="w-5 h-5 text-fitfly-purple mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Dane logowania</p>
              <p className="text-xs text-muted-foreground">Email i hasło - bezpiecznie szyfrowane</p>
            </div>
          </div>
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
    </div>
  );
}