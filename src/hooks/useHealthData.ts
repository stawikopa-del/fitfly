import { useState, useEffect, useCallback, useMemo } from 'react';
import { handleApiError } from '@/lib/errorHandler';

interface HealthData {
  steps: number;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useHealthData() {
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    isAvailable: false,
    isLoading: true,
    error: null,
  });

  // Check if running on native platform - memoized and safe
  const isNativePlatform = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Check for Capacitor
      return !!(window as any).Capacitor?.isNativePlatform?.();
    } catch {
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    if (!isNativePlatform) {
      setHealthData(prev => ({
        ...prev,
        isLoading: false,
        isAvailable: false,
      }));
      return false;
    }

    try {
      setHealthData(prev => ({
        ...prev,
        isAvailable: true,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      handleApiError(error, 'requestHealthPermissions', { 
        fallbackMessage: 'Nie udało się uzyskać dostępu do danych zdrowotnych',
        silent: true // Don't spam user on web
      });
      setHealthData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Nie udało się uzyskać dostępu do danych zdrowotnych',
      }));
      return false;
    }
  }, [isNativePlatform]);

  const fetchSteps = useCallback(async (): Promise<number> => {
    if (!isNativePlatform) {
      return 0;
    }

    try {
      return 0;
    } catch (error) {
      handleApiError(error, 'fetchSteps', { silent: true });
      return 0;
    }
  }, [isNativePlatform]);

  const updateSteps = useCallback((steps: number) => {
    setHealthData(prev => ({
      ...prev,
      steps,
    }));
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (healthData.isAvailable) {
      fetchSteps().then(steps => {
        if (steps > 0) {
          updateSteps(steps);
        }
      });
    }
  }, [healthData.isAvailable, fetchSteps, updateSteps]);

  return {
    ...healthData,
    requestPermissions,
    fetchSteps,
    updateSteps,
    isNativePlatform,
  };
}
