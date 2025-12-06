import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        // Synchronous state updates only
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        setIsInitialized(true);
      }
    );

    // THEN check for existing session with retry
    const initSession = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error && retryCount < maxRetries) {
          // Retry after delay
          setTimeout(() => initSession(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
      } catch (error) {
        console.error('Session init error:', error);
        
        // Retry on network errors
        if (retryCount < maxRetries) {
          setTimeout(() => initSession(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
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
    // Safe origin access
    let redirectUrl = '/';
    try {
      if (typeof window !== 'undefined' && window.location?.origin) {
        redirectUrl = `${window.location.origin}/`;
      }
    } catch {
      redirectUrl = '/';
    }
    
    try {
      const { error } = await supabase.auth.signUp({
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
      });
      return { error };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error: error instanceof Error ? error : new Error('Błąd rejestracji') };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error: error instanceof Error ? error : new Error('Błąd logowania') };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear state
      setUser(null);
      setSession(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Safe origin access
    let redirectUrl = '/reset-password';
    try {
      if (typeof window !== 'undefined' && window.location?.origin) {
        redirectUrl = `${window.location.origin}/reset-password`;
      }
    } catch {
      redirectUrl = '/reset-password';
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error instanceof Error ? error : new Error('Błąd resetowania hasła') };
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
