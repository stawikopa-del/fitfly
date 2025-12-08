// Comprehensive workout programs data

export type WorkoutCategory = 'morning' | 'evening' | 'hiit' | 'strength' | 'stretch' | 'core' | 'quick';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type BodyFocus = 'full-body' | 'upper' | 'lower' | 'core' | 'cardio';

export interface WorkoutExercise {
  id: string;
  name: string;
  duration: number; // seconds
  instruction: string;
  tips: string[];
  muscleGroups: string[];
  animationType: 'pulse' | 'bounce' | 'rotate' | 'breathe' | 'static';
  intensity: 'low' | 'medium' | 'high';
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  calories: { min: number; max: number };
  bodyFocus: BodyFocus;
  exercises: WorkoutExercise[];
  breakDuration: number; // seconds between exercises
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
  xpReward: number;
  unlockLevel: number;
  icon: string;
  gradient: string;
  recommended?: boolean;
}

// Breathing patterns for rest periods
export interface BreathingPattern {
  name: string;
  inhale: number; // seconds
  hold: number;
  exhale: number;
  cycles: number;
  benefit: string;
}

export const breathingPatterns: BreathingPattern[] = [
  {
    name: 'Regenerujący',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 2,
    benefit: 'Szybka regeneracja między ćwiczeniami'
  },
  {
    name: 'Uspokajający',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 2,
    benefit: 'Obniża tętno i uspokaja umysł'
  },
  {
    name: 'Energetyzujący',
    inhale: 3,
    hold: 0,
    exhale: 3,
    cycles: 3,
    benefit: 'Dodaje energii przed intensywnym ćwiczeniem'
  }
];

// Motivational tips shown during rest
export const restTips: string[] = [
  '💧 Pamiętaj o piciu wody!',
  '🎯 Skup się na technice, nie na prędkości',
  '💪 Każdy powtórzenie przybliża cię do celu',
  '🧘 Oddychaj głęboko i równomiernie',
  '⚡ Twoje mięśnie właśnie się wzmacniają',
  '🏆 Jesteś silniejszy niż myślisz',
  '🔥 Każda kropla potu to inwestycja w zdrowie',
  '✨ Konsekwencja jest kluczem do sukcesu'
];

// Workout programs
export const workoutPrograms: WorkoutProgram[] = [
  // Morning Energy Boost - Featured
  {
    id: 'morning-energy',
    name: 'Poranny Zastrzyk Energii',
    description: 'Idealny start dnia! Delikatna rozgrzewka, która obudzi twoje ciało i umysł.',
    category: 'morning',
    difficulty: 'beginner',
    duration: 10,
    calories: { min: 45, max: 70 },
    bodyFocus: 'full-body',
    breakDuration: 15,
    warmupIncluded: true,
    cooldownIncluded: true,
    xpReward: 50,
    unlockLevel: 1,
    icon: '🌅',
    gradient: 'from-amber-400 to-orange-500',
    recommended: true,
    exercises: [
      {
        id: 'me-1',
        name: 'Marsz w miejscu',
        duration: 60,
        instruction: 'Unieś kolana wysoko, machaj ramionami w rytm kroków. Utrzymuj równe tempo.',
        tips: ['Utrzymuj wyprostowaną postawę', 'Oddychaj rytmicznie'],
        muscleGroups: ['nogi', 'core'],
        animationType: 'bounce',
        intensity: 'low'
      },
      {
        id: 'me-2',
        name: 'Pajacyki',
        duration: 60,
        instruction: 'Wykonuj skoki rozstawiając nogi i unosząc ręce nad głowę. Ląduj miękko.',
        tips: ['Ląduj na palcach', 'Utrzymuj lekkie ugięcie kolan'],
        muscleGroups: ['całe ciało'],
        animationType: 'pulse',
        intensity: 'medium'
      },
      {
        id: 'me-3',
        name: 'Dynamiczne skłony',
        duration: 45,
        instruction: 'Stój prosto, powoli schylaj się do stóp. Poczuj rozciąganie w tylnej części nóg.',
        tips: ['Nie blokuj kolan', 'Skup się na rozciąganiu'],
        muscleGroups: ['plecy', 'nogi'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'me-4',
        name: 'Rotacje tułowia',
        duration: 45,
        instruction: 'Stój stabilnie, obracaj tułów na boki z rękami na biodrach.',
        tips: ['Głowa podąża za ruchem', 'Biodra pozostają stabilne'],
        muscleGroups: ['core', 'plecy'],
        animationType: 'rotate',
        intensity: 'low'
      },
      {
        id: 'me-5',
        name: 'Przysiad z wyciągnięciem',
        duration: 60,
        instruction: 'Wykonaj przysiad, a wstając wyciągnij się na palcach z rękami w górze.',
        tips: ['Kolana nie wychodzą przed palce stóp', 'Napnij pośladki na górze'],
        muscleGroups: ['nogi', 'pośladki'],
        animationType: 'pulse',
        intensity: 'medium'
      },
      {
        id: 'me-6',
        name: 'Koci grzbiet',
        duration: 60,
        instruction: 'Na czworakach wyginaj i wyprostowuj plecy jak kot. Oddychaj spokojnie.',
        tips: ['Synchronizuj ruch z oddechem', 'Rozluźnij szyję'],
        muscleGroups: ['plecy', 'core'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'me-7',
        name: 'Plank',
        duration: 30,
        instruction: 'Oprzyj się na przedramionach i palcach stóp. Utrzymuj proste plecy.',
        tips: ['Napnij brzuch', 'Nie unoś bioder'],
        muscleGroups: ['core', 'ramiona'],
        animationType: 'static',
        intensity: 'high'
      },
      {
        id: 'me-8',
        name: 'Wymachy nóg',
        duration: 60,
        instruction: 'Na przemian unoś nogę w bok i opuszczaj. Utrzymuj równowagę.',
        tips: ['Trzymaj się ściany jeśli potrzebujesz', 'Kontroluj ruch'],
        muscleGroups: ['nogi', 'pośladki'],
        animationType: 'pulse',
        intensity: 'medium'
      },
      {
        id: 'me-9',
        name: 'Mountain Climbers',
        duration: 45,
        instruction: 'W pozycji podporu przyciągaj na przemian kolana do klatki piersiowej.',
        tips: ['Utrzymuj stabilny tułów', 'Pracuj w swoim tempie'],
        muscleGroups: ['core', 'nogi', 'ramiona'],
        animationType: 'bounce',
        intensity: 'high'
      },
      {
        id: 'me-10',
        name: 'Oddech wdzięczności',
        duration: 30,
        instruction: 'Stań prosto, weź głęboki wdech przez nos, powoli wydychaj przez usta.',
        tips: ['Zamknij oczy', 'Poczuj wdzięczność za swoje ciało'],
        muscleGroups: [],
        animationType: 'breathe',
        intensity: 'low'
      }
    ]
  },
  // Evening Wind-Down
  {
    id: 'evening-relax',
    name: 'Wieczorny Relaks',
    description: 'Spokojne ćwiczenia rozciągające przygotowujące ciało do snu.',
    category: 'evening',
    difficulty: 'beginner',
    duration: 15,
    calories: { min: 30, max: 50 },
    bodyFocus: 'full-body',
    breakDuration: 20,
    warmupIncluded: false,
    cooldownIncluded: true,
    xpReward: 40,
    unlockLevel: 1,
    icon: '🌙',
    gradient: 'from-indigo-400 to-purple-600',
    exercises: [
      {
        id: 'er-1',
        name: 'Rozciąganie szyi',
        duration: 60,
        instruction: 'Delikatnie przechylaj głowę na boki, do przodu i do tyłu.',
        tips: ['Wykonuj powolne ruchy', 'Nie forsuj'],
        muscleGroups: ['szyja'],
        animationType: 'rotate',
        intensity: 'low'
      },
      {
        id: 'er-2',
        name: 'Rozciąganie ramion',
        duration: 60,
        instruction: 'Przyciągnij ramię do klatki piersiowej drugą ręką. Zmień stronę.',
        tips: ['Trzymaj ramię proste', 'Oddychaj głęboko'],
        muscleGroups: ['ramiona', 'barki'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'er-3',
        name: 'Pozycja dziecka',
        duration: 90,
        instruction: 'Klęknij i usiądź na piętach, wyciągnij ręce przed siebie i połóż czoło na macie.',
        tips: ['Rozluźnij plecy', 'Skup się na oddechu'],
        muscleGroups: ['plecy', 'biodra'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'er-4',
        name: 'Skręt kręgosłupa',
        duration: 90,
        instruction: 'Leżąc na plecach, przyciągnij kolana do klatki i obróć je na bok.',
        tips: ['Utrzymaj ramiona na podłodze', 'Zmień strony'],
        muscleGroups: ['plecy', 'core'],
        animationType: 'rotate',
        intensity: 'low'
      },
      {
        id: 'er-5',
        name: 'Rozciąganie bioder',
        duration: 90,
        instruction: 'W pozycji gołębia, jedna noga zgięta przed sobą, druga wyprostowana za sobą.',
        tips: ['Trzymaj biodra równo', 'Oddychaj w napięcie'],
        muscleGroups: ['biodra', 'pośladki'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'er-6',
        name: 'Rozciąganie nóg',
        duration: 60,
        instruction: 'Leżąc na plecach, chwyć jedną nogę za łydkę i przyciągnij do siebie.',
        tips: ['Utrzymaj drugą nogę na podłodze', 'Zmień nogi'],
        muscleGroups: ['nogi'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'er-7',
        name: 'Medytacja oddechowa',
        duration: 120,
        instruction: 'Połóż się wygodnie, zamknij oczy. Skup się na spokojnym oddechu.',
        tips: ['Puść wszystkie myśli', 'Czuj jak ciało się relaksuje'],
        muscleGroups: [],
        animationType: 'breathe',
        intensity: 'low'
      }
    ]
  },
  // Quick HIIT
  {
    id: 'quick-hiit',
    name: 'Ekspresowe HIIT',
    description: 'Intensywny trening interwałowy dla tych, którzy mają mało czasu.',
    category: 'hiit',
    difficulty: 'intermediate',
    duration: 7,
    calories: { min: 80, max: 120 },
    bodyFocus: 'full-body',
    breakDuration: 10,
    warmupIncluded: true,
    cooldownIncluded: false,
    xpReward: 70,
    unlockLevel: 3,
    icon: '⚡',
    gradient: 'from-red-500 to-orange-500',
    exercises: [
      {
        id: 'qh-1',
        name: 'Szybki marsz',
        duration: 30,
        instruction: 'Dynamiczny marsz w miejscu - rozgrzewka.',
        tips: ['Unoś kolana wysoko', 'Pompuj ramionami'],
        muscleGroups: ['nogi'],
        animationType: 'bounce',
        intensity: 'low'
      },
      {
        id: 'qh-2',
        name: 'Burpees',
        duration: 30,
        instruction: 'Pełne burpees: przysiad, skok do podporu, pompka, skok w górę.',
        tips: ['Modyfikuj jeśli potrzebujesz', 'Jakość > ilość'],
        muscleGroups: ['całe ciało'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'qh-3',
        name: 'Przysiady z wyskokiem',
        duration: 30,
        instruction: 'Przysiad i dynamiczny wyskok w górę z uniesionymi rękami.',
        tips: ['Ląduj miękko', 'Pełny zakres ruchu'],
        muscleGroups: ['nogi', 'pośladki'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'qh-4',
        name: 'Mountain Climbers Sprint',
        duration: 30,
        instruction: 'Szybkie przyciąganie kolan w pozycji podporu.',
        tips: ['Utrzymuj biodra nisko', 'Maksymalne tempo'],
        muscleGroups: ['core', 'nogi'],
        animationType: 'bounce',
        intensity: 'high'
      },
      {
        id: 'qh-5',
        name: 'High Knees',
        duration: 30,
        instruction: 'Bieg w miejscu z wysokim unoszeniem kolan.',
        tips: ['Kolana na wysokość bioder', 'Szybkie tempo'],
        muscleGroups: ['nogi', 'core'],
        animationType: 'bounce',
        intensity: 'high'
      },
      {
        id: 'qh-6',
        name: 'Plank Jacks',
        duration: 30,
        instruction: 'W pozycji deski wykonuj pajacyki nogami.',
        tips: ['Stabilny tułów', 'Kontrolowany ruch'],
        muscleGroups: ['core', 'nogi'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'qh-7',
        name: 'Skoki boczne',
        duration: 30,
        instruction: 'Dynamiczne skoki z boku na bok.',
        tips: ['Ląduj na jednej nodze', 'Utrzymuj równowagę'],
        muscleGroups: ['nogi'],
        animationType: 'bounce',
        intensity: 'high'
      },
      {
        id: 'qh-8',
        name: 'Finałowe Burpees',
        duration: 30,
        instruction: 'Ostatnia runda burpees - daj z siebie wszystko!',
        tips: ['To ostatnie ćwiczenie!', 'Pełna moc!'],
        muscleGroups: ['całe ciało'],
        animationType: 'pulse',
        intensity: 'high'
      }
    ]
  },
  // Core Crusher
  {
    id: 'core-crusher',
    name: 'Stalowy Brzuch',
    description: 'Skoncentrowany trening mięśni brzucha i core.',
    category: 'core',
    difficulty: 'intermediate',
    duration: 12,
    calories: { min: 60, max: 90 },
    bodyFocus: 'core',
    breakDuration: 15,
    warmupIncluded: true,
    cooldownIncluded: true,
    xpReward: 60,
    unlockLevel: 2,
    icon: '🔥',
    gradient: 'from-yellow-500 to-red-500',
    exercises: [
      {
        id: 'cc-1',
        name: 'Rozgrzewka - Marsz',
        duration: 45,
        instruction: 'Marsz w miejscu z napięciem brzucha.',
        tips: ['Wciągnij pępek', 'Utrzymuj napięcie'],
        muscleGroups: ['core'],
        animationType: 'bounce',
        intensity: 'low'
      },
      {
        id: 'cc-2',
        name: 'Dead Bug',
        duration: 45,
        instruction: 'Leżąc na plecach, naprzemiennie prostuj przeciwną rękę i nogę.',
        tips: ['Plecy przyciśnięte do podłoża', 'Powolne ruchy'],
        muscleGroups: ['core'],
        animationType: 'pulse',
        intensity: 'medium'
      },
      {
        id: 'cc-3',
        name: 'Bicycle Crunches',
        duration: 45,
        instruction: 'Skręty tułowia z przyciąganiem kolana do przeciwnego łokcia.',
        tips: ['Nie szarp szyją', 'Kontroluj ruch'],
        muscleGroups: ['brzuch', 'skośne'],
        animationType: 'rotate',
        intensity: 'medium'
      },
      {
        id: 'cc-4',
        name: 'Plank',
        duration: 45,
        instruction: 'Klasyczna deska na przedramionach.',
        tips: ['Prosta linia od głowy do pięt', 'Oddychaj równomiernie'],
        muscleGroups: ['core'],
        animationType: 'static',
        intensity: 'high'
      },
      {
        id: 'cc-5',
        name: 'Leg Raises',
        duration: 45,
        instruction: 'Leżąc na plecach, unoś wyprostowane nogi do 90 stopni.',
        tips: ['Plecy na podłodze', 'Powolne opuszczanie'],
        muscleGroups: ['dolny brzuch'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'cc-6',
        name: 'Side Plank',
        duration: 60,
        instruction: 'Deska boczna - 30 sekund na każdą stronę.',
        tips: ['Biodra w górze', 'Stabilna pozycja'],
        muscleGroups: ['skośne', 'core'],
        animationType: 'static',
        intensity: 'high'
      },
      {
        id: 'cc-7',
        name: 'Flutter Kicks',
        duration: 45,
        instruction: 'Leżąc na plecach, wykonuj małe kopnięcia nogami na przemian.',
        tips: ['Nogi nisko nad ziemią', 'Napięty brzuch'],
        muscleGroups: ['dolny brzuch'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'cc-8',
        name: 'Russian Twists',
        duration: 45,
        instruction: 'Siedząc z lekko uniesionymi nogami, obracaj tułów na boki.',
        tips: ['Spleć ręce przed sobą', 'Kontroluj rotację'],
        muscleGroups: ['skośne'],
        animationType: 'rotate',
        intensity: 'medium'
      },
      {
        id: 'cc-9',
        name: 'V-Ups',
        duration: 30,
        instruction: 'Leżąc na plecach, jednocześnie unoś nogi i tułów, dotykając stóp.',
        tips: ['Dynamiczny ruch', 'Maksymalne napięcie'],
        muscleGroups: ['brzuch'],
        animationType: 'pulse',
        intensity: 'high'
      },
      {
        id: 'cc-10',
        name: 'Rozciąganie',
        duration: 60,
        instruction: 'Cobra stretch i pozycja dziecka na zmianę.',
        tips: ['Oddychaj głęboko', 'Rozluźnij mięśnie'],
        muscleGroups: ['core', 'plecy'],
        animationType: 'breathe',
        intensity: 'low'
      }
    ]
  },
  // 5-minute Quick Stretch
  {
    id: 'quick-stretch',
    name: '5-Minutowy Stretch',
    description: 'Szybkie rozciąganie idealne w przerwie od pracy.',
    category: 'quick',
    difficulty: 'beginner',
    duration: 5,
    calories: { min: 15, max: 25 },
    bodyFocus: 'full-body',
    breakDuration: 5,
    warmupIncluded: false,
    cooldownIncluded: false,
    xpReward: 25,
    unlockLevel: 1,
    icon: '⏱️',
    gradient: 'from-teal-400 to-cyan-500',
    exercises: [
      {
        id: 'qs-1',
        name: 'Rozciąganie szyi',
        duration: 45,
        instruction: 'Przechylaj głowę na boki, przód i tył.',
        tips: ['Delikatne ruchy', 'Zamknij oczy'],
        muscleGroups: ['szyja'],
        animationType: 'rotate',
        intensity: 'low'
      },
      {
        id: 'qs-2',
        name: 'Krążenia ramion',
        duration: 45,
        instruction: 'Duże kręgi ramionami do przodu i do tyłu.',
        tips: ['Rozluźnij barki', 'Pełny zakres ruchu'],
        muscleGroups: ['ramiona', 'barki'],
        animationType: 'rotate',
        intensity: 'low'
      },
      {
        id: 'qs-3',
        name: 'Skłon do stóp',
        duration: 45,
        instruction: 'Powoli schyl się do stóp, rozluźniając plecy.',
        tips: ['Nie blokuj kolan', 'Oddychaj'],
        muscleGroups: ['plecy', 'nogi'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'qs-4',
        name: 'Rozciąganie bioder',
        duration: 45,
        instruction: 'Wykrok jedną nogą do przodu, delikatne ściskanie biodra.',
        tips: ['Utrzymuj równowagę', 'Zmień nogi'],
        muscleGroups: ['biodra'],
        animationType: 'breathe',
        intensity: 'low'
      },
      {
        id: 'qs-5',
        name: 'Głębokie oddechy',
        duration: 30,
        instruction: 'Stań prosto, skup się na 5 głębokich oddechach.',
        tips: ['Wdech przez nos', 'Wydech przez usta'],
        muscleGroups: [],
        animationType: 'breathe',
        intensity: 'low'
      }
    ]
  }
];

// Get workout by ID
export const getWorkoutById = (id: string): WorkoutProgram | undefined => {
  return workoutPrograms.find(w => w.id === id);
};

// Get workouts by category
export const getWorkoutsByCategory = (category: WorkoutCategory): WorkoutProgram[] => {
  return workoutPrograms.filter(w => w.category === category);
};

// Get recommended workouts
export const getRecommendedWorkouts = (): WorkoutProgram[] => {
  return workoutPrograms.filter(w => w.recommended);
};

// Category display names
export const categoryNames: Record<WorkoutCategory, string> = {
  morning: 'Poranne',
  evening: 'Wieczorne',
  hiit: 'HIIT',
  strength: 'Siłowe',
  stretch: 'Rozciąganie',
  core: 'Core',
  quick: 'Szybkie'
};

// Difficulty display config
export const difficultyConfig: Record<DifficultyLevel, { label: string; color: string }> = {
  beginner: { label: 'Początkujący', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  intermediate: { label: 'Średniozaawansowany', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
  advanced: { label: 'Zaawansowany', color: 'bg-red-500/20 text-red-600 dark:text-red-400' }
};
