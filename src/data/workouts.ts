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
];

export const categories = ['Wszystkie', 'Domowe 10 min'];

export const difficultyConfig = {
  easy: { label: 'Łatwy', color: 'bg-secondary text-secondary-foreground' },
  medium: { label: 'Średni', color: 'bg-accent text-accent-foreground' },
  hard: { label: 'Trudny', color: 'bg-destructive text-destructive-foreground' },
};
