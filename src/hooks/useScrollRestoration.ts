import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const location = useLocation();

  // Save scroll position before leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };

    // Save position when component unmounts (navigating away)
    return () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };
  }, [location.pathname]);

  // Restore scroll position when entering a page
  useEffect(() => {
    const savedPosition = scrollPositions.get(location.pathname);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (savedPosition !== undefined && savedPosition > 0) {
        window.scrollTo(0, savedPosition);
      }
    });
  }, [location.pathname]);
}

// Hook to save scroll position before navigating
export function useSaveScrollPosition() {
  const location = useLocation();
  
  const savePosition = () => {
    scrollPositions.set(location.pathname, window.scrollY);
  };
  
  return savePosition;
}
