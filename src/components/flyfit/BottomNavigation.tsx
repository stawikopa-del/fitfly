import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, Menu, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
const navItems = [{
  to: '/',
  icon: Home,
  label: 'Główna'
}, {
  to: '/treningi',
  icon: Dumbbell,
  label: 'Treningi'
}, {
  to: '/czat',
  icon: MessageCircle,
  label: 'Chaty',
  isCenter: true
}, {
  to: '/odzywianie',
  icon: Utensils,
  label: 'Dieta'
}, {
  to: '/inne',
  icon: Menu,
  label: 'Inne'
}];

// Sub-routes that belong to each main category
const homeSubRoutes = ['/', '/kalendarz', '/planowanie'];
const inneSubRoutes = ['/inne', '/profil', '/postepy', '/wyzwania', '/ustawienia', '/o-nas', '/pomoc', '/informacje', '/prywatnosc', '/osiagniecia', '/cele', '/znajomi', '/lista-zakupow', '/zaproszenie'];
const dietaSubRoutes = ['/odzywianie', '/przepisy', '/konfiguracja-diety', '/szybki-posilek'];
const treningiSubRoutes = ['/treningi', '/trening'];
const chatySubRoutes = ['/czat', '/wiadomosci', '/chat'];
export function BottomNavigation() {
  const location = useLocation();
  const isRouteActive = (to: string) => {
    const pathname = location.pathname;
    if (to === '/') {
      return homeSubRoutes.some(route => pathname === route || route !== '/' && pathname.startsWith(route + '/'));
    }
    if (to === '/inne') {
      return inneSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/odzywianie') {
      return dietaSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/treningi') {
      return treningiSubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    if (to === '/czat') {
      return chatySubRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    }
    return pathname === to;
  };
  return <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
      <div className="bg-card/95 backdrop-blur-xl rounded-3xl border-2 border-border/50 shadow-card-playful-hover max-w-md mx-auto">
        
      </div>
    </nav>;
}