import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Share2, Calendar, ChevronLeft, ChevronRight, Trash2, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';

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
}

interface DietPlan {
  id: string;
  name: string;
  plan_data: {
    dailyMeals?: {
      breakfast: Array<{ name: string; calories: number; description: string }>;
      lunch: Array<{ name: string; calories: number; description: string }>;
      dinner: Array<{ name: string; calories: number; description: string }>;
      snacks: Array<{ name: string; calories: number; description: string }>;
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
  'mlekiem': 'mleko', 'mleka': 'mleko', 'mleku': 'mleko',
  'serem': 'ser', 'sera': 'ser', 'serze': 'ser', 'serami': 'ser',
  'jogurtem': 'jogurt', 'jogurtu': 'jogurt', 'jogurtami': 'jogurt',
  'śmietaną': 'śmietana', 'śmietany': 'śmietana', 'śmietanie': 'śmietana',
  'masłem': 'masło', 'masła': 'masło', 'maśle': 'masło',
  'twarogiem': 'twaróg', 'twarogu': 'twaróg',
  'jajkiem': 'jajko', 'jajka': 'jajko', 'jajek': 'jajko', 'jajkami': 'jajko', 'jaj': 'jajko',
  'kefirze': 'kefir', 'kefirem': 'kefir', 'kefiru': 'kefir',
  
  // Warzywa
  'marchewką': 'marchew', 'marchwi': 'marchew', 'marchewki': 'marchew',
  'cebulą': 'cebula', 'cebuli': 'cebula', 'cebulę': 'cebula',
  'czosnkiem': 'czosnek', 'czosnku': 'czosnek',
  'pomidorem': 'pomidor', 'pomidora': 'pomidor', 'pomidorami': 'pomidor', 'pomidory': 'pomidor', 'pomidorów': 'pomidor',
  'ogórkiem': 'ogórek', 'ogórka': 'ogórek', 'ogórki': 'ogórek', 'ogórków': 'ogórek',
  'sałatą': 'sałata', 'sałaty': 'sałata', 'sałacie': 'sałata',
  'papryką': 'papryka', 'papryki': 'papryka', 'papryce': 'papryka',
  'brokułami': 'brokuł', 'brokułem': 'brokuł', 'brokułów': 'brokuł', 'brokuły': 'brokuł',
  'szpinakiem': 'szpinak', 'szpinaku': 'szpinak',
  'kapustą': 'kapusta', 'kapusty': 'kapusta', 'kapuście': 'kapusta',
  'ziemniakami': 'ziemniak', 'ziemniakiem': 'ziemniak', 'ziemniaków': 'ziemniak', 'ziemniaki': 'ziemniak',
  'cukinią': 'cukinia', 'cukinii': 'cukinia',
  'bakłażanem': 'bakłażan', 'bakłażana': 'bakłażan',
  'kalafiorem': 'kalafior', 'kalafiora': 'kalafior',
  'porem': 'por', 'pora': 'por', 'porami': 'por',
  'selerem': 'seler', 'selera': 'seler',
  'burakiem': 'burak', 'buraka': 'burak', 'burakami': 'burak', 'buraki': 'burak',
  'pietruszkę': 'pietruszka', 'pietruszki': 'pietruszka', 'pietruszką': 'pietruszka',
  'szczypiorkiem': 'szczypiorek', 'szczypiorku': 'szczypiorek',
  'rukolą': 'rukola', 'rukoli': 'rukola',
  'awokado': 'awokado',
  
  // Owoce
  'jabłkiem': 'jabłko', 'jabłka': 'jabłko', 'jabłek': 'jabłko',
  'bananem': 'banan', 'banana': 'banan', 'bananami': 'banan', 'banany': 'banan', 'bananów': 'banan',
  'pomarańczą': 'pomarańcza', 'pomarańczy': 'pomarańcza',
  'cytryną': 'cytryna', 'cytryny': 'cytryna',
  'truskawkami': 'truskawka', 'truskawek': 'truskawka', 'truskawki': 'truskawka',
  'malinami': 'malina', 'malin': 'malina', 'maliny': 'malina',
  'jagodami': 'jagoda', 'jagód': 'jagoda', 'jagody': 'jagoda',
  'winogronami': 'winogrona', 'winogron': 'winogrona',
  'grejpfrutem': 'grejpfrut', 'grejpfruta': 'grejpfrut',
  'borówkami': 'borówka', 'borówek': 'borówka', 'borówki': 'borówka',
  
  // Mięso
  'kurczakiem': 'kurczak', 'kurczaka': 'kurczak',
  'wołowiną': 'wołowina', 'wołowiny': 'wołowina',
  'wieprzowiną': 'wieprzowina', 'wieprzowiny': 'wieprzowina',
  'mięsem': 'mięso', 'mięsa': 'mięso',
  'szynką': 'szynka', 'szynki': 'szynka',
  'boczkiem': 'boczek', 'boczku': 'boczek',
  'kiełbasą': 'kiełbasa', 'kiełbasy': 'kiełbasa',
  'indykiem': 'indyk', 'indyka': 'indyk',
  'łososiem': 'łosoś', 'łososia': 'łosoś',
  'tuńczykiem': 'tuńczyk', 'tuńczyka': 'tuńczyk',
  'krewetkami': 'krewetka', 'krewetkę': 'krewetka', 'krewetek': 'krewetka',
  'rybą': 'ryba', 'ryby': 'ryba', 'ryb': 'ryba',
  'piersią': 'pierś', 'piersi': 'pierś',
  'filetem': 'filet', 'fileta': 'filet',
  
  // Zboża i makarony
  'ryżem': 'ryż', 'ryżu': 'ryż',
  'makaronem': 'makaron', 'makaronu': 'makaron',
  'kaszą': 'kasza', 'kaszy': 'kasza',
  'płatkami': 'płatki', 'płatków': 'płatki',
  'mąką': 'mąka', 'mąki': 'mąka',
  'owsianymi': 'owsiane', 'owsianych': 'owsiane', 'owsiane': 'płatki owsiane',
  'chlebem': 'chleb', 'chleba': 'chleb',
  'bułką': 'bułka', 'bułki': 'bułka', 'bułek': 'bułka',
  'toastem': 'toast', 'tosta': 'toast', 'tosty': 'toast',
  
  // Przyprawy i dodatki
  'solą': 'sól', 'soli': 'sól',
  'pieprzem': 'pieprz', 'pieprzu': 'pieprz',
  'oregano': 'oregano',
  'bazylią': 'bazylia', 'bazylii': 'bazylia',
  'tymiankiem': 'tymianek', 'tymianku': 'tymianek',
  'kurkumą': 'kurkuma', 'kurkumy': 'kurkuma',
  'cynamonem': 'cynamon', 'cynamonu': 'cynamon',
  'imbirem': 'imbir', 'imbiru': 'imbir',
  'oliwą': 'oliwa', 'oliwy': 'oliwa',
  'olejem': 'olej', 'oleju': 'olej',
  'octem': 'ocet', 'octu': 'ocet',
  'miodem': 'miód', 'miodu': 'miód',
  'cukrem': 'cukier', 'cukru': 'cukier',
  
  // Inne
  'orzechami': 'orzechy', 'orzechów': 'orzechy', 'orzeszkami': 'orzechy',
  'migdałami': 'migdały', 'migdałów': 'migdały',
  'tofu': 'tofu',
  'hummusem': 'hummus', 'hummusu': 'hummus',
  'pastą': 'pasta', 'pasty': 'pasta',
  'sosem': 'sos', 'sosu': 'sos',
  'dżemem': 'dżem', 'dżemu': 'dżem',
  'masłem orzechowym': 'masło orzechowe',
  'czekoladą': 'czekolada', 'czekolady': 'czekolada',
};

// Standard package sizes for products
const PACKAGE_SIZES: Record<string, { size: number; unit: string; packageName: string }> = {
  // Nabiał - ml
  'mleko': { size: 1000, unit: 'ml', packageName: 'karton' },
  'jogurt': { size: 150, unit: 'g', packageName: 'kubek' },
  'śmietana': { size: 200, unit: 'ml', packageName: 'kubek' },
  'kefir': { size: 400, unit: 'ml', packageName: 'butelka' },
  'maślanka': { size: 500, unit: 'ml', packageName: 'butelka' },
  'ser': { size: 150, unit: 'g', packageName: 'opakowanie' },
  'twaróg': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'masło': { size: 200, unit: 'g', packageName: 'kostka' },
  'jajko': { size: 10, unit: 'szt', packageName: 'opakowanie' },
  
  // Mięso/ryby - g
  'kurczak': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'pierś': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'filet': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'indyk': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'wołowina': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'wieprzowina': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'łosoś': { size: 200, unit: 'g', packageName: 'porcja' },
  'tuńczyk': { size: 170, unit: 'g', packageName: 'puszka' },
  'szynka': { size: 100, unit: 'g', packageName: 'plasterek' },
  'boczek': { size: 150, unit: 'g', packageName: 'opakowanie' },
  'kiełbasa': { size: 300, unit: 'g', packageName: 'sztuka' },
  'krewetka': { size: 200, unit: 'g', packageName: 'opakowanie' },
  
  // Warzywa - g/szt
  'marchew': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'cebula': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'czosnek': { size: 1, unit: 'szt', packageName: 'główka' },
  'pomidor': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'ogórek': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'papryka': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'brokuł': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'kalafior': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'sałata': { size: 1, unit: 'szt', packageName: 'główka' },
  'szpinak': { size: 150, unit: 'g', packageName: 'opakowanie' },
  'kapusta': { size: 1, unit: 'szt', packageName: 'główka' },
  'ziemniak': { size: 1000, unit: 'g', packageName: 'kg' },
  'cukinia': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'bakłażan': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'por': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'seler': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'burak': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'awokado': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'pietruszka': { size: 1, unit: 'pęczek', packageName: 'pęczek' },
  'szczypiorek': { size: 1, unit: 'pęczek', packageName: 'pęczek' },
  'rukola': { size: 100, unit: 'g', packageName: 'opakowanie' },
  
  // Owoce - szt
  'jabłko': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'banan': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'pomarańcza': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'cytryna': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'grejpfrut': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'kiwi': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'truskawka': { size: 250, unit: 'g', packageName: 'opakowanie' },
  'malina': { size: 125, unit: 'g', packageName: 'opakowanie' },
  'jagoda': { size: 125, unit: 'g', packageName: 'opakowanie' },
  'borówka': { size: 125, unit: 'g', packageName: 'opakowanie' },
  'winogrona': { size: 500, unit: 'g', packageName: 'kiść' },
  
  // Zboża
  'ryż': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'makaron': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'kasza': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'płatki owsiane': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'płatki': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'mąka': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'chleb': { size: 1, unit: 'szt', packageName: 'bochenek' },
  'bułka': { size: 1, unit: 'szt', packageName: 'sztuka' },
  'toast': { size: 500, unit: 'g', packageName: 'opakowanie' },
  
  // Przyprawy
  'sól': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'pieprz': { size: 20, unit: 'g', packageName: 'słoiczek' },
  'oregano': { size: 10, unit: 'g', packageName: 'słoiczek' },
  'bazylia': { size: 10, unit: 'g', packageName: 'słoiczek' },
  'tymianek': { size: 10, unit: 'g', packageName: 'słoiczek' },
  'kurkuma': { size: 20, unit: 'g', packageName: 'słoiczek' },
  'cynamon': { size: 15, unit: 'g', packageName: 'słoiczek' },
  'imbir': { size: 50, unit: 'g', packageName: 'korzeń' },
  'curry': { size: 20, unit: 'g', packageName: 'słoiczek' },
  
  // Oleje i płyny
  'oliwa': { size: 500, unit: 'ml', packageName: 'butelka' },
  'olej': { size: 1000, unit: 'ml', packageName: 'butelka' },
  'ocet': { size: 500, unit: 'ml', packageName: 'butelka' },
  'sos sojowy': { size: 150, unit: 'ml', packageName: 'butelka' },
  
  // Słodycze i przekąski
  'miód': { size: 400, unit: 'g', packageName: 'słoik' },
  'cukier': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'orzechy': { size: 100, unit: 'g', packageName: 'opakowanie' },
  'migdały': { size: 100, unit: 'g', packageName: 'opakowanie' },
  'czekolada': { size: 100, unit: 'g', packageName: 'tabliczka' },
  'dżem': { size: 280, unit: 'g', packageName: 'słoik' },
  'masło orzechowe': { size: 350, unit: 'g', packageName: 'słoik' },
  
  // Inne
  'tofu': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'hummus': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'pasta': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'sos': { size: 400, unit: 'g', packageName: 'słoik' },
};

const INGREDIENT_CATEGORIES: Record<string, { label: string; emoji: string; keywords: string[] }> = {
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
  },
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
const extractAmountAndUnit = (text: string): { amount: number; unit: string } | null => {
  // Match patterns like "100g", "100 g", "1,5 kg", "500ml", "2 szt", "1/2 kostki"
  const patterns = [
    /(\d+[,.]?\d*)\s*(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/gi,
    /(\d+)\/(\d+)\s*(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/gi,
  ];
  
  const match1 = text.match(patterns[0]);
  if (match1) {
    const amount = parseFloat(match1[0].match(/[\d,.]*/)?.[0]?.replace(',', '.') || '0');
    const unit = match1[0].match(/(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)/i)?.[0]?.toLowerCase() || 'g';
    
    // Convert to base units
    if (unit === 'kg') return { amount: amount * 1000, unit: 'g' };
    if (unit === 'l') return { amount: amount * 1000, unit: 'ml' };
    if (unit === 'kostek' || unit === 'kostki') return { amount: amount, unit: 'szt' };
    if (unit === 'łyżk') return { amount: amount * 15, unit: 'g' };
    if (unit === 'szklan') return { amount: amount * 250, unit: 'ml' };
    
    return { amount, unit };
  }
  
  // Handle fractions like "1/2"
  const match2 = text.match(/(\d+)\/(\d+)\s*(kg|g|ml|l|szt)?/i);
  if (match2) {
    const amount = parseInt(match2[1]) / parseInt(match2[2]);
    const unit = match2[3]?.toLowerCase() || 'szt';
    return { amount, unit };
  }
  
  return null;
};

// Filter out non-ingredient words
const EXCLUDED_WORDS = [
  'oraz', 'lub', 'dla', 'bez', 'bardzo', 'lekko', 'dużo', 'mało', 'świeże', 'świeży',
  'pokrojony', 'pokrojona', 'posiekany', 'posiekana', 'mały', 'mała', 'duży', 'duża',
  'ugotowany', 'ugotowana', 'smażony', 'smażona', 'pieczony', 'pieczona',
  'ciepły', 'ciepła', 'zimny', 'zimna', 'świeżo', 'delikatny', 'delikatna',
  'podany', 'podana', 'przygotowany', 'przygotowana', 'gotowy', 'gotowa',
  'kalorie', 'kcal', 'białko', 'węglowodany', 'tłuszcze', 'porcja', 'porcji',
  'śniadanie', 'obiad', 'kolacja', 'przekąska', 'posiłek'
];

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
  for (const [category, { keywords }] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }
  return 'inne';
};

// Get package info for ingredient
const getPackageInfo = (name: string, totalAmount: number, unit: string): { count: number; size: number; packageUnit: string; packageName: string } => {
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
    return { count: 1, size: 0, packageUnit: unit || 'szt', packageName: 'opakowanie' };
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

// Parse ingredients from meal data
const parseIngredientsFromMeals = (
  meals: Array<{ name: string; description: string }>,
  dayMultiplier: number
): Map<string, { amount: number; unit: string; count: number }> => {
  const ingredients = new Map<string, { amount: number; unit: string; count: number }>();
  
  meals.forEach(meal => {
    const text = `${meal.name} ${meal.description || ''}`;
    
    // Split by common separators
    const parts = text.split(/[,;:\(\)\[\]]+/);
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      // Extract amount if present
      const amountInfo = extractAmountAndUnit(trimmed);
      
      // Remove amount patterns from text to get ingredient name
      const nameOnly = trimmed
        .replace(/\d+[,.]?\d*\s*(kg|g|ml|l|szt|sztuk|łyżk|szklan|kostek|kostki)?/gi, '')
        .replace(/\d+\/\d+/g, '')
        .trim();
      
      // Split by spaces and process words
      const words = nameOnly.split(/\s+/);
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]/g, '');
        if (!isIngredient(cleanWord)) return;
        
        const normalizedName = normalizeIngredientName(cleanWord);
        if (!normalizedName || normalizedName.length < 3) return;
        
        const existing = ingredients.get(normalizedName);
        const amount = (amountInfo?.amount || 100) * dayMultiplier;
        const unit = amountInfo?.unit || 'g';
        
        if (existing) {
          ingredients.set(normalizedName, {
            amount: existing.amount + amount,
            unit: existing.unit || unit,
            count: existing.count + dayMultiplier,
          });
        } else {
          ingredients.set(normalizedName, { amount, unit, count: dayMultiplier });
        }
      });
    });
  });
  
  return ingredients;
};

export default function ShoppingList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriends();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Date range selection
  const [weekOffset, setWeekOffset] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const fetchDietPlan = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('saved_diet_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
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
  }, [user]);

  // Load checked items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shoppingListChecked');
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save checked items to localStorage
  useEffect(() => {
    localStorage.setItem('shoppingListChecked', JSON.stringify([...checkedItems]));
  }, [checkedItems]);

  const handleDateClick = (date: Date) => {
    soundFeedback.buttonClick();
    
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
  };

  const ingredients = useMemo(() => {
    if (!dietPlan?.plan_data || !startDate || !endDate) return [];
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Collect all meals
    const allMeals: Array<{ name: string; description: string }> = [];
    
    if (dietPlan.plan_data.dailyMeals) {
      const { breakfast, lunch, dinner, snacks } = dietPlan.plan_data.dailyMeals;
      [...(breakfast || []), ...(lunch || []), ...(dinner || []), ...(snacks || [])].forEach(meal => {
        allMeals.push({ name: meal.name, description: meal.description || '' });
      });
    }
    
    // Parse and aggregate ingredients
    const parsedIngredients = parseIngredientsFromMeals(allMeals, daysDiff);
    
    // Convert to final format with packaging
    const result: Ingredient[] = [];
    
    parsedIngredients.forEach((data, name) => {
      const { count, size, packageUnit, packageName } = getPackageInfo(name, data.amount, data.unit);
      const category = categorizeIngredient(name);
      
      // Format display amount
      let displayAmount = '';
      if (count > 1 || packageName !== 'sztuka') {
        const plural = count > 1 ? getPluralForm(packageName, count) : packageName;
        if (size > 0 && data.amount > 0) {
          displayAmount = `${count} ${plural} (${Math.round(data.amount)}${data.unit})`;
        } else {
          displayAmount = `${count} ${plural}`;
        }
      } else {
        displayAmount = `${Math.round(data.count)} szt`;
      }
      
      result.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: data.amount,
        unit: data.unit,
        category,
        checked: checkedItems.has(name.toLowerCase()),
        packageCount: count,
        packageSize: size,
        packageUnit,
        displayAmount,
      });
    });
    
    return result;
  }, [dietPlan, startDate, endDate, checkedItems]);

  // Polish plural forms for package names
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
      'kg': ['kg', 'kg', 'kg'],
    };
    
    const form = forms[packageName] || [packageName, packageName, packageName];
    
    if (count === 1) return form[0];
    if (count >= 2 && count <= 4) return form[1];
    return form[2];
  };

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

  const toggleItem = (name: string) => {
    soundFeedback.buttonClick();
    const key = name.toLowerCase();
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const clearChecked = () => {
    soundFeedback.buttonClick();
    setCheckedItems(new Set());
    toast.success('Lista wyczyszczona');
  };

  const copyToClipboard = () => {
    soundFeedback.buttonClick();
    
    let text = '🛒 Lista zakupów FITFLY\n';
    if (startDate && endDate) {
      text += `📅 ${format(startDate, 'd MMM', { locale: pl })} - ${format(endDate, 'd MMM yyyy', { locale: pl })}\n\n`;
    }

    Object.entries(groupedIngredients).forEach(([category, items]) => {
      const catConfig = INGREDIENT_CATEGORIES[category];
      text += `${catConfig.emoji} ${catConfig.label}:\n`;
      items.forEach(item => {
        const checkbox = checkedItems.has(item.name.toLowerCase()) ? '✅' : '⬜';
        text += `  ${checkbox} ${item.name} - ${item.displayAmount}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka! 📋');
  };

  const shareWithFriend = async (friendId: string) => {
    soundFeedback.buttonClick();
    
    let text = '🛒 Lista zakupów FITFLY\n';
    if (startDate && endDate) {
      text += `📅 ${format(startDate, 'd MMM', { locale: pl })} - ${format(endDate, 'd MMM yyyy', { locale: pl })}\n\n`;
    }

    Object.entries(groupedIngredients).forEach(([category, items]) => {
      const catConfig = INGREDIENT_CATEGORIES[category];
      text += `${catConfig.emoji} ${catConfig.label}:\n`;
      items.forEach(item => {
        text += `  • ${item.name} - ${item.displayAmount}\n`;
      });
      text += '\n';
    });

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user!.id,
          receiver_id: friendId,
          content: text,
          message_type: 'text',
        });

      if (error) throw error;
      
      toast.success('Wysłano listę zakupów! 🛒');
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Nie udało się wysłać listy');
    }
  };

  const checkedCount = ingredients.filter(i => checkedItems.has(i.name.toLowerCase())).length;
  const progress = ingredients.length > 0 ? (checkedCount / ingredients.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => { soundFeedback.navTap(); navigate('/inne'); }}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              Lista zakupów <ShoppingCart className="w-5 h-5" />
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareDialog(true)}
            disabled={ingredients.length === 0}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Calendar Date Range Selector */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => { soundFeedback.buttonClick(); setWeekOffset(w => w - 1); }}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="text-center">
              <p className="font-bold text-foreground">
                {format(weekStart, 'MMMM yyyy', { locale: pl })}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectingStart ? 'Wybierz początek okresu' : 'Wybierz koniec okresu'}
              </p>
            </div>
            <button 
              onClick={() => { soundFeedback.buttonClick(); setWeekOffset(w => w + 1); }}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
            {weekDays.map(day => {
              const isStart = startDate && isSameDay(day, startDate);
              const isEnd = endDate && isSameDay(day, endDate);
              const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm font-medium",
                    isStart && "bg-primary text-primary-foreground",
                    isEnd && "bg-primary text-primary-foreground",
                    isInRange && !isStart && !isEnd && "bg-primary/20 text-foreground",
                    !isStart && !isEnd && !isInRange && "hover:bg-muted",
                    isToday && !isStart && !isEnd && "ring-2 ring-primary/50"
                  )}
                >
                  <span>{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          {startDate && endDate && (
            <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
              <p className="text-sm font-medium text-foreground">
                <Calendar className="w-4 h-4 inline mr-2" />
                {format(startDate, 'd MMMM', { locale: pl })} — {format(endDate, 'd MMMM yyyy', { locale: pl })}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !dietPlan ? (
          <div className="text-center py-12 px-4">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-bold text-foreground mb-2">Brak planu diety</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Najpierw skonfiguruj swoją dietę, aby wygenerować listę zakupów
            </p>
            <Button onClick={() => navigate('/konfiguracja-diety')}>
              Skonfiguruj dietę
            </Button>
          </div>
        ) : !startDate || !endDate ? (
          <div className="text-center py-8 px-4">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Wybierz okres na kalendarzu powyżej, aby zobaczyć listę zakupów
            </p>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-8 px-4">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Brak składników w wybranym okresie
            </p>
          </div>
        ) : (
          <>
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
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {checkedCount > 0 && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={clearChecked}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Wyczyść zaznaczone
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Kopiuj listę
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowShareDialog(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Wyślij znajomemu
              </Button>
            </div>

            {/* Ingredient Categories */}
            <div className="space-y-4">
              {Object.entries(groupedIngredients).map(([category, items]) => {
                const catConfig = INGREDIENT_CATEGORIES[category];
                const categoryChecked = items.filter(i => checkedItems.has(i.name.toLowerCase())).length;

                return (
                  <div key={category} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
                    <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-xl">{catConfig.emoji}</span>
                        {catConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {categoryChecked}/{items.length}
                      </span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {items.map((item, idx) => {
                        const isChecked = checkedItems.has(item.name.toLowerCase());
                        return (
                          <button
                            key={`${item.name}-${idx}`}
                            onClick={() => toggleItem(item.name)}
                            className={cn(
                              "w-full px-4 py-3 flex items-center gap-3 transition-all text-left",
                              isChecked && "bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                              isChecked 
                                ? "bg-primary border-primary" 
                                : "border-border"
                            )}>
                              {isChecked && <Check className="w-4 h-4 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium transition-all",
                                isChecked ? "text-muted-foreground line-through" : "text-foreground"
                              )}>
                                {item.name}
                              </p>
                              <p className={cn(
                                "text-xs",
                                isChecked ? "text-muted-foreground/50" : "text-muted-foreground"
                              )}>
                                {item.displayAmount}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
            {friends.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nie masz jeszcze znajomych
              </p>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => shareWithFriend(friend.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{friend.displayName || 'Użytkownik'}</p>
                    {friend.username && (
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>

          <Button variant="outline" onClick={copyToClipboard} className="w-full mt-2">
            <Copy className="w-4 h-4 mr-2" />
            Kopiuj do schowka
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
