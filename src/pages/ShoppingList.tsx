import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Share2, Calendar, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';
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

interface CustomProduct {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
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
  };
}

const POLISH_NORMALIZATION: Record<string, string> = {
  'mlekiem': 'mleko', 'mleka': 'mleko',
  'serem': 'ser', 'sera': 'ser',
  'jogurtem': 'jogurt', 'jogurtu': 'jogurt',
  'masłem': 'masło', 'masła': 'masło',
  'jajkiem': 'jajko', 'jajka': 'jajko', 'jajek': 'jajko',
  'kurczakiem': 'kurczak', 'kurczaka': 'kurczak',
  'ryżem': 'ryż', 'ryżu': 'ryż',
  'makaronem': 'makaron', 'makaronu': 'makaron',
};

const PACKAGE_SIZES: Record<string, { size: number; unit: string; packageName: string }> = {
  'mleko': { size: 1000, unit: 'ml', packageName: 'karton' },
  'jogurt': { size: 400, unit: 'g', packageName: 'opakowanie' },
  'masło': { size: 200, unit: 'g', packageName: 'kostka' },
  'jajko': { size: 10, unit: 'szt', packageName: 'opakowanie' },
  'kurczak': { size: 500, unit: 'g', packageName: 'opakowanie' },
  'ryż': { size: 1000, unit: 'g', packageName: 'opakowanie' },
  'makaron': { size: 500, unit: 'g', packageName: 'opakowanie' },
};

const INGREDIENT_CATEGORIES: Record<string, { label: string; emoji: string; keywords: string[] }> = {
  pieczywo: { label: 'Pieczywo', emoji: '🍞', keywords: ['chleb', 'bułk'] },
  nabial: { label: 'Nabiał', emoji: '🥛', keywords: ['mleko', 'ser', 'jogurt', 'masło', 'jaj'] },
  mieso: { label: 'Mięso i ryby', emoji: '🥩', keywords: ['kurczak', 'mięso', 'ryb', 'łosoś'] },
  warzywa: { label: 'Warzywa', emoji: '🥬', keywords: ['marchew', 'cebul', 'pomidor', 'sałat'] },
  owoce: { label: 'Owoce', emoji: '🍎', keywords: ['jabłk', 'banan', 'pomarańcz'] },
  zboza: { label: 'Zboża i makarony', emoji: '🍝', keywords: ['ryż', 'makaron', 'kasza'] },
  przyprawy: { label: 'Przyprawy i oleje', emoji: '🧂', keywords: ['sól', 'pieprz', 'olej'] },
  inne: { label: 'Inne', emoji: '📦', keywords: [] },
};

const normalizeIngredientName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  return POLISH_NORMALIZATION[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
};

const categorizeIngredient = (name: string): string => {
  const nameLower = name.toLowerCase();
  for (const [category, { keywords }] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) return category;
  }
  return 'inne';
};

const getPackageInfo = (name: string, totalAmount: number, unit: string) => {
  const nameLower = name.toLowerCase();
  const packageInfo = PACKAGE_SIZES[nameLower];
  if (!packageInfo) return { count: 1, size: 0, packageUnit: unit || 'szt', packageName: 'opakowanie' };
  const count = packageInfo.size > 0 && totalAmount > 0 ? Math.ceil(totalAmount / packageInfo.size) : 1;
  return { count: Math.max(1, count), size: packageInfo.size, packageUnit: packageInfo.unit, packageName: packageInfo.packageName };
};

export default function ShoppingList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductAmount, setNewProductAmount] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('szt');
  const [newProductCategory, setNewProductCategory] = useState('inne');
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
        const { data } = await supabase
          .from('saved_diet_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) setDietPlan(data as DietPlan);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDietPlan();
  }, [user]);

  const handleAddProduct = () => {
    const trimmedName = newProductName.trim();
    if (!trimmedName) {
      toast.error('Podaj nazwę produktu');
      return;
    }
    soundFeedback.buttonClick();
    const newProduct: CustomProduct = {
      id: crypto.randomUUID(),
      name: trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase(),
      amount: parseFloat(newProductAmount) || 1,
      unit: newProductUnit,
      category: newProductCategory,
      checked: false,
    };
    setCustomProducts(prev => [newProduct, ...prev]);
    setNewProductName('');
    setNewProductAmount('');
    setShowAddDialog(false);
    toast.success('Dodano produkt!');
  };

  const removeCustomProduct = (id: string) => {
    soundFeedback.buttonClick();
    setCustomProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Usunięto produkt');
  };

  const toggleItem = useCallback((name: string, isCustom?: boolean, customId?: string) => {
    soundFeedback.buttonClick();
    const key = name.toLowerCase();
    
    if (isCustom && customId) {
      setCustomProducts(prev => prev.map(p => 
        p.id === customId ? { ...p, checked: !p.checked } : p
      ));
    }
    
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

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
    const allMeals: Array<{ ingredients?: Array<{ name: string; amount: number; unit: string }> }> = [];
    
    if (dietPlan.plan_data.dailyMeals) {
      const { breakfast, lunch, dinner, snacks } = dietPlan.plan_data.dailyMeals;
      [...(breakfast || []), ...(lunch || []), ...(dinner || []), ...(snacks || [])].forEach(meal => {
        allMeals.push({ ingredients: meal.ingredients });
      });
    }
    
    const ingredientMap = new Map<string, { amount: number; unit: string; count: number }>();
    
    allMeals.forEach(meal => {
      if (meal.ingredients) {
        meal.ingredients.forEach(ing => {
          const name = normalizeIngredientName(ing.name);
          const existing = ingredientMap.get(name);
          const adjustedAmount = (ing.amount || 0) * daysDiff;
          if (existing) {
            ingredientMap.set(name, { 
              amount: existing.amount + adjustedAmount, 
              unit: existing.unit || ing.unit, 
              count: existing.count + daysDiff 
            });
          } else {
            ingredientMap.set(name, { amount: adjustedAmount, unit: ing.unit || 'g', count: daysDiff });
          }
        });
      }
    });
    
    const result: Ingredient[] = [];
    ingredientMap.forEach((data, name) => {
      const { count, size, packageUnit, packageName } = getPackageInfo(name, data.amount, data.unit);
      const category = categorizeIngredient(name);
      const displayAmount = size > 0 ? `${count} ${packageName} (${Math.round(data.amount)}${data.unit})` : `${Math.round(data.count)} szt`;
      
      result.push({
        name,
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

  const allIngredients = useMemo(() => {
    const combined = [...ingredients];
    
    customProducts.forEach(product => {
      combined.push({
        name: product.name,
        amount: product.amount,
        unit: product.unit,
        category: product.category,
        checked: product.checked || checkedItems.has(product.name.toLowerCase()),
        packageCount: 1,
        packageSize: 0,
        packageUnit: product.unit,
        displayAmount: `${product.amount} ${product.unit}`,
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
    return groups;
  }, [allIngredients]);

  const getShareText = () => {
    let text = '🛒 Lista zakupów FITFLY\n\n';
    Object.entries(groupedIngredients).forEach(([category, items]) => {
      const cat = INGREDIENT_CATEGORIES[category];
      text += `${cat?.emoji || '📦'} ${cat?.label || category}\n`;
      items.forEach(item => {
        text += `${item.checked ? '✓' : '○'} ${item.name} - ${item.displayAmount}\n`;
      });
      text += '\n';
    });
    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      toast.success('Skopiowano do schowka!');
      setShowShareDialog(false);
    } catch {
      toast.error('Nie udało się skopiować');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold font-display text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Lista zakupów
              </h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)} disabled={allIngredients.length === 0}>
            <Share2 className="w-4 h-4 mr-2" /> Udostępnij
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Add product button */}
        <Button onClick={() => setShowAddDialog(true)} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Dodaj własny produkt
        </Button>

        {/* Date selection */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-medium text-sm">
              {format(weekStart, 'MMMM yyyy', { locale: pl })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => Math.min(prev + 1, 4))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const isStart = startDate && isSameDay(day, startDate);
              const isEnd = endDate && isSameDay(day, endDate);
              const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-xl transition-all',
                    isStart || isEnd ? 'bg-primary text-primary-foreground' : 
                    isInRange ? 'bg-primary/20' : 
                    isToday ? 'bg-accent/20' : 'hover:bg-muted'
                  )}
                >
                  <span className="text-xs opacity-70">{format(day, 'EEE', { locale: pl })}</span>
                  <span className="font-bold">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
          
          {startDate && endDate && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              {format(startDate, 'd MMM', { locale: pl })} - {format(endDate, 'd MMM', { locale: pl })}
            </p>
          )}
        </div>

        {/* Ingredients list */}
        {allIngredients.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedIngredients).map(([category, items]) => (
              <div key={category} className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <span>{INGREDIENT_CATEGORIES[category]?.emoji || '📦'}</span>
                  {INGREDIENT_CATEGORIES[category]?.label || category}
                </h3>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer',
                        item.checked ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/30'
                      )}
                      onClick={() => toggleItem(item.name, item.isCustom, item.customId)}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        item.checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      )}>
                        {item.checked && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium truncate', item.checked && 'line-through')}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.displayAmount}</p>
                      </div>
                      {item.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomProduct(item.customId!);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold mb-2">Wybierz zakres dat</h3>
            <p className="text-sm text-muted-foreground">
              {!dietPlan ? 'Najpierw stwórz plan diety' : 'Kliknij datę początkową i końcową'}
            </p>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Udostępnij listę</DialogTitle>
            <DialogDescription>Skopiuj listę zakupów</DialogDescription>
          </DialogHeader>
          <Button onClick={handleCopyToClipboard} className="w-full">
            <Copy className="w-4 h-4 mr-2" /> Kopiuj do schowka
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Dodaj produkt
            </DialogTitle>
            <DialogDescription>Dodaj własny produkt do listy zakupów</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nazwa produktu</label>
              <Input 
                placeholder="np. Ser gouda" 
                value={newProductName} 
                onChange={(e) => setNewProductName(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Ilość</label>
                <Input 
                  type="number" 
                  placeholder="1" 
                  value={newProductAmount} 
                  onChange={(e) => setNewProductAmount(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Jednostka</label>
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
              <label className="text-sm font-medium mb-1 block">Kategoria</label>
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
