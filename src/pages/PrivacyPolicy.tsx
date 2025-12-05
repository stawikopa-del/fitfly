import { Shield, ArrowLeft, Eye, Lock, Server, Trash2, Globe, Clock, Baby, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
              Polityka Prywatności 🔒
            </h1>
            <p className="text-xs text-muted-foreground">Jak chronimy Twoje dane</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Nagłówek */}
        <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-bold font-display text-foreground text-xl mb-2">
            Polityka Prywatności FITFLY
          </h2>
          <p className="text-sm text-muted-foreground">
            Ostatnia aktualizacja: Grudzień 2024
          </p>
        </div>

        {/* Wprowadzenie */}
        <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Niniejsza Polityka Prywatności wyjaśnia, w jaki sposób FITFLY Sp. z o.o. 
            zbiera, wykorzystuje, przechowuje i chroni Twoje dane osobowe zgodnie z 
            Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
          </p>
        </div>

        {/* 1. Administrator danych */}
        <Section
          icon={<Globe className="w-5 h-5 text-primary" />}
          title="1. Administrator danych"
          content={
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Administratorem Twoich danych osobowych jest:</p>
              <div className="bg-muted/50 rounded-2xl p-4 mt-2">
                <p className="font-medium text-foreground">FITFLY Sp. z o.o.</p>
                <p>ul. Przykładowa 123</p>
                <p>00-001 Warszawa, Polska</p>
                <p className="mt-2">Email: kontakt@fitfly.app</p>
              </div>
            </div>
          }
        />

        {/* 2. Jakie dane zbieramy */}
        <Section
          icon={<Eye className="w-5 h-5 text-secondary" />}
          title="2. Jakie dane zbieramy"
          content={
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-2">Dane podane przez Ciebie:</p>
                <ul className="space-y-1">
                  <li>• Adres email i hasło (do logowania)</li>
                  <li>• Imię, wiek, płeć (do personalizacji)</li>
                  <li>• Wzrost, waga, cel fitness (do obliczeń)</li>
                  <li>• Zdjęcie profilowe (opcjonalnie)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Dane zbierane automatycznie:</p>
                <ul className="space-y-1">
                  <li>• Dane o aktywności (kroki, treningi, posiłki)</li>
                  <li>• Postępy i statystyki</li>
                  <li>• Informacje o urządzeniu i systemie</li>
                  <li>• Logi błędów (do poprawy jakości)</li>
                </ul>
              </div>
            </div>
          }
        />

        {/* 3. Cel przetwarzania */}
        <Section
          icon={<Server className="w-5 h-5 text-fitfly-purple" />}
          title="3. Cel przetwarzania danych"
          content={
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Świadczenie usług aplikacji i personalizacja doświadczenia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Obliczanie celów kalorycznych, nawodnienia i aktywności</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Śledzenie postępów i generowanie statystyk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Komunikacja z Tobą (powiadomienia, wsparcie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Przetwarzanie płatności za subskrypcje</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Poprawa jakości i rozwój aplikacji</span>
              </li>
            </ul>
          }
        />

        {/* 4. Bezpieczeństwo */}
        <Section
          icon={<Lock className="w-5 h-5 text-primary" />}
          title="4. Bezpieczeństwo danych"
          content={
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Stosujemy następujące środki ochrony:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>Szyfrowanie SSL/TLS dla wszystkich połączeń</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>Bezpieczne hashowanie haseł (bcrypt)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>Row Level Security (RLS) w bazie danych</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>Regularne kopie zapasowe i audyty bezpieczeństwa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔐</span>
                  <span>Dostęp do danych tylko dla upoważnionych osób</span>
                </li>
              </ul>
            </div>
          }
        />

        {/* 5. Twoje prawa */}
        <Section
          icon={<Trash2 className="w-5 h-5 text-destructive" />}
          title="5. Twoje prawa (RODO)"
          content={
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo dostępu</strong> - możesz żądać kopii swoich danych</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo do sprostowania</strong> - możesz poprawiać nieprawidłowe dane</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo do usunięcia</strong> - możesz żądać usunięcia danych</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo do przenoszenia</strong> - możesz otrzymać dane w formacie elektronicznym</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo do sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">→</span>
                <span><strong className="text-foreground">Prawo do skargi</strong> - możesz złożyć skargę do UODO</span>
              </li>
            </ul>
          }
        />

        {/* 6. Okres przechowywania */}
        <Section
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          title="6. Okres przechowywania"
          content={
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Dane konta: przez czas posiadania konta + 30 dni po usunięciu</li>
              <li>• Dane aktywności: przez czas posiadania konta</li>
              <li>• Dane rozliczeniowe: 5 lat (wymogi prawne)</li>
              <li>• Logi systemowe: maksymalnie 90 dni</li>
            </ul>
          }
        />

        {/* 7. Dzieci */}
        <Section
          icon={<Baby className="w-5 h-5 text-pink-500" />}
          title="7. Ochrona dzieci"
          content={
            <p className="text-sm text-muted-foreground">
              Aplikacja FITFLY jest przeznaczona dla osób powyżej 16 roku życia. 
              Nie zbieramy świadomie danych od osób poniżej tego wieku. 
              Jeśli dowiesz się, że dziecko poniżej 16 lat utworzyło konto, 
              prosimy o kontakt - usuniemy dane niezwłocznie.
            </p>
          }
        />

        {/* 8. Kontakt */}
        <Section
          icon={<Mail className="w-5 h-5 text-primary" />}
          title="8. Kontakt w sprawach prywatności"
          content={
            <div className="text-sm text-muted-foreground">
              <p className="mb-3">W sprawach dotyczących Twoich danych osobowych kontaktuj się z nami:</p>
              <div className="bg-muted/50 rounded-2xl p-4">
                <p>📧 Email: prywatnosc@fitfly.app</p>
                <p>📧 IOD: iod@fitfly.app</p>
                <p className="mt-2 text-xs">Odpowiadamy w ciągu 30 dni zgodnie z RODO.</p>
              </div>
            </div>
          }
        />

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
