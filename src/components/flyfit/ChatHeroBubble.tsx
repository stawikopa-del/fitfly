import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles } from 'lucide-react';
import mascotImage from '@/assets/fitfly-mascot.png';

export function ChatHeroBubble() {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/czat')}
      className="relative cursor-pointer group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse" />
      
      {/* Main bubble container */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-5 shadow-xl border border-primary/20 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        {/* Decorative bubbles */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/10 rounded-full" />
        <div className="absolute top-8 right-10 w-4 h-4 bg-white/15 rounded-full" />
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full" />
        
        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Mascot avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-white/20 rounded-2xl p-2 backdrop-blur-sm">
              <img 
                src={mascotImage} 
                alt="FITEK" 
                className="w-full h-full object-contain drop-shadow-lg animate-float"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-fitfly-green rounded-full flex items-center justify-center border-2 border-primary">
              <span className="text-[10px]">💬</span>
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg font-display">Hej! Jestem FITEK! 👋</h3>
              <Sparkles className="w-4 h-4 text-fitfly-yellow animate-pulse" />
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-3">
              Twój przyjaciel od fitnesu! Pogadajmy o Twoich celach, treningach albo po prostu porozmawiajmy! 🐦
            </p>
            
            {/* CTA Button */}
            <div className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2.5 w-fit backdrop-blur-sm transition-colors duration-200">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Napisz do mnie!</span>
            </div>
          </div>
        </div>
        
        {/* Typing indicator */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1">
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}
