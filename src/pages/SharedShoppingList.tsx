import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Calendar, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface SharedListItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  displayAmount: string;
  checked?: boolean;
}

interface SharedList {
  id: string;
  owner_id: string;
  owner_name: string;
  items: SharedListItem[];
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
  
  if (lastChar === 'a') {
    if (lastTwoChars === 'ia') return trimmed.slice(0, -1) + 'i';
    if (lastTwoChars === 'ja') return trimmed.slice(0, -1) + 'i';
    const beforeA = trimmed.slice(-2, -1).toLowerCase();
    if (['l', 'j'].includes(beforeA) || trimmed.slice(-2).match(/[śćźń]a/i)) {
      return trimmed.slice(0, -1) + 'i';
    }
    return trimmed.slice(0, -1) + 'y';
  }
  
  if (lastTwoChars === 'ek') return trimmed.slice(0, -2) + 'ka';
  if (lastTwoChars === 'eł') return trimmed.slice(0, -2) + 'ła';
  if (lastTwoChars === 'sz') return trimmed + 'a';
  if (['n', 'r', 'ł', 'f', 'd', 'k', 's', 'z', 'j', 't', 'm', 'c', 'w', 'p', 'b', 'g'].includes(lastChar)) {
    return trimmed + 'a';
  }
  
  return trimmed + 'a';
};

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

export default function SharedShoppingList() {
  const navigate = useNavigate();
  const { listId } = useParams<{ listId: string }>();
  const { user, isInitialized } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sharedList, setSharedList] = useState<SharedList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Load shared list and its items
  useEffect(() => {
    if (!isInitialized || !user || !listId) return;

    const fetchSharedList = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shared_shopping_lists')
          .select('*')
          .eq('id', listId)
          .single();

        if (error) {
          console.error('Error fetching shared list:', error);
          toast.error('Nie udało się załadować listy');
          navigate('/lista-zakupow');
          return;
        }

        // Check if user has access
        if (data.shared_with_id !== user.id && data.owner_id !== user.id) {
          toast.error('Brak dostępu do tej listy');
          navigate('/lista-zakupow');
          return;
        }

        // Get owner profile
        let ownerName = 'Znajomy';
        try {
          const { data: profileData } = await supabase
            .rpc('get_friend_profile', { friend_user_id: data.owner_id });
          if (profileData && profileData.length > 0) {
            ownerName = profileData[0].display_name || 'Znajomy';
          }
        } catch (e) {
          console.error('Error fetching owner profile:', e);
        }

        // Parse items and extract checked state
        const items = (data.items as unknown as SharedListItem[]) || [];
        const initialChecked = new Set<string>();
        items.forEach(item => {
          if (item.checked) {
            initialChecked.add(item.name.toLowerCase());
          }
        });

        setSharedList({
          id: data.id,
          owner_id: data.owner_id,
          owner_name: ownerName,
          items: items,
          date_range_start: data.date_range_start,
          date_range_end: data.date_range_end,
          created_at: data.created_at,
        });
        setCheckedItems(initialChecked);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [user, isInitialized, listId, navigate]);

  // Save checked items to database
  const saveCheckedItems = useCallback(async (newCheckedItems: Set<string>) => {
    if (!sharedList || !user || saving) return;

    setSaving(true);
    try {
      // Update items with checked state
      const updatedItems = sharedList.items.map(item => ({
        ...item,
        checked: newCheckedItems.has(item.name.toLowerCase()),
      }));

      const { error } = await supabase
        .from('shared_shopping_lists')
        .update({ items: updatedItems })
        .eq('id', sharedList.id);

      if (error) {
        console.error('Error saving checked items:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  }, [sharedList, user, saving]);

  // Toggle item checked state
  const toggleItem = useCallback((itemName: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    
    const key = itemName.toLowerCase();
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(key)) {
        newChecked.delete(key);
      } else {
        newChecked.add(key);
      }
      // Save to database
      saveCheckedItems(newChecked);
      return newChecked;
    });
  }, [saveCheckedItems]);

  // Delete shared list
  const deleteList = useCallback(async () => {
    if (!sharedList) return;
    
    try {
      soundFeedback.buttonClick();
    } catch {}

    try {
      const { error } = await supabase
        .from('shared_shopping_lists')
        .delete()
        .eq('id', sharedList.id);

      if (error) throw error;

      toast.success('Usunięto listę');
      navigate('/lista-zakupow');
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Nie udało się usunąć listy');
    }
  }, [sharedList, navigate]);

  // Group items by category
  const groupedItems = sharedList?.items.reduce((groups, item) => {
    const category = item.category || 'inne';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, SharedListItem[]>) || {};

  // Calculate progress
  const totalItems = sharedList?.items.length || 0;
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sharedList) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Lista nie została znaleziona</p>
          <Button className="mt-4" onClick={() => navigate('/lista-zakupow')}>
            Wróć do list zakupów
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = sharedList.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => {
              try { soundFeedback.navTap(); } catch {}
              navigate('/lista-zakupow');
            }} 
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              Lista zakupów <ShoppingCart className="w-5 h-5" />
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              {isOwner ? 'Twoja lista' : `Od ${declinePolishName(sharedList.owner_name)}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={deleteList} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 space-y-4 py-4">
        {/* Date Range */}
        {sharedList.date_range_start && sharedList.date_range_end && (
          <div className="bg-primary/10 rounded-xl p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {format(new Date(sharedList.date_range_start), 'd MMMM', { locale: pl })} — {format(new Date(sharedList.date_range_end), 'd MMMM yyyy', { locale: pl })}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card-playful">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Postęp zakupów
            </span>
            <span className="text-sm font-bold text-primary">
              {checkedCount}/{totalItems}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {saving && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Zapisywanie...
            </p>
          )}
        </div>

        {/* Grouped Items */}
        <div className="space-y-4">
          {Object.entries(INGREDIENT_CATEGORIES).map(([category, config]) => {
            const items = groupedItems[category];
            if (!items || items.length === 0) return null;

            const categoryChecked = items.filter(i => checkedItems.has(i.name.toLowerCase())).length;
            const allChecked = categoryChecked === items.length;

            return (
              <div key={category} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
                <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                  <span className={cn(
                    "font-bold flex items-center gap-2 transition-colors",
                    allChecked ? "text-muted-foreground" : "text-foreground"
                  )}>
                    <span className="text-xl">{config.emoji}</span>
                    {config.label}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    allChecked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
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
                          isChecked ? "bg-primary border-primary" : "border-border"
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

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Ta lista jest pusta</p>
          </div>
        )}
      </div>
    </div>
  );
}
