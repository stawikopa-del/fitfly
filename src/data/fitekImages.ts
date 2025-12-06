// Katalog wszystkich zdjęć Fitka z opisami i sugerowanymi miejscami użycia

// Import zdjęć - Paczka 1
import fitekBatonik from '@/assets/fitek/fitek-batonik.png';
import fitekCel from '@/assets/fitek/fitek-cel.png';
import fitekDetektyw from '@/assets/fitek/fitek-detektyw.png';
import fitekDzwoni from '@/assets/fitek/fitek-dzwoni.png';
import fitekJablko from '@/assets/fitek/fitek-jablko.png';

// Import zdjęć - Paczka 2
import fitekPoranek from '@/assets/fitek/fitek-poranek.png';
import fitekKasa from '@/assets/fitek/fitek-kasa.png';
import fitekObiad from '@/assets/fitek/fitek-obiad.png';
import fitekPalec from '@/assets/fitek/fitek-palec.png';
import fitekPiatka from '@/assets/fitek/fitek-piatka.png';

// Import zdjęć - Paczka 3
import fitekPuchar from '@/assets/fitek/fitek-puchar.png';
import fitekReceWGore from '@/assets/fitek/fitek-rece-w-gore.png';
import fitekSamolot from '@/assets/fitek/fitek-samolot.png';
import fitekSen from '@/assets/fitek/fitek-sen.png';
import fitekWoda from '@/assets/fitek/fitek-woda.png';
import fitekWykresy from '@/assets/fitek/fitek-wykresy.png';

export interface FitekImage {
  id: string;
  src: string;
  name: string;
  description: string;
  suggestedUsage: string[];
  usedIn?: string; // Gdzie zostało użyte
}

export const fitekImages: FitekImage[] = [
  // Paczka 1
  {
    id: 'batonik',
    src: fitekBatonik,
    name: 'Fitek z batonikiem',
    description: 'Fitek je batonik czekoladowy - wyraz twarzy zadowolony, lekko niezdrowa przekąska',
    suggestedUsage: ['przekąski', 'barcode-scanner', 'niezdrowe jedzenie', 'cheat meal'],
    usedIn: undefined, // Wolne - do wykorzystania
  },
  {
    id: 'cel',
    src: fitekCel,
    name: 'Fitek z celem',
    description: 'Fitek stoi przy tarczy do rzutek ze strzałką w środku - dumny, osiągnięcie celu',
    suggestedUsage: ['cele', 'goals', 'achievements', 'wyzwania ukończone'],
    usedIn: 'Goals.tsx - pusty stan bez celów',
  },
  {
    id: 'detektyw',
    src: fitekDetektyw,
    name: 'Fitek detektyw',
    description: 'Fitek jako detektyw z lupą i czapką Sherlocka - skupiony, szuka czegoś',
    suggestedUsage: ['wyszukiwanie', 'skanowanie', 'analiza produktów', 'barcode scanner'],
    usedIn: 'Nutrition.tsx - skaner produktów',
  },
  {
    id: 'dzwoni',
    src: fitekDzwoni,
    name: 'Fitek dzwoni',
    description: 'Fitek dzwoni dzwonkiem - radosny, zwraca uwagę na coś',
    suggestedUsage: ['powiadomienia', 'przypomnienia', 'kalendarz', 'alarmy'],
    usedIn: 'CalendarDialog.tsx - nagłówek kalendarza',
  },
  {
    id: 'jablko',
    src: fitekJablko,
    name: 'Fitek z jabłkiem',
    description: 'Fitek trzyma nadgryzione czerwone jabłko - zadowolony, zdrowe odżywianie',
    suggestedUsage: ['dieta', 'zdrowe jedzenie', 'owoce', 'przepisy', 'nutrition'],
    usedIn: 'Nutrition.tsx - przepisy i posiłki',
  },
  // Paczka 2
  {
    id: 'poranek',
    src: fitekPoranek,
    name: 'Fitek poranny',
    description: 'Fitek budzi się w łóżku, ziewa, słońce świeci, symbole ZzZ - senny ale gotowy do działania',
    suggestedUsage: ['poranny trening', 'budzenie się', 'poranek', 'sen'],
    usedIn: 'Workouts.tsx - nagłówek sekcji treningów',
  },
  {
    id: 'kasa',
    src: fitekKasa,
    name: 'Fitek z kasą',
    description: 'Fitek trzyma banknoty dolary - radosny, pokazuje pieniądze',
    suggestedUsage: ['pakiety', 'subskrypcje', 'zakupy', 'premium', 'płatności'],
    usedIn: 'More.tsx - sekcja pakietów premium',
  },
  {
    id: 'obiad',
    src: fitekObiad,
    name: 'Fitek je obiad',
    description: 'Fitek siedzi przy talerzu z jedzeniem (stek, groszek, marchewka), trzyma widelec - głodny, gotowy do jedzenia',
    suggestedUsage: ['obiad', 'lunch', 'posiłki główne', 'meal logging'],
    usedIn: 'Nutrition.tsx - zjedz coś na szybko',
  },
  {
    id: 'palec',
    src: fitekPalec,
    name: 'Fitek wskazuje',
    description: 'Fitek pokazuje palec wskazujący w górę - daje wskazówkę, zwraca uwagę',
    suggestedUsage: ['wskazówka', 'tip', 'uwaga', 'informacja', 'porady'],
    usedIn: 'Challenges.tsx - tip z Atomowych Nawyków',
  },
  {
    id: 'piatka',
    src: fitekPiatka,
    name: 'Fitek daje piątkę',
    description: 'Fitek biegnie i daje piątkę (high five) - radosny, gratuluje sukcesu',
    suggestedUsage: ['gratulacje', 'sukces', 'high-five', 'ukończenie', 'brawo'],
    usedIn: 'Home.tsx - szybka akcja wyzwanie dnia',
  },
  // Paczka 3
  {
    id: 'puchar',
    src: fitekPuchar,
    name: 'Fitek z pucharem',
    description: 'Fitek trzyma złoty puchar, napina mięśnie - dumny zwycięzca, triumf',
    suggestedUsage: ['zwycięstwo', 'nagrody', 'osiągnięcia', 'wyzwania ukończone', 'trofea'],
    usedIn: 'Achievements.tsx - hero sekcji osiągnięć',
  },
  {
    id: 'rece-w-gore',
    src: fitekReceWGore,
    name: 'Fitek z rękami w górze',
    description: 'Fitek radośnie podnosi ręce do góry, zamknięte oczy z uśmiechem - celebracja, euforia',
    suggestedUsage: ['celebracja', 'radość', 'sukces', 'ukończenie treningu', 'hurra'],
    usedIn: 'Home.tsx - szybka akcja trening',
  },
  {
    id: 'samolot',
    src: fitekSamolot,
    name: 'Fitek z samolotem',
    description: 'Fitek puszcza papierowy samolot - wysyłanie, udostępnianie, wiadomość',
    suggestedUsage: ['wysyłanie', 'udostępnianie', 'share', 'wiadomości', 'zaproszenia'],
    usedIn: 'ShareDialog.tsx - nagłówek udostępniania',
  },
  {
    id: 'sen',
    src: fitekSen,
    name: 'Fitek śpi',
    description: 'Fitek śpi na poduszce, symbole ZzZ - głęboki sen, odpoczynek, regeneracja',
    suggestedUsage: ['sen', 'odpoczynek', 'regeneracja', 'noc', 'dobranoc'],
    usedIn: undefined, // Wolne - do wykorzystania w przyszłości
  },
  {
    id: 'woda',
    src: fitekWoda,
    name: 'Fitek pije wodę',
    description: 'Fitek pije wodę ze szklanki - nawodnienie, zdrowie, orzeźwienie',
    suggestedUsage: ['woda', 'nawodnienie', 'hydratacja', 'water tracker', 'picie'],
    usedIn: 'WaterTracker.tsx - ikona sekcji nawodnienia',
  },
  {
    id: 'wykresy',
    src: fitekWykresy,
    name: 'Fitek z wykresami',
    description: 'Fitek pokazuje tablicę z kolorowymi wykresami słupkowymi - analiza, postępy, statystyki',
    suggestedUsage: ['postępy', 'statystyki', 'wykresy', 'analiza', 'progress'],
    usedIn: 'Progress.tsx - motywacyjna karta postępów',
  },
];

// Funkcja pomocnicza do pobierania zdjęcia
export const getFitekImage = (id: string): FitekImage | undefined => {
  return fitekImages.find(img => img.id === id);
};

// Funkcja do sprawdzenia które zdjęcia są jeszcze nieużyte
export const getUnusedFitekImages = (): FitekImage[] => {
  return fitekImages.filter(img => !img.usedIn);
};
