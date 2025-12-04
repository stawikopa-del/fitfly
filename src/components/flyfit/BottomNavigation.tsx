import { useRef, useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import fitekAvatar from '@/assets/fitek-avatar.png';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/treningi', icon: Dumbbell, label: 'Treningi' },
  { to: '/czat', icon: null, label: 'FITEK', isCenter: true },
  { to: '/odzywianie', icon: Utensils, label: 'Dieta' },
  { to: '/inne', icon: Menu, label: 'Inne' },
];

// Sub-routes that belong to "Inne" section
const inneSubRoutes = ['/inne', '/profil', '/postepy', '/wyzwania', '/ustawienia', '/o-nas', '/pomoc', '/informacje', '/prywatnosc'];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [bubbleX, setBubbleX] = useState(0);

  const isRouteActive = (to: string) => {
    if (to === '/inne') {
      return inneSubRoutes.includes(location.pathname);
    }
    return location.pathname === to;
  };

  const getActiveIndex = useCallback(() => {
    return navItems.findIndex(item => isRouteActive(item.to));
  }, [location.pathname]);

  // Get item index from X position
  const getIndexFromX = useCallback((clientX: number) => {
    if (!containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - containerRect.left;
    
    for (let i = 0; i < itemRefs.current.length; i++) {
      const itemEl = itemRefs.current[i];
      if (itemEl) {
        const itemRect = itemEl.getBoundingClientRect();
        const itemCenterX = itemRect.left - containerRect.left + itemRect.width / 2;
        const itemWidth = itemRect.width;
        
        if (Math.abs(relativeX - itemCenterX) < itemWidth / 2) {
          return i;
        }
      }
    }
    return null;
  }, []);

  // Get bubble X position for an index
  const getBubbleXForIndex = useCallback((index: number) => {
    if (!containerRef.current || !itemRefs.current[index]) return 0;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = itemRefs.current[index]!.getBoundingClientRect();
    
    return itemRect.left - containerRect.left + itemRect.width / 2 - 24; // 24 = half bubble width
  }, []);

  // Update bubble position when route changes
  useEffect(() => {
    if (!isDragging) {
      const activeIdx = getActiveIndex();
      if (activeIdx >= 0) {
        setTimeout(() => {
          setBubbleX(getBubbleXForIndex(activeIdx));
        }, 50);
      }
    }
  }, [location.pathname, isDragging, getActiveIndex, getBubbleXForIndex]);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    const index = getIndexFromX(clientX);
    if (index !== null) {
      setDragIndex(index);
      setBubbleX(getBubbleXForIndex(index));
      soundFeedback.buttonClick();
    }
  }, [getIndexFromX, getBubbleXForIndex]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const index = getIndexFromX(clientX);
    if (index !== null && index !== dragIndex) {
      setDragIndex(index);
      setBubbleX(getBubbleXForIndex(index));
      // Haptic feedback on item change
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }, [isDragging, dragIndex, getIndexFromX, getBubbleXForIndex]);

  const handleDragEnd = useCallback(() => {
    if (isDragging && dragIndex !== null) {
      const targetRoute = navItems[dragIndex].to;
      soundFeedback.navTap();
      navigate(targetRoute);
    }
    setIsDragging(false);
    setDragIndex(null);
  }, [isDragging, dragIndex, navigate]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  const activeIndex = getActiveIndex();
  const displayIndex = isDragging ? dragIndex : activeIndex;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
      <div 
        ref={containerRef}
        className="bg-card/95 backdrop-blur-xl rounded-3xl border-2 border-border/50 shadow-card-playful-hover max-w-md mx-auto relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Liquid Glass bubble indicator */}
        <div 
          className={cn(
            "absolute top-3 w-12 h-12 rounded-2xl pointer-events-none z-0",
            "bg-primary/90 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]",
            "transition-all",
            isDragging ? "duration-100 scale-110" : "duration-300 scale-100"
          )}
          style={{ 
            left: bubbleX,
            transform: `translateX(0) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
          }}
        />
        
        <div className="flex items-center justify-around h-20 px-2 relative z-10">
          {navItems.map(({ to, icon: Icon, label, isCenter }, index) => {
            const isActive = displayIndex === index;
            
            // Center FITEK button
            if (isCenter) {
              return (
                <div
                  key={to}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  onClick={() => {
                    if (!isDragging) {
                      soundFeedback.navTap();
                      navigate(to);
                    }
                  }}
                  className="relative flex flex-col items-center -mt-6 cursor-pointer w-16"
                >
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                    'bg-[#fdfeea] border-4 border-primary/20 shadow-lg',
                    'hover:scale-105 hover:shadow-xl hover:border-primary/40',
                    isActive && 'ring-4 ring-primary/30 scale-110 border-primary/50'
                  )}>
                    <img 
                      src={fitekAvatar} 
                      alt="FITEK" 
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold mt-1 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
              );
            }

            // Regular nav items
            return (
              <div
                key={to}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => {
                  if (!isDragging) {
                    soundFeedback.navTap();
                    navigate(to);
                  }
                }}
                className="relative flex flex-col items-center w-16 cursor-pointer select-none"
              >
                <div className={cn(
                  'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
                  isActive ? '-translate-y-1' : 'hover:bg-muted/50'
                )}>
                  {Icon && (
                    <Icon 
                      className={cn(
                        'w-5 h-5 transition-all duration-200',
                        isActive ? 'text-primary-foreground scale-110' : 'text-muted-foreground'
                      )} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-bold mt-1 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
