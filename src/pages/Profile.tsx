import { useState } from 'react';
import { User, Target, Bell, Settings, ChevronRight, Footprints, Droplets, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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

  // Placeholder stats
  const weeklyStats = {
    avgSteps: 8500,
    avgWater: 1800,
    workouts: 4,
    challengesCompleted: 2,
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-3 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">{profile.weight} kg • {profile.height} cm</p>
      </header>

      {/* Weekly Stats */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Statystyki tygodnia</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <Footprints className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{weeklyStats.avgSteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Śr. kroków/dzień</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{weeklyStats.avgWater} ml</p>
              <p className="text-xs text-muted-foreground">Śr. wody/dzień</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{weeklyStats.workouts}</p>
              <p className="text-xs text-muted-foreground">Treningów</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Target className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{weeklyStats.challengesCompleted}</p>
              <p className="text-xs text-muted-foreground">Wyzwań</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Moje cele</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Zapisz' : 'Edytuj'}
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Waga docelowa</span>
              {isEditing ? (
                <Input 
                  type="number"
                  value={profile.goalWeight}
                  onChange={(e) => setProfile({...profile, goalWeight: Number(e.target.value)})}
                  className="w-20 h-6 text-right"
                />
              ) : (
                <span className="font-medium">{profile.goalWeight} kg</span>
              )}
            </div>
            <Progress value={((profile.weight - profile.goalWeight) / (80 - profile.goalWeight)) * 100} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dzienny cel kroków</span>
            {isEditing ? (
              <Input 
                type="number"
                value={profile.dailyStepsGoal}
                onChange={(e) => setProfile({...profile, dailyStepsGoal: Number(e.target.value)})}
                className="w-24 h-6 text-right"
              />
            ) : (
              <span className="font-medium">{profile.dailyStepsGoal.toLocaleString()}</span>
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dzienny cel wody</span>
            {isEditing ? (
              <Input 
                type="number"
                value={profile.dailyWaterGoal}
                onChange={(e) => setProfile({...profile, dailyWaterGoal: Number(e.target.value)})}
                className="w-24 h-6 text-right"
              />
            ) : (
              <span className="font-medium">{profile.dailyWaterGoal} ml</span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Powiadomienia</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="water-notif" className="text-sm">Przypomnienia o piciu wody</Label>
            <Switch 
              id="water-notif"
              checked={notifications.water}
              onCheckedChange={(checked) => setNotifications({...notifications, water: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="workout-notif" className="text-sm">Przypomnienia o treningu</Label>
            <Switch 
              id="workout-notif"
              checked={notifications.workout}
              onCheckedChange={(checked) => setNotifications({...notifications, workout: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="challenge-notif" className="text-sm">Nowe wyzwania</Label>
            <Switch 
              id="challenge-notif"
              checked={notifications.challenges}
              onCheckedChange={(checked) => setNotifications({...notifications, challenges: checked})}
            />
          </div>
        </div>
      </div>

      {/* Settings Link */}
      <Button variant="outline" className="w-full justify-between" asChild>
        <div>
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ustawienia aplikacji
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Button>
    </div>
  );
}
