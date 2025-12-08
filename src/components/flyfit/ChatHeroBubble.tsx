import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import waveAnimation from '@/assets/fitfly-wave.mp4';
import { springBouncy, cardVariants } from '@/lib/animations';

export function ChatHeroBubble() {
  const navigate = useNavigate();

  return (
    <motion.div 
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className="flex gap-3 items-center"
    >
      {/* Mascot */}
      <motion.div 
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springBouncy, delay: 0.2 }}
        className="flex-shrink-0 w-44"
      >
        <video 
          src={waveAnimation} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Chat bubble */}
      <motion.div 
        initial={{ scale: 0, x: -20 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ ...springBouncy, delay: 0.3 }}
        className="w-[17.5rem]"
      >
        <motion.div 
          onClick={() => navigate('/czat')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          transition={springBouncy}
          className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-600 rounded-3xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 group aspect-square flex flex-col justify-between"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Header */}
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springBouncy, delay: 0.5 }}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-1"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </motion.div>
            <h3 className="text-white font-bold text-sm font-display leading-tight">Hej!</h3>
            <p className="text-white/80 text-xs">Jestem FITEK 🐦</p>
          </div>

          {/* Typing indicator */}
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
