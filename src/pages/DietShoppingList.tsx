import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Calendar, Trash2, Plus, X, Copy, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';
import { processShoppingList, ProcessedIngredient } from '@/utils/shoppingListProcessor';

// Wrapper for parsing ingredients from meals
const parseIngredientsFromMeals = (meals: Array<{ name: string; description: string }>, dayMultiplier: number): ProcessedIngredient[] => {
  return processShoppingList(meals, dayMultiplier);
};

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
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
    weeklySchedule?: Array<{ day: string; meals: string[] }>;
  };
}

const INGREDIENT_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  'pieczywo': { label: 'Pieczywo', emoji: '🍞' },
  'nabial': { label: 'Nabiał', emoji: '🥛' },
  'mieso': { label: 'Mięso i ryby', emoji: '🥩' },
  'warzywa': { label: 'Warzywa', emoji: '🥬' },
  'owoce': { label: 'Owoce', emoji: '🍎' },
  'przyprawy': { label: 'Przyprawy i oleje', emoji: '🧂' },
  'zboza': { label: 'Zboża i makarony', emoji: '🍝' },
  'napoje': { label: 'Napoje', emoji: '🥤' },
  'slodycze': { label: 'Słodycze i przekąski', emoji: '🍫' },
  'inne': { label: 'Inne', emoji: '📦' },
};

const CATEGORY_OPTIONS = Object.entries(INGREDIENT_CATEGORIES).map(([key, value]) => ({
  key,
  label: value.label,
  emoji: value.emoji,
}));

const AVAILABLE_UNITS = ['g', 'ml', 'kg', 'l', 'szt', 'opak'];

export default function DietShoppingList() {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  const { friends } = useFriends();
  
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  // Date range - default to 7 days
  const [startDate] = useState<Date>(() => new Date());
  const [endDate] = useState<Date>(() => addDays(new Date(), 6));
  
  // Add item dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('szt');
  const [newItemCategory, setNewItemCategory] = useState('inne');
  const [customItems, setCustomItems] = useState<Array<{ name: string; amount: number; unit: string; category: string }>>([]);
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  // Load diet plan
  useEffect(() => {
    if (!isInitialized || !user) return;

    const fetchDietPlan = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('saved_diet_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching diet plan:', error);
          toast.error('Nie udało się załadować planu diety');
          navigate('/lista-zakupow');
          return;
        }

        if (!data) {
          toast.error('Brak zapisanego planu diety');
          navigate('/lista-zakupow');
          return;
        }

        setDietPlan(data as DietPlan);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Wystąpił błąd');
        navigate('/lista-zakupow');
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [user, isInitialized, navigate]);

  // Load checked items from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('dietShoppingListChecked');
      if (saved) {
        setCheckedItems(new Set(JSON.parse(saved)));
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, []);

  // Save checked items to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dietShoppingListChecked', JSON.stringify([...checkedItems]));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, [checkedItems]);

  // Generate ingredients from diet plan
  const ingredients = useMemo(() => {
    const result: Ingredient[] = [];

    // Add custom items first
    customItems.forEach(item => {
      result.push({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        category: item.category,
        checked: checkedItems.has(item.name.toLowerCase()),
        displayAmount: `${item.amount} ${item.unit}`,
      });
    });

    // Add diet plan ingredients
    if (dietPlan?.plan_data && startDate && endDate) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const allMeals: Array<{ name: string; description: string }> = [];
      if (dietPlan.plan_data.dailyMeals) {
        const { breakfast, lunch, dinner, snacks } = dietPlan.plan_data.dailyMeals;
        [...(breakfast || []), ...(lunch || []), ...(dinner || []), ...(snacks || [])].forEach(meal => {
          allMeals.push({
            name: meal?.name || '',
            description: meal?.description || '',
          });
        });
      }

      const parsedIngredients = parseIngredientsFromMeals(allMeals, daysDiff);

      parsedIngredients.forEach((ing) => {
        if (customItems.some(ci => ci.name.toLowerCase() === ing.name.toLowerCase())) {
          return;
        }
        result.push({
          name: ing.name,
          amount: ing.totalAmount,
          unit: ing.unit,
          category: ing.category,
          checked: checkedItems.has(ing.name.toLowerCase()),
          displayAmount: ing.displayText,
        });
      });
    }

    return result;
  }, [dietPlan, startDate, endDate, checkedItems, customItems]);

  // Group by category
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};
    ingredients.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [ingredients]);

  const toggleItem = useCallback((itemName: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    const key = itemName.toLowerCase();
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

  const checkedCount = ingredients.filter(i => i.checked).length;
  const progress = ingredients.length > 0 ? (checkedCount / ingredients.length) * 100 : 0;

  const clearChecked = useCallback(() => {
    try { soundFeedback.buttonClick(); } catch {}
    setCheckedItems(new Set());
    toast.success('Wyczyszczono zaznaczenia');
  }, []);

  const copyToClipboard = useCallback(async () => {
    try { soundFeedback.buttonClick(); } catch {}
    const text = ingredients
      .map(i => `${i.checked ? '✓' : '○'} ${i.name} - ${i.displayAmount}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Lista skopiowana do schowka!');
    } catch {
      toast.error('Nie udało się skopiować');
    }
  }, [ingredients]);

  const addCustomItem = useCallback(() => {
    if (!newItemName.trim()) {
      toast.error('Podaj nazwę produktu');
      return;
    }
    try { soundFeedback.buttonClick(); } catch {}
    
    setCustomItems(prev => [...prev, {
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount) || 1,
      unit: newItemUnit,
      category: newItemCategory,
    }]);
    
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUnit('szt');
    setNewItemCategory('inne');
    setShowAddDialog(false);
    toast.success('Dodano produkt');
  }, [newItemName, newItemAmount, newItemUnit, newItemCategory]);

  const removeCustomItem = useCallback((itemName: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    setCustomItems(prev => prev.filter(i => i.name !== itemName));
    toast.success('Usunięto produkt');
  }, []);

  const saveToFavorites = useCallback(async () => {
    if (!user) return;
    try { soundFeedback.buttonClick(); } catch {}
    
    try {
      const { error } = await supabase.from('favorite_shopping_lists').insert({
        user_id: user.id,
        name: `Lista z diety - ${format(startDate, 'd MMM', { locale: pl })} do ${format(endDate, 'd MMM', { locale: pl })}`,
        items: ingredients.map(i => ({
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          category: i.category,
          displayAmount: i.displayAmount,
        })),
      });
      
      if (error) throw error;
      toast.success('Zapisano w ulubionych!');
    } catch (err) {
      console.error('Error saving to favorites:', err);
      toast.error('Nie udało się zapisać');
    }
  }, [user, ingredients, startDate, endDate]);

  const shareWithFriend = useCallback(async () => {
    if (!user || !selectedFriend) return;
    setSharing(true);
    
    try {
      // Create shared list
      const { data: sharedList, error: shareError } = await supabase
        .from('shared_shopping_lists')
        .insert({
          owner_id: user.id,
          shared_with_id: selectedFriend,
          items: ingredients.map(i => ({
            name: i.name,
            amount: i.amount,
            unit: i.unit,
            category: i.category,
            displayAmount: i.displayAmount,
            checked: false,
          })),
          date_range_start: format(startDate, 'yyyy-MM-dd'),
          date_range_end: format(endDate, 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (shareError) throw shareError;

      // Send chat message
      await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: selectedFriend,
        content: `📋 Udostępniono ci listę zakupów`,
        message_type: 'shopping_list',
        recipe_data: { listId: sharedList.id },
      });

      toast.success('Lista wysłana!');
      setShowShareDialog(false);
      setSelectedFriend(null);
    } catch (err) {
      console.error('Error sharing list:', err);
      toast.error('Nie udało się wysłać listy');
    } finally {
      setSharing(false);
    }
  }, [user, selectedFriend, ingredients, startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              try { soundFeedback.buttonClick(); } catch {}
              navigate('/lista-zakupow');
            }}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold font-display text-lg">Lista z diety</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(startDate, 'd MMM', { locale: pl })} — {format(endDate, 'd MMM yyyy', { locale: pl })}
            </p>
          </div>
          <ShoppingCart className="w-6 h-6 text-secondary" />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Progress */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Postęp zakupów</span>
            <span className="text-sm font-bold text-primary">{checkedCount}/{ingredients.length}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-secondary to-fitfly-green transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {checkedCount > 0 && (
            <div className="flex justify-end mt-2">
              <button onClick={clearChecked} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Wyczyść zaznaczone
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Kopiuj
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowShareDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            Wyślij
          </Button>
          <Button variant="outline" onClick={saveToFavorites}>
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Add item button */}
        <Button variant="outline" className="w-full" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj własny produkt
        </Button>

        {/* Ingredients by category */}
        {Object.keys(groupedIngredients).length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Brak produktów do wyświetlenia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedIngredients).map(([category, items]) => {
              const categoryInfo = INGREDIENT_CATEGORIES[category] || { label: category, emoji: '📦' };
              const categoryChecked = items.filter(i => i.checked).length;
              
              return (
                <div key={category} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
                  <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryInfo.emoji}</span>
                      <span className="font-bold text-foreground">{categoryInfo.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{categoryChecked}/{items.length}</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {items.map((item, idx) => {
                      const isCustom = customItems.some(ci => ci.name === item.name);
                      return (
                        <div
                          key={`${item.name}-${idx}`}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all",
                            item.checked && "bg-secondary/10 opacity-60"
                          )}
                          onClick={() => toggleItem(item.name)}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            item.checked ? "bg-secondary border-secondary" : "border-muted-foreground/30"
                          )}>
                            {item.checked && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className={cn(
                            "flex-1 text-sm",
                            item.checked && "line-through text-muted-foreground"
                          )}>
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.displayAmount}</span>
                          {isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomItem(item.name);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj produkt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Nazwa produktu</label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="np. Jabłka"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Ilość</label>
                <Input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Jednostka</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background"
                >
                  {AVAILABLE_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Kategoria</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.emoji} {opt.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={addCustomItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wyślij listę znajomemu</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak znajomych do wysłania listy
              </p>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.userId}
                  onClick={() => setSelectedFriend(friend.userId)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                    selectedFriend === friend.userId
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <span className="font-medium text-foreground">{friend.displayName}</span>
                </button>
              ))
            )}
          </div>
          {selectedFriend && (
            <Button onClick={shareWithFriend} disabled={sharing} className="w-full">
              {sharing ? 'Wysyłanie...' : 'Wyślij listę'}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
