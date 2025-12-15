import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from '@/lib/errorHandler';

interface GratitudeEntry {
  id: string;
  entry_date: string;
  entry_1: string | null;
  entry_2: string | null;
  entry_3: string | null;
}

export function useGratitude() {
  const { user } = useAuth();
  const [todayEntry, setTodayEntry] = useState<GratitudeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);

  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const fetchTodayEntry = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = getToday();
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (error) throw error;
      
      if (mountedRef.current) {
        setTodayEntry(data);
      }
    } catch (error) {
      handleApiError(error, 'Gratitude fetch', { silent: true });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, getToday]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTodayEntry();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTodayEntry]);

  const saveEntry = useCallback(async (entries: { entry_1?: string; entry_2?: string; entry_3?: string }) => {
    if (!user) return;

    setSaving(true);
    try {
      const today = getToday();
      
      if (todayEntry) {
        // Update existing
        const { error } = await supabase
          .from('gratitude_entries')
          .update({
            entry_1: entries.entry_1 ?? todayEntry.entry_1,
            entry_2: entries.entry_2 ?? todayEntry.entry_2,
            entry_3: entries.entry_3 ?? todayEntry.entry_3,
          })
          .eq('id', todayEntry.id);

        if (error) throw error;

        if (mountedRef.current) {
          setTodayEntry(prev => prev ? { ...prev, ...entries } : null);
        }
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('gratitude_entries')
          .insert({
            user_id: user.id,
            entry_date: today,
            entry_1: entries.entry_1 || null,
            entry_2: entries.entry_2 || null,
            entry_3: entries.entry_3 || null,
          })
          .select()
          .single();

        if (error) throw error;

        if (mountedRef.current && data) {
          setTodayEntry(data);
        }
      }
    } catch (error) {
      handleApiError(error, 'Nie udało się zapisać wpisu wdzięczności');
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [user, todayEntry, getToday]);

  const isComplete = todayEntry?.entry_1 && todayEntry?.entry_2 && todayEntry?.entry_3;

  return {
    todayEntry,
    loading,
    saving,
    saveEntry,
    isComplete,
    refresh: fetchTodayEntry,
  };
}
