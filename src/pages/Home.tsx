import { Footprints, Flame, Calendar, Utensils, CheckCircle, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { ChatHeroBubble } from '@/components/flyfit/ChatHeroBubble';
import { StatCard } from '@/components/flyfit/StatCard';
import { WaterTracker } from '@/components/flyfit/WaterTracker';
import { QuickAction } from '@/components/flyfit/QuickAction';
import { MeasurementsSummary } from '@/components/flyfit/MeasurementsSummary';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useGamification } from '@/hooks/useGamification';
import { useHabitsAndChallenges } from '@/hooks/useHabitsAndChallenges';
import { useAuth } from '@/hooks/useAuth';
import { LevelProgress } from '@/components/flyfit/LevelProgress';
import { supabase } from '@/integrations/supabase/client';
import fitflyLogoFull from '@/assets/fitfly-logo-full.png';
import fitekReceWGore from '@/assets/fitek/fitek-rece-w-gore.png';
import fitekPiatka from '@/assets/fitek/fitek-piatka.png';
import fitekPuchar from '@/assets/fitek/fitek-puchar.png';
import fitekCel from '@/assets/fitek/fitek-cel.png';

// Personalized greeting based on time of day
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return {
    text: 'Dzień dobry',
    emoji: '🌅'
  };
  if (hour >= 12 && hour < 18) return {
    text: 'Cześć',
    emoji: '☀️'
  };
  if (hour >= 18 && hour < 22) return {
    text: 'Dobry wieczór',
    emoji: '🌙'
  };
  return {
    text: 'Nocny marek?',
    emoji: '🦉'
  };
};

// Motivational messages based on streak
const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Zacznij swoją serię już dziś! 💪';
  if (streak === 1) return 'Świetny start! Kontynuuj jutro!';
  if (streak >= 2 && streak <= 6) return `${streak} dni z rzędu! Tak trzymaj! 🔥`;
  if (streak === 7) return 'Tydzień bez przerwy! Niesamowite! 🏆';
  if (streak >= 8 && streak <= 13) return `${streak} dni! Jesteś nie do zatrzymania!`;
  if (streak >= 14 && streak <= 29) return `${streak} dni serii! Legenda! 🌟`;
  if (streak >= 30) return `${streak} dni! FITEK jest z Ciebie dumny! 👑`;
  return 'Kontynuuj dobrą passę!';
};
export default function Home() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    progress,
    addWater,
    loading: progressLoading
  } = useUserProgress();
  const {
    gamification,
    loading: gamificationLoading
  } = useGamification();
  const {
    challenges,
    habits,
    todayLogs,
    loading: habitsLoading
  } = useHabitsAndChallenges();
  const [displayName, setDisplayName] = useState<string>('');
  const [todayCalories, setTodayCalories] = useState<number>(0);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(2000);
  const [todayPlans, setTodayPlans] = useState<Array<{id: string; name: string; time: string | null; location: string | null; category: string; is_completed: boolean}>>([]);

  // Fetch user profile for personalized greeting and calories
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('display_name, daily_calories').eq('user_id', user.id).maybeSingle();
        if (!error && data) {
          setDisplayName(data.display_name || '');
          setCaloriesGoal(data.daily_calories || 2000);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    // Fetch today's meals for calories
    const fetchTodayMeals = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const {
          data,
          error
        } = await supabase.from('meals').select('calories').eq('user_id', user.id).eq('meal_date', today);
        if (!error && data) {
          const total = data.reduce((sum, meal) => sum + (meal.calories || 0), 0);
          setTodayCalories(total);
        }
      } catch (err) {
        console.error('Error fetching meals:', err);
      }
    };
    // Fetch today's plans
    const fetchTodayPlans = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('day_plans')
          .select('id, name, time, location, category, is_completed')
          .eq('user_id', user.id)
          .eq('plan_date', today)
          .order('time', { ascending: true, nullsFirst: false })
          .limit(4);
        if (!error && data) {
          setTodayPlans(data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };

    fetchProfile();
    fetchTodayMeals();
    fetchTodayPlans();
  }, [user]);

  // Get greeting info
  const greeting = useMemo(() => getTimeGreeting(), []);

  // Find active challenge for "Challenge of the day"
  const activeChallenge = useMemo(() => {
    return challenges.find(c => c.is_active && !c.is_completed);
  }, [challenges]);

  // Calculate completed habits for today
  const completedHabitsToday = useMemo(() => {
    const completedIds = todayLogs.filter(log => log.is_completed).map(log => log.habit_id);
    return habits.filter(h => completedIds.includes(h.id)).length;
  }, [habits, todayLogs]);
  const totalActiveHabits = habits.length;

  // Loading state
  if (progressLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>;
  }
  const loginStreak = gamification?.daily_login_streak || 0;
  const streakMessage = getStreakMessage(loginStreak);
  return <div className="px-4 py-6 space-y-6">
      {/* Brand Banner */}
      

      {/* Header z personalizowanym powitaniem */}
      <header className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-foreground tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {greeting.text}
            </span>
            {displayName && <span className="text-foreground">, {displayName.split(' ')[0]}!</span>}
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Jak się dziś czujesz?</p>
        </div>
        
        <button onClick={() => navigate('/kalendarz')} className="relative text-center bg-card/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Calendar className="w-3 h-3" />
            Kalendarz
          </span>
          
          <p className="text-xs font-bold text-foreground capitalize group-hover:text-primary transition-colors">
            {new Date().toLocaleDateString('pl-PL', {
            weekday: 'long'
          })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
          })} • {new Date().toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '.')}
          </p>
        </button>
      </header>

      {/* Dzisiejsze plany */}
      <section className="relative z-10">
        <div 
          className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all" 
          onClick={() => navigate('/planowanie')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold font-display text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Plany na dziś
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {todayPlans.length > 0 ? (
            <div className="space-y-2">
              {todayPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`flex items-center gap-3 p-2 rounded-xl ${plan.is_completed ? 'bg-muted/50 opacity-60' : 'bg-muted/30'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${plan.is_completed ? 'bg-primary' : 'bg-accent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${plan.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {plan.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {plan.time && <span>{plan.time}</span>}
                      {plan.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-3 h-3" />
                          {plan.location.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Brak planów na dziś — dotknij, aby dodać ✨
            </p>
          )}
        </div>
      </section>

      {/* Level Progress - compact */}
      {!gamificationLoading && gamification && <section className="relative z-10 cursor-pointer" onClick={() => navigate('/osiagniecia')}>
          <LevelProgress level={gamification.current_level} totalXP={gamification.total_xp} compact />
        </section>}

      {/* Chat Hero - zachęta do rozmowy z FITEK */}
      <section className="py-2 relative z-10">
        <ChatHeroBubble />
      </section>

      {/* Statystyki w gridzie - 2x2 */}
      <section className="grid grid-cols-2 gap-4 relative z-10">
        <div className="animate-float" style={{
        animationDelay: '0s'
      }}>
          <StatCard icon={<Footprints className="w-5 h-5" />} label="Kroki" value={(progress?.steps || 0).toLocaleString()} subValue={`/ ${(progress?.stepsGoal || 10000).toLocaleString()}`} color="green" />
        </div>
        <div className="animate-float" style={{
        animationDelay: '0.3s'
      }}>
          <StatCard icon={<Flame className="w-5 h-5" />} label="Aktywność" value={`${progress?.activeMinutes || 0} min`} subValue={`/ ${progress?.activeMinutesGoal || 30} min`} color="orange" />
        </div>
        <div className="animate-float" style={{
        animationDelay: '0.6s'
      }}>
          <StatCard icon={<Utensils className="w-5 h-5" />} label="Kalorie" value={todayCalories.toLocaleString()} subValue={`/ ${caloriesGoal.toLocaleString()} kcal`} color="purple" onClick={() => navigate('/odzywianie')} />
        </div>
        <div className="animate-float" style={{
        animationDelay: '0.9s'
      }}>
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Nawyki" value={`${completedHabitsToday}/${totalActiveHabits}`} subValue={totalActiveHabits > 0 ? 'wykonane dziś' : 'brak nawyków'} color="blue" onClick={() => navigate('/wyzwania')} />
        </div>
      </section>

      {/* Dzisiejsze pomiary */}
      <section className="relative z-10 animate-float" style={{
      animationDelay: '0.95s'
    }}>
        <MeasurementsSummary />
      </section>

      {/* Tracker wody */}
      <section className="relative z-10 animate-float" style={{
      animationDelay: '1s'
    }}>
        <WaterTracker current={progress?.water || 0} goal={progress?.waterGoal || 2000} onAdd={addWater} />
      </section>

      {/* Szybkie akcje */}
      <section className="space-y-4 relative z-10">
        <h2 className="font-bold font-display text-lg text-foreground flex items-center gap-2">
          <span>Co dziś robimy?</span>
          <span className="text-xl">🚀</span>
        </h2>
        
        <div className="space-y-3">
          <div className="animate-float" style={{
          animationDelay: '1.2s'
        }}>
            <QuickAction icon={<img src={fitekReceWGore} alt="FITEK" className="w-8 h-8 object-contain" />} title="Szybki trening" description="10 minut ćwiczeń na start dnia" color="green" onClick={() => navigate('/treningi')} />
          </div>
          
          <div className="animate-float" style={{
          animationDelay: '1.4s'
        }}>
            <QuickAction icon={<img src={activeChallenge ? fitekPuchar : fitekPiatka} alt="FITEK" className="w-8 h-8 object-contain" />} title={activeChallenge ? activeChallenge.title : 'Wyzwanie dnia'} description={activeChallenge ? `${activeChallenge.current}/${activeChallenge.target} ${activeChallenge.unit} - ${Math.round(activeChallenge.current / activeChallenge.target * 100)}% ukończone` : 'Rozpocznij nowe wyzwanie!'} color="orange" onClick={() => navigate('/wyzwania')} />
          </div>

          <div className="animate-float" style={{
          animationDelay: '1.6s'
        }}>
            <QuickAction icon={<img src={fitekCel} alt="FITEK" className="w-8 h-8 object-contain" />} title="Planowanie dnia" description="Zaplanuj zadania i przypomnienia" color="pink" onClick={() => navigate('/planowanie')} />
          </div>
        </div>
      </section>
    </div>;
}