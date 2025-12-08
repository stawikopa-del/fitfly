import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Trophy, Target, Share2, Home, Sparkles, Star } from 'lucide-react';
import { WorkoutProgram } from '@/data/workoutPrograms';
import { triggerBadgeConfetti } from '@/utils/confetti';
import fitekPuchar from '@/assets/fitek/fitek-puchar.png';

interface WorkoutSummaryProps {
  workout: WorkoutProgram;
  stats: {
    totalTime: number;
    exercisesCompleted: number;
    caloriesBurned: number;
    xpEarned: number;
  };
  onFinish: () => void;
}

export function WorkoutSummary({ workout, stats, onFinish }: WorkoutSummaryProps) {
  useEffect(() => {
    // Celebrate!
    triggerBadgeConfetti();
    
    // Second confetti burst
    const timeout = setTimeout(() => {
      triggerBadgeConfetti();
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  const statItems = [
    { icon: Clock, label: 'Czas', value: `${stats.totalTime} min`, color: 'text-blue-500' },
    { icon: Target, label: 'Ćwiczenia', value: `${stats.exercisesCompleted}`, color: 'text-green-500' },
    { icon: Flame, label: 'Kalorie', value: `~${stats.caloriesBurned} kcal`, color: 'text-orange-500' },
    { icon: Trophy, label: 'XP', value: `+${stats.xpEarned}`, color: 'text-primary' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5 flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-4"
        >
          <div className="relative">
            <img 
              src={fitekPuchar} 
              alt="Trophy" 
              className="w-40 h-40 object-contain"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent mb-2"
        >
          Brawo! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Ukończyłeś {workout.name}!
        </motion.p>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full grid grid-cols-2 gap-3 mb-8"
        >
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-4"
            >
              <item.icon className={`w-6 h-6 ${item.color} mb-2 mx-auto`} />
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* XP Earned Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl p-5 border border-primary/30 mb-6"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zdobyłeś</p>
              <p className="text-2xl font-bold text-primary">+{stats.xpEarned} XP</p>
            </div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-sm text-muted-foreground mb-8 max-w-xs"
        >
          Każdy trening to inwestycja w siebie. Jesteś na dobrej drodze! 💪
        </motion.p>
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-8 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFinish}
          className="w-full h-14 rounded-2xl bg-primary flex items-center justify-center gap-2 shadow-lg"
        >
          <Home className="w-5 h-5 text-primary-foreground" />
          <span className="font-bold text-primary-foreground">Wróć do treningów</span>
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-12 rounded-2xl bg-muted flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Udostępnij sukces</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
