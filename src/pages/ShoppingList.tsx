import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Share2, Calendar, ChevronLeft, ChevronRight, Trash2, Copy, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';

interface CustomProduct {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  is_checked: boolean;
}

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
  customId?: string;
}

interface DietPlan {
  id: string;
  name: string;
  plan_data: {
    dailyMeals?: {
      breakfast: Array<{ name: string; calories: number; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }>;
      lunch: Array<{ name: string; calories: number; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }>;
      dinner: Array<{ name: string; calories: number; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }>;
      snacks: Array<{ name: string; calories: number; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }>;
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
  'krewetkami': 'krewetki', 'krewetkę': 'krewetki', 'krewetek': 'krewetki', 'krewetka': 'krewetki',
  'rybą': 'ryba', 'ryby': 'ryba', 'ryb': 'ryba',
  'piersią': 'pierś z kurczaka', 'piersi': 'pierś z kurczaka', 'piers': 'pierś z kurczaka', 'pierś': 'pierś z kurczaka',
  'filetem': 'filet z kurczaka', 'fileta': 'filet z kurczaka', 'filet': 'filet z kurczaka',
  
  // Zboża
  'ryżem': 'ryż', 'ryżu': 'ryż',
  'makaronem': 'makaron', 'makaronu': 'makaron',
  'kaszą': 'kasza', 'kaszy': 'kasza',
  'płatkami': 'płatki owsiane', 'płatków': 'płatki owsiane',
  'mąką': 'mąka', 'mąki': 'mąka',
  'owsianymi': 'płatki owsiane', 'owsianych': 'płatki owsiane', 'owsiane': 'płatki owsiane',
  'chlebem': 'chleb', 'chleba': 'chleb',
  'bułką': 'bułka', 'bułki': 'bułka', 'bułek': 'bułka',
  
  // Przyprawy
  'solą': 'sól', 'soli': 'sól',
  'pieprzem': 'pieprz', 'pieprzu': 'pieprz',
  'oregano': 'oregano',
  'bazylią': 'bazylia', 'bazylii': 'bazylia',
  'oliwą': 'oliwa', 'oliwy': 'oliwa',
  'olejem': 'olej', 'oleju': 'olej',
  'miodem': 'miód', 'miodu': 'miód',
  'cukrem': 'cukier', 'cukru': 'cukier',
  
  // Inne
  'orzechami': 'orzechy', 'orzechów': 'orzechy', 'orzeszkami': 'orzechy',
  'migdałami': 'migdały', 'migdałów': 'migdały',
  'tofu': 'tofu',
  'hummusem': 'hummus', 'hummusu': 'hummus',
  'czekoladą': 'czekolada', 'czekolady': 'czekolada',
  'nasionami': 'nasiona', 'nasion': 'nasiona',
  'siemieniem': 'siemię lniane', 'siemienia': 'siemię lniane',
  'lnianej': 'siemię lniane', 'lniane': 'siemię lniane', 'lnianym': 'siemię lniane',
};

// Package sizes
const PACKAGE_SIZES: Record<string, { size: number; unit: string; packageName: string }> = {
  'mleko': { size: 1000, unit: 'ml', packageName: 'karton' },
  'jogurt': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'jogurt naturalny': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'jogurt grecki': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'śmietana': { size: 200, unit: 'ml', packageName: 'kubek' },
  'kefir': { size: 400, unit: 'ml', packageName: 'butelka' },
  'ser': { size: 150, unit: 'g', packageName: 'opakowanie' },
  'ser żółty': { size: 250, unit: 'g', packageName: 'opakowanie' },
  'twaróg': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'masło': { size: 200, unit: 'g', packageName: 'kostka' },
  'jajko': { size: 10, unit: 'szt', packageName: 'opakowanie' },
  'jajka': { size: 10, unit: 'szt', packageName: 'opakowanie' },
  'kurczak': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'pierś z kurczaka': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'filet z kurczaka': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'łosoś': { size: 300, unit: 'g', packageName: 'opakowanie' },
  'tuńczyk': { size: 170, unit: 'g', packageName: 'puszka' },
  'ryż': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'makaron': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'kasza': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'płatki owsiane': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'chleb': { size: 1, unit: 'szt', packageName: 'bochenek' },
  'oliwa': { size: 500, unit: 'ml', packageName: 'butelka' },
  'olej': { size: 1000, unit: 'ml', packageName: 'butelka' },
  'miód': { size: 400, unit: 'g', packageName: 'słoik' },
  'orzechy': { size: 100, unit: 'g', packageName: 'opakowanie' },
  'migdały': { size: 100, unit: 'g', packageName: 'opakowanie' },
  'czekolada': { size: 100, unit: 'g', packageName: 'tabliczka' },
  'tofu': { size: 200, unit: 'g', packageName: 'opakowanie' },
  'hummus': { size: 200, unit: 'g', packageName: 'opakowanie' },
};

const INGREDIENT_CATEGORIES: Record<string, { label: string; emoji: string; keywords: string[] }> = {
  pieczywo: { label: 'Pieczywo', emoji: '🍞', keywords: ['chleb', 'bułk', 'bagiet', 'rogal', 'toast', 'tortill'] },
  nabial: { label: 'Nabiał', emoji: '🥛', keywords: ['mleko', 'ser', 'jogurt', 'śmietana', 'masło', 'twaróg', 'kefir', 'jaj', 'feta', 'mozzarell'] },
  mieso: { label: 'Mięso i ryby', emoji: '🥩', keywords: ['kurczak', 'wołowin', 'wieprzow', 'mięso', 'szynk', 'kiełbas', 'ryb', 'łosoś', 'tuńczyk', 'krewetk', 'indyk', 'pierś', 'filet'] },
  warzywa: { label: 'Warzywa', emoji: '🥬', keywords: ['marchew', 'cebul', 'czosnek', 'pomidor', 'ogórek', 'sałat', 'papryka', 'brokuł', 'szpinak', 'kapust', 'ziemniak', 'cukini', 'bakłażan', 'kalafior', 'por', 'seler', 'burak', 'awokado'] },
  owoce: { label: 'Owoce', emoji: '🍎', keywords: ['jabłk', 'banan', 'pomarańcz', 'cytryn', 'truskawk', 'maliny', 'jagod', 'winogrona', 'grejpfrut', 'kiwi', 'mango', 'borówk'] },
  zboza: { label: 'Zboża i makarony', emoji: '🍝', keywords: ['ryż', 'makaron', 'kasza', 'płatki', 'mąka', 'owsian', 'quinoa', 'kuskus'] },
  przyprawy: { label: 'Przyprawy i oleje', emoji: '🧂', keywords: ['sól', 'pieprz', 'oregano', 'bazylia', 'tymianek', 'oliw', 'olej', 'ocet', 'sos'] },
  slodycze: { label: 'Słodycze i przekąski', emoji: '🍫', keywords: ['czekolad', 'cukier', 'miód', 'dżem', 'orzechy', 'migdał', 'masło orzechowe'] },
  inne: { label: 'Inne', emoji: '📦', keywords: [] },
};

// Helpers
const normalizeIngredientName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (POLISH_NORMALIZATION[lower]) return POLISH_NORMALIZATION[lower];
  for (const [declined, base] of Object.entries(POLISH_NORMALIZATION)) {
    if (lower.includes(declined)) return base;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const categorizeIngredient = (name: string): string => {
  const nameLower = name.toLowerCase();
  for (const [category, { keywords }] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) return category;
  }
  return 'inne';
};

const getPackageInfo = (name: string, totalAmount: number, unit: string): { count: number; size: number; packageUnit: string; packageName: string } => {
  const nameLower = name.toLowerCase();
  let packageInfo = PACKAGE_SIZES[nameLower];
  
  if (!packageInfo) {
    for (const [key, value] of Object.entries(PACKAGE_SIZES)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        packageInfo = value;
        break;
      }
    }
  }
  
  if (!packageInfo) return { count: 1, size: 0, packageUnit: unit || 'szt', packageName: 'opakowanie' };
  
  let count = 1;
  if (packageInfo.size > 0 && totalAmount > 0) {
    count = Math.ceil(totalAmount / packageInfo.size);
  }
  
  return { count: Math.max(1, count), size: packageInfo.size, packageUnit: packageInfo.unit, packageName: packageInfo.packageName };
};

const parseIngredientsFromMeals = (
  meals: Array<{ name: string; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }>,
  dayMultiplier: number
): Map<string, { amount: number; unit: string; count: number }> => {
  const ingredients = new Map<string, { amount: number; unit: string; count: number }>();
  
  const addIngredient = (rawName: string, amount: number, unit: string) => {
    let normalizedName = rawName.toLowerCase().trim();
    const descriptiveWords = ['świeży', 'świeża', 'gotowany', 'gotowana', 'smażony', 'smażona', 'grillowany', 'grillowana', 'pokrojony', 'pokrojona'];
    descriptiveWords.forEach(word => {
      normalizedName = normalizedName.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
    });
    
    if (POLISH_NORMALIZATION[normalizedName]) normalizedName = POLISH_NORMALIZATION[normalizedName];
    for (const [declined, base] of Object.entries(POLISH_NORMALIZATION)) {
      if (normalizedName.includes(declined)) {
        normalizedName = base;
        break;
      }
    }
    
    normalizedName = normalizedName.replace(/\s+/g, ' ').trim();
    if (!normalizedName || normalizedName.length < 2) return;
    
    const finalName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    const existing = ingredients.get(finalName);
    const adjustedAmount = amount * dayMultiplier;
    
    if (existing) {
      ingredients.set(finalName, { amount: existing.amount + adjustedAmount, unit: existing.unit || unit, count: existing.count + dayMultiplier });
    } else {
      ingredients.set(finalName, { amount: adjustedAmount, unit, count: dayMultiplier });
    }
  };
  
  meals.forEach(meal => {
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      meal.ingredients.forEach(ing => {
        if (ing.name && ing.amount) addIngredient(ing.name, ing.amount, ing.unit || 'g');
      });
    }
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Custom products from database
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductAmount, setNewProductAmount] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('szt');
  const [newProductCategory, setNewProductCategory] = useState('inne');
  
  // Date range
  const [weekOffset, setWeekOffset] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch diet plan
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
          .maybeSingle();

        if (error) console.error('Error fetching diet plan:', error);
        if (data) setDietPlan(data as DietPlan);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDietPlan();
  }, [user]);

  // Fetch custom products from database
  useEffect(() => {
    const fetchCustomProducts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('shopping_list_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setCustomProducts(data.map(item => ({
            id: item.id,
            name: item.name,
            amount: Number(item.amount),
            unit: item.unit,
            category: item.category,
            is_checked: item.is_checked,
          })));
        }
      } catch (err) {
        console.error('Error fetching custom products:', err);
      }
    };
    fetchCustomProducts();
  }, [user]);

  // Fetch checked items from database
  useEffect(() => {
    const fetchCheckedItems = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('shopping_list_checked')
          .select('item_name')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data) {
          setCheckedItems(new Set(data.map(item => item.item_name.toLowerCase())));
        }
      } catch (err) {
        console.error('Error fetching checked items:', err);
      }
    };
    fetchCheckedItems();
  }, [user]);

  // Add custom product to database
  const handleAddProduct = async () => {
    if (!user) return;
    const trimmedName = newProductName.trim();
    if (!trimmedName) {
      toast.error('Podaj nazwę produktu');
      return;
    }
    if (trimmedName.length > 100) {
      toast.error('Nazwa produktu jest za długa (max 100 znaków)');
      return;
    }
    
    const amount = parseFloat(newProductAmount) || 1;
    if (amount <= 0 || amount > 10000) {
      toast.error('Podaj prawidłową ilość (1-10000)');
      return;
    }
    
    soundFeedback.buttonClick();
    
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          user_id: user.id,
          name: trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase(),
          amount,
          unit: newProductUnit,
          category: newProductCategory,
          is_checked: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCustomProducts(prev => [{
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        unit: data.unit,
        category: data.category,
        is_checked: data.is_checked,
      }, ...prev]);
      
      setNewProductName('');
      setNewProductAmount('');
      setNewProductUnit('szt');
      setNewProductCategory('inne');
      setShowAddDialog(false);
      toast.success('Dodano produkt!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Nie udało się dodać produktu');
    }
  };

  // Remove custom product from database
  const removeCustomProduct = async (id: string) => {
    if (!user) return;
    soundFeedback.buttonClick();
    
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCustomProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Usunięto produkt');
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Nie udało się usunąć produktu');
    }
  };

  // Toggle checked state and save to database
  const toggleItem = useCallback(async (name: string, isCustom?: boolean, customId?: string) => {
    if (!user) return;
    soundFeedback.buttonClick();
    const key = name.toLowerCase();
    const isCurrentlyChecked = checkedItems.has(key);
    
    // Update local state immediately
    const newChecked = new Set(checkedItems);
    if (isCurrentlyChecked) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
    
    // Save to database
    try {
      if (isCustom && customId) {
        // Update custom product
        await supabase
          .from('shopping_list_items')
          .update({ is_checked: !isCurrentlyChecked })
          .eq('id', customId)
          .eq('user_id', user.id);
          
        setCustomProducts(prev => prev.map(p => 
          p.id === customId ? { ...p, is_checked: !isCurrentlyChecked } : p
        ));
      } else {
        // Update diet plan item checked status
        if (isCurrentlyChecked) {
          await supabase
            .from('shopping_list_checked')
            .delete()
            .eq('user_id', user.id)
            .eq('item_name', key);
        } else {
          await supabase
            .from('shopping_list_checked')
            .upsert({ user_id: user.id, item_name: key, is_checked: true }, { onConflict: 'user_id,item_name' });
        }
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  }, [user, checkedItems]);

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

  const getPluralForm = (packageName: string, count: number): string => {
    const forms: Record<string, [string, string, string]> = {
      'opakowanie': ['opakowanie', 'opakowania', 'opakowań'],
      'karton': ['karton', 'kartony', 'kartonów'],
      'butelka': ['butelka', 'butelki', 'butelek'],
      'kubek': ['kubek', 'kubki', 'kubków'],
      'słoik': ['słoik', 'słoiki', 'słoików'],
      'sztuka': ['sztuka', 'sztuki', 'sztuk'],
      'puszka': ['puszka', 'puszki', 'puszek'],
      'kostka': ['kostka', 'kostki', 'kostek'],
      'tabliczka': ['tabliczka', 'tabliczki', 'tabliczek'],
      'bochenek': ['bochenek', 'bochenki', 'bochenków'],
    };
    const form = forms[packageName] || [packageName, packageName, packageName];
    if (count === 1) return form[0];
    if (count >= 2 && count <= 4) return form[1];
    return form[2];
  };

  const ingredients = useMemo(() => {
    if (!dietPlan?.plan_data || !startDate || !endDate) return [];
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const allMeals: Array<{ name: string; description: string; ingredients?: Array<{ name: string; amount: number; unit: string }> }> = [];
    
    if (dietPlan.plan_data.dailyMeals) {
      const { breakfast, lunch, dinner, snacks } = dietPlan.plan_data.dailyMeals;
      [...(breakfast || []), ...(lunch || []), ...(dinner || []), ...(snacks || [])].forEach(meal => {
        allMeals.push({ name: meal.name, description: meal.description || '', ingredients: meal.ingredients });
      });
    }
    
    const parsedIngredients = parseIngredientsFromMeals(allMeals, daysDiff);
    const result: Ingredient[] = [];
    
    parsedIngredients.forEach((data, name) => {
      const { count, size, packageUnit, packageName } = getPackageInfo(name, data.amount, data.unit);
      const category = categorizeIngredient(name);
      
      let displayAmount = '';
      if (count > 1 || packageName !== 'sztuka') {
        const plural = count > 1 ? getPluralForm(packageName, count) : packageName;
        displayAmount = size > 0 && data.amount > 0 ? `${count} ${plural} (${Math.round(data.amount)}${data.unit})` : `${count} ${plural}`;
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

  // Combine diet ingredients with custom products
  const allIngredients = useMemo(() => {
    const combined = [...ingredients];
    
    customProducts.forEach(product => {
      const { count, size, packageUnit, packageName } = getPackageInfo(product.name, product.amount, product.unit);
      let displayAmount = product.unit === 'szt' ? `${Math.round(product.amount)} szt` : 
        count > 1 || packageName !== 'sztuka' 
          ? `${count} ${count > 1 ? getPluralForm(packageName, count) : packageName} (${Math.round(product.amount)}${product.unit})`
          : `${Math.round(product.amount)}${product.unit}`;
      
      combined.push({
        name: product.name,
        amount: product.amount,
        unit: product.unit,
        category: product.category,
        checked: product.is_checked || checkedItems.has(product.name.toLowerCase()),
        packageCount: count,
        packageSize: size,
        packageUnit,
        displayAmount,
        isCustom: true,
        customId: product.id,
      });
    });
    
    return combined;
  }, [ingredients, customProducts, checkedItems]);

  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};
    allIngredients.forEach(ing => {
      if (!groups[ing.category]) groups[ing.category] = [];
      groups[ing.category].push(ing);
    });
    
    const sortedGroups: Record<string, Ingredient[]> = {};
    Object.keys(INGREDIENT_CATEGORIES).forEach(cat => {
      if (groups[cat]) sortedGroups[cat] = groups[cat].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    });
    return sortedGroups;
  }, [allIngredients]);

  const clearChecked = async () => {
    if (!user) return;
    soundFeedback.buttonClick();
    
    try {
      await supabase.from('shopping_list_checked').delete().eq('user_id', user.id);
      await supabase.from('shopping_list_items').update({ is_checked: false }).eq('user_id', user.id);
      
      setCheckedItems(new Set());
      setCustomProducts(prev => prev.map(p => ({ ...p, is_checked: false })));
      toast.success('Lista wyczyszczona');
    } catch (error) {
      console.error('Error clearing:', error);
    }
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
        const checkbox = item.checked ? '✅' : '⬜';
        text += `  ${checkbox} ${item.name} - ${item.displayAmount}\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka! 📋');
  };

  const shareWithFriend = async (friendId: string) => {
    if (!user) return;
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
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
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

  const checkedCount = allIngredients.filter(i => i.checked).length;

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
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} disabled={allIngredients.length === 0}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Add Product Button - ALWAYS VISIBLE */}
        <Button onClick={() => setShowAddDialog(true)} className="w-full" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Dodaj własny produkt
        </Button>

        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { soundFeedback.buttonClick(); setWeekOffset(w => w - 1); }} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="text-center">
              <p className="font-bold text-foreground">{format(weekStart, 'MMMM yyyy', { locale: pl })}</p>
              <p className="text-xs text-muted-foreground">{selectingStart ? 'Wybierz początek okresu' : 'Wybierz koniec okresu'}</p>
            </div>
            <button onClick={() => { soundFeedback.buttonClick(); setWeekOffset(w => w + 1); }} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
            ))}
            {weekDays.map(day => {
              const isStart = startDate && isSameDay(day, startDate);
              const isEnd = endDate && isSameDay(day, endDate);
              const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
              const isToday = isSameDay(day, new Date());
              return (
                <button key={day.toISOString()} onClick={() => handleDateClick(day)} className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm font-medium",
                  isStart && "bg-primary text-primary-foreground",
                  isEnd && "bg-primary text-primary-foreground",
                  isInRange && !isStart && !isEnd && "bg-primary/20 text-foreground",
                  !isStart && !isEnd && !isInRange && "hover:bg-muted",
                  isToday && !isStart && !isEnd && "ring-2 ring-primary/50"
                )}>
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
        ) : allIngredients.length === 0 ? (
          <div className="text-center py-8 px-4">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {!dietPlan ? 'Brak planu diety' : !startDate || !endDate ? 'Wybierz okres na kalendarzu' : 'Brak składników'}
            </p>
            {!dietPlan && (
              <Button onClick={() => navigate('/konfiguracja-diety')} variant="outline" className="mt-2">
                Skonfiguruj dietę
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Postęp zakupów</span>
                <span className="text-sm font-bold text-primary">{checkedCount}/{allIngredients.length}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${allIngredients.length > 0 ? (checkedCount / allIngredients.length) * 100 : 0}%` }} />
              </div>
              {checkedCount > 0 && (
                <div className="flex justify-end mt-2">
                  <button onClick={clearChecked} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Wyczyść zaznaczone
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" /> Kopiuj
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowShareDialog(true)}>
                <Users className="w-4 h-4 mr-2" /> Wyślij
              </Button>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              {Object.entries(groupedIngredients).map(([category, items]) => {
                const catConfig = INGREDIENT_CATEGORIES[category];
                const categoryChecked = items.filter(i => i.checked).length;
                return (
                  <div key={category} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
                    <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-xl">{catConfig.emoji}</span> {catConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{categoryChecked}/{items.length}</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {items.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} className={cn("w-full px-4 py-3 flex items-center gap-3 transition-all", item.checked && "bg-primary/5")}>
                          <button onClick={() => toggleItem(item.name, item.isCustom, item.customId)} className="flex items-center gap-3 flex-1 text-left">
                            <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0", item.checked ? "bg-primary border-primary" : "border-border")}>
                              {item.checked && <Check className="w-4 h-4 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("font-medium transition-all", item.checked ? "text-muted-foreground line-through" : "text-foreground")}>
                                {item.name}
                                {item.isCustom && <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">własny</span>}
                              </p>
                              <p className={cn("text-xs", item.checked ? "text-muted-foreground/50" : "text-muted-foreground")}>{item.displayAmount}</p>
                            </div>
                          </button>
                          {item.isCustom && item.customId && (
                            <button onClick={() => removeCustomProduct(item.customId!)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
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
            <DialogTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" /> Udostępnij listę</DialogTitle>
            <DialogDescription>Wyślij listę zakupów znajomemu</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">Nie masz jeszcze znajomych</p>
            ) : (
              friends.map(friend => (
                <button key={friend.id} onClick={() => shareWithFriend(friend.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{friend.displayName || 'Użytkownik'}</p>
                    {friend.username && <p className="text-xs text-muted-foreground">@{friend.username}</p>}
                  </div>
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
          <Button variant="outline" onClick={copyToClipboard} className="w-full mt-2">
            <Copy className="w-4 h-4 mr-2" /> Kopiuj do schowka
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Dodaj produkt</DialogTitle>
            <DialogDescription>Dodaj własny produkt do listy zakupów</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Nazwa produktu</label>
              <Input placeholder="np. Ser gouda" value={newProductName} onChange={(e) => setNewProductName(e.target.value.slice(0, 100))} maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Ilość</label>
                <Input type="number" placeholder="1" value={newProductAmount} onChange={(e) => setNewProductAmount(e.target.value)} min="0" max="10000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Jednostka</label>
                <Select value={newProductUnit} onValueChange={setNewProductUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="szt">szt</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Kategoria</label>
              <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(INGREDIENT_CATEGORIES).map(([key, { label, emoji }]) => (
                    <SelectItem key={key} value={key}>{emoji} {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddProduct} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Dodaj do listy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
