import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { handleApiError } from '@/lib/errorHandler';

export interface Measurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight: number | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeasurementInput {
  weight?: number | null;
  mood?: number | null;
  energy?: number | null;
  stress?: number | null;
  sleep_quality?: number | null;
  sleep_hours?: number | null;
  notes?: string | null;
}

export function useMeasurements() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [todayMeasurement, setTodayMeasurement] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);

  const fetchMeasurements = useCallback(async (days: number = 30) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('measurement_date', startDate)
        .order('measurement_date', { ascending: false });

      if (error) throw error;

      if (mountedRef.current) {
        // Type assertion since we know the structure matches
        const typedData = (data || []) as unknown as Measurement[];
        setMeasurements(typedData);
        
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayData = typedData.find(m => m.measurement_date === today);
        setTodayMeasurement(todayData || null);
      }
    } catch (error) {
      handleApiError(error, 'fetchMeasurements', { fallbackMessage: 'Nie udało się pobrać pomiarów' });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  const saveMeasurement = useCallback(async (input: MeasurementInput): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Musisz być zalogowany');
      return false;
    }

    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Check if measurement exists for today
      const { data: existing } = await supabase
        .from('user_measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('measurement_date', today)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_measurements')
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        toast.success('Pomiary zaktualizowane! 📊');
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_measurements')
          .insert({
            user_id: user.id,
            measurement_date: today,
            ...input,
          });

        if (error) throw error;
        toast.success('Pomiary zapisane! 📊');
      }

      // Refresh data
      await fetchMeasurements();
      return true;
    } catch (error) {
      handleApiError(error, 'saveMeasurement', { fallbackMessage: 'Nie udało się zapisać pomiarów' });
      return false;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [user?.id, fetchMeasurements]);

  const getLatestWeight = useCallback((): number | null => {
    const withWeight = measurements.find(m => m.weight !== null);
    return withWeight?.weight ?? null;
  }, [measurements]);

  const getWeightHistory = useCallback((days: number = 30): { date: string; weight: number }[] => {
    return measurements
      .filter(m => m.weight !== null)
      .slice(0, days)
      .map(m => ({
        date: m.measurement_date,
        weight: m.weight!,
      }))
      .reverse();
  }, [measurements]);

  const getMoodHistory = useCallback((days: number = 7): { date: string; mood: number }[] => {
    return measurements
      .filter(m => m.mood !== null)
      .slice(0, days)
      .map(m => ({
        date: m.measurement_date,
        mood: m.mood!,
      }))
      .reverse();
  }, [measurements]);

  const getAverages = useCallback((days: number = 7) => {
    const recent = measurements.slice(0, days);
    
    const avg = (arr: (number | null)[]) => {
      const valid = arr.filter((v): v is number => v !== null);
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };

    return {
      mood: avg(recent.map(m => m.mood)),
      energy: avg(recent.map(m => m.energy)),
      stress: avg(recent.map(m => m.stress)),
      sleepQuality: avg(recent.map(m => m.sleep_quality)),
      sleepHours: avg(recent.map(m => m.sleep_hours)),
    };
  }, [measurements]);

  useEffect(() => {
    mountedRef.current = true;
    fetchMeasurements();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchMeasurements]);

  return {
    measurements,
    todayMeasurement,
    loading,
    saving,
    saveMeasurement,
    fetchMeasurements,
    getLatestWeight,
    getWeightHistory,
    getMoodHistory,
    getAverages,
  };
}
