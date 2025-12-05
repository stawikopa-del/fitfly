import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/flyfit/AppLayout';
import { PageHeader } from '@/components/flyfit/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Footprints, 
  Droplets, 
  Clock, 
  Utensils,
  ShoppingCart,
  Loader2,
  TrendingUp,
  Trophy,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';

interface FriendData {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface FriendProgress {
  steps: number;
  water: number;
  activeMinutes: number;
  date: string;
}

interface WeeklyStats {
  totalSteps: number;
  totalWater: number;
  totalActiveMinutes: number;
  activeDays: number;
}

export default function FriendProfile() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [friend, setFriend] = useState<FriendData | null>(null);
  const [todayProgress, setTodayProgress] = useState<FriendProgress | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!friendId || !user) return;

      try {
        // Fetch friend profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url')
          .eq('user_id', friendId)
          .single();

        if (profileError) throw profileError;

        setFriend({
          userId: profile.user_id,
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url
        });

        // Fetch today's progress
        const today = new Date().toISOString().split('T')[0];
        const { data: todayData } = await supabase
          .from('daily_progress')
          .select('steps, water, active_minutes, progress_date')
          .eq('user_id', friendId)
          .eq('progress_date', today)
          .single();

        if (todayData) {
          setTodayProgress({
            steps: todayData.steps,
            water: todayData.water,
            activeMinutes: todayData.active_minutes,
            date: todayData.progress_date
          });
        }

        // Fetch weekly stats (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const { data: weekData } = await supabase
          .from('daily_progress')
          .select('steps, water, active_minutes')
          .eq('user_id', friendId)
          .gte('progress_date', weekAgoStr)
          .lte('progress_date', today);

        if (weekData && weekData.length > 0) {
          setWeeklyStats({
            totalSteps: weekData.reduce((sum, d) => sum + d.steps, 0),
            totalWater: weekData.reduce((sum, d) => sum + d.water, 0),
            totalActiveMinutes: weekData.reduce((sum, d) => sum + d.active_minutes, 0),
            activeDays: weekData.length
          });
        }

      } catch (error) {
        console.error('Error fetching friend data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId, user]);

  const handleMessage = () => {
    soundFeedback.buttonClick();
    navigate(`/czat/${friendId}`);
  };

  const handleSendRecipe = () => {
    soundFeedback.buttonClick();
    // Navigate to nutrition with share mode enabled
    navigate(`/odzywianie?share=${friendId}`);
  };

  const handleSendShoppingList = () => {
    soundFeedback.buttonClick();
    // TODO: Implement shopping list feature
    navigate(`/lista-zakupow?share=${friendId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!friend) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-24 px-4 pt-4">
          <PageHeader title="Nie znaleziono" backTo="/znajomi" />
          <Card className="bg-card/80 mt-8">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nie udało się znaleźć profilu znajomego
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen pb-24 px-4 pt-4">
        <PageHeader title="Profil znajomego" backTo="/znajomi" />

        {/* Profile Header */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-primary/30 shadow-lg">
                <AvatarImage src={friend.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                  {(friend.displayName || friend.username || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="mt-4 text-2xl font-bold text-foreground">
                {friend.displayName || friend.username || 'Użytkownik'}
              </h2>
              
              {friend.username && (
                <p className="text-muted-foreground">@{friend.username}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Button
            onClick={handleMessage}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-primary hover:bg-primary/90"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Napisz</span>
          </Button>
          
          <Button
            onClick={handleSendRecipe}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Utensils className="h-6 w-6" />
            <span className="text-xs">Wyślij przepis</span>
          </Button>
          
          <Button
            onClick={handleSendShoppingList}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">Lista zakupów</span>
          </Button>
        </div>

        {/* Today's Progress */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Dzisiejsze postępy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayProgress ? (
              <div className="grid grid-cols-3 gap-4">
                <StatBox 
                  icon={<Footprints className="h-5 w-5" />}
                  value={todayProgress.steps.toLocaleString()}
                  label="kroków"
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
                <StatBox 
                  icon={<Droplets className="h-5 w-5" />}
                  value={`${todayProgress.water}`}
                  label="ml wody"
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                />
                <StatBox 
                  icon={<Clock className="h-5 w-5" />}
                  value={`${todayProgress.activeMinutes}`}
                  label="minut"
                  color="text-orange-500"
                  bgColor="bg-orange-500/10"
                />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Brak danych na dziś
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statystyki tygodnia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyStats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Łącznie kroków</span>
                  </div>
                  <span className="font-semibold">{weeklyStats.totalSteps.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Łącznie wody</span>
                  </div>
                  <span className="font-semibold">{(weeklyStats.totalWater / 1000).toFixed(1)} L</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Aktywne minuty</span>
                  </div>
                  <span className="font-semibold">{weeklyStats.totalActiveMinutes} min</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Aktywne dni</span>
                  </div>
                  <span className="font-semibold">{weeklyStats.activeDays}/7</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Brak danych z tego tygodnia
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatBox({ 
  icon, 
  value, 
  label, 
  color, 
  bgColor 
}: { 
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={cn("rounded-xl p-3 text-center", bgColor)}>
      <div className={cn("flex justify-center mb-1", color)}>
        {icon}
      </div>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
