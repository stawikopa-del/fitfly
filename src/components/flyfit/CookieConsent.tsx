import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already accepted cookies
    try {
      const hasAccepted = localStorage.getItem('fitfly_cookies_accepted');
      if (!hasAccepted) {
        // Show after a small delay to not be intrusive on load
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('fitfly_cookies_accepted', 'true');
    } catch {
      // Ignore storage errors
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    handleAccept();
    navigate('/cookies');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium mb-1">
              Używamy ciasteczek 🍪
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tylko niezbędne do działania aplikacji. Bez śledzenia, bez reklam.
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleAccept}
                className="h-8 text-xs rounded-xl"
              >
                OK, rozumiem
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleLearnMore}
                className="h-8 text-xs rounded-xl text-muted-foreground"
              >
                Więcej info
              </Button>
            </div>
          </div>

          <button 
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
