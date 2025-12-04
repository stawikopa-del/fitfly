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
    <div className="flex gap-2 items-center">
      {/* Mascot */}
      <div className="flex-shrink-0 w-40">
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
          className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-600 rounded-3xl p-5 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg font-display leading-tight">Hej! Jestem FITEK!</h3>
              <p className="text-white/70 text-sm">Twój trener AI 🐦</p>
            </div>
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickReply(reply);
                }}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/10">
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            <span className="text-white/50 text-sm ml-2">Kliknij, żeby pogadać...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
