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

export interface FitekImage {
  id: string;
  src: string;
  name: string;
  description: string;
  suggestedUsage: string[];
  usedIn?: string; // Gdzie zostało użyte (aby nie powtarzać)
}

export const fitekImages: FitekImage[] = [
  // Paczka 1
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
  // Paczka 2
  {
    id: 'poranek',
    src: fitekPoranek,
    name: 'Fitek poranny',
    description: 'Fitek budzi się w łóżku, ziewa, słońce świeci, symbole ZzZ - senny ale gotowy do działania',
    suggestedUsage: ['poranny trening', 'budzenie się', 'poranek', 'sen'],
  },
  {
    id: 'kasa',
    src: fitekKasa,
    name: 'Fitek z kasą',
    description: 'Fitek trzyma banknoty dolary - radosny, pokazuje pieniądze',
    suggestedUsage: ['pakiety', 'subskrypcje', 'zakupy', 'premium', 'płatności'],
  },
  {
    id: 'obiad',
    src: fitekObiad,
    name: 'Fitek je obiad',
    description: 'Fitek siedzi przy talerzu z jedzeniem (stek, groszek, marchewka), trzyma widelec - głodny, gotowy do jedzenia',
    suggestedUsage: ['obiad', 'lunch', 'posiłki główne', 'meal logging'],
  },
  {
    id: 'palec',
    src: fitekPalec,
    name: 'Fitek wskazuje',
    description: 'Fitek pokazuje palec wskazujący w górę - daje wskazówkę, zwraca uwagę',
    suggestedUsage: ['wskazówka', 'tip', 'uwaga', 'informacja', 'porady'],
  },
  {
    id: 'piatka',
    src: fitekPiatka,
    name: 'Fitek daje piątkę',
    description: 'Fitek biegnie i daje piątkę (high five) - radosny, gratuluje sukcesu',
    suggestedUsage: ['gratulacje', 'sukces', 'high-five', 'ukończenie', 'brawo'],
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
