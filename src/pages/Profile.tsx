import { useState } from 'react';
import { User, Target, Bell, Settings, ChevronRight, Footprints, Droplets, Flame, Trophy, Edit3 } from 'lucide-react';
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
    <div className="px-4 py-6 space-y-6">
      {/* Profil użytkownika z maskotką */}
      <header className="text-center relative">
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-fitfly-lg">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <img 
            src={mascotImage} 
            alt="FitFly" 
            className="absolute -bottom-2 -right-2 w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">{profile.weight} kg • {profile.height} cm</p>
        
        {/* Badge punktów */}
        <div className="inline-flex items-center gap-1 mt-2 bg-accent/10 text-accent px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">{totalPoints} punktów</span>
        </div>
      </header>

      {/* Statystyki tygodnia */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Statystyki tygodnia
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Footprints, value: weeklyStats.avgSteps.toLocaleString(), label: 'Śr. kroków/dzień', color: 'text-secondary' },
            { icon: Droplets, value: `${weeklyStats.avgWater} ml`, label: 'Śr. wody/dzień', color: 'text-primary' },
            { icon: Flame, value: weeklyStats.workouts, label: 'Treningów', color: 'text-accent' },
            { icon: Trophy, value: weeklyStats.challengesCompleted, label: 'Wyzwań', color: 'text-purple-500' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl bg-muted flex items-center justify-center', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cele */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Moje cele
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditing ? 'Zapisz' : 'Edytuj'}
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Waga docelowa</span>
              {isEditing ? (
                <Input 
                  type="number"
                  value={profile.goalWeight}
                  onChange={(e) => setProfile({...profile, goalWeight: Number(e.target.value)})}
                  className="w-20 h-7 text-right"
                />
              ) : (
                <span className="font-bold text-foreground">{profile.goalWeight} kg</span>
              )}
            </div>
            <Progress value={80} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Pozostało 5 kg do celu</p>
          </div>
          
          {[
            { label: 'Dzienny cel kroków', value: profile.dailyStepsGoal, key: 'dailyStepsGoal' },
            { label: 'Dzienny cel wody (ml)', value: profile.dailyWaterGoal, key: 'dailyWaterGoal' },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{label}</span>
              {isEditing ? (
                <Input 
                  type="number"
                  value={value}
                  onChange={(e) => setProfile({...profile, [key]: Number(e.target.value)})}
                  className="w-24 h-7 text-right"
                />
              ) : (
                <span className="font-bold text-foreground">{value.toLocaleString()}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          Powiadomienia
        </h2>
        
        <div className="space-y-4">
          {[
            { id: 'water', label: 'Przypomnienia o piciu wody', checked: notifications.water },
            { id: 'workout', label: 'Przypomnienia o treningu', checked: notifications.workout },
            { id: 'challenges', label: 'Nowe wyzwania', checked: notifications.challenges },
          ].map(({ id, label, checked }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-sm text-foreground">{label}</Label>
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
      <Button variant="outline" className="w-full justify-between rounded-xl h-12">
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Ustawienia aplikacji
        </span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
