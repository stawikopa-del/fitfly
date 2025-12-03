import { useState } from 'react';
import { User, Target, Bell, Settings, ChevronRight, Footprints, Droplets, Flame, Trophy, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/fitfly-mascot.png';
import { UserProfile } from '@/types/flyfit';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jan Kowalski',
    age: 25,
    weight: 75,
    height: 180,
    goalWeight: 70,
    dailyWaterGoal: 2000,
    dailyStepsGoal: 10000,
    dailyCaloriesGoal: 2000,
  });

  const [notifications, setNotifications] = useState({
    water: true,
    workout: true,
    challenges: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const weeklyStats = {
    avgSteps: 8500,
    avgWater: 1800,
    workouts: 4,
    challengesCompleted: 2,
  };

  const totalPoints = 250;

  return (
    <div className="px-4 py-6 space-y-6 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 left-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-32 right-0 w-48 h-48 bg-fitfly-purple/10 rounded-full blur-3xl translate-x-1/2" />

      {/* Profil użytkownika z maskotką */}
      <header className="text-center relative z-10">
        <div className="relative inline-block mb-4 animate-float">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-fitfly-blue-light flex items-center justify-center shadow-playful-lg">
            <User className="w-14 h-14 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-2 -right-2 animate-bounce-soft">
            <img 
              src={mascotImage} 
              alt="FitFly" 
              className="w-14 h-14 object-contain drop-shadow-md"
            />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fitfly-yellow animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold font-display text-foreground">{profile.name}</h1>
        <p className="text-sm text-muted-foreground font-medium">{profile.weight} kg • {profile.height} cm</p>
        
        {/* Badge punktów */}
        <div className="inline-flex items-center gap-2 mt-3 bg-accent text-accent-foreground px-4 py-2 rounded-2xl shadow-playful-orange animate-float" style={{ animationDelay: '0.2s' }}>
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-bold">{totalPoints} punktów</span>
          <span>🏆</span>
        </div>
      </header>

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
          ].map(({ icon: Icon, value, label, color, shadow }, index) => (
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
            onClick={() => setIsEditing(!isEditing)}
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
                  value={profile.goalWeight}
                  onChange={(e) => setProfile({...profile, goalWeight: Number(e.target.value)})}
                  className="w-20 h-8 text-right rounded-xl"
                />
              ) : (
                <span className="font-bold text-foreground">{profile.goalWeight} kg</span>
              )}
            </div>
            <Progress value={80} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 font-medium">Pozostało 5 kg do celu 💪</p>
          </div>
          
          {[
            { label: 'Dzienny cel kroków', value: profile.dailyStepsGoal, key: 'dailyStepsGoal', emoji: '👟' },
            { label: 'Dzienny cel wody (ml)', value: profile.dailyWaterGoal, key: 'dailyWaterGoal', emoji: '💧' },
          ].map(({ label, value, key, emoji }) => (
            <div key={key} className="flex justify-between items-center bg-muted/50 rounded-2xl p-4">
              <span className="text-sm text-muted-foreground font-medium">{label} {emoji}</span>
              {isEditing ? (
                <Input 
                  type="number"
                  value={value}
                  onChange={(e) => setProfile({...profile, [key]: Number(e.target.value)})}
                  className="w-24 h-8 text-right rounded-xl"
                />
              ) : (
                <span className="font-bold text-foreground">{value.toLocaleString()}</span>
              )}
            </div>
          ))}
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
        className="w-full justify-between rounded-3xl h-14 border-2 font-bold relative z-10 animate-float hover:-translate-y-1 transition-all"
        style={{ animationDelay: '0.6s' }}
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          Ustawienia aplikacji ⚙️
        </span>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
