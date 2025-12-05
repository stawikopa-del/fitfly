import { Cookie, ArrowLeft, Shield, Settings, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CookiesPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-pt">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/informacje')}
            className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold font-display text-foreground">
              Polityka Cookies 🍪
            </h1>
            <p className="text-xs text-muted-foreground">Informacje o plikach cookie</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Nagłówek */}
        <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="font-bold font-display text-foreground text-xl mb-2">
            Polityka Cookies
          </h2>
          <p className="text-sm text-muted-foreground">
            Ostatnia aktualizacja: Grudzień 2024
          </p>
        </div>

        {/* Wprowadzenie */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aplikacja FITFLY korzysta z minimalnej ilości plików cookie i technologii 
            lokalnego przechowywania danych, które są niezbędne do prawidłowego działania 
            aplikacji. Szanujemy Twoją prywatność i nie używamy cookies do śledzenia 
            czy reklam.
          </p>
        </div>

        {/* Czym są cookies */}
        <Section
          icon={<Cookie className="w-5 h-5 text-amber-500" />}
          title="Czym są pliki cookie?"
          content={
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pliki cookie to małe pliki tekstowe zapisywane na Twoim urządzeniu. 
              Pomagają aplikacji zapamiętać Twoje preferencje i zapewnić prawidłowe 
              działanie. W przypadku FITFLY używamy głównie localStorage i sessionStorage, 
              które działają podobnie do cookies, ale pozostają tylko na Twoim urządzeniu.
            </p>
          }
        />

        {/* Niezbędne cookies */}
        <Section
          icon={<Shield className="w-5 h-5 text-primary" />}
          title="Niezbędne (wymagane)"
          content={
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Te dane są konieczne do działania aplikacji i nie można ich wyłączyć:
              </p>
              <CookieItem 
                name="Sesja logowania"
                purpose="Utrzymanie Twojego zalogowania"
                duration="Do wylogowania"
              />
              <CookieItem 
                name="Token autoryzacji"
                purpose="Bezpieczna komunikacja z serwerem"
                duration="24 godziny"
              />
              <CookieItem 
                name="Splash screen"
                purpose="Zapamiętanie wyświetlenia ekranu powitalnego"
                duration="Sesja przeglądarki"
              />
            </div>
          }
        />

        {/* Funkcjonalne */}
        <Section
          icon={<Settings className="w-5 h-5 text-secondary" />}
          title="Funkcjonalne (preferencje)"
          content={
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pomagają zapamiętać Twoje ustawienia:
              </p>
              <CookieItem 
                name="Motyw aplikacji"
                purpose="Zapisanie wybranego motywu (jasny/ciemny/minimalny)"
                duration="Trwałe"
              />
              <CookieItem 
                name="Język"
                purpose="Zapamiętanie preferowanego języka"
                duration="Trwałe"
              />
              <CookieItem 
                name="Ustawienia dźwięku"
                purpose="Zapisanie preferencji dźwięków i wibracji"
                duration="Trwałe"
              />
              <CookieItem 
                name="Dane Face ID"
                purpose="Zapamiętanie emaila do logowania biometrycznego"
                duration="Trwałe"
              />
            </div>
          }
        />

        {/* Analityczne */}
        <Section
          icon={<BarChart3 className="w-5 h-5 text-fitfly-purple" />}
          title="Analityczne"
          content={
            <div className="space-y-3">
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <p className="text-sm text-foreground font-medium mb-1">
                  ✨ Dobra wiadomość!
                </p>
                <p className="text-sm text-muted-foreground">
                  FITFLY nie używa zewnętrznych narzędzi analitycznych jak Google Analytics. 
                  Nie śledzimy Twoich zachowań ani nie sprzedajemy danych.
                </p>
              </div>
            </div>
          }
        />

        {/* Reklamowe */}
        <Section
          icon={<Users className="w-5 h-5 text-orange-500" />}
          title="Reklamowe i śledzące"
          content={
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <p className="text-sm text-foreground font-medium mb-1">
                🚫 Nie używamy!
              </p>
              <p className="text-sm text-muted-foreground">
                FITFLY nie korzysta z żadnych cookies reklamowych ani śledzących. 
                Nie wyświetlamy reklam i nie udostępniamy Twoich danych firmom reklamowym.
              </p>
            </div>
          }
        />

        {/* Jak zarządzać */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <h3 className="font-bold font-display text-foreground mb-4 text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Jak zarządzać danymi?
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Możesz zarządzać danymi przechowywanymi przez FITFLY:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Wylogowanie</strong> - usuwa dane sesji</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Usunięcie konta</strong> - usuwa wszystkie Twoje dane z serwera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Czyszczenie przeglądarki</strong> - usuwa lokalne preferencje</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            © 2024 FITFLY. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) {
  return (
    <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
      <h3 className="font-bold font-display text-foreground mb-4 text-lg flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {content}
    </div>
  );
}

function CookieItem({ name, purpose, duration }: { name: string; purpose: string; duration: string }) {
  return (
    <div className="bg-muted/50 rounded-2xl p-3">
      <p className="font-medium text-foreground text-sm">{name}</p>
      <p className="text-xs text-muted-foreground mt-1">{purpose}</p>
      <p className="text-xs text-primary mt-1">⏱️ {duration}</p>
    </div>
  );
}
