import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShoppingCart, Check, Calendar, ChevronRight, Trash2, Plus, Gift, User, Heart, FolderOpen, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface SavedShoppingList {
  id: string;
  name: string;
  items: Array<{
    name: string;
    amount: number;
    unit: string;
    category: string;
    displayAmount: string;
    checked?: boolean;
  }>;
  source: 'diet' | 'custom' | 'shared';
  created_at: string;
  diet_name?: string;
  date_range_start?: string;
  date_range_end?: string;
  shared_by?: string;
}

interface MyShoppingListsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectList: (list: SavedShoppingList) => void;
  user: { id: string } | null;
}

export function MyShoppingListsSection({ isOpen, onClose, onSelectList, user }: MyShoppingListsSectionProps) {
  const [lists, setLists] = useState<SavedShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const fetchLists = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch favorite lists (custom)
      const { data: favorites, error: favError } = await supabase
        .from('favorite_shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) console.error('Error fetching favorites:', favError);

      // Fetch shared lists
      const { data: shared, error: sharedError } = await supabase
        .from('shared_shopping_lists')
        .select('*')
        .eq('shared_with_id', user.id)
        .order('created_at', { ascending: false });

      if (sharedError) console.error('Error fetching shared:', sharedError);

      const allLists: SavedShoppingList[] = [];

      // Add favorites as custom lists
      if (favorites) {
        favorites.forEach((fav: any) => {
          const parsedItems = Array.isArray(fav.items) ? fav.items.map((item: any) => ({
            name: item?.name || '',
            amount: item?.amount || 0,
            unit: item?.unit || 'szt',
            category: item?.category || 'inne',
            displayAmount: item?.displayAmount || `${item?.amount || 0} ${item?.unit || 'szt'}`,
            checked: item?.checked || false,
          })) : [];
          
          allLists.push({
            id: fav.id,
            name: fav.name || 'Lista zakupów',
            items: parsedItems,
            source: 'custom',
            created_at: fav.created_at,
          });
        });
      }

      // Add shared lists
      if (shared) {
        for (const s of shared) {
          // Get owner name
          const { data: ownerData } = await supabase.rpc('get_friend_profile', { friend_user_id: s.owner_id });
          const ownerName = ownerData?.[0]?.display_name || 'Znajomy';
          
          const parsedItems = Array.isArray(s.items) ? (s.items as any[]).map((item: any) => ({
            name: item?.name || '',
            amount: item?.amount || 0,
            unit: item?.unit || 'szt',
            category: item?.category || 'inne',
            displayAmount: item?.displayAmount || `${item?.amount || 0} ${item?.unit || 'szt'}`,
            checked: item?.checked || false,
          })) : [];
          
          allLists.push({
            id: s.id,
            name: `Lista od ${ownerName}`,
            items: parsedItems,
            source: 'shared',
            created_at: s.created_at,
            shared_by: ownerName,
            date_range_start: s.date_range_start || undefined,
            date_range_end: s.date_range_end || undefined,
          });
        }
      }

      setLists(allLists);
    } catch (err) {
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, fetchLists]);

  const deleteList = async (listId: string, source: 'custom' | 'shared' | 'diet') => {
    try {
      soundFeedback.buttonClick();
    } catch {}

    try {
      if (source === 'custom') {
        const { error } = await supabase
          .from('favorite_shopping_lists')
          .delete()
          .eq('id', listId);
        if (error) throw error;
      } else if (source === 'shared') {
        const { error } = await supabase
          .from('shared_shopping_lists')
          .delete()
          .eq('id', listId);
        if (error) throw error;
      }
      
      setLists(prev => prev.filter(l => l.id !== listId));
      toast.success('Lista usunięta');
    } catch (err) {
      console.error('Error deleting list:', err);
      toast.error('Nie udało się usunąć listy');
    }
  };

  const toggleSection = (section: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const customLists = lists.filter(l => l.source === 'custom');
  const sharedLists = lists.filter(l => l.source === 'shared');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => {
              try { soundFeedback.navTap(); } catch {}
              onClose();
            }} 
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold font-display text-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Moje listy zakupów
            </h1>
            <p className="text-sm text-muted-foreground">
              {lists.length} list zapisanych
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 overflow-y-auto h-[calc(100vh-80px)] space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Brak zapisanych list</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Utwórz nową listę lub wygeneruj z diety
            </p>
          </div>
        ) : (
          <>
            {/* Custom Lists */}
            {customLists.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <button
                  onClick={() => toggleSection('custom')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-destructive fill-destructive" />
                    <span className="font-bold text-foreground">Moje listy</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                      {customLists.length}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    collapsedSections.has('custom') && "-rotate-90"
                  )} />
                </button>
                
                <div className={cn(
                  "divide-y divide-border/30 transition-all overflow-hidden",
                  collapsedSections.has('custom') ? "max-h-0" : "max-h-[2000px]"
                )}>
                  {customLists.map(list => (
                    <div key={list.id} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{list.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {list.items.length} produktów • {format(new Date(list.created_at), 'd MMM', { locale: pl })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id, 'custom');
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            try { soundFeedback.buttonClick(); } catch {}
                            onSelectList(list);
                          }}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Lists */}
            {sharedLists.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <button
                  onClick={() => toggleSection('shared')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-foreground">Udostępnione</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                      {sharedLists.length}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    collapsedSections.has('shared') && "-rotate-90"
                  )} />
                </button>
                
                <div className={cn(
                  "divide-y divide-border/30 transition-all overflow-hidden",
                  collapsedSections.has('shared') ? "max-h-0" : "max-h-[2000px]"
                )}>
                  {sharedLists.map(list => (
                    <div key={list.id} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{list.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {list.items.length} produktów • {format(new Date(list.created_at), 'd MMM', { locale: pl })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id, 'shared');
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            try { soundFeedback.buttonClick(); } catch {}
                            onSelectList(list);
                          }}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
