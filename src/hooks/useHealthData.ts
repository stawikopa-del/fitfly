import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface HealthData {
  steps: number;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

// Ten hook będzie używał natywnego API kroków gdy aplikacja jest uruchomiona na urządzeniu
// Na razie używa danych demonstracyjnych - pełna integracja wymaga:
// 1. npx cap add ios / npx cap add android
// 2. Instalacja pluginu zdrowia w projekcie natywnym
// 3. Konfiguracja uprawnień w Info.plist (iOS) / AndroidManifest.xml

export function useHealthData() {
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    isAvailable: false,
    isLoading: true,
    error: null,
  });

  const isNativePlatform = Capacitor.isNativePlatform();

  const requestPermissions = useCallback(async () => {
    if (!isNativePlatform) {
      // W przeglądarce - użyj danych demonstracyjnych
      setHealthData(prev => ({
        ...prev,
        isLoading: false,
        isAvailable: false,
      }));
      return false;
    }

    // Na platformie natywnej - tutaj zostanie dodana integracja z HealthKit/Health Connect
    try {
      // Placeholder dla natywnej integracji
      // Po dodaniu pluginu zdrowia, odkomentuj i dostosuj:
      // const { Health } = await import('native-health-plugin');
      // const result = await Health.requestPermissions();
      
      setHealthData(prev => ({
        ...prev,
        isAvailable: true,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error requesting health permissions:', error);
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
      // Placeholder dla natywnej integracji
      // Po dodaniu pluginu zdrowia:
      // const { Health } = await import('native-health-plugin');
      // const today = new Date();
      // today.setHours(0, 0, 0, 0);
      // const result = await Health.getSteps({ from: today.getTime(), to: Date.now() });
      // return result.steps;
      
      return 0;
    } catch (error) {
      console.error('Error fetching steps:', error);
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
