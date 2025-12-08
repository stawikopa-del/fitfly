export interface MorningExercise {
  id: number;
  name: string;
  duration: number; // in seconds
  instruction: string;
  breakDuration: number; // in seconds
}

export const morningWorkoutData = {
  name: 'Poranny trening 10 minut',
  totalTime: '10 minut',
  difficulty: 'Łatwy',
  calories: '45–70 kcal',
  exercises: [
    {
      id: 1,
      name: 'Marsz w miejscu',
      duration: 60,
      instruction: 'Unieś kolana wysoko, machaj ramionami w rytm kroków. Utrzymuj równe tempo.',
      breakDuration: 15,
    },
    {
      id: 2,
      name: 'Pajacyki wolnym tempem',
      duration: 60,
      instruction: 'Wykonuj skoki rozstawiając nogi i unosząc ręce nad głowę. Ląduj miękko.',
      breakDuration: 15,
    },
    {
      id: 3,
      name: 'Skłony do stóp',
      duration: 45,
      instruction: 'Stój prosto, powoli schylaj się do stóp. Poczuj rozciąganie w tylnej części nóg.',
      breakDuration: 15,
    },
    {
      id: 4,
      name: 'Rotacje tułowia',
      duration: 45,
      instruction: 'Stój stabilnie, obracaj tułów na boki z rękami na biodrach. Głowa podąża za ruchem.',
      breakDuration: 15,
    },
    {
      id: 5,
      name: 'Przysiad + wyjście na palce',
      duration: 60,
      instruction: 'Wykonaj przysiad, a wstając wyciągnij się na palcach z rękami w górze.',
      breakDuration: 15,
    },
    {
      id: 6,
      name: 'Koci grzbiet',
      duration: 60,
      instruction: 'Na czworakach wyginaj i wyprostowuj plecy jak kot. Oddychaj spokojnie.',
      breakDuration: 15,
    },
    {
      id: 7,
      name: 'Deska',
      duration: 30,
      instruction: 'Oprzyj się na przedramionach i palcach stóp. Utrzymuj proste plecy i napięty brzuch.',
      breakDuration: 15,
    },
    {
      id: 8,
      name: 'Wymachy nogi w bok prawa',
      duration: 45,
      instruction: 'Stój prosto, unieś prawą nogę w bok i opuść. Utrzymuj równowagę.',
      breakDuration: 15,
    },
    {
      id: 9,
      name: 'Wymachy nogi w bok lewa',
      duration: 45,
      instruction: 'Stój prosto, unieś lewą nogę w bok i opuść. Utrzymuj równowagę.',
      breakDuration: 15,
    },
    {
      id: 10,
      name: 'Podpór + przyciąganie kolana',
      duration: 45,
      instruction: 'W pozycji podporu przyciągaj na przemian kolana do klatki piersiowej.',
      breakDuration: 15,
    },
    {
      id: 11,
      name: 'Głęboki wdech i wydech',
      duration: 30,
      instruction: 'Stań prosto, weź głęboki wdech przez nos, powoli wydychaj przez usta. Zrelaksuj ciało.',
      breakDuration: 0, // Last exercise, no break
    },
  ] as MorningExercise[],
};
