export type BadgeType = 
  | 'pierwszy_krok'
  | 'wodny_wojownik'
  | 'maratonczyk'
  | 'konsekwentny'
  | 'mistrz_nawykow'
  | 'dietetyk'
  | 'niezniszczalny'
  | 'stuprocentowy'
  | 'wczesny_ptaszek'
  | 'nocny_marek'
  | 'zelazna_wola'
  | 'zdrowy_duch'
  | 'fit_guru'
  | 'legenda';

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
}

export interface UserGamification {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  daily_login_streak: number;
  last_login_date: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  description: string | null;
  created_at: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: 'pierwszy_krok',
    name: 'Pierwszy Krok',
    description: 'Ukończ swój pierwszy trening',
    icon: '🏃',
    color: 'bg-green-500',
    requirement: 'Ukończ 1 trening'
  },
  {
    type: 'wodny_wojownik',
    name: 'Wodny Wojownik',
    description: 'Pij wystarczająco wody przez 7 dni z rzędu',
    icon: '💧',
    color: 'bg-blue-500',
    requirement: '7 dni osiągania celu wody'
  },
  {
    type: 'maratonczyk',
    name: 'Maratończyk',
    description: 'Zrób łącznie 100 000 kroków',
    icon: '🏅',
    color: 'bg-yellow-500',
    requirement: '100 000 kroków łącznie'
  },
  {
    type: 'konsekwentny',
    name: 'Konsekwentny',
    description: 'Zaloguj się 7 dni z rzędu',
    icon: '🔥',
    color: 'bg-orange-500',
    requirement: '7 dni streak logowania'
  },
  {
    type: 'mistrz_nawykow',
    name: 'Mistrz Nawyków',
    description: 'Ukończ 30 nawyków',
    icon: '✅',
    color: 'bg-emerald-500',
    requirement: '30 ukończonych nawyków'
  },
  {
    type: 'dietetyk',
    name: 'Dietetyk',
    description: 'Loguj posiłki przez 7 dni z rzędu',
    icon: '🥗',
    color: 'bg-lime-500',
    requirement: '7 dni logowania posiłków'
  },
  {
    type: 'niezniszczalny',
    name: 'Niezniszczalny',
    description: 'Utrzymaj 30-dniową serię logowania',
    icon: '💪',
    color: 'bg-red-500',
    requirement: '30 dni streak logowania'
  },
  {
    type: 'stuprocentowy',
    name: 'Stuprocentowy',
    description: 'Osiągnij wszystkie dzienne cele w jednym dniu',
    icon: '💯',
    color: 'bg-purple-500',
    requirement: '100% dziennych celów'
  },
  {
    type: 'wczesny_ptaszek',
    name: 'Wczesny Ptaszek',
    description: 'Ukończ trening przed 8:00 rano',
    icon: '🌅',
    color: 'bg-amber-500',
    requirement: 'Trening przed 8:00'
  },
  {
    type: 'nocny_marek',
    name: 'Nocny Marek',
    description: 'Ukończ trening po 22:00',
    icon: '🌙',
    color: 'bg-indigo-500',
    requirement: 'Trening po 22:00'
  },
  {
    type: 'zelazna_wola',
    name: 'Żelazna Wola',
    description: 'Ukończ 50 treningów',
    icon: '🏋️',
    color: 'bg-slate-500',
    requirement: '50 ukończonych treningów'
  },
  {
    type: 'zdrowy_duch',
    name: 'Zdrowy Duch',
    description: 'Osiągnij poziom 10',
    icon: '🌟',
    color: 'bg-cyan-500',
    requirement: 'Poziom 10'
  },
  {
    type: 'fit_guru',
    name: 'Fit Guru',
    description: 'Zdobądź 10 000 XP',
    icon: '🧘',
    color: 'bg-pink-500',
    requirement: '10 000 XP łącznie'
  },
  {
    type: 'legenda',
    name: 'Legenda',
    description: 'Osiągnij poziom 25',
    icon: '👑',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    requirement: 'Poziom 25'
  }
];

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  800,    // Level 5
  1200,   // Level 6
  1700,   // Level 7
  2300,   // Level 8
  3000,   // Level 9
  3800,   // Level 10
  4700,   // Level 11
  5700,   // Level 12
  6800,   // Level 13
  8000,   // Level 14
  9300,   // Level 15
  10700,  // Level 16
  12200,  // Level 17
  13800,  // Level 18
  15500,  // Level 19
  17300,  // Level 20
  19200,  // Level 21
  21200,  // Level 22
  23300,  // Level 23
  25500,  // Level 24
  27800,  // Level 25
  30200,  // Level 26+
];

export const XP_REWARDS = {
  workout_completed: 50,
  water_goal_reached: 20,
  meal_logged: 10,
  habit_completed: 15,
  challenge_completed: 100,
  steps_1000: 5,
  daily_login: 10,
  all_daily_goals: 30,
};

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 3000;
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

export function getXPProgress(totalXP: number, currentLevel: number): { current: number; required: number; percentage: number } {
  const currentLevelXP = currentLevel <= LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[currentLevel - 1] : 
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length) * 3000;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  
  return {
    current: xpInCurrentLevel,
    required: xpNeededForLevel,
    percentage: Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100)
  };
}
