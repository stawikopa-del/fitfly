import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import waveAnimation from '@/assets/fitfly-wave.mp4';

export function ChatHeroBubble() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 items-center">
      {/* Mascot */}
      <div className="flex-shrink-0 w-48">
        <video 
          src={waveAnimation} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Chat bubble */}
      <div className="w-40">
        <div 
          onClick={() => navigate('/czat')}
          className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-600 rounded-3xl p-4 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group aspect-square flex flex-col justify-between"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Header */}
          <div className="text-center">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-1">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-bold text-sm font-display leading-tight">Hej!</h3>
            <p className="text-white/80 text-xs">Jestem FITEK 🐦</p>
          </div>

          {/* Typing indicator */}
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
