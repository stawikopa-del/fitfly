import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import waveAnimation from '@/assets/fitfly-wave.mp4';

export function ChatHeroBubble() {
  const navigate = useNavigate();

  const quickReplies = [
    "Cześć! 👋",
    "Motywacja 💪",
    "Co ćwiczymy?",
  ];

  const handleQuickReply = (reply: string) => {
    navigate('/czat', { state: { initialMessage: reply } });
  };

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
      <div className="flex-1 min-w-0">
        <div 
          onClick={() => navigate('/czat')}
          className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-600 rounded-2xl p-3 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm font-display leading-tight">Hej! Jestem FITEK!</h3>
              <p className="text-white/70 text-xs">Twój trener AI 🐦</p>
            </div>
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickReply(reply);
                }}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1 rounded-full transition-colors backdrop-blur-sm"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            <span className="text-white/50 text-xs ml-1.5">Kliknij, żeby pogadać...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
