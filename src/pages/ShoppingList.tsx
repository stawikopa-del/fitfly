import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Share2, Calendar, ChevronLeft, ChevronRight, ChevronDown, Trash2, Copy, Users, Plus, X, Gift, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';
import { CreateCustomListDialog } from '@/components/flyfit/CreateCustomListDialog';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
  packageCount: number;
  packageSize: number;
  packageUnit: string;
  displayAmount: string;
  isCustom?: boolean;
}

interface CustomItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  unit: string;
}

interface SharedList {
  id: string;
  owner_id: string;
  owner_name: string;
  items: Array<{
    name: string;
    amount: number;
    unit: string;
    category: string;
    displayAmount: string;
    checked?: boolean;
  }>;
  date_range_start: string | null;
  date_range_end: string | null;
  created_at: string;
}

// Polish name declension helper (genitive case - "od kogo?")
const declinePolishName = (name: string): string => {
  if (!name) return '';
  
  const trimmed = name.trim();
  const lastChar = trimmed.slice(-1).toLowerCase();
  const lastTwoChars = trimmed.slice(-2).toLowerCase();
  
  // Names ending in -a (feminine and some masculine)
  if (lastChar === 'a') {
    // Exception for -ia endings (Maria -> Marii)
    if (lastTwoChars === 'ia') {
      return trimmed.slice(0, -1) + 'i';
    }
    // Exception for -ja endings (Kaja -> Kai)
    if (lastTwoChars === 'ja') {
      return trimmed.slice(0, -1) + 'i';
    }
    // Standard -a -> -y (Anna -> Anny, Ola -> Oli)
    // Soft stem check (after soft consonants like ń, ś, ć, ź, dź, l, j use -i)
    const beforeA = trimmed.slice(-2, -1).toLowerCase();
    if (['l', 'j'].includes(beforeA) || trimmed.slice(-2).match(/[śćźń]a/i)) {
      return trimmed.slice(0, -1) + 'i';
    }
    return trimmed.slice(0, -1) + 'y';
  }
  
  // Masculine names ending in consonants
  // Common patterns:
  // -ek -> -ka (Marek -> Marka, Jacek -> Jacka)
  if (lastTwoChars === 'ek') {
    return trimmed.slice(0, -2) + 'ka';
  }
  // -eł -> -ła (Paweł -> Pawła)
  if (lastTwoChars === 'eł') {
    return trimmed.slice(0, -2) + 'ła';
  }
  // -sz -> -sza (Tomasz -> Tomasza)
  if (lastTwoChars === 'sz') {
    return trimmed + 'a';
  }
  // -n -> -na (Jan -> Jana, Stefan -> Stefana)
  if (lastChar === 'n') {
    return trimmed + 'a';
  }
  // -r -> -ra (Piotr -> Piotra)
  if (lastChar === 'r') {
    return trimmed + 'a';
  }
  // -ł -> -ła (Michał -> Michała)
  if (lastChar === 'ł') {
    return trimmed + 'a';
  }
  // -f -> -fa (Krzysztof -> Krzysztofa)
  if (lastChar === 'f') {
    return trimmed + 'a';
  }
  // -d -> -da (Dawid -> Dawida)
  if (lastChar === 'd') {
    return trimmed + 'a';
  }
  // -k -> -ka (Patryk -> Patryka)
  if (lastChar === 'k') {
    return trimmed + 'a';
  }
  // -s -> -sa (Mateusz exception handled above, generic: Marcin -> Marcina handled by n)
  if (lastChar === 's') {
    return trimmed + 'a';
  }
  // -z -> -za (Błażej is -ej)
  if (lastChar === 'z') {
    return trimmed + 'a';
  }
  // -j -> -ja (Maciej -> Macieja)
  if (lastChar === 'j') {
    return trimmed + 'a';
  }
  // -t -> -ta (Hubert -> Huberta)
  if (lastChar === 't') {
    return trimmed + 'a';
  }
  // -m -> -ma (Adam -> Adama)
  if (lastChar === 'm') {
    return trimmed + 'a';
  }
  // -c -> -ca (Kacper -> special, but -c generic)
  if (lastChar === 'c') {
    return trimmed + 'a';
  }
  // -w -> -wa (Sław compounds)
  if (lastChar === 'w') {
    return trimmed + 'a';
  }
  // -p -> -pa (Filip -> Filipa)
  if (lastChar === 'p') {
    return trimmed + 'a';
  }
  // -b -> -ba (Jakub -> Jakuba)
  if (lastChar === 'b') {
    return trimmed + 'a';
  }
  // -g -> -ga
  if (lastChar === 'g') {
    return trimmed + 'a';
  }
  
  // Default: just add 'a'
  return trimmed + 'a';
};

const AVAILABLE_UNITS = ['g', 'ml', 'kg', 'l', 'szt', 'opak'];
const CATEGORY_OPTIONS = [{
  key: 'pieczywo',
  label: 'Pieczywo',
  emoji: '🍞'
}, {
  key: 'nabial',
  label: 'Nabiał',
  emoji: '🥛'
}, {
  key: 'mieso',
  label: 'Mięso i ryby',
  emoji: '🥩'
}, {
  key: 'warzywa',
  label: 'Warzywa',
  emoji: '🥬'
}, {
  key: 'owoce',
  label: 'Owoce',
  emoji: '🍎'
}, {
  key: 'przyprawy',
  label: 'Przyprawy i oleje',
  emoji: '🧂'
}, {
  key: 'zboza',
  label: 'Zboża i makarony',
  emoji: '🍝'
}, {
  key: 'napoje',
  label: 'Napoje',
  emoji: '🥤'
}, {
  key: 'slodycze',
  label: 'Słodycze i przekąski',
  emoji: '🍫'
}, {
  key: 'inne',
  label: 'Inne',
  emoji: '📦'
}];
interface DietPlan {
  id: string;
  name: string;
  plan_data: {
    dailyMeals?: {
      breakfast: Array<{
        name: string;
        calories: number;
        description: string;
      }>;
      lunch: Array<{
        name: string;
        calories: number;
        description: string;
      }>;
      dinner: Array<{
        name: string;
        calories: number;
        description: string;
      }>;
      snacks: Array<{
        name: string;
        calories: number;
        description: string;
      }>;
    };
    weeklySchedule?: Array<{
      day: string;
      meals: string[];
    }>;
  };
}

// Polish word normalization - convert declined forms to base form
const POLISH_NORMALIZATION: Record<string, string> = {
  // Nabiał
  'mlekiem': 'mleko',
  'mleka': 'mleko',
  'mleku': 'mleko',
  'serem': 'ser',
  'sera': 'ser',
  'serze': 'ser',
  'serami': 'ser',
  'jogurtem': 'jogurt',
  'jogurtu': 'jogurt',
  'jogurtami': 'jogurt',
  'śmietaną': 'śmietana',
  'śmietany': 'śmietana',
  'śmietanie': 'śmietana',
  'masłem': 'masło',
  'masła': 'masło',
  'maśle': 'masło',
  'twarogiem': 'twaróg',
  'twarogu': 'twaróg',
  'jajkiem': 'jajko',
  'jajka': 'jajko',
  'jajek': 'jajko',
  'jajkami': 'jajko',
  'jaj': 'jajko',
  'kefirze': 'kefir',
  'kefirem': 'kefir',
  'kefiru': 'kefir',
  // Warzywa
  'marchewką': 'marchew',
  'marchwi': 'marchew',
  'marchewki': 'marchew',
  'cebulą': 'cebula',
  'cebuli': 'cebula',
  'cebulę': 'cebula',
  'czosnkiem': 'czosnek',
  'czosnku': 'czosnek',
  'pomidorem': 'pomidor',
  'pomidora': 'pomidor',
  'pomidorami': 'pomidor',
  'pomidory': 'pomidor',
  'pomidorów': 'pomidor',
  'ogórkiem': 'ogórek',
  'ogórka': 'ogórek',
  'ogórki': 'ogórek',
  'ogórków': 'ogórek',
  'sałatą': 'sałata',
  'sałaty': 'sałata',
  'sałacie': 'sałata',
  'papryką': 'papryka',
  'papryki': 'papryka',
  'papryce': 'papryka',
  'brokułami': 'brokuł',
  'brokułem': 'brokuł',
  'brokułów': 'brokuł',
  'brokuły': 'brokuł',
  'szpinakiem': 'szpinak',
  'szpinaku': 'szpinak',
  'kapustą': 'kapusta',
  'kapusty': 'kapusta',
  'kapuście': 'kapusta',
  'ziemniakami': 'ziemniak',
  'ziemniakiem': 'ziemniak',
  'ziemniaków': 'ziemniak',
  'ziemniaki': 'ziemniak',
  'cukinią': 'cukinia',
  'cukinii': 'cukinia',
  'bakłażanem': 'bakłażan',
  'bakłażana': 'bakłażan',
  'kalafiorem': 'kalafior',
  'kalafiora': 'kalafior',
  'porem': 'por',
  'pora': 'por',
  'porami': 'por',
  'selerem': 'seler',
  'selera': 'seler',
  'burakiem': 'burak',
  'buraka': 'burak',
  'burakami': 'burak',
  'buraki': 'burak',
  'pietruszkę': 'pietruszka',
  'pietruszki': 'pietruszka',
  'pietruszką': 'pietruszka',
  'szczypiorkiem': 'szczypiorek',
  'szczypiorku': 'szczypiorek',
  'rukolą': 'rukola',
  'rukoli': 'rukola',
  'awokado': 'awokado',
  // Owoce
  'jabłkiem': 'jabłko',
  'jabłka': 'jabłko',
  'jabłek': 'jabłko',
  'bananem': 'banan',
  'banana': 'banan',
  'bananami': 'banan',
  'banany': 'banan',
  'bananów': 'banan',
  'pomarańczą': 'pomarańcza',
  'pomarańczy': 'pomarańcza',
  'cytryną': 'cytryna',
  'cytryny': 'cytryna',
  'truskawkami': 'truskawka',
  'truskawek': 'truskawka',
  'truskawki': 'truskawka',
  'malinami': 'malina',
  'malin': 'malina',
  'maliny': 'malina',
  'jagodami': 'jagoda',
  'jagód': 'jagoda',
  'jagody': 'jagoda',
  'winogronami': 'winogrona',
  'winogron': 'winogrona',
  'grejpfrutem': 'grejpfrut',
  'grejpfruta': 'grejpfrut',
  'borówkami': 'borówka',
  'borówek': 'borówka',
  'borówki': 'borówka',
  // Mięso
  'kurczakiem': 'kurczak',
  'kurczaka': 'kurczak',
  'wołowiną': 'wołowina',
  'wołowiny': 'wołowina',
  'wieprzowiną': 'wieprzowina',
  'wieprzowiny': 'wieprzowina',
  'mięsem': 'mięso',
  'mięsa': 'mięso',
  'szynką': 'szynka',
  'szynki': 'szynka',
  'boczkiem': 'boczek',
  'boczku': 'boczek',
  'kiełbasą': 'kiełbasa',
  'kiełbasy': 'kiełbasa',
  'indykiem': 'indyk',
  'indyka': 'indyk',
  'łososiem': 'łosoś',
  'łososia': 'łosoś',
  'tuńczykiem': 'tuńczyk',
  'tuńczyka': 'tuńczyk',
  'krewetkami': 'krewetka',
  'krewetkę': 'krewetka',
  'krewetek': 'krewetka',
  'rybą': 'ryba',
  'ryby': 'ryba',
  'ryb': 'ryba',
  'piersią': 'pierś',
  'piersi': 'pierś',
  'filetem': 'filet',
  'fileta': 'filet',
  // Zboża i makarony
  'ryżem': 'ryż',
  'ryżu': 'ryż',
  'makaronem': 'makaron',
  'makaronu': 'makaron',
  'kaszą': 'kasza',
  'kaszy': 'kasza',
  'płatkami': 'płatki',
  'płatków': 'płatki',
  'mąką': 'mąka',
  'mąki': 'mąka',
  'owsianymi': 'owsiane',
  'owsianych': 'owsiane',
  'owsiane': 'płatki owsiane',
  'chlebem': 'chleb',
  'chleba': 'chleb',
  'bułką': 'bułka',
  'bułki': 'bułka',
  'bułek': 'bułka',
  'toastem': 'toast',
  'tosta': 'toast',
  'tosty': 'toast',
  // Przyprawy i dodatki
  'solą': 'sól',
  'soli': 'sól',
  'pieprzem': 'pieprz',
  'pieprzu': 'pieprz',
  'oregano': 'oregano',
  'bazylią': 'bazylia',
  'bazylii': 'bazylia',
  'tymiankiem': 'tymianek',
  'tymianku': 'tymianek',
  'kurkumą': 'kurkuma',
  'kurkumy': 'kurkuma',
  'cynamonem': 'cynamon',
  'cynamonu': 'cynamon',
  'imbirem': 'imbir',
  'imbiru': 'imbir',
  'oliwą': 'oliwa',
  'oliwy': 'oliwa',
  'olejem': 'olej',
  'oleju': 'olej',
  'octem': 'ocet',
  'octu': 'ocet',
  'miodem': 'miód',
  'miodu': 'miód',
  'cukrem': 'cukier',
  'cukru': 'cukier',
  // Inne
  'orzechami': 'orzechy',
  'orzechów': 'orzechy',
  'orzeszkami': 'orzechy',
  'migdałami': 'migdały',
  'migdałów': 'migdały',
  'tofu': 'tofu',
  'hummusem': 'hummus',
  'hummusu': 'hummus',
  'pastą': 'pasta',
  'pasty': 'pasta',
  'sosem': 'sos',
  'sosu': 'sos',
  'dżemem': 'dżem',
  'dżemu': 'dżem',
  'masłem orzechowym': 'masło orzechowe',
  'czekoladą': 'czekolada',
  'czekolady': 'czekolada'
};

// Standard package sizes for products
const PACKAGE_SIZES: Record<string, {
  size: number;
  unit: string;
  packageName: string;
}> = {
  // Nabiał - ml
  'mleko': {
    size: 1000,
    unit: 'ml',
    packageName: 'karton'
  },
  'jogurt': {
    size: 150,
    unit: 'g',
    packageName: 'kubek'
  },
  'śmietana': {
    size: 200,
    unit: 'ml',
    packageName: 'kubek'
  },
  'kefir': {
    size: 400,
    unit: 'ml',
    packageName: 'butelka'
  },
  'maślanka': {
    size: 500,
    unit: 'ml',
    packageName: 'butelka'
  },
  'ser': {
    size: 150,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'twaróg': {
    size: 200,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'masło': {
    size: 200,
    unit: 'g',
    packageName: 'kostka'
  },
  'jajko': {
    size: 10,
    unit: 'szt',
    packageName: 'opakowanie'
  },
  // Mięso/ryby - g
  'kurczak': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'pierś': {
    size: 400,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'filet': {
    size: 400,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'indyk': {
    size: 400,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'wołowina': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'wieprzowina': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'łosoś': {
    size: 200,
    unit: 'g',
    packageName: 'porcja'
  },
  'tuńczyk': {
    size: 170,
    unit: 'g',
    packageName: 'puszka'
  },
  'szynka': {
    size: 100,
    unit: 'g',
    packageName: 'plasterek'
  },
  'boczek': {
    size: 150,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'kiełbasa': {
    size: 300,
    unit: 'g',
    packageName: 'sztuka'
  },
  'krewetka': {
    size: 200,
    unit: 'g',
    packageName: 'opakowanie'
  },
  // Warzywa - g/szt
  'marchew': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'cebula': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'czosnek': {
    size: 1,
    unit: 'szt',
    packageName: 'główka'
  },
  'pomidor': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'ogórek': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'papryka': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'brokuł': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'kalafior': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'sałata': {
    size: 1,
    unit: 'szt',
    packageName: 'główka'
  },
  'szpinak': {
    size: 150,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'kapusta': {
    size: 1,
    unit: 'szt',
    packageName: 'główka'
  },
  'ziemniak': {
    size: 1000,
    unit: 'g',
    packageName: 'kg'
  },
  'cukinia': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'bakłażan': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'por': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'seler': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'burak': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'awokado': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'pietruszka': {
    size: 1,
    unit: 'pęczek',
    packageName: 'pęczek'
  },
  'szczypiorek': {
    size: 1,
    unit: 'pęczek',
    packageName: 'pęczek'
  },
  'rukola': {
    size: 100,
    unit: 'g',
    packageName: 'opakowanie'
  },
  // Owoce - szt
  'jabłko': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'banan': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'pomarańcza': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'cytryna': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'grejpfrut': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'kiwi': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'truskawka': {
    size: 250,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'malina': {
    size: 125,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'jagoda': {
    size: 125,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'borówka': {
    size: 125,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'winogrona': {
    size: 500,
    unit: 'g',
    packageName: 'kiść'
  },
  // Zboża
  'ryż': {
    size: 1000,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'makaron': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'kasza': {
    size: 400,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'płatki owsiane': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'płatki': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'mąka': {
    size: 1000,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'chleb': {
    size: 1,
    unit: 'szt',
    packageName: 'bochenek'
  },
  'bułka': {
    size: 1,
    unit: 'szt',
    packageName: 'sztuka'
  },
  'toast': {
    size: 500,
    unit: 'g',
    packageName: 'opakowanie'
  },
  // Przyprawy
  'sól': {
    size: 1000,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'pieprz': {
    size: 20,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'oregano': {
    size: 10,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'bazylia': {
    size: 10,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'tymianek': {
    size: 10,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'kurkuma': {
    size: 20,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'cynamon': {
    size: 15,
    unit: 'g',
    packageName: 'słoiczek'
  },
  'imbir': {
    size: 50,
    unit: 'g',
    packageName: 'korzeń'
  },
  'curry': {
    size: 20,
    unit: 'g',
    packageName: 'słoiczek'
  },
  // Oleje i płyny
  'oliwa': {
    size: 500,
    unit: 'ml',
    packageName: 'butelka'
  },
  'olej': {
    size: 1000,
    unit: 'ml',
    packageName: 'butelka'
  },
  'ocet': {
    size: 500,
    unit: 'ml',
    packageName: 'butelka'
  },
  'sos sojowy': {
    size: 150,
    unit: 'ml',
    packageName: 'butelka'
  },
  // Słodycze i przekąski
  'miód': {
    size: 400,
    unit: 'g',
    packageName: 'słoik'
  },
  'cukier': {
    size: 1000,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'orzechy': {
    size: 100,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'migdały': {
    size: 100,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'czekolada': {
    size: 100,
    unit: 'g',
    packageName: 'tabliczka'
  },
  'dżem': {
    size: 280,
    unit: 'g',
    packageName: 'słoik'
  },
  'masło orzechowe': {
    size: 350,
    unit: 'g',
    packageName: 'słoik'
  },
  // Inne
  'tofu': {
    size: 200,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'hummus': {
    size: 200,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'pasta': {
    size: 200,
    unit: 'g',
    packageName: 'opakowanie'
  },
  'sos': {
    size: 400,
    unit: 'g',
    packageName: 'słoik'
  }
};
const INGREDIENT_CATEGORIES: Record<string, {
  label: string;
  emoji: string;
  keywords: string[];
}> = {
  pieczywo: {
    label: 'Pieczywo',
    emoji: '🍞',
    keywords: ['chleb', 'bułk', 'bagiet', 'rogal', 'pieczywo', 'toast', 'chałk']
  },
  nabial: {
    label: 'Nabiał',
    emoji: '🥛',
    keywords: ['mleko', 'ser', 'jogurt', 'śmietana', 'masło', 'twaróg', 'kefir', 'maślank', 'jaj']
  },
  mieso: {
    label: 'Mięso i ryby',
    emoji: '🥩',
    keywords: ['kurczak', 'wołowin', 'wieprzow', 'mięso', 'szynk', 'boczek', 'kiełbas', 'ryb', 'łosoś', 'tuńczyk', 'krewetk', 'indyk', 'pierś', 'filet']
  },
  warzywa: {
    label: 'Warzywa',
    emoji: '🥬',
    keywords: ['marchew', 'cebul', 'czosnek', 'pomidor', 'ogórek', 'sałat', 'papryka', 'brokuł', 'szpinak', 'kapust', 'ziemniak', 'cukini', 'bakłażan', 'kalafior', 'por', 'seler', 'burak', 'awokado', 'pietruszk', 'szczypior', 'rukola']
  },
  owoce: {
    label: 'Owoce',
    emoji: '🍎',
    keywords: ['jabłk', 'banan', 'pomarańcz', 'cytryn', 'truskawk', 'maliny', 'jagod', 'winogrona', 'arbuz', 'melon', 'grejpfrut', 'kiwi', 'mango', 'ananas', 'borówk']
  },
  przyprawy: {
    label: 'Przyprawy i oleje',
    emoji: '🧂',
    keywords: ['sól', 'pieprz', 'oregano', 'bazylia', 'tymianek', 'kurkuma', 'curry', 'cynamon', 'imbir', 'przyprawa', 'oliw', 'olej', 'ocet']
  },
  zboza: {
    label: 'Zboża i makarony',
    emoji: '🍝',
    keywords: ['ryż', 'makaron', 'kasza', 'płatki', 'mąka', 'owsian', 'jęczmien', 'quinoa', 'kuskus', 'spaghetti']
  },
  napoje: {
    label: 'Napoje',
    emoji: '🥤',
    keywords: ['woda', 'sok', 'herbat', 'kawa', 'napój', 'kompot']
  },
  slodycze: {
    label: 'Słodycze i przekąski',
    emoji: '🍫',
    keywords: ['czekolad', 'cukier', 'miód', 'dżem', 'ciast', 'baton', 'herbatnik', 'orzechy', 'bakalie', 'migdał', 'masło orzechowe']
  },
  inne: {
    label: 'Inne',
    emoji: '📦',
    keywords: []
  }
};

// Polish plural forms for package names - MOVED BEFORE useMemo
const getPluralForm = (packageName: string, count: number): string => {
  const forms: Record<string, [string, string, string]> = {
    'opakowanie': ['opakowanie', 'opakowania', 'opakowań'],
    'karton': ['karton', 'kartony', 'kartonów'],
    'butelka': ['butelka', 'butelki', 'butelek'],
    'kubek': ['kubek', 'kubki', 'kubków'],
    'słoik': ['słoik', 'słoiki', 'słoików'],
    'słoiczek': ['słoiczek', 'słoiczki', 'słoiczków'],
    'sztuka': ['sztuka', 'sztuki', 'sztuk'],
    'puszka': ['puszka', 'puszki', 'puszek'],
    'kostka': ['kostka', 'kostki', 'kostek'],
    'tabliczka': ['tabliczka', 'tabliczki', 'tabliczek'],
    'główka': ['główka', 'główki', 'główek'],
    'bochenek': ['bochenek', 'bochenki', 'bochenków'],
    'kiść': ['kiść', 'kiście', 'kiści'],
    'porcja': ['porcja', 'porcje', 'porcji'],
    'pęczek': ['pęczek', 'pęczki', 'pęczków'],
    'korzeń': ['korzeń', 'korzenie', 'korzeni'],
    'plasterek': ['plasterek', 'plasterki', 'plasterków'],
    'kg': ['kg', 'kg', 'kg']
  };
  const form = forms[packageName] || [packageName, packageName, packageName];
  if (count === 1) return form[0];
  if (count >= 2 && count <= 4) return form[1];
  return form[2];
};

// Normalize ingredient name to base form
const normalizeIngredientName = (name: string): string => {
  const lower = name.toLowerCase().trim();

  // Check direct mapping first
  if (POLISH_NORMALIZATION[lower]) {
    return POLISH_NORMALIZATION[lower];
  }

  // Check if any normalization key is contained in the name
  for (const [declined, base] of Object.entries(POLISH_NORMALIZATION)) {
    if (lower.includes(declined)) {
      return base;
    }
  }

  // Capitalize first letter
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Extract amount and unit from string
const extractAmountAndUnit = (text: string): {
  amount: number;
  unit: string;
} | null => {
  // Match patterns like "100g", "100 g", "1,5 kg", "500ml", "2 szt", "1/2 kostki"
  const patterns = [/(\d+[,.]?\d*)\s*(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/gi, /(\d+)\/(\d+)\s*(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/gi];
  const match1 = text.match(patterns[0]);
  if (match1) {
    const amount = parseFloat(match1[0].match(/[\d,.]*/)?.[0]?.replace(',', '.') || '0');
    const unit = match1[0].match(/(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/i)?.[0]?.toLowerCase() || 'g';

    // Convert to base units
    if (unit === 'kg') return {
      amount: amount * 1000,
      unit: 'g'
    };
    if (unit === 'l') return {
      amount: amount * 1000,
      unit: 'ml'
    };
    if (unit === 'kostek' || unit === 'kostki') return {
      amount: amount,
      unit: 'szt'
    };
    if (unit === 'łyżk') return {
      amount: amount * 15,
      unit: 'g'
    };
    if (unit === 'szklan') return {
      amount: amount * 250,
      unit: 'ml'
    };
    return {
      amount,
      unit
    };
  }

  // Handle fractions like "1/2"
  const match2 = text.match(/(\d+)\/(\d+)\s*(kg|g|ml|l|szt)?/i);
  if (match2) {
    const amount = parseInt(match2[1]) / parseInt(match2[2]);
    const unit = match2[3]?.toLowerCase() || 'szt';
    return {
      amount,
      unit
    };
  }
  return null;
};

// Filter out non-ingredient words
const EXCLUDED_WORDS = ['oraz', 'lub', 'dla', 'bez', 'bardzo', 'lekko', 'dużo', 'mało', 'świeże', 'świeży', 'pokrojony', 'pokrojona', 'posiekany', 'posiekana', 'mały', 'mała', 'duży', 'duża', 'ugotowany', 'ugotowana', 'smażony', 'smażona', 'pieczony', 'pieczona', 'ciepły', 'ciepła', 'zimny', 'zimna', 'świeżo', 'delikatny', 'delikatna', 'podany', 'podana', 'przygotowany', 'przygotowana', 'gotowy', 'gotowa', 'kalorie', 'kcal', 'białko', 'węglowodany', 'tłuszcze', 'porcja', 'porcji', 'śniadanie', 'obiad', 'kolacja', 'przekąska', 'posiłek'];
const isIngredient = (word: string): boolean => {
  const lower = word.toLowerCase();
  if (EXCLUDED_WORDS.includes(lower)) return false;
  if (word.length < 3) return false;
  if (/^\d+$/.test(word)) return false; // Just a number
  if (/^\d+[,.]?\d*\s*[gmlk]/.test(word)) return false; // Just measurement
  return true;
};
const categorizeIngredient = (name: string): string => {
  const nameLower = name.toLowerCase();
  for (const [category, {
    keywords
  }] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }
  return 'inne';
};

// Get package info for ingredient
const getPackageInfo = (name: string, totalAmount: number, unit: string): {
  count: number;
  size: number;
  packageUnit: string;
  packageName: string;
} => {
  const nameLower = name.toLowerCase();

  // Find best matching package size
  let packageInfo = PACKAGE_SIZES[nameLower];
  if (!packageInfo) {
    // Try partial matching
    for (const [key, value] of Object.entries(PACKAGE_SIZES)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        packageInfo = value;
        break;
      }
    }
  }
  if (!packageInfo) {
    // Default package
    return {
      count: 1,
      size: 0,
      packageUnit: unit || 'szt',
      packageName: 'opakowanie'
    };
  }

  // Calculate number of packages needed
  let count = 1;
  if (packageInfo.size > 0 && totalAmount > 0) {
    // Handle unit conversion
    let adjustedAmount = totalAmount;
    if ((unit === 'g' || unit === 'ml') && packageInfo.unit === 'szt') {
      // Assume average weight per piece
      adjustedAmount = Math.ceil(totalAmount / 100);
    }
    count = Math.ceil(adjustedAmount / packageInfo.size);
  }
  return {
    count: Math.max(1, count),
    size: packageInfo.size,
    packageUnit: packageInfo.unit,
    packageName: packageInfo.packageName
  };
};

// Use the advanced shopping list processor
import { processShoppingList, ProcessedIngredient } from '@/utils/shoppingListProcessor';

// Wrapper for backward compatibility
const parseIngredientsFromMeals = (meals: Array<{
  name: string;
  description: string;
}>, dayMultiplier: number): ProcessedIngredient[] => {
  return processShoppingList(meals, dayMultiplier);
};
export default function ShoppingList() {
  const navigate = useNavigate();
  const {
    user,
    isInitialized
  } = useAuth();
  const {
    friends
  } = useFriends();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('inne');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('szt');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Date range selection
  const [weekOffset, setWeekOffset] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), {
    weekStartsOn: 1
  });
  const weekDays = Array.from({
    length: 7
  }, (_, i) => addDays(weekStart, i));

  // Load diet plan
  useEffect(() => {
    if (!isInitialized) return;
    const fetchDietPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from('saved_diet_plans').select('*').eq('user_id', user.id).order('created_at', {
          ascending: false
        }).limit(1).maybeSingle();
        if (error) {
          console.error('Error fetching diet plan:', error);
        }
        if (data) {
          setDietPlan(data as DietPlan);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDietPlan();
  }, [user, isInitialized]);

  // Load checked items and custom items from localStorage - with SSR guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedChecked = localStorage.getItem('shoppingListChecked');
      if (savedChecked) {
        setCheckedItems(new Set(JSON.parse(savedChecked)));
      }
      const savedCustom = localStorage.getItem('shoppingListCustomItems');
      if (savedCustom) {
        setCustomItems(JSON.parse(savedCustom));
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, []);

  // Save checked items to localStorage - with SSR guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('shoppingListChecked', JSON.stringify([...checkedItems]));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, [checkedItems]);

  // Save custom items to localStorage - with SSR guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('shoppingListCustomItems', JSON.stringify(customItems));
    } catch (err) {
      console.error('Error saving custom items:', err);
    }
  }, [customItems]);

  // State for shared lists received from friends
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [sentLists, setSentLists] = useState<SharedList[]>([]); // Lists I sent to others
  const [loadingSharedLists, setLoadingSharedLists] = useState(false);
  
  // Favorite shopping lists
  const [favoriteLists, setFavoriteLists] = useState<Array<{
    id: string;
    name: string;
    items: any[];
    created_at: string;
  }>>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Load favorite shopping lists
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    
    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('favorite_shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavoriteLists((data || []).map(d => ({
        id: d.id,
        name: d.name,
        items: d.items as any[],
        created_at: d.created_at,
      })));
    } catch (err) {
      console.error('Error fetching favorite lists:', err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isInitialized || !user) return;
    fetchFavorites();
  }, [user, isInitialized, fetchFavorites]);

  // Load shared lists from friends
  useEffect(() => {
    if (!isInitialized || !user) return;

    const fetchSharedLists = async () => {
      setLoadingSharedLists(true);
      try {
        const { data: shared, error } = await supabase
          .from('shared_shopping_lists')
          .select('*')
          .eq('shared_with_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching shared_shopping_lists:', error);
          setSharedLists([]);
          return;
        }

        

        if (shared && shared.length > 0) {
          // Get owner profiles - use RPC function to bypass RLS
          const ownerIds = [...new Set(shared.map(s => s.owner_id))];
          
          // Fetch profiles for each owner using the get_friend_profile RPC
          const profilesMap: Record<string, string> = {};
          for (const ownerId of ownerIds) {
            try {
              const { data: profileData } = await supabase
                .rpc('get_friend_profile', { friend_user_id: ownerId });
              if (profileData && profileData.length > 0) {
                profilesMap[ownerId] = profileData[0].display_name || 'Znajomy';
              }
            } catch (e) {
              console.error('Error fetching owner profile:', e);
            }
          }

          const listsWithNames: SharedList[] = shared.map(s => {
            return {
              id: s.id,
              owner_id: s.owner_id,
              owner_name: profilesMap[s.owner_id] || 'Znajomy',
              items: (s.items as SharedList['items']) || [],
              date_range_start: s.date_range_start,
              date_range_end: s.date_range_end,
              created_at: s.created_at
            };
          });
          setSharedLists(listsWithNames);
        } else {
          setSharedLists([]);
        }

        // Also fetch lists I sent to others
        const { data: mySentLists, error: sentError } = await supabase
          .from('shared_shopping_lists')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (!sentError && mySentLists && mySentLists.length > 0) {
          const recipientIds = [...new Set(mySentLists.map(s => s.shared_with_id))];
          const recipientsMap: Record<string, string> = {};
          
          for (const recipientId of recipientIds) {
            try {
              const { data: profileData } = await supabase
                .rpc('get_friend_profile', { friend_user_id: recipientId });
              if (profileData && profileData.length > 0) {
                recipientsMap[recipientId] = profileData[0].display_name || 'Znajomy';
              }
            } catch (e) {
              console.error('Error fetching recipient profile:', e);
            }
          }

          const sentListsWithNames: SharedList[] = mySentLists.map(s => ({
            id: s.id,
            owner_id: s.owner_id,
            owner_name: recipientsMap[s.shared_with_id] || 'Znajomy',
            items: (s.items as SharedList['items']) || [],
            date_range_start: s.date_range_start,
            date_range_end: s.date_range_end,
            created_at: s.created_at
          }));
          setSentLists(sentListsWithNames);
        } else {
          setSentLists([]);
        }
      } catch (err) {
        console.error('Error fetching shared lists:', err);
      } finally {
        setLoadingSharedLists(false);
      }
    };

    fetchSharedLists();
  }, [user, isInitialized]);

  // Delete a shared list
  const deleteSharedList = useCallback(async (listId: string) => {
    try {
      soundFeedback.buttonClick();
    } catch {}

    try {
      const { error } = await supabase
        .from('shared_shopping_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      setSharedLists(prev => prev.filter(l => l.id !== listId));
      toast.success('Usunięto listę');
    } catch (err) {
      console.error('Error deleting shared list:', err);
      toast.error('Nie udało się usunąć listy');
    }
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    try {
      soundFeedback.buttonClick();
    } catch {}
    if (selectingStart || !startDate) {
      setStartDate(date);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelectingStart(true);
    }
  }, [selectingStart, startDate]);

  // Combine diet plan ingredients with custom items
  const ingredients = useMemo(() => {
    const result: Ingredient[] = [];

    // Add custom items first (always visible, no date selection needed)
    customItems.forEach(item => {
      const displayAmount = `${item.amount} ${item.unit}`;
      result.push({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        category: item.category,
        checked: checkedItems.has(item.name.toLowerCase()),
        packageCount: 1,
        packageSize: item.amount,
        packageUnit: item.unit,
        displayAmount,
        isCustom: true
      });
    });

    // Only add diet plan ingredients if dates are selected
    if (dietPlan?.plan_data && startDate && endDate) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Collect all meals
      const allMeals: Array<{
        name: string;
        description: string;
      }> = [];
      if (dietPlan.plan_data.dailyMeals) {
        const {
          breakfast,
          lunch,
          dinner,
          snacks
        } = dietPlan.plan_data.dailyMeals;
        [...(breakfast || []), ...(lunch || []), ...(dinner || []), ...(snacks || [])].forEach(meal => {
          allMeals.push({
            name: meal?.name || '',
            description: meal?.description || ''
          });
        });
      }

      // Parse and aggregate ingredients using new processor
      const parsedIngredients = parseIngredientsFromMeals(allMeals, daysDiff);

      // Convert to final format
      parsedIngredients.forEach((ing) => {
        // Skip if already added as custom item
        if (customItems.some(ci => ci.name.toLowerCase() === ing.name.toLowerCase())) {
          return;
        }
        
        result.push({
          name: ing.name,
          amount: ing.totalAmount,
          unit: ing.unit,
          category: ing.category,
          checked: checkedItems.has(ing.name.toLowerCase()),
          packageCount: ing.packageCount,
          packageSize: ing.packageSize,
          packageUnit: ing.unit,
          displayAmount: ing.displayText
        });
      });
    }
    return result;
  }, [dietPlan, startDate, endDate, checkedItems, customItems]);
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};
    ingredients.forEach(ing => {
      if (!groups[ing.category]) {
        groups[ing.category] = [];
      }
      groups[ing.category].push(ing);
    });

    // Sort categories
    const sortedGroups: Record<string, Ingredient[]> = {};
    Object.keys(INGREDIENT_CATEGORIES).forEach(cat => {
      if (groups[cat]) {
        sortedGroups[cat] = groups[cat].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
      }
    });
    return sortedGroups;
  }, [ingredients]);
  
  // Save current list to favorites
  const saveToFavorites = useCallback(async () => {
    if (!user || ingredients.length === 0) return;

    try {
      soundFeedback.buttonClick();
    } catch {}

    const listName = startDate && endDate 
      ? `Lista ${format(startDate, 'd.MM', { locale: pl })} - ${format(endDate, 'd.MM', { locale: pl })}`
      : `Lista ${format(new Date(), 'd.MM.yyyy', { locale: pl })}`;

    const itemsToSave = ingredients.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      displayAmount: ing.displayAmount,
    }));

    try {
      const { data, error } = await supabase
        .from('favorite_shopping_lists')
        .insert({
          user_id: user.id,
          name: listName,
          items: itemsToSave,
        })
        .select()
        .single();

      if (error) throw error;

      setFavoriteLists(prev => [{
        id: data.id,
        name: data.name,
        items: data.items as any[],
        created_at: data.created_at,
      }, ...prev]);
      toast.success('Zapisano do ulubionych! ❤️');
    } catch (err) {
      console.error('Error saving to favorites:', err);
      toast.error('Nie udało się zapisać');
    }
  }, [user, ingredients, startDate, endDate]);

  // Delete favorite list
  const deleteFavorite = useCallback(async (id: string) => {
    try {
      soundFeedback.buttonClick();
    } catch {}

    try {
      const { error } = await supabase
        .from('favorite_shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFavoriteLists(prev => prev.filter(l => l.id !== id));
      toast.success('Usunięto z ulubionych');
    } catch (err) {
      console.error('Error deleting favorite:', err);
      toast.error('Nie udało się usunąć');
    }
  }, []);

  const toggleItem = useCallback((name: string) => {
    try {
      soundFeedback.buttonClick();
    } catch {}
    const key = name.toLowerCase();
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(key)) {
        newChecked.delete(key);
      } else {
        newChecked.add(key);
      }
      return newChecked;
    });
  }, []);
  const clearChecked = useCallback(() => {
    try {
      soundFeedback.buttonClick();
    } catch {}
    setCheckedItems(new Set());
    toast.success('Lista wyczyszczona');
  }, []);
  const addCustomItem = useCallback(() => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) {
      toast.error('Wpisz nazwę produktu');
      return;
    }
    const parsedAmount = parseFloat(newItemAmount) || 1;
    if (parsedAmount <= 0) {
      toast.error('Ilość musi być większa od zera');
      return;
    }

    // Check for duplicates
    if (customItems.some(ci => ci.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error('Ten produkt już jest na liście');
      return;
    }
    const newItem: CustomItem = {
      id: Date.now().toString(),
      name: trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1),
      category: newItemCategory,
      amount: parsedAmount,
      unit: newItemUnit
    };
    setCustomItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemCategory('inne');
    setNewItemAmount('1');
    setNewItemUnit('szt');
    setShowAddDialog(false);
    toast.success('Dodano produkt');
  }, [newItemName, customItems, newItemCategory, newItemAmount, newItemUnit]);
  const removeCustomItem = useCallback((itemId: string) => {
    setCustomItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Usunięto produkt');
  }, []);
  const copyToClipboard = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Kopiowanie niedostępne');
      return;
    }
    try {
      soundFeedback.buttonClick();
    } catch {}
    let text = '🛒 Lista zakupów FITFLY\n';
    if (startDate && endDate) {
      text += `📅 ${format(startDate, 'd MMM', {
        locale: pl
      })} - ${format(endDate, 'd MMM yyyy', {
        locale: pl
      })}\n\n`;
    } else if (customItems.length > 0) {
      text += '\n';
    }
    Object.entries(groupedIngredients).forEach(([category, items]) => {
      const catConfig = INGREDIENT_CATEGORIES[category];
      if (!catConfig) return;
      text += `${catConfig.emoji} ${catConfig.label}:\n`;
      items.forEach(item => {
        const checkbox = checkedItems.has(item.name.toLowerCase()) ? '✅' : '⬜';
        text += `  ${checkbox} ${item.name} - ${item.displayAmount}\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Skopiowano do schowka! 📋');
    }).catch(() => {
      toast.error('Nie udało się skopiować');
    });
  }, [groupedIngredients, startDate, endDate, checkedItems, customItems]);
  const shareWithFriend = useCallback(async (friendId: string) => {
    if (!user) return;
    try {
      soundFeedback.buttonClick();
    } catch {}

    // Prepare items for sharing
    const itemsToShare = ingredients.map(item => ({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      displayAmount: item.displayAmount
    }));

    try {
      // Insert into shared_shopping_lists table
      const { data: sharedList, error } = await supabase
        .from('shared_shopping_lists')
        .insert({
          owner_id: user.id,
          shared_with_id: friendId,
          items: itemsToShare,
          date_range_start: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          date_range_end: endDate ? format(endDate, 'yyyy-MM-dd') : null
        })
        .select('id')
        .single();

      if (error) throw error;

      // Send a message in chat with shopping list notification
      await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: friendId,
          content: '🛒 Udostępniono Ci listę zakupów!',
          message_type: 'shopping_list',
          recipe_data: { shoppingListId: sharedList.id }
        });

      toast.success('Lista zakupów została udostępniona! 🛒');
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Nie udało się udostępnić listy');
    }
  }, [user, ingredients, startDate, endDate]);
  const checkedCount = ingredients.filter(i => checkedItems.has(i.name.toLowerCase())).length;
  const progress = ingredients.length > 0 ? checkedCount / ingredients.length * 100 : 0;

  // Loading state
  if (!isInitialized) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>;
  }
  return <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={() => {
          try {
            soundFeedback.navTap();
          } catch {}
          navigate('/inne');
        }} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              Lista zakupów <ShoppingCart className="w-5 h-5" />
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={saveToFavorites} 
            disabled={ingredients.length === 0}
            title="Dodaj do ulubionych"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} disabled={ingredients.length === 0}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 space-y-6 py-4">
        {/* Info banner - show when no dates selected */}
        {(!startDate || !endDate) && (
          <div className="bg-muted rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Najpierw wybierz okres w kalendarzu 🗓️
            </p>
          </div>
        )}

        {/* Calendar Date Range Selector */}
        <div id="calendar-section" className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful py-[8px]">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => {
            try {
              soundFeedback.buttonClick();
            } catch {}
            setWeekOffset(w => w - 1);
          }} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="text-center">
              <p className="font-bold text-foreground">
                {format(weekStart, 'MMMM yyyy', {
                locale: pl
              })}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectingStart ? 'Wybierz początek okresu' : 'Wybierz koniec okresu'}
              </p>
            </div>
            <button onClick={() => {
            try {
              soundFeedback.buttonClick();
            } catch {}
            setWeekOffset(w => w + 1);
          }} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>)}
            {weekDays.map(day => {
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);
            const isInRange = startDate && endDate && isWithinInterval(day, {
              start: startDate,
              end: endDate
            });
            const isToday = isSameDay(day, new Date());
            return <button key={day.toISOString()} onClick={() => handleDateClick(day)} className={cn("aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm font-medium", isStart && "bg-primary text-primary-foreground", isEnd && "bg-primary text-primary-foreground", isInRange && !isStart && !isEnd && "bg-primary/20 text-foreground", !isStart && !isEnd && !isInRange && "hover:bg-muted", isToday && !isStart && !isEnd && "ring-2 ring-primary/50")}>
                  <span>{format(day, 'd')}</span>
                </button>;
          })}
          </div>

          {startDate && endDate && <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
              <p className="text-sm font-medium text-foreground">
                <Calendar className="w-4 h-4 inline mr-2" />
                {format(startDate, 'd MMMM', {
              locale: pl
            })} — {format(endDate, 'd MMMM yyyy', {
              locale: pl
            })}
              </p>
            </div>}
        </div>

        {/* Moje listy Section Header */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold font-display text-foreground">
            Moje listy
          </h2>
          
          {/* Twoja dieta button - only show if user has a diet plan */}
          {dietPlan && (
            <button
              onClick={() => {
                try { soundFeedback.buttonClick(); } catch {}
                navigate('/lista-zakupow/dieta');
              }}
              className="w-full bg-gradient-to-r from-secondary/20 via-fitfly-green/20 to-fitfly-green-light/20 rounded-3xl p-5 border-2 border-secondary/30 shadow-card-playful hover:-translate-y-1 transition-all duration-300 relative z-10 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-fitfly-green-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
                    Twoja dieta
                    <span>🥗</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Generuj listę zakupów z planu diety</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )}
          
          {/* Create custom list button */}
          <button
            onClick={() => {
              try { soundFeedback.buttonClick(); } catch {}
              setShowCreateListDialog(true);
            }}
            className="w-full bg-gradient-to-r from-primary/20 via-fitfly-blue/20 to-fitfly-blue-light/20 rounded-3xl p-5 border-2 border-primary/30 border-dashed shadow-card-playful hover:-translate-y-1 transition-all duration-300 relative z-10 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-fitfly-blue-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-extrabold font-display text-foreground flex items-center gap-2">
                  Utwórz swoją listę
                  <span>✨</span>
                </h3>
                <p className="text-sm text-muted-foreground">Dodaj produkty, notatki i udostępnij</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Custom Items Notice */}
        {customItems.length > 0 && (!startDate || !endDate) && <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-foreground">
              Masz {customItems.length} własnych produktów na liście
            </p>
          </div>}

        {/* Favorite Lists Section */}
        {(loadingFavorites || favoriteLists.length > 0) && (
          <div className="bg-card rounded-2xl border-2 border-destructive/30 p-4 shadow-card-playful">
            <h2 className="font-bold font-display text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
              Ulubione listy zakupów
            </h2>
            
            {loadingFavorites ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : favoriteLists.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak ulubionych list
              </p>
            ) : (
              <div className="space-y-3">
                {favoriteLists.map(list => (
                  <div key={list.id} className="bg-muted/50 rounded-xl overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {list.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {list.items?.length || 0} produktów • {format(new Date(list.created_at), 'd MMM yyyy', { locale: pl })}
                          </p>
                        </div>
                        <button 
                          onClick={() => deleteFavorite(list.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          try { soundFeedback.buttonClick(); } catch {}
                          navigate(`/lista-zakupow/fav/${list.id}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Otwórz listę
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shared Lists from Friends */}
        {(loadingSharedLists || sharedLists.length > 0) && (
          <div className="bg-card rounded-2xl border-2 border-secondary/30 p-4 shadow-card-playful">
            <h2 className="font-bold font-display text-foreground mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-secondary" />
              Udostępnione listy zakupów
            </h2>
            
            {loadingSharedLists ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sharedLists.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak udostępnionych list
              </p>
            ) : (
              <div className="space-y-3">
                {sharedLists.map(list => {
                  const totalCount = list.items.length;
                  // Count checked items from database (items with checked: true)
                  const checkedCount = list.items.filter(item => item.checked).length;
                  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

                  return (
                    <div key={list.id} className="bg-muted/50 rounded-xl overflow-hidden">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <User className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">
                              Udostępnione przez {declinePolishName(list.owner_name)}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteSharedList(list.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {list.date_range_start && list.date_range_end && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {format(new Date(list.date_range_start), 'd MMM', { locale: pl })} — {format(new Date(list.date_range_end), 'd MMM', { locale: pl })}
                          </p>
                        )}
                        
                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Postęp zakupów</span>
                            <span className="text-xs font-medium text-primary">{checkedCount}/{totalCount}</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                          </div>
                        </div>

                        {/* Open list button - navigates to dedicated page */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            try { soundFeedback.buttonClick(); } catch {}
                            navigate(`/lista-zakupow/${list.id}`);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Otwórz listę ({totalCount} produktów)
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lists I sent to others */}
        {sentLists.length > 0 && (
          <div className="bg-card rounded-2xl border-2 border-primary/30 p-4 shadow-card-playful">
            <h2 className="font-bold font-display text-foreground mb-3 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Wysłane listy zakupów
            </h2>
            <div className="space-y-3">
              {sentLists.map(list => {
                const totalCount = list.items.length;
                const checkedCount = list.items.filter(item => item.checked).length;
                const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
                
                return (
                  <div key={list.id} className="bg-muted/50 rounded-xl overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            Wysłano do: {list.owner_name}
                          </p>
                          {list.date_range_start && list.date_range_end && (
                            <p className="text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {format(new Date(list.date_range_start), 'd MMM', { locale: pl })} — {format(new Date(list.date_range_end), 'd MMM', { locale: pl })}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={async () => {
                            try { soundFeedback.buttonClick(); } catch {}
                            try {
                              await supabase.from('shared_shopping_lists').delete().eq('id', list.id);
                              setSentLists(prev => prev.filter(l => l.id !== list.id));
                              toast.success('Usunięto udostępnioną listę');
                            } catch (err) {
                              toast.error('Nie udało się usunąć');
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Postęp zakupów</span>
                          <span className="text-xs font-medium text-primary">{checkedCount}/{totalCount}</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                      </div>

                      {/* Open list button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          try { soundFeedback.buttonClick(); } catch {}
                          navigate(`/lista-zakupow/${list.id}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Otwórz listę ({totalCount} produktów)
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj własny produkt
        </Button>

        {loading ? <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div> : ingredients.length === 0 && !dietPlan ? <div className="text-center py-12 px-4">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-bold text-foreground mb-2">Brak planu diety</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Skonfiguruj dietę lub dodaj własne produkty
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/konfiguracja-diety')}>
                Skonfiguruj dietę
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj własny produkt
              </Button>
            </div>
          </div> : ingredients.length === 0 ? <div className="text-center py-8 px-4">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Wybierz okres na kalendarzu powyżej
lub dodaj własne produkty</p>
            
          </div> : <>
            {/* Progress Bar */}
            <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Postęp zakupów
                </span>
                <span className="text-sm font-bold text-primary">
                  {checkedCount}/{ingredients.length}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{
              width: `${progress}%`
            }} />
              </div>
              {checkedCount > 0 && <div className="flex justify-end mt-2">
                  <button onClick={clearChecked} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Wyczyść zaznaczone
                  </button>
                </div>}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Kopiuj listę
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowShareDialog(true)}>
                <Users className="w-4 h-4 mr-2" />
                Wyślij znajomemu
              </Button>
            </div>

            {/* Ingredient Categories */}
            <div className="space-y-4">
              {Object.entries(groupedIngredients).map(([category, items]) => {
            const catConfig = INGREDIENT_CATEGORIES[category];
            if (!catConfig) return null;
            const categoryChecked = items.filter(i => checkedItems.has(i.name.toLowerCase())).length;
            const isCollapsed = collapsedCategories.has(category);
            const allChecked = categoryChecked === items.length;
            return <div key={category} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
                    <button onClick={() => {
                try {
                  soundFeedback.buttonClick();
                } catch {}
                setCollapsedCategories(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(category)) {
                    newSet.delete(category);
                  } else {
                    newSet.add(category);
                  }
                  return newSet;
                });
              }} className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted/70 transition-colors">
                      <span className={cn("font-bold flex items-center gap-2 transition-colors", allChecked ? "text-muted-foreground" : "text-foreground")}>
                        <span className="text-xl">{catConfig.emoji}</span>
                        {catConfig.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", allChecked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                          {categoryChecked}/{items.length}
                        </span>
                        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", isCollapsed && "-rotate-90")} />
                      </div>
                    </button>
                    <div className={cn("divide-y divide-border/30 transition-all duration-200 overflow-hidden", isCollapsed ? "max-h-0" : "max-h-[2000px]")}>
                      {items.map((item, idx) => {
                  const isChecked = checkedItems.has(item.name.toLowerCase());
                  return <div key={`${item.name}-${idx}`} className={cn("w-full px-4 py-3 flex items-center gap-3 transition-all", isChecked && "bg-primary/5")}>
                            <button onClick={() => toggleItem(item.name)} className="flex-1 flex items-center gap-3 text-left">
                              <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0", isChecked ? "bg-primary border-primary" : "border-border")}>
                                {isChecked && <Check className="w-4 h-4 text-primary-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("font-medium transition-all", isChecked ? "text-muted-foreground line-through" : "text-foreground")}>
                                  {item.name}
                                  {item.isCustom && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                      własny
                                    </span>}
                                </p>
                                <p className={cn("text-xs", isChecked ? "text-muted-foreground/50" : "text-muted-foreground")}>
                                  {item.displayAmount}
                                </p>
                              </div>
                            </button>
                            {item.isCustom && <button onClick={() => {
                      const customItem = customItems.find(ci => ci.name === item.name);
                      if (customItem) {
                        removeCustomItem(customItem.id);
                      }
                    }} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                <X className="w-4 h-4" />
                              </button>}
                          </div>;
                })}
                    </div>
                  </div>;
          })}
            </div>
          </>}
      </div>

      {/* Add Custom Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Dodaj własny produkt
            </DialogTitle>
            <DialogDescription>
              Dodaj produkt, który chcesz kupić
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nazwa produktu</label>
              <Input placeholder="np. Masło, Chleb..." value={newItemName} onChange={e => setNewItemName(e.target.value)} onKeyDown={e => {
              if (e.key === 'Enter') {
                addCustomItem();
              }
            }} autoFocus />
            </div>
            
            {/* Category Selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Kategoria</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {CATEGORY_OPTIONS.map(cat => <button key={cat.key} type="button" onClick={() => setNewItemCategory(cat.key)} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border", newItemCategory === cat.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50")}>
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>)}
              </div>
            </div>
            
            {/* Amount and Unit */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Ilość</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="1" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} min="0.1" step="0.1" className="flex-1" />
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {AVAILABLE_UNITS.map(unit => <button key={unit} type="button" onClick={() => setNewItemUnit(unit)} className={cn("px-3 py-2 text-sm font-medium transition-all", newItemUnit === unit ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}>
                      {unit}
                    </button>)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => {
              setShowAddDialog(false);
              setNewItemName('');
              setNewItemCategory('inne');
              setNewItemAmount('1');
              setNewItemUnit('szt');
            }}>
                Anuluj
              </Button>
              <Button className="flex-1" onClick={addCustomItem} disabled={!newItemName.trim()}>
                Dodaj
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Udostępnij listę
            </DialogTitle>
            <DialogDescription>
              Wyślij listę zakupów znajomemu
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {!friends || friends.length === 0 ? <p className="text-center text-sm text-muted-foreground py-4">
                Nie masz jeszcze znajomych
              </p> : friends.map(friend => <button key={friend.id} onClick={() => shareWithFriend(friend.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{friend.displayName || 'Użytkownik'}</p>
                    {friend.username && <p className="text-xs text-muted-foreground">@{friend.username}</p>}
                  </div>
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>)}
          </div>

          <Button variant="outline" onClick={copyToClipboard} className="w-full mt-2">
            <Copy className="w-4 h-4 mr-2" />
            Kopiuj do schowka
          </Button>
        </DialogContent>
      </Dialog>

      {/* Create Custom List Dialog */}
      <CreateCustomListDialog
        open={showCreateListDialog}
        onOpenChange={setShowCreateListDialog}
        onListCreated={() => {
          fetchFavorites();
          // Also refresh shared lists
          if (user) {
            supabase
              .from('shared_shopping_lists')
              .select('*')
              .eq('owner_id', user.id)
              .order('created_at', { ascending: false })
              .then(async ({ data: mySentLists }) => {
                if (mySentLists && mySentLists.length > 0) {
                  const recipientIds = [...new Set(mySentLists.map(s => s.shared_with_id))];
                  const recipientsMap: Record<string, string> = {};
                  
                  for (const recipientId of recipientIds) {
                    try {
                      const { data: profileData } = await supabase
                        .rpc('get_friend_profile', { friend_user_id: recipientId });
                      if (profileData && profileData.length > 0) {
                        recipientsMap[recipientId] = profileData[0].display_name || 'Znajomy';
                      }
                    } catch (e) {}
                  }

                  setSentLists(mySentLists.map(s => ({
                    id: s.id,
                    owner_id: s.owner_id,
                    owner_name: recipientsMap[s.shared_with_id] || 'Znajomy',
                    items: (s.items as any) || [],
                    date_range_start: s.date_range_start,
                    date_range_end: s.date_range_end,
                    created_at: s.created_at
                  })));
                }
              });
          }
        }}
      />
    </div>;
}