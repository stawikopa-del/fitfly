import { Smartphone, Code, Shield, FileText } from 'lucide-react';

export default function Info() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Informacje ℹ️
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Wersja i szczegóły techniczne
        </p>
      </header>

      {/* Wersja */}
      <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful relative z-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-playful">
          <span className="text-3xl font-extrabold text-white">FF</span>
        </div>
        <h2 className="font-bold font-display text-foreground text-2xl">FITFLY</h2>
        <p className="text-primary font-bold mt-1">Wersja 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-2">Build 2024.12.04</p>
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
  );
}