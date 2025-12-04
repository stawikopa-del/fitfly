import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/flyfit/AppLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/flyfit/SplashScreen";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Challenges from "./pages/Challenges";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import More from "./pages/More";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import Help from "./pages/Help";
import About from "./pages/About";
import Info from "./pages/Info";
import CalendarPage from "./pages/Calendar";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender, age, height, weight, goal')
          .eq('user_id', user.id)
          .single();

        // Profile is complete if all required fields are filled
        const isComplete = profile && 
          profile.gender && 
          profile.age && 
          profile.height && 
          profile.weight && 
          profile.goal;
        
        setProfileComplete(!!isComplete);
      } catch {
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
            <Chat />
          </AppLayout>
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
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Check if this is the first visit in this session
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
