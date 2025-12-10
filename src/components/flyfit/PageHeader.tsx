import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { soundFeedback } from '@/utils/soundFeedback';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  backTo?: string;
  icon?: React.ReactNode;
  useHistory?: boolean; // If true, use browser history instead of fixed path
}

export function PageHeader({ title, subtitle, emoji, backTo = '/inne', icon, useHistory = true }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    soundFeedback.navTap();
    
    if (useHistory && window.history.length > 1) {
      // Use browser history to go back - this preserves scroll position
      navigate(-1);
    } else {
      // Fallback to specific route if no history
      navigate(backTo);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-pt">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold font-display text-foreground truncate">
            {title} {emoji}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
