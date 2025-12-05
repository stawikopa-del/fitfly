import { Smartphone, Code, Shield, FileText, Info as InfoIcon, ChevronRight, Scale, Cookie, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/flyfit/PageHeader';
import { useNavigate } from 'react-router-dom';
import { soundFeedback } from '@/utils/soundFeedback';

export default function Info() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    soundFeedback.navTap();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Informacje" emoji="ℹ️" icon={<InfoIcon className="w-5 h-5 text-primary" />} />
      <div className="px-4 py-4 space-y-6 pb-24">

      {/* Wersja */}
      <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful relative z-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-playful">
          <span className="text-3xl font-extrabold text-white">FF</span>
        </div>
        <h2 className="font-bold font-display text-foreground text-2xl">FITFLY</h2>
        <p className="text-primary font-bold mt-1">Wersja 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-2">Build 2024.12.04</p>
      </div>

      {/* Dokumenty prawne */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Dokumenty prawne 📜
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleNavigate('/regulamin')}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Regulamin</p>
                <p className="text-xs text-muted-foreground">Zasady korzystania z FITFLY</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => handleNavigate('/polityka-prywatnosci')}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Polityka Prywatności</p>
                <p className="text-xs text-muted-foreground">Jak chronimy Twoje dane (RODO)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => handleNavigate('/prywatnosc')}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fitfly-purple/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-fitfly-purple" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Ustawienia prywatności</p>
                <p className="text-xs text-muted-foreground">Zarządzaj swoimi danymi</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => handleNavigate('/cookies')}
            className="w-full flex items-center justify-between gap-3 bg-muted/50 rounded-2xl p-4 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Polityka Cookies</p>
                <p className="text-xs text-muted-foreground">Informacje o plikach cookie</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Szczegóły techniczne */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Szczegóły techniczne 🔧
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-muted/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Platforma</p>
              <p className="text-xs text-muted-foreground">PWA + Capacitor (iOS & Android)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-muted/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Technologie</p>
              <p className="text-xs text-muted-foreground">React, TypeScript, Tailwind CSS</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-muted/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-fitfly-purple/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-fitfly-purple" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Backend</p>
              <p className="text-xs text-muted-foreground">Lovable Cloud (bezpieczne szyfrowanie)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ostrzeżenie zdrowotne */}
      <div className="bg-orange-500/10 rounded-3xl p-5 border-2 border-orange-500/30 relative z-10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground text-sm mb-1">Ważne informacje zdrowotne</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aplikacja FITFLY nie zastępuje profesjonalnej porady medycznej. 
              Przed rozpoczęciem nowego programu ćwiczeń lub diety skonsultuj się z lekarzem.
            </p>
          </div>
        </div>
      </div>

      {/* Licencje */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Licencje i uznania 📜
        </h2>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• React - MIT License</p>
          <p>• Tailwind CSS - MIT License</p>
          <p>• Lucide Icons - ISC License</p>
          <p>• Shadcn/ui - MIT License</p>
          <p>• Framer Motion - MIT License</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center relative z-10 pt-4">
        <p className="text-xs text-muted-foreground">
          © 2024 FITFLY. Wszystkie prawa zastrzeżone.
        </p>
      </div>
      </div>
    </div>
  );
}