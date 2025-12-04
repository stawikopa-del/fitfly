import { ChevronDown, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const faqItems = [
  {
    question: 'Jak śledzić kroki?',
    answer: 'FLYFIT automatycznie liczy Twoje kroki, gdy aplikacja jest zainstalowana jako aplikacja natywna. Na razie używamy szacunkowych danych, ale wkrótce zintegrujemy Apple Health i Google Fit.',
  },
  {
    question: 'Jak dodać posiłek?',
    answer: 'Przejdź do zakładki Dieta, kliknij "+" przy wybranym posiłku (śniadanie, obiad, kolacja lub przekąski). Możesz opisać posiłek słowami, a AI oszacuje kalorie, lub wprowadzić dane ręcznie.',
  },
  {
    question: 'Jak działają wyzwania?',
    answer: 'Wyzwania to krótkie cele do realizacji. Codziennie dostępne są nowe wyzwania. Za każde ukończone wyzwanie zdobywasz punkty i nagrody!',
  },
  {
    question: 'Jak rozmawiać z FITEK?',
    answer: 'Kliknij ikonę FITEK w dolnym menu nawigacyjnym (środkowa ikona). FITEK to Twój osobisty trener i motywator - możesz zadawać mu pytania o dietę, treningi i zdrowy styl życia.',
  },
  {
    question: 'Jak zmienić swoje cele?',
    answer: 'Przejdź do Profil w sekcji Inne. Tam możesz edytować swoje cele: wagę docelową, dzienny cel kroków i spożycie wody.',
  },
  {
    question: 'Czy moje dane są bezpieczne?',
    answer: 'Tak! Wszystkie dane są szyfrowane i przechowywane bezpiecznie. Masz pełną kontrolę nad swoimi danymi i możesz je usunąć w każdej chwili.',
  },
  {
    question: 'Jak zainstalować aplikację?',
    answer: 'Przejdź do sekcji Inne i kliknij "Pobierz aplikację". Na iPhone użyj opcji "Dodaj do ekranu głównego" w Safari. Na Androidzie zobaczysz automatyczny monit instalacji.',
  },
  {
    question: 'Jak włączyć Face ID?',
    answer: 'Przejdź do Ustawienia i włącz opcję "Face ID / Touch ID" w sekcji logowania biometrycznego. Musisz być zalogowany, aby aktywować tę funkcję.',
  },
];

export default function Help() {
  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Pomoc ❓
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Znajdź odpowiedzi na swoje pytania
        </p>
      </header>

      {/* FAQ */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Często zadawane pytania 💬
        </h2>
        
        <Accordion type="single" collapsible className="space-y-2">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-muted/50 rounded-2xl border-none px-4"
            >
              <AccordionTrigger className="text-left text-sm font-medium py-4 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Kontakt */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10">
        <h2 className="font-bold font-display text-foreground mb-4 text-lg">
          Potrzebujesz więcej pomocy? 🤝
        </h2>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-2xl h-14 border-2 font-medium"
            onClick={() => window.location.href = 'mailto:pomoc@flyfit.app'}
          >
            <Mail className="w-5 h-5 mr-3 text-primary" />
            Napisz do nas: pomoc@flyfit.app
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-2xl h-14 border-2 font-medium"
            onClick={() => window.open('https://instagram.com/flyfit_app', '_blank')}
          >
            <MessageCircle className="w-5 h-5 mr-3 text-primary" />
            Napisz na Instagram @flyfit_app
          </Button>
        </div>
      </div>
    </div>
  );
}