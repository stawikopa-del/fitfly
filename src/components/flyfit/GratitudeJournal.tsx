import { useState, useEffect, memo, useCallback } from 'react';
import { Heart, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGratitude } from '@/hooks/useGratitude';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const PROMPTS = [
  'Za co jestem dziś wdzięczny/a?',
  'Co mnie dzisiaj ucieszyło?',
  'Komu chcę podziękować?',
];

const GratitudeInput = memo(({ 
  index, 
  value, 
  onChange, 
  disabled,
  isSaved 
}: { 
  index: number; 
  value: string; 
  onChange: (value: string) => void; 
  disabled: boolean;
  isSaved: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
      isSaved ? "bg-green-500 text-white" : "bg-primary/20 text-primary"
    )}>
      {isSaved ? <Check className="w-3 h-3" /> : index + 1}
    </div>
    <Input
      placeholder={PROMPTS[index]}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="flex-1 bg-background/50 border-border/50 text-sm"
    />
  </div>
));

GratitudeInput.displayName = 'GratitudeInput';

export const GratitudeJournal = memo(function GratitudeJournal() {
  const { todayEntry, loading, saving, saveEntry, isComplete } = useGratitude();
  const [isExpanded, setIsExpanded] = useState(false);
  const [entries, setEntries] = useState({
    entry_1: '',
    entry_2: '',
    entry_3: '',
  });

  // Initialize entries when todayEntry loads
  useEffect(() => {
    if (todayEntry) {
      setEntries({
        entry_1: todayEntry.entry_1 || '',
        entry_2: todayEntry.entry_2 || '',
        entry_3: todayEntry.entry_3 || '',
      });
    }
  }, [todayEntry]);

  const handleEntryChange = useCallback((key: keyof typeof entries, value: string) => {
    setEntries(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    await saveEntry(entries);
  }, [saveEntry, entries]);

  const hasChanges = 
    entries.entry_1 !== (todayEntry?.entry_1 || '') ||
    entries.entry_2 !== (todayEntry?.entry_2 || '') ||
    entries.entry_3 !== (todayEntry?.entry_3 || '');

  const hasAnyEntry = entries.entry_1 || entries.entry_2 || entries.entry_3;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl p-4 transition-all duration-300",
      isComplete && "ring-2 ring-green-500/30"
    )}>
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isComplete ? "bg-green-500" : "bg-gradient-to-br from-pink-500 to-orange-500"
          )}>
            {isComplete ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Heart className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm flex items-center gap-1">
              Dziennik wdzięczności
              {isComplete && <Sparkles className="w-3 h-3 text-yellow-500" />}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isComplete ? 'Ukończono na dziś!' : '3 rzeczy za które jesteś wdzięczny/a'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 mt-4 animate-in slide-in-from-top-2 duration-200">
          <GratitudeInput
            index={0}
            value={entries.entry_1}
            onChange={(v) => handleEntryChange('entry_1', v)}
            disabled={saving}
            isSaved={!!todayEntry?.entry_1}
          />
          <GratitudeInput
            index={1}
            value={entries.entry_2}
            onChange={(v) => handleEntryChange('entry_2', v)}
            disabled={saving}
            isSaved={!!todayEntry?.entry_2}
          />
          <GratitudeInput
            index={2}
            value={entries.entry_3}
            onChange={(v) => handleEntryChange('entry_3', v)}
            disabled={saving}
            isSaved={!!todayEntry?.entry_3}
          />

          {hasAnyEntry && hasChanges && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
            >
              {saving ? 'Zapisuję...' : 'Zapisz wpisy'}
            </Button>
          )}

          {isComplete && !hasChanges && (
            <div className="text-center text-xs text-green-600 font-medium py-1">
              Świetnie! Wdzięczność na dziś zapisana
            </div>
          )}
        </div>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && isComplete && (
        <div className="flex gap-1 mt-1">
          {[todayEntry?.entry_1, todayEntry?.entry_2, todayEntry?.entry_3].map((entry, i) => (
            <div key={i} className="flex-1 text-xs truncate text-muted-foreground bg-background/30 rounded px-2 py-1">
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
