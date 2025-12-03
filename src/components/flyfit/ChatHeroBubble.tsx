import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import waveAnimation from '@/assets/fitfly-wave.mov';

export function ChatHeroBubble() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const quickReplies = [
    "Cześć FITEK! 👋",
    "Daj mi motywację! 💪",
    "Co dziś ćwiczymy?",
  ];

  const handleQuickReply = (reply: string) => {
    navigate('/czat', { state: { initialMessage: reply } });
  };

  const handleSend = () => {
    if (message.trim()) {
      navigate('/czat', { state: { initialMessage: message } });
    }
  };

  return (
    <div className="flex items-end gap-3">
      {/* Mascot - po lewej, dostosowuje się do rozmiaru chatu */}
      <div className={`flex-shrink-0 relative transition-all duration-300 ease-out ${isExpanded ? 'w-56 h-56' : 'w-44 h-44'}`}>
        <video 
          src={waveAnimation} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-contain drop-shadow-2xl relative z-10"
        />
      </div>

      {/* Chat bubble - po prawej */}
      <div className="flex-1 min-w-0">
        {/* Glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-fitfly-green/30 to-emerald-400/30 rounded-3xl blur-xl" />
          
          {/* Main bubble */}
          <div className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-500 rounded-3xl p-5 shadow-xl border border-fitfly-green/20 overflow-hidden">
            {/* Decorative bubbles */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white/10 rounded-full" />
            <div className="absolute top-8 right-8 w-4 h-4 bg-white/15 rounded-full" />
            <div className="absolute bottom-4 left-4 w-5 h-5 bg-white/10 rounded-full" />
            
            {/* Header - always visible */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg font-display">Hej! Jestem FITEK!</h3>
                  <p className="text-white/80 text-sm">Kliknij, żeby pogadać 🐦</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {/* Expandable content */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-72 mt-4' : 'max-h-0'}`}>
              {/* Quick replies */}
              <div className="space-y-2 mb-4">
                <p className="text-white/70 text-sm">Szybkie odpowiedzi:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input field */}
              <div className="flex items-center gap-2 bg-white/20 rounded-xl p-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Napisz coś..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base outline-none"
                />
                <button
                  onClick={handleSend}
                  className="bg-white/30 hover:bg-white/40 p-2.5 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Full chat CTA */}
              <button
                onClick={() => navigate('/czat')}
                className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white text-base font-medium py-3 rounded-xl transition-colors"
              >
                Otwórz pełny czat →
              </button>
            </div>

            {/* Typing indicator when collapsed */}
            {!isExpanded && (
              <div className="flex items-center gap-1.5 mt-4">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
