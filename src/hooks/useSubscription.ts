import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionTier = 'start' | 'fit' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  shopify_order_id: string | null;
  shopify_customer_id: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export const TIER_FEATURES: Record<SubscriptionTier, {
  name: string;
  price: string;
  features: string[];
}> = {
  start: {
    name: 'START',
    price: 'Za darmo',
    features: [
      'Podstawowe śledzenie aktywności',
      'Licznik wody',
      'Dziennik posiłków',
      'Czat z FITEK',
    ],
  },
  fit: {
    name: 'FIT',
    price: '19,99 zł/mies.',
    features: [
      'Wszystko z pakietu START',
      'Zaawansowane statystyki',
      'Spersonalizowane treningi',
      'Przepisy AI',
      'Priorytetowe wsparcie',
    ],
  },
  premium: {
    name: 'PREMIUM',
    price: '39,99 zł/mies.',
    features: [
      'Wszystko z pakietu FIT',
      'Indywidualny plan treningowy',
      'Konsultacje z trenerem',
      'Ekskluzywne wyzwania',
      'Brak reklam',
    ],
  },
};

export function useSubscription() {
  const { user, isInitialized } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchedRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchedRef.current) {
      return;
    }

    try {
      fetchedRef.current = true;
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Type cast the data since Supabase types might not include our new table yet
      setSubscription(data as UserSubscription | null);
    } catch (err) {
      console.error('Subscription fetch error:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isInitialized) {
      fetchedRef.current = false;
      fetchSubscription();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isInitialized, fetchSubscription]);

  const currentTier: SubscriptionTier = subscription?.tier || 'start';
  
  // Safe date comparison
  const isActive = (() => {
    if (!subscription || subscription.status !== 'active') return false;
    if (!subscription.ends_at) return true;
    try {
      return new Date(subscription.ends_at) > new Date();
    } catch {
      return false;
    }
  })();

  const tierInfo = TIER_FEATURES[currentTier] || TIER_FEATURES.start;

  return {
    subscription,
    loading,
    error,
    currentTier,
    isActive,
    tierInfo,
    refresh: () => {
      fetchedRef.current = false;
      return fetchSubscription();
    },
  };
}