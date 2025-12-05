import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSharing() {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const operationInProgress = useRef(false);

  const generateShareToken = useCallback(() => {
    try {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback for environments without crypto
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
  }, []);

  const shareRecipeWithFriend = useCallback(async (recipeId: string, friendId: string) => {
    if (!user || operationInProgress.current) return false;

    operationInProgress.current = true;
    setIsSharing(true);
    try {
      const { error } = await supabase
        .from('shared_recipes')
        .insert({
          recipe_id: recipeId,
          owner_id: user.id,
          shared_with_id: friendId,
          is_public: false
        });

      if (error) throw error;

      toast.success('Przepis udostępniony znajomemu!');
      return true;
    } catch (error) {
      console.error('Error sharing recipe:', error);
      toast.error('Nie udało się udostępnić przepisu');
      return false;
    } finally {
      operationInProgress.current = false;
      setIsSharing(false);
    }
  }, [user]);

  const createPublicRecipeLink = useCallback(async (recipeId: string) => {
    if (!user || operationInProgress.current) return null;

    operationInProgress.current = true;
    setIsSharing(true);
    try {
      const token = generateShareToken();
      
      const { error } = await supabase
        .from('shared_recipes')
        .insert({
          recipe_id: recipeId,
          owner_id: user.id,
          share_token: token,
          is_public: true
        });

      if (error) throw error;

      const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/shared/recipe/${token}`
        : `/shared/recipe/${token}`;
      
      // Copy to clipboard safely
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link skopiowany do schowka!');
        }
      } catch {
        toast.success('Link utworzony!');
      }
      
      return shareUrl;
    } catch (error) {
      console.error('Error creating public link:', error);
      toast.error('Nie udało się utworzyć linku');
      return null;
    } finally {
      operationInProgress.current = false;
      setIsSharing(false);
    }
  }, [user, generateShareToken]);

  const getSharedRecipe = useCallback(async (token: string) => {
    if (!token) return null;
    
    try {
      const { data, error } = await supabase
        .from('shared_recipes')
        .select('*, favorite_recipes(*)')
        .eq('share_token', token)
        .eq('is_public', true)
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching shared recipe:', error);
      return null;
    }
  }, []);

  const shareChallengeWithFriend = useCallback(async (challengeId: string, friendId: string) => {
    if (!user || operationInProgress.current) return false;

    operationInProgress.current = true;
    setIsSharing(true);
    try {
      const { error } = await supabase
        .from('shared_challenges')
        .insert({
          challenge_id: challengeId,
          owner_id: user.id,
          shared_with_id: friendId
        });

      if (error) throw error;

      toast.success('Wyzwanie udostępnione znajomemu!');
      return true;
    } catch (error) {
      console.error('Error sharing challenge:', error);
      toast.error('Nie udało się udostępnić wyzwania');
      return false;
    } finally {
      operationInProgress.current = false;
      setIsSharing(false);
    }
  }, [user]);

  const getRecipesSharedWithMe = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('shared_recipes')
        .select('*, favorite_recipes(*)')
        .eq('shared_with_id', user.id);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching shared recipes:', error);
      return [];
    }
  }, [user]);

  const getChallengesSharedWithMe = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('shared_challenges')
        .select('*, challenges(*)')
        .eq('shared_with_id', user.id);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching shared challenges:', error);
      return [];
    }
  }, [user]);

  return {
    isSharing,
    shareRecipeWithFriend,
    createPublicRecipeLink,
    getSharedRecipe,
    shareChallengeWithFriend,
    getRecipesSharedWithMe,
    getChallengesSharedWithMe
  };
}
