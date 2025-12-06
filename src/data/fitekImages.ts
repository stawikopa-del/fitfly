// Katalog wszystkich zdjęć Fitka z opisami i sugerowanymi miejscami użycia

// Import zdjęć
import fitekBatonik from '@/assets/fitek/fitek-batonik.png';
import fitekCel from '@/assets/fitek/fitek-cel.png';
import fitekDetektyw from '@/assets/fitek/fitek-detektyw.png';
import fitekDzwoni from '@/assets/fitek/fitek-dzwoni.png';
import fitekJablko from '@/assets/fitek/fitek-jablko.png';

export interface FitekImage {
  id: string;
  src: string;
  name: string;
  description: string;
  suggestedUsage: string[];
  usedIn?: string; // Gdzie zostało użyte (aby nie powtarzać)
}

export const fitekImages: FitekImage[] = [
  {
    id: 'batonik',
    src: fitekBatonik,
    name: 'Fitek z batonikiem',
    description: 'Fitek je batonik czekoladowy - wyraz twarzy zadowolony, lekko niezdrowa przekąska',
    suggestedUsage: ['przekąski', 'barcode-scanner', 'niezdrowe jedzenie', 'cheat meal'],
  },
  {
    id: 'cel',
    src: fitekCel,
    name: 'Fitek z celem',
    description: 'Fitek stoi przy tarczy do rzutek ze strzałką w środku - dumny, osiągnięcie celu',
    suggestedUsage: ['cele', 'goals', 'achievements', 'wyzwania ukończone'],
  },
  {
    id: 'detektyw',
    src: fitekDetektyw,
    name: 'Fitek detektyw',
    description: 'Fitek jako detektyw z lupą i czapką Sherlocka - skupiony, szuka czegoś',
    suggestedUsage: ['wyszukiwanie', 'skanowanie', 'analiza produktów', 'barcode scanner'],
  },
  {
    id: 'dzwoni',
    src: fitekDzwoni,
    name: 'Fitek dzwoni',
    description: 'Fitek dzwoni dzwonkiem - radosny, zwraca uwagę na coś',
    suggestedUsage: ['powiadomienia', 'przypomnienia', 'kalendarz', 'alarmy'],
  },
  {
    id: 'jablko',
    src: fitekJablko,
    name: 'Fitek z jabłkiem',
    description: 'Fitek trzyma nadgryzione czerwone jabłko - zadowolony, zdrowe odżywianie',
    suggestedUsage: ['dieta', 'zdrowe jedzenie', 'owoce', 'przepisy', 'nutrition'],
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
