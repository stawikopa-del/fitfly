import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Battery, BatteryLow, BatteryMedium, Clock, Flame, Target, Zap, ChevronRight } from 'lucide-react';
import { WorkoutProgram, difficultyConfig } from '@/data/workoutPrograms';
import { cn } from '@/lib/utils';
import fitekPoranek from '@/assets/fitek/fitek-poranek.png';

interface PreWorkoutCheckProps {
  workout: WorkoutProgram;
  onStart: (energy: 'low' | 'medium' | 'high') => void;
  onBack: () => void;
}

type EnergyLevel = 'low' | 'medium' | 'high';

const energyLevels: { level: EnergyLevel; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { 
    level: 'low', 
    label: 'Niska energia', 
    description: 'Jestem zmęczony, ale chcę się poruszyć',
    icon: BatteryLow,
    color: 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
  },
  { 
    level: 'medium', 
    label: 'Średnia energia', 
    description: 'Czuję się dobrze, gotowy na trening',
    icon: BatteryMedium,
    color: 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
  },
  { 
    level: 'high', 
    label: 'Pełna energia', 
    description: 'Mam mnóstwo siły, daj mi wyzwanie!',
    icon: Battery,
    color: 'border-primary bg-primary/10 text-primary'
  }
];

export function PreWorkoutCheck({ workout, onStart, onBack }: PreWorkoutCheckProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');

  const getAdjustedDuration = (energy: EnergyLevel): string => {
    if (energy === 'low') return `${Math.floor(workout.duration * 0.8)}-${workout.duration}`;
    if (energy === 'high') return `${workout.duration}-${Math.ceil(workout.duration * 1.2)}`;
    return `${workout.duration}`;
  };

  const getEnergyTip = (energy: EnergyLevel): string => {
    switch (energy) {
      case 'low':
        return 'Dostosuję tempo - więcej przerw, łagodniejsze ruchy. Słuchaj swojego ciała! 💚';
      case 'medium':
        return 'Idealny stan do treningu! Utrzymaj równe tempo przez cały trening. 💪';
      case 'high':
        return 'Świetnie! Możesz zwiększyć intensywność i skrócić przerwy. Daj z siebie wszystko! 🔥';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Przygotowanie</h1>
            <p className="text-xs text-muted-foreground">Dostosuj trening do siebie</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Workout Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-3xl p-5 bg-gradient-to-br border border-white/20',
            workout.gradient
          )}
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl">{workout.icon}</div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-white mb-1">{workout.name}</h2>
              <p className="text-white/80 text-sm mb-3">{workout.description}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{workout.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <Flame className="w-4 h-4" />
                  <span>{workout.calories.min}-{workout.calories.max} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <Target className="w-4 h-4" />
                  <span>{workout.exercises.length} ćwiczeń</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Energy Level Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Jak się dziś czujesz?</h3>
          </div>
          
          <div className="space-y-3">
            {energyLevels.map(({ level, label, description, icon: Icon, color }) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedEnergy(level)}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
                  selectedEnergy === level 
                    ? color
                    : 'border-border bg-card hover:border-muted-foreground/30'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  selectedEnergy === level ? 'bg-white/20' : 'bg-muted'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {selectedEnergy === level && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Energy-based tip */}
        <motion.div
          key={selectedEnergy}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-2xl p-4 flex items-start gap-3"
        >
          <img 
            src={fitekPoranek} 
            alt="FITEK" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <p className="font-medium text-sm mb-1">Wskazówka od FITEK</p>
            <p className="text-sm text-muted-foreground">{getEnergyTip(selectedEnergy)}</p>
          </div>
        </motion.div>

        {/* Adjusted Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Twój plan
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{getAdjustedDuration(selectedEnergy)}</p>
              <p className="text-xs text-muted-foreground">minut</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{workout.exercises.length}</p>
              <p className="text-xs text-muted-foreground">ćwiczeń</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">+{workout.xpReward}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selectedEnergy)}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="text-xl font-bold text-primary-foreground">Zaczynamy!</span>
          <ChevronRight className="w-6 h-6 text-primary-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
}
