import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import greetingVideo from '@/assets/fitfly-greeting.mp4';
import mascotImage from '@/assets/fitfly-mascot.png';

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
    <div className="flex items-end gap-3 justify-between">
      {/* Chat bubble - po lewej */}
      <div className="flex-1 min-w-0">
        {/* Glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-fitfly-green/30 to-emerald-400/30 rounded-3xl blur-xl" />
          
          {/* Main bubble */}
          <div className="relative bg-gradient-to-br from-fitfly-green via-emerald-500 to-teal-500 rounded-3xl p-4 shadow-xl border border-fitfly-green/20 overflow-hidden">
            {/* Decorative bubbles */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full" />
            <div className="absolute top-6 right-6 w-3 h-3 bg-white/15 rounded-full" />
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/10 rounded-full" />
            
            {/* Header - always visible */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base font-display">Hej! Jestem FITEK!</h3>
                  <p className="text-white/80 text-xs">Kliknij, żeby pogadać 🐦</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-1.5">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {/* Expandable content */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-60 mt-4' : 'max-h-0'}`}>
              {/* Quick replies */}
              <div className="space-y-2 mb-3">
                <p className="text-white/70 text-xs">Szybkie odpowiedzi:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input field */}
              <div className="flex items-center gap-2 bg-white/20 rounded-xl p-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Napisz coś..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none"
                />
                <button
                  onClick={handleSend}
                  className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Full chat CTA */}
              <button
                onClick={() => navigate('/czat')}
                className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 rounded-xl transition-colors"
              >
                Otwórz pełny czat →
              </button>
            </div>

            {/* Typing indicator when collapsed */}
            {!isExpanded && (
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mascot - po prawej, z animacją powitania */}
      <div className="flex-shrink-0 w-32 h-32 relative">
        <div className="absolute inset-0 bg-fitfly-green/20 rounded-full blur-xl animate-pulse" />
        <video
          src={greetingVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain drop-shadow-lg z-10"
          poster={mascotImage}
        />
        {/* Fallback image underneath */}
        <img 
          src={mascotImage} 
          alt="FITEK" 
          className="w-full h-full object-contain drop-shadow-lg animate-float"
        />
      </div>
    </div>
  );
}
