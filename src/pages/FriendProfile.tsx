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
  Calendar,
  Quote
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';

const bioPlaceholdersFemale = [
  'Zgrywa niedostępną 🙄',
  'Za zajęta na opis 💅',
  'Opis? Nie znam tej pani 🤷‍♀️',
  'Tajemnicza jak pogoda w Polsce 🌦️',
  'Zbyt fit na pisanie 🏃‍♀️',
  'Tu miał być opis, ale poszła na trening 💪',
  'Opis? Może jutro... 😴',
  'Królowa bez bio 👑',
  'Biegam szybciej niż piszę opisy 🏃‍♀️💨',
  'Fitness > pisanie bio 🔥',
  'Zajęta piciem wody 💧',
  'Bio schudło razem ze mną 😂',
  'Na diecie od pisania 📝❌',
  'Sorry, mam trenować 🏋️‍♀️',
  'Opis na cheat day 🍕',
  'Zbyt zmęczona po treningu 😮‍💨',
];

const bioPlaceholdersMale = [
  'Zgrywa niedostępnego 🙄',
  'Za zajęty na opis 😎',
  'Opis? Nie znam tego pana 🤷‍♂️',
  'Tajemniczy jak WiFi w pociągu 📶',
  'Zbyt fit na pisanie 🏋️',
  'Tu miał być opis, ale poszedł na siłkę 💪',
  'Opis? Może po serii 🏋️',
  'Król bez bio 👑',
  'Podnoszę ciężary, nie piszę opisy 🏋️‍♂️',
  'Fitness > pisanie bio 🔥',
  'Zajęty piciem shakea 🥤',
  'Bio zjadłem na masie 🍗',
  'Opis jest na następnym splicie 📅',
  'Sorry, mam leg day 🦵',
  'Bio? To jest cardio? 🤔',
  'Zbyt zmęczony po pompkach 😮‍💨',
];

const bioPlaceholdersNeutral = [
  'Jeszcze nic tu nie ma... 🤷',
  'Opis w budowie 🚧',
  'Coming soon... ⏳',
  'Bio loading... 🔄',
  'Ktoś tu zapomniał o opisie 🙈',
  '404: Bio not found 🔍',
  'Tu byłby opis, ale... 💤',
  'Opis na wakacjach 🏖️',
  'Bio poszło na trening 🏃',
  'Placeholder tekst 📝',
  'Insert bio here ➡️',
  'Work in progress 🔨',
];

const getRandomBioPlaceholder = (gender: string | null) => {
  const placeholders = gender === 'female' 
    ? bioPlaceholdersFemale 
    : gender === 'male' 
      ? bioPlaceholdersMale 
      : bioPlaceholdersNeutral;
  return placeholders[Math.floor(Math.random() * placeholders.length)];
};

interface FriendData {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
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
        // Use secure RPC function to get friend profile (only non-sensitive data)
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_friend_profile', { friend_user_id: friendId });

        if (profileError || !profileData || profileData.length === 0) {
          console.error('Profile error:', profileError);
          setIsLoading(false);
          return;
        }

        const profile = profileData[0];
        setFriend({
          userId: profile.user_id,
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          gender: profile.gender
        });

        // Use secure RPC function to get friend activity stats
        const { data: activityData } = await supabase
          .rpc('get_friend_activity_stats', { friend_user_id: friendId });

        if (activityData && activityData.length > 0) {
          const stats = activityData[0];
          setWeeklyStats({
            totalSteps: Number(stats.total_steps) || 0,
            totalWater: Number(stats.total_water) || 0,
            totalActiveMinutes: Number(stats.total_active_minutes) || 0,
            activeDays: Number(stats.days_tracked) || 0
          });
        }

        // Fetch today's progress using daily_progress table (still allowed via RLS for friends)
        const today = new Date().toISOString().split('T')[0];
        const { data: todayData } = await supabase
          .from('daily_progress')
          .select('steps, water, active_minutes, progress_date')
          .eq('user_id', friendId)
          .eq('progress_date', today)
          .maybeSingle();

        if (todayData) {
          setTodayProgress({
            steps: todayData.steps,
            water: todayData.water,
            activeMinutes: todayData.active_minutes,
            date: todayData.progress_date
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

              {/* Bio */}
              <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-border/30 max-w-xs mx-auto">
                <p className="text-sm text-foreground">
                  {friend.bio || (
                    <span className="text-muted-foreground italic">
                      {getRandomBioPlaceholder(friend.gender)}
                    </span>
                  )}
                </p>
              </div>
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
