import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Share2, Calendar, ChevronLeft, ChevronRight, Trash2, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';

interface Ingredient {
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

interface DietPlan {
  id: string;
  name: string;
  plan_data: {
    days?: Array<{
      date: string;
      meals: Array<{
        name: string;
        ingredients?: string[];
      }>;
    }>;
  };
}

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
    keywords: ['kurczak', 'wołowin', 'wieprzow', 'mięso', 'szynk', 'boczek', 'kiełbas', 'ryb', 'łosoś', 'tuńczyk', 'krewetk', 'indyk'] 
  },
  warzywa: { 
    label: 'Warzywa', 
    emoji: '🥬', 
    keywords: ['marchew', 'cebul', 'czosnek', 'pomidor', 'ogórek', 'sałat', 'papryka', 'brokuł', 'szpinak', 'kapust', 'ziemniak', 'cukini', 'bakłażan', 'kalafior', 'por', 'seler', 'burak'] 
  },
  owoce: { 
    label: 'Owoce', 
    emoji: '🍎', 
    keywords: ['jabłk', 'banan', 'pomarańcz', 'cytryn', 'truskawk', 'maliny', 'jagod', 'winogrona', 'arbuz', 'melon', 'grejpfrut', 'kiwi', 'mango', 'ananas'] 
  },
  przyprawy: { 
    label: 'Przyprawy', 
    emoji: '🧂', 
    keywords: ['sól', 'pieprz', 'papryka', 'oregano', 'bazylia', 'tymianek', 'kurkuma', 'curry', 'cynamon', 'imbir', 'przyprawa'] 
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
    keywords: ['czekolad', 'cukier', 'miód', 'dżem', 'ciast', 'baton', 'herbatnik', 'orzechy', 'bakalie'] 
  },
  inne: { 
    label: 'Inne', 
    emoji: '📦', 
    keywords: [] 
  },
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

const parseIngredients = (ingredientStrings: string[]): Ingredient[] => {
  return ingredientStrings.map(str => {
    // Try to parse "amount name" or just "name"
    const match = str.match(/^([\d.,/]+\s*\w*)\s+(.+)$/);
    const name = match ? match[2].trim() : str.trim();
    const amount = match ? match[1].trim() : '';
    
    return {
      name,
      amount,
      category: categorizeIngredient(name),
      checked: false,
    };
  });
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
    if (!dietPlan?.plan_data?.days || !startDate || !endDate) return [];
    
    const allIngredients: string[] = [];
    
    dietPlan.plan_data.days.forEach(day => {
      const dayDate = parseISO(day.date);
      if (isWithinInterval(dayDate, { start: startDate, end: endDate })) {
        day.meals.forEach(meal => {
          if (meal.ingredients) {
            allIngredients.push(...meal.ingredients);
          }
        });
      }
    });

    const parsed = parseIngredients(allIngredients);
    
    // Merge duplicates
    const merged = new Map<string, Ingredient>();
    parsed.forEach(ing => {
      const key = ing.name.toLowerCase();
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        // Try to combine amounts
        if (existing.amount && ing.amount) {
          existing.amount = `${existing.amount} + ${ing.amount}`;
        } else if (ing.amount) {
          existing.amount = ing.amount;
        }
      } else {
        merged.set(key, { ...ing, checked: checkedItems.has(key) });
      }
    });

    return Array.from(merged.values());
  }, [dietPlan, startDate, endDate, checkedItems]);

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
        text += `  ${checkbox} ${item.amount ? `${item.amount} ` : ''}${item.name}\n`;
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
        text += `  • ${item.amount ? `${item.amount} ` : ''}${item.name}\n`;
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
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
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
                              {item.amount && (
                                <p className="text-xs text-muted-foreground">{item.amount}</p>
                              )}
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
