import { useState, useEffect } from 'react';
import { Target, Bell, Settings, ChevronRight, Footprints, Droplets, Flame, Trophy, Edit3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from '@/components/flyfit/ProfileAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  display_name: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal_weight: number | null;
  goal: string | null;
  daily_calories: number | null;
  daily_water: number | null;
  daily_steps_goal: number | null;
  avatar_url: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});

  const [notifications, setNotifications] = useState({
    water: true,
    workout: true,
    challenges: false,
  });

  // Fetch profile from database
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        setEditedProfile(data);
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        goal_weight: editedProfile.goal_weight,
        daily_steps_goal: editedProfile.daily_steps_goal,
        daily_water: editedProfile.daily_water,
      })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Nie udało się zapisać zmian');
    } else {
      setProfile({ ...profile, ...editedProfile } as ProfileData);
      setIsEditing(false);
      toast.success('Zmiany zapisane! 🎉');
    }
  };

  const weeklyStats = {
    avgSteps: 8500,
    avgWater: 1800,
    workouts: 4,
    challengesCompleted: 2,
  };

  const totalPoints = 250;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Wylogowano pomyślnie');
    navigate('/auth');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Użytkownik';
  const weight = profile?.weight || 70;
  const height = profile?.height || 170;
  const goalWeight = editedProfile?.goal_weight ?? profile?.goal_weight ?? 65;
  const dailyStepsGoal = editedProfile?.daily_steps_goal ?? profile?.daily_steps_goal ?? 10000;
  const dailyWaterGoal = editedProfile?.daily_water ?? profile?.daily_water ?? 2000;
  const dailyCalories = profile?.daily_calories ?? 2000;
  const goal = profile?.goal;
  
  const weightDiff = Math.abs(weight - goalWeight);
  const weightProgress = goal === 'lose' 
    ? Math.max(0, 100 - (weightDiff / (weight * 0.2)) * 100)
    : goal === 'gain'
      ? Math.max(0, 100 - (weightDiff / (goalWeight * 0.2)) * 100)
      : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 left-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-32 right-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl translate-x-1/2" />

      {/* Profil użytkownika */}
      <header className="text-center relative z-10">
        <div className="mb-4">
          <ProfileAvatar
            userId={user?.id || ''}
            avatarUrl={profile?.avatar_url || null}
            displayName={displayName}
            onAvatarChange={(url) => setProfile(prev => prev ? { ...prev, avatar_url: url } : prev)}
          />
        </div>
        <h1 className="text-2xl font-extrabold font-display text-foreground">{displayName}</h1>
        <p className="text-sm text-muted-foreground font-medium">{weight} kg • {height} cm</p>
        
        {/* Badge z celem */}
        {goal && (
          <div className="inline-flex items-center gap-2 mt-2 bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-bold">
            {goal === 'lose' ? '🔥 Redukcja' : goal === 'gain' ? '💪 Masa' : '⚖️ Utrzymanie'}
          </div>
        )}
        
      </header>

      {/* Dzienne cele */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-secondary/10 rounded-2xl p-4 text-center border-2 border-secondary/20">
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-2xl font-extrabold font-display text-secondary">{dailyCalories}</p>
          <p className="text-xs text-muted-foreground font-medium">kcal/dzień</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-4 text-center border-2 border-primary/20">
          <div className="text-2xl mb-1">💧</div>
          <p className="text-2xl font-extrabold font-display text-primary">{dailyWaterGoal}</p>
          <p className="text-xs text-muted-foreground font-medium">ml wody/dzień</p>
        </div>
      </div>

      {/* Statystyki tygodnia */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10 animate-float" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-bold font-display text-foreground mb-4 flex items-center gap-2 text-lg">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          Statystyki tygodnia 📊
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Footprints, value: weeklyStats.avgSteps.toLocaleString(), label: 'Śr. kroków/dzień', color: 'bg-secondary text-secondary-foreground', shadow: 'shadow-playful-green' },
            { icon: Droplets, value: `${weeklyStats.avgWater} ml`, label: 'Śr. wody/dzień', color: 'bg-primary text-primary-foreground', shadow: 'shadow-playful' },
            { icon: Flame, value: weeklyStats.workouts, label: 'Treningów', color: 'bg-accent text-accent-foreground', shadow: 'shadow-playful-orange' },
            { icon: Trophy, value: weeklyStats.challengesCompleted, label: 'Wyzwań', color: 'bg-fitfly-purple text-white', shadow: 'shadow-md' },
          ].map(({ icon: Icon, value, label, color, shadow }) => (
            <div 
              key={label} 
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', color, shadow)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold font-display text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cele */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10 animate-float" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold font-display text-foreground flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-secondary" />
            </div>
            Moje cele 🎯
          </h2>
          <Button 
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className="rounded-2xl font-bold"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditing ? 'Zapisz' : 'Edytuj'}
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Waga docelowa</span>
              {isEditing ? (
                <Input 
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setEditedProfile({...editedProfile, goal_weight: Number(e.target.value)})}
                  className="w-20 h-8 text-right rounded-xl"
                />
              ) : (
                <span className="font-bold text-foreground">{goalWeight} kg</span>
              )}
            </div>
            <Progress value={weightProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {weightDiff > 0 
                ? `Pozostało ${weightDiff} kg do celu 💪` 
                : 'Cel osiągnięty! 🎉'}
            </p>
          </div>
          
          <div className="flex justify-between items-center bg-muted/50 rounded-2xl p-4">
            <span className="text-sm text-muted-foreground font-medium">Dzienny cel kroków 👟</span>
            {isEditing ? (
              <Input 
                type="number"
                value={dailyStepsGoal}
                onChange={(e) => setEditedProfile({...editedProfile, daily_steps_goal: Number(e.target.value)})}
                className="w-24 h-8 text-right rounded-xl"
              />
            ) : (
              <span className="font-bold text-foreground">{dailyStepsGoal.toLocaleString()}</span>
            )}
          </div>
          
          <div className="flex justify-between items-center bg-muted/50 rounded-2xl p-4">
            <span className="text-sm text-muted-foreground font-medium">Dzienny cel wody (ml) 💧</span>
            {isEditing ? (
              <Input 
                type="number"
                value={dailyWaterGoal}
                onChange={(e) => setEditedProfile({...editedProfile, daily_water: Number(e.target.value)})}
                className="w-24 h-8 text-right rounded-xl"
              />
            ) : (
              <span className="font-bold text-foreground">{dailyWaterGoal.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="bg-card rounded-3xl p-5 border-2 border-border/50 shadow-card-playful relative z-10 animate-float" style={{ animationDelay: '0.5s' }}>
        <h2 className="font-bold font-display text-foreground mb-4 flex items-center gap-2 text-lg">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          Powiadomienia 🔔
        </h2>
        
        <div className="space-y-4">
          {[
            { id: 'water', label: 'Przypomnienia o piciu wody', checked: notifications.water, emoji: '💧' },
            { id: 'workout', label: 'Przypomnienia o treningu', checked: notifications.workout, emoji: '🏃' },
            { id: 'challenges', label: 'Nowe wyzwania', checked: notifications.challenges, emoji: '🏆' },
          ].map(({ id, label, checked, emoji }) => (
            <div key={id} className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
              <Label htmlFor={id} className="text-sm text-foreground font-medium flex items-center gap-2">
                {label} {emoji}
              </Label>
              <Switch 
                id={id}
                checked={checked}
                onCheckedChange={(c) => setNotifications({...notifications, [id]: c})}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Link do ustawień */}
      <Button 
        variant="outline" 
        className="w-full justify-between rounded-3xl h-14 border-2 font-bold relative z-10 hover:-translate-y-1 transition-all"
        onClick={() => navigate('/ustawienia')}
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          Ustawienia aplikacji ⚙️
        </span>
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Wyloguj */}
      <Button 
        variant="outline" 
        onClick={handleSignOut}
        className="w-full justify-between rounded-3xl h-14 border-2 border-destructive/30 text-destructive font-bold relative z-10 hover:-translate-y-1 transition-all hover:bg-destructive/10"
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          Wyloguj się
        </span>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
