import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/flyfit/AppLayout";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/flyfit/SplashScreen";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutProvider } from "@/contexts/WorkoutContext";

// Retry wrapper for lazy loading - handles transient module loading failures
const lazyWithRetry = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> => {
  return lazy(() => {
    const tryImport = async (attempt: number): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          return tryImport(attempt + 1);
        }
        throw error;
      }
    };
    return tryImport(0);
  });
};

// Lazy load pages with retry mechanism for better reliability
const Home = lazyWithRetry(() => import("./pages/Home"));
const Workouts = lazyWithRetry(() => import("./pages/Workouts"));
const Nutrition = lazyWithRetry(() => import("./pages/Nutrition"));
const Challenges = lazyWithRetry(() => import("./pages/Challenges"));
const Progress = lazyWithRetry(() => import("./pages/Progress"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const More = lazyWithRetry(() => import("./pages/More"));
const ChatList = lazyWithRetry(() => import("./pages/ChatList"));
const FitekChat = lazyWithRetry(() => import("./pages/FitekChat"));
const DirectChat = lazyWithRetry(() => import("./pages/DirectChat"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const ProfileSetup = lazyWithRetry(() => import("./pages/ProfileSetup"));
const Help = lazyWithRetry(() => import("./pages/Help"));
const About = lazyWithRetry(() => import("./pages/About"));
const Info = lazyWithRetry(() => import("./pages/Info"));
const CalendarPage = lazyWithRetry(() => import("./pages/Calendar"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy"));
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));

const Achievements = lazyWithRetry(() => import("./pages/Achievements"));
const Goals = lazyWithRetry(() => import("./pages/Goals"));
const Friends = lazyWithRetry(() => import("./pages/Friends"));
const FriendProfile = lazyWithRetry(() => import("./pages/FriendProfile"));
const SharedRecipe = lazyWithRetry(() => import("./pages/SharedRecipe"));
const Invite = lazyWithRetry(() => import("./pages/Invite"));
const DietConfig = lazyWithRetry(() => import("./pages/DietConfig"));
const Recipes = lazyWithRetry(() => import("./pages/Recipes"));
const RecipesDatabase = lazyWithRetry(() => import("./pages/RecipesDatabase"));
const QuickMeal = lazyWithRetry(() => import("./pages/QuickMeal"));
const QuickMealMethod = lazyWithRetry(() => import("./pages/QuickMealMethod"));
const ShoppingList = lazyWithRetry(() => import("./pages/ShoppingList"));
const SharedShoppingList = lazyWithRetry(() => import("./pages/SharedShoppingList"));
const DietShoppingList = lazyWithRetry(() => import("./pages/DietShoppingList"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const FavoriteRecipes = lazyWithRetry(() => import("./pages/FavoriteRecipes"));
const DayPlanner = lazyWithRetry(() => import("./pages/DayPlanner"));
const ProductsDatabase = lazyWithRetry(() => import("./pages/ProductsDatabase"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isInitialized } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    let mounted = true;

    const checkProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender, age, height, weight, goal')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!mounted) return;

        const isComplete = profile && 
          profile.gender && 
          profile.age && 
          profile.height && 
          profile.weight && 
          profile.goal;
        
        setProfileComplete(!!isComplete);
      } catch {
        if (mounted) setProfileComplete(false);
      } finally {
        if (mounted) setCheckingProfile(false);
      }
    };

    checkProfile();

    return () => { mounted = false; };
  }, [user, isInitialized]);

  if (!isInitialized || loading || checkingProfile) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileComplete === false) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/treningi"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Workouts />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/odzywianie"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Nutrition />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wyzwania"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Challenges />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/postepy"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Progress />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ustawienia"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/czat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/czat/fitek"
        element={
          <ProtectedRoute>
            <FitekChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/czat/:odgerId"
        element={
          <ProtectedRoute>
            <DirectChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inne"
        element={
          <ProtectedRoute>
            <AppLayout>
              <More />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pomoc"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Help />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/o-nas"
        element={
          <ProtectedRoute>
            <AppLayout>
              <About />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/informacje"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Info />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prywatnosc"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Privacy />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kalendarz"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/osiagniecia"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Achievements />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cele"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Goals />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/znajomi"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Friends />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/znajomi/:friendId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FriendProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/shared/recipe/:token" element={<SharedRecipe />} />
      <Route path="/invite/:userId" element={<Invite />} />
      <Route
        path="/konfiguracja-diety"
        element={
          <ProtectedRoute>
            <DietConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path="/przepisy"
        element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/baza-przepisow"
        element={
          <ProtectedRoute>
            <RecipesDatabase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/szybki-posilek"
        element={
          <ProtectedRoute>
            <QuickMeal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/szybki-posilek/:method"
        element={
          <ProtectedRoute>
            <QuickMealMethod />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lista-zakupow"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ShoppingList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lista-zakupow/:listId"
        element={
          <ProtectedRoute>
            <SharedShoppingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lista-zakupow/fav/:favId"
        element={
          <ProtectedRoute>
            <SharedShoppingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lista-zakupow/dieta"
        element={
          <ProtectedRoute>
            <DietShoppingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ulubione-przepisy"
        element={
          <ProtectedRoute>
            <FavoriteRecipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/regulamin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TermsOfService />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/polityka-prywatnosci"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PrivacyPolicy />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planowanie"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DayPlanner />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/baza-produktow"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductsDatabase />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Initialize theme on app load
  useTheme();

  // Check if this is the first visit in this session
  useEffect(() => {
    try {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      if (hasSeenSplash) {
        setShowSplash(false);
      }
    } catch {
      // sessionStorage might not be available
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('hasSeenSplash', 'true');
    } catch {
      // Ignore storage errors
    }
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <BrowserRouter>
            <AuthProvider>
              <WorkoutProvider>
                <AppRoutes />
              </WorkoutProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
