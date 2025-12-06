import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/flyfit/AppLayout";
import { CookieConsent } from "@/components/flyfit/CookieConsent";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/flyfit/SplashScreen";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Workouts = lazy(() => import("./pages/Workouts"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const More = lazy(() => import("./pages/More"));
const ChatList = lazy(() => import("./pages/ChatList"));
const FitekChat = lazy(() => import("./pages/FitekChat"));
const DirectChat = lazy(() => import("./pages/DirectChat"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));
const Info = lazy(() => import("./pages/Info"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const Privacy = lazy(() => import("./pages/Privacy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Goals = lazy(() => import("./pages/Goals"));
const Friends = lazy(() => import("./pages/Friends"));
const FriendProfile = lazy(() => import("./pages/FriendProfile"));
const SharedRecipe = lazy(() => import("./pages/SharedRecipe"));
const Invite = lazy(() => import("./pages/Invite"));
const DietConfig = lazy(() => import("./pages/DietConfig"));
const Recipes = lazy(() => import("./pages/Recipes"));
const QuickMeal = lazy(() => import("./pages/QuickMeal"));
const QuickMealMethod = lazy(() => import("./pages/QuickMealMethod"));
const ShoppingList = lazy(() => import("./pages/ShoppingList"));
const SharedShoppingList = lazy(() => import("./pages/SharedShoppingList"));
const DietShoppingList = lazy(() => import("./pages/DietShoppingList"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FavoriteRecipes = lazy(() => import("./pages/FavoriteRecipes"));

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
        path="/cookies"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CookiesPolicy />
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
              <AppRoutes />
              <CookieConsent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
