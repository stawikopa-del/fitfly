import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  displayName?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  goalWeight?: number;
  goal?: string;
  dailyCalories?: number;
  dailyWater?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isInitialized: boolean;
  signUp: (email: string, password: string, profileData?: ProfileData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Retry helper for network errors
const withRetry = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refresh session manually
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        // If refresh fails, sign out
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('invalid_grant')) {
          await supabase.auth.signOut();
        }
      } else if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setIsInitialized(true);

        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed');
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    // THEN check for existing session with retry
    const initSession = async () => {
      try {
        const { data: { session }, error } = await withRetry(
          () => supabase.auth.getSession(),
          3,
          500
        );
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session init error:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, profileData?: ProfileData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { error } = await withRetry(() => 
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: profileData?.displayName,
              gender: profileData?.gender,
              age: profileData?.age,
              height: profileData?.height,
              weight: profileData?.weight,
              goal_weight: profileData?.goalWeight,
              goal: profileData?.goal,
              daily_calories: profileData?.dailyCalories,
              daily_water: profileData?.dailyWater,
            },
          },
        })
      );
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await withRetry(() =>
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear state even if signOut fails
      setUser(null);
      setSession(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    try {
      const { error } = await withRetry(() =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        })
      );
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isInitialized,
      signUp, 
      signIn, 
      signOut, 
      resetPassword,
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
