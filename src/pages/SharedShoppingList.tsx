import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Calendar, User, Trash2, Plus, X, MessageSquare, Wifi, WifiOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SharedListItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  displayAmount: string;
  checked?: boolean;
  addedBy?: string;
}

interface SharedList {
  id: string;
  owner_id: string;
  shared_with_id: string;
  owner_name: string;
  recipient_name: string;
  items: SharedListItem[];
  date_range_start: string | null;
  date_range_end: string | null;
  created_at: string;
  notes: string;
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

const CATEGORY_OPTIONS = Object.entries(INGREDIENT_CATEGORIES).map(([key, value]) => ({
  key,
  label: value.label,
  emoji: value.emoji,
}));

const AVAILABLE_UNITS = ['g', 'ml', 'kg', 'l', 'szt', 'opak'];

export default function SharedShoppingList() {
  const navigate = useNavigate();
  const { listId } = useParams<{ listId: string }>();
  const { user, isInitialized } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sharedList, setSharedList] = useState<SharedList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  // Add item dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('szt');
  const [newItemCategory, setNewItemCategory] = useState('inne');
  
  // Notes
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        let recipientName = 'Znajomy';
        
        try {
          const { data: ownerData } = await supabase
            .rpc('get_friend_profile', { friend_user_id: data.owner_id });
          if (ownerData && ownerData.length > 0) {
            ownerName = ownerData[0].display_name || 'Znajomy';
          }
        } catch (e) {
          console.error('Error fetching owner profile:', e);
        }

        try {
          const { data: recipientData } = await supabase
            .rpc('get_friend_profile', { friend_user_id: data.shared_with_id });
          if (recipientData && recipientData.length > 0) {
            recipientName = recipientData[0].display_name || 'Znajomy';
          }
        } catch (e) {
          console.error('Error fetching recipient profile:', e);
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
          shared_with_id: data.shared_with_id,
          owner_name: ownerName,
          recipient_name: recipientName,
          items: items,
          date_range_start: data.date_range_start,
          date_range_end: data.date_range_end,
          created_at: data.created_at,
          notes: (data as any).notes || '',
        });
        setCheckedItems(initialChecked);
        setNotes((data as any).notes || '');
      } catch (err) {
        console.error('Error:', err);
        toast.error('Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [user, isInitialized, listId, navigate]);

  // Real-time subscription
  useEffect(() => {
    if (!listId || !user) return;

    const channel = supabase
      .channel(`shared-list-${listId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_shopping_lists',
          filter: `id=eq.${listId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          const newData = payload.new as any;
          
          // Update items
          const items = (newData.items as SharedListItem[]) || [];
          const newChecked = new Set<string>();
          items.forEach(item => {
            if (item.checked) {
              newChecked.add(item.name.toLowerCase());
            }
          });
          
          setSharedList(prev => prev ? {
            ...prev,
            items: items,
            notes: newData.notes || '',
          } : null);
          
          setCheckedItems(newChecked);
          
          // Only update notes if user is not editing
          if (!editingNotes) {
            setNotes(newData.notes || '');
          }
          
          // Show toast for live update (not from self)
          try {
            soundFeedback.messageReceived();
          } catch {}
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, user, editingNotes]);

  // Save items to database
  const saveItems = useCallback(async (newItems: SharedListItem[], newCheckedItems?: Set<string>) => {
    if (!sharedList || !user || saving) return;

    setSaving(true);
    try {
      const checkedSet = newCheckedItems || checkedItems;
      const updatedItems = newItems.map(item => ({
        ...item,
        checked: checkedSet.has(item.name.toLowerCase()),
      }));

      const { error } = await supabase
        .from('shared_shopping_lists')
        .update({ items: updatedItems })
        .eq('id', sharedList.id);

      if (error) {
        console.error('Error saving items:', error);
        toast.error('Nie udało się zapisać zmian');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  }, [sharedList, user, saving, checkedItems]);

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
      // Save to database with new checked state
      if (sharedList) {
        saveItems(sharedList.items, newChecked);
      }
      return newChecked;
    });
  }, [saveItems, sharedList]);

  // Add new item
  const addItem = useCallback(() => {
    if (!newItemName.trim() || !sharedList) return;
    
    try { soundFeedback.success(); } catch {}

    const newItem: SharedListItem = {
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount) || 1,
      unit: newItemUnit,
      category: newItemCategory,
      displayAmount: `${newItemAmount} ${newItemUnit}`,
      checked: false,
      addedBy: user?.id,
    };

    const updatedItems = [...sharedList.items, newItem];
    setSharedList(prev => prev ? { ...prev, items: updatedItems } : null);
    saveItems(updatedItems);
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUnit('szt');
    setNewItemCategory('inne');
    setShowAddDialog(false);
    
    toast.success('Dodano produkt');
  }, [newItemName, newItemAmount, newItemUnit, newItemCategory, sharedList, user, saveItems]);

  // Delete item
  const deleteItem = useCallback((itemName: string) => {
    if (!sharedList) return;
    
    try { soundFeedback.buttonClick(); } catch {}
    
    const updatedItems = sharedList.items.filter(i => i.name.toLowerCase() !== itemName.toLowerCase());
    setSharedList(prev => prev ? { ...prev, items: updatedItems } : null);
    
    // Also remove from checked
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      newChecked.delete(itemName.toLowerCase());
      return newChecked;
    });
    
    saveItems(updatedItems);
  }, [sharedList, saveItems]);

  // Save notes with debounce
  const saveNotes = useCallback(async (newNotes: string) => {
    if (!sharedList) return;
    
    try {
      const { error } = await supabase
        .from('shared_shopping_lists')
        .update({ notes: newNotes })
        .eq('id', sharedList.id);

      if (error) {
        console.error('Error saving notes:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }, [sharedList]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    setEditingNotes(true);
    
    // Debounce save
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    notesTimeoutRef.current = setTimeout(() => {
      saveNotes(value);
      setEditingNotes(false);
    }, 1000);
  }, [saveNotes]);

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

  const isOwner = sharedList?.owner_id === user?.id;
  const partnerName = isOwner ? sharedList?.recipient_name : sharedList?.owner_name;

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
              Wspólna lista <ShoppingCart className="w-5 h-5" />
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3 h-3" />
              <span>z {declinePolishName(partnerName || 'Znajomym')}</span>
              {isLive ? (
                <span className="flex items-center gap-1 text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3" />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground/50 text-xs">
                  <WifiOff className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={deleteList} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 space-y-4 py-4">
        {/* Date Range (read-only) */}
        {sharedList.date_range_start && sharedList.date_range_end && (
          <div className="bg-primary/10 rounded-xl p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {format(new Date(sharedList.date_range_start), 'd MMMM', { locale: pl })} — {format(new Date(sharedList.date_range_end), 'd MMMM yyyy', { locale: pl })}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">(Okres ustalony)</span>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card-playful">
          <button
            onClick={() => setShowNotesInput(!showNotesInput)}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground flex-1">
              {notes ? 'Notatka' : 'Dodaj notatkę'}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              showNotesInput && "rotate-180"
            )} />
          </button>
          
          {showNotesInput && (
            <div className="px-4 pb-4 pt-0">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Napisz notatkę... (np. 'Kupić na promocji', 'Sprawdzić ceny w Biedronce')"
                className="min-h-[80px] resize-none"
              />
              {editingNotes && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Zapisywanie...
                </p>
              )}
            </div>
          )}
        </div>

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

        {/* Add Item Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold py-6 rounded-2xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Dodaj produkt
        </Button>

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
                      <div
                        key={`${item.name}-${idx}`}
                        className={cn(
                          "flex items-center transition-all",
                          isChecked && "bg-primary/5"
                        )}
                      >
                        <button
                          onClick={() => toggleItem(item.name)}
                          className="flex-1 px-4 py-3 flex items-center gap-3 text-left"
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
                        <button
                          onClick={() => deleteItem(item.name)}
                          className="p-3 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
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
            <p className="text-muted-foreground mb-4">Ta lista jest pusta</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj pierwszy produkt
            </Button>
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Dodaj produkt
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nazwa produktu
              </label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="np. Mleko, Chleb, Masło..."
                className="text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Ilość
                </label>
                <Input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Jednostka
                </label>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_UNITS.map(unit => (
                    <button
                      key={unit}
                      onClick={() => setNewItemUnit(unit)}
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                        newItemUnit === unit
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Kategoria
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setNewItemCategory(cat.key)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left flex items-center gap-2",
                      newItemCategory === cat.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={addItem}
              disabled={!newItemName.trim()}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj do listy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ChevronDown component for notes toggle
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
