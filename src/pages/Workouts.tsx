import { motion } from 'framer-motion';
import { WorkoutHub } from '@/components/flyfit/WorkoutHub';
import { pageVariants, cardVariants } from '@/lib/animations';

export default function Workouts() {
  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="px-4 py-6"
    >
      {/* Header */}
      <motion.header variants={cardVariants} className="mb-6">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-fitfly-blue-light bg-clip-text text-transparent">
          Treningi
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Ćwicz ze mną! 💪</p>
      </motion.header>

      <WorkoutHub />
    </motion.div>
  );
}
