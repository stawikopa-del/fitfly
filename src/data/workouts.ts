export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instruction: string;
}

export interface WorkoutData {
  id: string;
  name: string;
  category: string;
  duration: number; // total in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  exercises: Exercise[];
}

export const workouts: WorkoutData[] = [
  {
    id: '1',
    name: 'Poranny rozruch',
    category: 'Domowe 10 min',
    duration: 10,
    difficulty: 'easy',
    calories: 80,
    exercises: [
      {
        id: '1-1',
        name: 'Rozgrzewka - marsz w miejscu',
        duration: 60,
        instruction: 'Stań prosto i zacznij maszerować w miejscu. Unoś kolana do wysokości bioder, machaj rękami naprzemiennie. Utrzymuj stały rytm i pamiętaj o równomiernym oddychaniu.',
      },
      {
        id: '1-2',
        name: 'Krążenia ramionami',
        duration: 45,
        instruction: 'Stań w rozkroku na szerokość bioder. Wykonuj duże koła ramionami - najpierw do przodu, potem do tyłu. Utrzymuj plecy proste i brzuch napięty.',
      },
      {
        id: '1-3',
        name: 'Przysiady',
        duration: 60,
        instruction: 'Stań w rozkroku nieco szerszym niż biodra. Zegnij kolana i biodra, jakbyś siadał na krzesło. Kolana nie powinny wychodzić poza palce stóp. Wróć do pozycji wyjściowej.',
      },
      {
        id: '1-4',
        name: 'Wykroki w miejscu',
        duration: 60,
        instruction: 'Stań prosto, zrób duży krok do przodu jedną nogą i zegnij oba kolana do kąta 90 stopni. Wróć do pozycji wyjściowej i powtórz drugą nogą.',
      },
      {
        id: '1-5',
        name: 'Skłony tułowia',
        duration: 45,
        instruction: 'Stań w rozkroku z rękami na biodrach. Pochyl się w bok, starając się dotknąć kolanem łokciem. Wróć do pionu i powtórz na drugą stronę.',
      },
      {
        id: '1-6',
        name: 'Pajacyki',
        duration: 60,
        instruction: 'Stań prosto ze złączonymi stopami i rękami wzdłuż ciała. Wyskocz, rozkładając nogi na boki i unosząc ręce nad głowę. Wróć do pozycji wyjściowej.',
      },
      {
        id: '1-7',
        name: 'Deska',
        duration: 45,
        instruction: 'Oprzyj się na przedramionach i palcach stóp. Ciało powinno tworzyć prostą linię od głowy do pięt. Napnij brzuch i pośladki. Oddychaj równomiernie.',
      },
      {
        id: '1-8',
        name: 'Rozciąganie - dotyk palców',
        duration: 45,
        instruction: 'Stań prosto i powoli pochyl się do przodu, starając się dotknąć palcami stóp. Trzymaj kolana lekko zgięte. Wytrzymaj pozycję, oddychając głęboko.',
      },
    ],
  },
  {
    id: '2',
    name: 'Trening na start',
    category: 'Dla początkujących',
    duration: 15,
    difficulty: 'easy',
    calories: 120,
    exercises: [
      {
        id: '2-1',
        name: 'Marsz w miejscu',
        duration: 60,
        instruction: 'Rozgrzej ciało marszem w miejscu. Unoś kolana wysoko i machaj rękami w rytmie kroków.',
      },
      {
        id: '2-2',
        name: 'Przysiady z przytrzymaniem',
        duration: 60,
        instruction: 'Wykonaj przysiad i zatrzymaj się w dolnej pozycji na 2 sekundy. Wróć do góry i powtórz.',
      },
      {
        id: '2-3',
        name: 'Pompki od ściany',
        duration: 60,
        instruction: 'Oprzyj ręce o ścianę na wysokości klatki piersiowej. Zegnij łokcie, przybliżając klatkę do ściany, potem odepchnij się.',
      },
      {
        id: '2-4',
        name: 'Unoszenie kolan',
        duration: 60,
        instruction: 'Stojąc prosto, naprzemiennie unoś kolana do klatki piersiowej. Utrzymuj równowagę i tempo.',
      },
      {
        id: '2-5',
        name: 'Most biodrowy',
        duration: 60,
        instruction: 'Połóż się na plecach z ugiętymi kolanami. Unieś biodra do góry, napinając pośladki, potem opuść.',
      },
      {
        id: '2-6',
        name: 'Wspinaczka górska (wolna)',
        duration: 60,
        instruction: 'W pozycji deski naprzemiennie przyciągaj kolana do klatki piersiowej. Wykonuj ruch powoli i kontrolowanie.',
      },
      {
        id: '2-7',
        name: 'Skręty tułowia',
        duration: 45,
        instruction: 'Stań z rękami przed sobą. Skręcaj tułów w lewo i prawo, utrzymując biodra nieruchomo.',
      },
      {
        id: '2-8',
        name: 'Rozciąganie całego ciała',
        duration: 60,
        instruction: 'Stań i unieś ręce wysoko nad głowę. Połącz dłonie i delikatnie pochyl się na boki, rozciągając boczne mięśnie.',
      },
    ],
  },
  {
    id: '3',
    name: 'Spalanie kalorii',
    category: 'Cardio',
    duration: 20,
    difficulty: 'medium',
    calories: 200,
    exercises: [
      {
        id: '3-1',
        name: 'Rozgrzewka - skip A',
        duration: 60,
        instruction: 'Biegaj w miejscu unosząc wysoko kolana. Utrzymuj szybkie tempo i pompuj rękami.',
      },
      {
        id: '3-2',
        name: 'Burpees',
        duration: 60,
        instruction: 'Z pozycji stojącej kucnij, połóż ręce na podłodze, wyrzuć nogi do tyłu do pozycji deski, wróć do kucnięcia i wyskocz w górę z rękami nad głową.',
      },
      {
        id: '3-3',
        name: 'Pajacyki intensywne',
        duration: 60,
        instruction: 'Wykonuj pajacyki w szybkim tempie. Skacz energicznie, rozrzucając ręce i nogi.',
      },
      {
        id: '3-4',
        name: 'Przysiady z wyskokiem',
        duration: 60,
        instruction: 'Wykonaj przysiad, a następnie dynamicznie wyskocz w górę. Miękko wyląduj i od razu przejdź do następnego przysiadu.',
      },
      {
        id: '3-5',
        name: 'Wspinaczka górska',
        duration: 60,
        instruction: 'W pozycji deski szybko naprzemiennie przyciągaj kolana do klatki piersiowej. Utrzymuj szybkie tempo.',
      },
      {
        id: '3-6',
        name: 'Bieg w miejscu z wysokimi kolanami',
        duration: 60,
        instruction: 'Biegaj w miejscu, unosząc kolana jak najwyżej. Utrzymuj szybkie tempo przez całe ćwiczenie.',
      },
      {
        id: '3-7',
        name: 'Wykroki z wyskokiem',
        duration: 60,
        instruction: 'Wykonaj wykrok, a następnie dynamicznie zmień nogi w locie. Ląduj miękko i od razu przejdź do następnego wykroku.',
      },
      {
        id: '3-8',
        name: 'Plank z dotknięciem ramion',
        duration: 60,
        instruction: 'W pozycji deski na wyprostowanych rękach naprzemiennie dotykaj jedną ręką przeciwnego ramienia. Utrzymuj stabilne biodra.',
      },
      {
        id: '3-9',
        name: 'Skakanka bez skakanki',
        duration: 60,
        instruction: 'Skacz w miejscu, naśladując ruchy skakanki. Utrzymuj lekkie, szybkie skoki na palcach.',
      },
      {
        id: '3-10',
        name: 'Rozciąganie i oddech',
        duration: 60,
        instruction: 'Zwolnij tempo. Rozciągnij główne grupy mięśniowe i oddychaj głęboko, uspokajając tętno.',
      },
    ],
  },
  {
    id: '4',
    name: 'Siłownia - podstawy',
    category: 'Siła',
    duration: 30,
    difficulty: 'medium',
    calories: 250,
    exercises: [
      {
        id: '4-1',
        name: 'Rozgrzewka dynamiczna',
        duration: 90,
        instruction: 'Wykonaj krążenia ramionami, skręty tułowia, przysiady bez obciążenia. Przygotuj ciało do wysiłku.',
      },
      {
        id: '4-2',
        name: 'Pompki klasyczne',
        duration: 60,
        instruction: 'Oprzyj się na rękach i palcach stóp. Zegnij łokcie opuszczając klatkę w kierunku podłogi, potem odepchnij się do góry.',
      },
      {
        id: '4-3',
        name: 'Przysiady głębokie',
        duration: 60,
        instruction: 'Wykonuj głębokie przysiady z pełnym zakresem ruchu. Utrzymuj plecy proste i kolana w linii ze stopami.',
      },
      {
        id: '4-4',
        name: 'Wiosłowanie w opadzie',
        duration: 60,
        instruction: 'Pochyl się do przodu z lekko ugiętymi kolanami. Naśladuj ruch wiosłowania, przyciągając łokcie do tyłu.',
      },
      {
        id: '4-5',
        name: 'Deska z unoszeniem nóg',
        duration: 60,
        instruction: 'W pozycji deski naprzemiennie unoś nogi do góry. Utrzymuj stabilny korpus.',
      },
      {
        id: '4-6',
        name: 'Wykroki bułgarskie',
        duration: 90,
        instruction: 'Oprzyj jedną stopę na podwyższeniu za sobą. Wykonuj wykroki w dół, zginając przednią nogę do 90 stopni.',
      },
      {
        id: '4-7',
        name: 'Pompki diamentowe',
        duration: 60,
        instruction: 'Wykonuj pompki z dłońmi złączonymi w kształt diamentu pod klatką piersiową. Angażuje bardziej tricepsy.',
      },
      {
        id: '4-8',
        name: 'Martwy ciąg na jednej nodze',
        duration: 90,
        instruction: 'Stojąc na jednej nodze, pochyl się do przodu wyprostowaną nogę unosząc do tyłu. Trzymaj plecy proste.',
      },
      {
        id: '4-9',
        name: 'Hollow body hold',
        duration: 60,
        instruction: 'Leż na plecach i unieś lekko nogi i ramiona. Dociskaj dolną część pleców do podłogi. Utrzymaj pozycję.',
      },
      {
        id: '4-10',
        name: 'Rozciąganie statyczne',
        duration: 120,
        instruction: 'Rozciągnij wszystkie główne grupy mięśniowe. Trzymaj każdą pozycję przez 20-30 sekund.',
      },
    ],
  },
  {
    id: '5',
    name: 'HIIT Express',
    category: 'Intensywny',
    duration: 15,
    difficulty: 'hard',
    calories: 180,
    exercises: [
      {
        id: '5-1',
        name: 'Szybka rozgrzewka',
        duration: 60,
        instruction: 'Bieg w miejscu z wysokimi kolanami przez 60 sekund. Rozgrzej całe ciało!',
      },
      {
        id: '5-2',
        name: 'Burpees maksymalne',
        duration: 40,
        instruction: 'Wykonuj burpees najszybciej jak potrafisz! Każda sekunda się liczy!',
      },
      {
        id: '5-3',
        name: 'Odpoczynek',
        duration: 20,
        instruction: 'Złap oddech, ale nie siadaj! Chodź w miejscu.',
      },
      {
        id: '5-4',
        name: 'Przysiady z wyskokiem',
        duration: 40,
        instruction: 'Skacz jak najwyżej! Pełna moc przy każdym wyskoku!',
      },
      {
        id: '5-5',
        name: 'Odpoczynek',
        duration: 20,
        instruction: 'Krótka przerwa - oddychaj głęboko!',
      },
      {
        id: '5-6',
        name: 'Wspinaczka górska turbo',
        duration: 40,
        instruction: 'Najszybciej jak potrafisz! Kolana do klatki piersiowej!',
      },
      {
        id: '5-7',
        name: 'Odpoczynek',
        duration: 20,
        instruction: 'Złap oddech!',
      },
      {
        id: '5-8',
        name: 'Skoki na boki',
        duration: 40,
        instruction: 'Skacz na boki jak łyżwiarz. Dynamicznie i z pełną mocą!',
      },
      {
        id: '5-9',
        name: 'Odpoczynek',
        duration: 20,
        instruction: 'Ostatnia przerwa przed finałem!',
      },
      {
        id: '5-10',
        name: 'Tabata finisher',
        duration: 40,
        instruction: 'Daj z siebie wszystko! Burpees lub pajacyki - nie zwalniaj!',
      },
      {
        id: '5-11',
        name: 'Cool down',
        duration: 60,
        instruction: 'Zwolnij tempo. Marsz w miejscu i głębokie oddechy.',
      },
    ],
  },
  {
    id: '6',
    name: 'Joga wieczorna',
    category: 'Relaks',
    duration: 20,
    difficulty: 'easy',
    calories: 60,
    exercises: [
      {
        id: '6-1',
        name: 'Pozycja dziecka',
        duration: 90,
        instruction: 'Klęknij i usiądź na piętach, pochyl się do przodu z wyciągniętymi rękami. Oddychaj głęboko i rozluźnij plecy.',
      },
      {
        id: '6-2',
        name: 'Kot-Krowa',
        duration: 90,
        instruction: 'Na czworakach naprzemiennie wyginaj kręgosłup w łuk (kot) i wklęsłość (krowa). Synchronizuj z oddechem.',
      },
      {
        id: '6-3',
        name: 'Pies z głową w dół',
        duration: 90,
        instruction: 'Z pozycji na czworakach wypchnij biodra do góry, tworząc odwrócone V. Naciskaj pięty w kierunku podłogi.',
      },
      {
        id: '6-4',
        name: 'Wojownik I',
        duration: 90,
        instruction: 'Stań w wykroku z tylną stopą pod kątem 45 stopni. Unieś ręce nad głowę, spójrz w górę.',
      },
      {
        id: '6-5',
        name: 'Wojownik II',
        duration: 90,
        instruction: 'Rozstaw szeroko nogi, skieruj jedną stopę w bok. Zegnij tę nogę i rozłóż ręce na boki.',
      },
      {
        id: '6-6',
        name: 'Trójkąt',
        duration: 90,
        instruction: 'Stań w szerokim rozkroku. Pochyl się w bok, dotykając jedną ręką kostki, drugą wyciągnij w górę.',
      },
      {
        id: '6-7',
        name: 'Gołąb',
        duration: 120,
        instruction: 'Zegnij jedną nogę przed sobą, drugą wyciągnij do tyłu. Pochyl się do przodu dla głębszego rozciągnięcia bioder.',
      },
      {
        id: '6-8',
        name: 'Skręt w leżeniu',
        duration: 90,
        instruction: 'Leż na plecach, przyciągnij kolano do klatki i opuść je na bok. Głowa skierowana w przeciwną stronę.',
      },
      {
        id: '6-9',
        name: 'Savasana',
        duration: 120,
        instruction: 'Leż płasko na plecach z rozluźnionymi rękami i nogami. Zamknij oczy i oddychaj spokojnie. Pozwól ciału się zrelaksować.',
      },
    ],
  },
];

export const categories = ['Wszystkie', 'Domowe 10 min', 'Dla początkujących', 'Cardio', 'Siła', 'Intensywny', 'Relaks'];

export const difficultyConfig = {
  easy: { label: 'Łatwy', color: 'bg-secondary text-secondary-foreground' },
  medium: { label: 'Średni', color: 'bg-accent text-accent-foreground' },
  hard: { label: 'Trudny', color: 'bg-destructive text-destructive-foreground' },
};
