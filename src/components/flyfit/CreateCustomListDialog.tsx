import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Heart, Share2, X, ShoppingCart, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useFriends } from '@/hooks/useFriends';

const CATEGORY_OPTIONS = [
  { key: 'pieczywo', label: 'Pieczywo', emoji: '🍞' },
  { key: 'nabial', label: 'Nabiał', emoji: '🥛' },
  { key: 'mieso', label: 'Mięso i ryby', emoji: '🥩' },
  { key: 'warzywa', label: 'Warzywa', emoji: '🥬' },
  { key: 'owoce', label: 'Owoce', emoji: '🍎' },
  { key: 'przyprawy', label: 'Przyprawy i oleje', emoji: '🧂' },
  { key: 'zboza', label: 'Zboża i makarony', emoji: '🍝' },
  { key: 'napoje', label: 'Napoje', emoji: '🥤' },
  { key: 'slodycze', label: 'Słodycze i przekąski', emoji: '🍫' },
  { key: 'inne', label: 'Inne', emoji: '📦' },
];

const AVAILABLE_UNITS = ['g', 'ml', 'kg', 'l', 'szt', 'opak'];

interface ListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
}

interface CreateCustomListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListCreated?: () => void;
}

export function CreateCustomListDialog({ open, onOpenChange, onListCreated }: CreateCustomListDialogProps) {
  const { user } = useAuth();
  const { friends } = useFriends();
  
  const [listName, setListName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  
  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('szt');
  const [newItemCategory, setNewItemCategory] = useState('inne');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setListName('');
    setNotes('');
    setItems([]);
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUnit('szt');
    setNewItemCategory('inne');
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleAddItem = useCallback(() => {
    if (!newItemName.trim()) return;
    
    try { soundFeedback.buttonClick(); } catch {}
    
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount) || 1,
      unit: newItemUnit,
      category: newItemCategory,
      checked: false,
    };
    
    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemAmount('1');
  }, [newItemName, newItemAmount, newItemUnit, newItemCategory]);

  const handleRemoveItem = useCallback((id: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleSaveToFavorites = useCallback(async () => {
    if (!user || items.length === 0) return;
    
    try { soundFeedback.success(); } catch {}
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('favorite_shopping_lists')
        .insert({
          user_id: user.id,
          name: listName.trim() || 'Moja lista zakupów',
          items: items.map(item => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            category: item.category,
            displayAmount: `${item.amount} ${item.unit}`,
          })),
        });

      if (error) throw error;
      
      toast.success('Lista została zapisana do ulubionych! ❤️');
      onListCreated?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving list:', err);
      toast.error('Nie udało się zapisać listy');
    } finally {
      setSaving(false);
    }
  }, [user, items, listName, onListCreated, onOpenChange]);

  const handleShareWithFriend = useCallback(async (friendId: string) => {
    if (!user || items.length === 0) return;
    
    try { soundFeedback.success(); } catch {}
    setSaving(true);
    
    try {
      // Create shared shopping list
      const { data: sharedList, error } = await supabase
        .from('shared_shopping_lists')
        .insert({
          owner_id: user.id,
          shared_with_id: friendId,
          items: items.map(item => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            category: item.category,
            displayAmount: `${item.amount} ${item.unit}`,
            checked: false,
          })),
          notes: notes || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Send chat message notification
      await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: friendId,
          content: '🛒 Udostępniono Ci listę zakupów!',
          message_type: 'shopping_list',
          recipe_data: { shoppingListId: sharedList.id }
        });

      toast.success('Lista została udostępniona! 🛒');
      setShowShareDialog(false);
      onListCreated?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error sharing list:', err);
      toast.error('Nie udało się udostępnić listy');
    } finally {
      setSaving(false);
    }
  }, [user, items, notes, onListCreated, onOpenChange]);

  const selectedCategoryEmoji = CATEGORY_OPTIONS.find(c => c.key === newItemCategory)?.emoji || '📦';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Utwórz swoją listę
            </DialogTitle>
            <DialogDescription>
              Stwórz własną listę zakupów
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* List name */}
            <div className="space-y-2">
              <Label htmlFor="listName">Nazwa listy</Label>
              <Input
                id="listName"
                placeholder="np. Zakupy na weekend"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notatki (opcjonalnie)</Label>
              <Textarea
                id="notes"
                placeholder="Dodaj notatki do listy..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Add new item */}
            <div className="space-y-2">
              <Label>Dodaj produkt</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nazwa produktu"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className="flex-1"
                />
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg hover:bg-muted/80 transition-colors text-lg"
                  >
                    {selectedCategoryEmoji}
                  </button>
                  {showCategoryPicker && (
                    <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-2 min-w-[180px]">
                      {CATEGORY_OPTIONS.map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => {
                            setNewItemCategory(cat.key);
                            setShowCategoryPicker(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            newItemCategory === cat.key ? "bg-primary/20 text-primary" : "hover:bg-muted"
                          )}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Ilość"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="w-20"
                  min="0"
                  step="0.1"
                />
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  {AVAILABLE_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </div>

            {/* Items list */}
            {items.length > 0 && (
              <div className="space-y-2">
                <Label>Produkty ({items.length})</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {items.map(item => {
                    const cat = CATEGORY_OPTIONS.find(c => c.key === item.category);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                      >
                        <span className="text-lg">{cat?.emoji || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.amount} {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSaveToFavorites}
                disabled={items.length === 0 || saving}
              >
                <Heart className="w-4 h-4 mr-2" />
                Zapisz do ulubionych
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowShareDialog(true)}
                disabled={items.length === 0 || saving}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Udostępnij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Udostępnij listę</DialogTitle>
            <DialogDescription>
              Wybierz znajomego, któremu chcesz udostępnić listę
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak znajomych do udostępnienia
              </p>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.userId}
                  onClick={() => handleShareWithFriend(friend.userId)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.displayName || ''}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {friend.displayName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {friend.displayName || 'Znajomy'}
                    </p>
                    {friend.username && (
                      <p className="text-xs text-muted-foreground">
                        @{friend.username}
                      </p>
                    )}
                  </div>
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
