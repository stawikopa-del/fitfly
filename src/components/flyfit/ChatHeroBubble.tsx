import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import waveAnimation from '@/assets/fitfly-wave.mp4';

export const ChatHeroBubble = memo(function ChatHeroBubble() {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleClick = useCallback(() => {
    navigate('/czat');
  }, [navigate]);

  return (
    <div className="flex gap-3 items-center">
      {/* Mascot */}
      <div className="flex-shrink-0 w-44">
        {!videoLoaded && (
          <div className="w-full aspect-square bg-muted/30 rounded-2xl animate-pulse" />
        )}
        <video 
          src={waveAnimation} 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-auto object-contain ${videoLoaded ? 'block' : 'hidden'}`}
        />
      </div>

      {/* Chat bubble */}
      <div className="w-[17.5rem]">
        <div 
          onClick={handleClick}
          className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-600 rounded-3xl p-4 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group aspect-square flex flex-col justify-between will-change-transform"
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
});
