import { Heart, Target, Users, Sparkles } from 'lucide-react';
import flyflyMascot from '@/assets/fitfly-mascot.png';

export default function About() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="relative z-10 text-center">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          O nas 💚
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Poznaj FLYFIT bliżej
        </p>
      </header>

      {/* Mascot */}
      <div className="flex justify-center relative z-10">
        <div className="w-32 h-32 animate-float">
          <img 
            src={flyflyMascot} 
            alt="FITEK mascot" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Mission */}
      <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful relative z-10 text-center">
        <h2 className="font-bold font-display text-foreground mb-3 text-xl">
          Nasza misja 🎯
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Wierzymy, że dbanie o zdrowie może być <strong className="text-foreground">przyjemne i zabawne</strong>! 
          FLYFIT powstał z myślą o młodych ludziach, którzy chcą żyć zdrowiej, 
          ale nie lubią nudnych aplikacji fitness.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-card rounded-2xl p-4 border-2 border-border/50 shadow-card-playful text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Zabawa</h3>
          <p className="text-xs text-muted-foreground mt-1">Zdrowie przez radość</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border-2 border-border/50 shadow-card-playful text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Prostota</h3>
          <p className="text-xs text-muted-foreground mt-1">Bez komplikacji</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border-2 border-border/50 shadow-card-playful text-center">
          <div className="w-12 h-12 rounded-2xl bg-fitfly-purple/10 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-fitfly-purple" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Społeczność</h3>
          <p className="text-xs text-muted-foreground mt-1">Razem łatwiej</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border-2 border-border/50 shadow-card-playful text-center">
          <div className="w-12 h-12 rounded-2xl bg-fitfly-orange/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-fitfly-orange" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Motywacja</h3>
          <p className="text-xs text-muted-foreground mt-1">Codzienne wsparcie</p>
        </div>
      </div>

      {/* FITEK */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-6 border-2 border-primary/30 relative z-10">
        <h2 className="font-bold font-display text-foreground mb-3 text-lg text-center">
          Poznaj FITEK! 🦸
        </h2>
        <p className="text-muted-foreground text-center leading-relaxed text-sm">
          FITEK to Twój osobisty towarzysz fitness. Będzie Cię motywować, 
          odpowiadać na pytania i świętować z Tobą każdy sukces. 
          Im więcej ćwiczysz, tym szczęśliwszy jest FITEK!
        </p>
      </div>

      {/* Footer */}
      <div className="text-center relative z-10 pt-4">
        <p className="text-muted-foreground text-sm">
          Stworzone z 💚 przez zespół FLYFIT
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © 2024 FLYFIT. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
}