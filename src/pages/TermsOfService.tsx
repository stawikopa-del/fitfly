import { FileText, ArrowLeft, Scale, AlertTriangle, Users, CreditCard, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
              Regulamin 📜
            </h1>
            <p className="text-xs text-muted-foreground">Zasady korzystania z FITFLY</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Nagłówek */}
        <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 shadow-card-playful text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-bold font-display text-foreground text-xl mb-2">
            Regulamin Serwisu FITFLY
          </h2>
          <p className="text-sm text-muted-foreground">
            Ostatnia aktualizacja: Grudzień 2024
          </p>
        </div>

        {/* §1 Postanowienia ogólne */}
        <Section
          icon={<FileText className="w-5 h-5 text-primary" />}
          title="§1. Postanowienia ogólne"
          items={[
            "Niniejszy Regulamin określa zasady korzystania z aplikacji mobilnej FITFLY.",
            "Właścicielem i operatorem aplikacji FITFLY jest FITFLY Sp. z o.o. z siedzibą w Polsce.",
            "Korzystanie z aplikacji oznacza akceptację niniejszego Regulaminu.",
            "Aplikacja FITFLY służy do monitorowania aktywności fizycznej, odżywiania i zdrowych nawyków."
          ]}
        />

        {/* §2 Definicje */}
        <Section
          icon={<FileText className="w-5 h-5 text-secondary" />}
          title="§2. Definicje"
          items={[
            "Aplikacja - aplikacja mobilna FITFLY dostępna na urządzenia iOS i Android.",
            "Użytkownik - osoba fizyczna korzystająca z Aplikacji.",
            "Konto - indywidualne konto Użytkownika w Aplikacji.",
            "Usługi Premium - płatne funkcje dostępne w ramach subskrypcji FIT lub PREMIUM."
          ]}
        />

        {/* §3 Rejestracja i Konto */}
        <Section
          icon={<Users className="w-5 h-5 text-fitfly-purple" />}
          title="§3. Rejestracja i Konto"
          items={[
            "Rejestracja w Aplikacji jest bezpłatna i wymaga podania adresu email oraz hasła.",
            "Użytkownik zobowiązuje się do podania prawdziwych danych.",
            "Użytkownik odpowiada za zachowanie poufności swojego hasła.",
            "Jedno Konto może być używane tylko przez jedną osobę.",
            "FITFLY zastrzega sobie prawo do usunięcia Konta naruszającego Regulamin."
          ]}
        />

        {/* §4 Zasady korzystania */}
        <Section
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
          title="§4. Zasady korzystania"
          items={[
            "Użytkownik zobowiązuje się do korzystania z Aplikacji zgodnie z jej przeznaczeniem.",
            "Zabrania się wykorzystywania Aplikacji do celów niezgodnych z prawem.",
            "Zabrania się podejmowania działań mogących zakłócić działanie Aplikacji.",
            "Użytkownik nie może udostępniać treści obraźliwych, wulgarnych lub nielegalnych.",
            "FITFLY nie ponosi odpowiedzialności za decyzje zdrowotne podejmowane na podstawie danych z Aplikacji."
          ]}
        />

        {/* §5 Subskrypcje i płatności */}
        <Section
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          title="§5. Subskrypcje i płatności"
          items={[
            "Aplikacja oferuje trzy pakiety: START (bezpłatny), FIT (19,99 PLN/mies.) i PREMIUM (39,99 PLN/mies.).",
            "Płatności są przetwarzane przez Shopify Payments.",
            "Subskrypcja odnawia się automatycznie, chyba że zostanie anulowana przed końcem okresu rozliczeniowego.",
            "Użytkownik może anulować subskrypcję w dowolnym momencie w Ustawieniach.",
            "Zwroty są możliwe w ciągu 14 dni od zakupu zgodnie z prawem konsumenckim."
          ]}
        />

        {/* §6 Odpowiedzialność */}
        <Section
          icon={<XCircle className="w-5 h-5 text-destructive" />}
          title="§6. Wyłączenie odpowiedzialności"
          items={[
            "Aplikacja nie zastępuje profesjonalnej porady medycznej, dietetycznej ani trenerskiej.",
            "FITFLY nie ponosi odpowiedzialności za skutki zdrowotne wynikające z korzystania z Aplikacji.",
            "Przed rozpoczęciem programu ćwiczeń zalecamy konsultację z lekarzem.",
            "FITFLY nie gwarantuje osiągnięcia określonych rezultatów fitness.",
            "Aplikacja jest dostarczana \"tak jak jest\" bez żadnych gwarancji."
          ]}
        />

        {/* §7 Zmiany regulaminu */}
        <Section
          icon={<RefreshCw className="w-5 h-5 text-secondary" />}
          title="§7. Zmiany Regulaminu"
          items={[
            "FITFLY zastrzega sobie prawo do zmiany Regulaminu w dowolnym momencie.",
            "O istotnych zmianach Użytkownicy będą informowani za pośrednictwem Aplikacji lub emaila.",
            "Dalsze korzystanie z Aplikacji po zmianie Regulaminu oznacza jego akceptację.",
            "Aktualna wersja Regulaminu jest zawsze dostępna w sekcji Informacje."
          ]}
        />

        {/* §8 Kontakt */}
        <Section
          icon={<MessageSquare className="w-5 h-5 text-primary" />}
          title="§8. Kontakt"
          items={[
            "Pytania dotyczące Regulaminu można kierować na adres: kontakt@fitfly.app",
            "Reklamacje rozpatrywane są w ciągu 14 dni roboczych.",
            "Wszelkie spory będą rozstrzygane przez sąd właściwy dla siedziby FITFLY."
          ]}
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

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful">
      <h3 className="font-bold font-display text-foreground mb-4 text-lg flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
