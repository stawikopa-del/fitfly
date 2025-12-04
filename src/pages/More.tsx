import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Trophy, User, Settings, HelpCircle, Info, Heart, Download, Check, Share, Award, Crown, Zap, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchSubscriptionProducts, createStorefrontCheckout, ShopifyProduct } from '@/lib/shopify';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';

const menuItems = [
  { to: '/postepy', icon: TrendingUp, label: 'Postępy', emoji: '📊', description: 'Sprawdź swoje statystyki' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania', emoji: '🏆', description: 'Podejmij nowe wyzwania' },
  { to: '/osiagniecia', icon: Award, label: 'Osiągnięcia', emoji: '🎖️', description: 'Poziomy, odznaki i XP' },
  { to: '/profil', icon: User, label: 'Profil', emoji: '👤', description: 'Twoje dane i cele' },
  { to: '/ustawienia', icon: Settings, label: 'Ustawienia', emoji: '⚙️', description: 'Dostosuj aplikację' },
];

const additionalItems = [
  { to: '/o-nas', icon: Heart, label: 'O nas', emoji: '💚', description: 'Poznaj FITFLY' },
  { to: '/pomoc', icon: HelpCircle, label: 'Pomoc', emoji: '❓', description: 'FAQ i wsparcie' },
  { to: '/informacje', icon: Info, label: 'Informacje', emoji: 'ℹ️', description: 'Wersja i licencje' },
];

// Package display config
const packageConfig: Record<string, { icon: typeof Zap; emoji: string; features: string[]; popular?: boolean; gradient?: string; borderColor?: string; priceColor?: string }> = {
  'pakiet-start': {
    icon: Zap,
    emoji: '⚡',
    features: ['Podstawowe treningi', 'Tracker wody', 'Dziennik posiłków'],
  },
  'pakiet-fit': {
    icon: Star,
    emoji: '🌟',
    features: ['Wszystko z START', 'AI przepisy', 'Spersonalizowane plany', 'Brak reklam'],
    popular: true,
    gradient: 'from-primary/10 to-secondary/10',
    borderColor: 'border-primary/50',
    priceColor: 'text-primary',
  },
  'pakiet-premium': {
    icon: Crown,
    emoji: '👑',
    features: ['Wszystko z FIT', '1-na-1 z trenerem AI', 'Priorytetowe wsparcie', 'Ekskluzywne wyzwania'],
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    priceColor: 'text-amber-600',
  },
};

// Map handles to tiers
const HANDLE_TO_TIER: Record<string, SubscriptionTier> = {
  'pakiet-start': 'start',
  'pakiet-fit': 'fit',
  'pakiet-premium': 'premium',
};

export default function More() {
  const { isInstallable, isInstalled, promptInstall, showIOSInstructions } = usePWAInstall();
  const { currentTier, isActive, loading: subscriptionLoading } = useSubscription();
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      const data = await fetchSubscriptionProducts();
      setProducts(data);
      setLoadingProducts(false);
    };
    loadProducts();
  }, []);

  const handlePurchase = async (product: ShopifyProduct) => {
    soundFeedback.buttonClick();
    
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      toast.error('Nie można znaleźć wariantu produktu');
      return;
    }

    // Free product
    if (parseFloat(variant.price.amount) === 0) {
      toast.success('Pakiet START jest darmowy! Korzystasz z niego już teraz 🎉');
      return;
    }

    setPurchasingId(product.node.id);
    
    try {
      const checkoutUrl = await createStorefrontCheckout(variant.id, 1);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        toast.success('Przekierowano do płatności Shopify');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Nie udało się utworzyć płatności');
    } finally {
      setPurchasingId(null);
    }
  };

  const handleInstallClick = async () => {
    soundFeedback.buttonClick();
    
    if (isInstalled) {
      toast.success('Aplikacja jest już zainstalowana! 🎉');
      return;
    }

    if (showIOSInstructions) {
      setShowIOSDialog(true);
      return;
    }

    if (isInstallable) {
      const success = await promptInstall();
      if (success) {
        toast.success('Aplikacja zainstalowana! 🎉');
      }
    } else {
      toast.info('Użyj opcji "Dodaj do ekranu głównego" w menu przeglądarki 📱');
    }
  };

  const renderPackageCard = (product: ShopifyProduct) => {
    const config = packageConfig[product.node.handle] || packageConfig['pakiet-start'];
    const Icon = config.icon;
    const variant = product.node.variants.edges[0]?.node;
    const price = variant ? parseFloat(variant.price.amount) : 0;
    const isFree = price === 0;
    const isLoading = purchasingId === product.node.id;
    const productTier = HANDLE_TO_TIER[product.node.handle] || 'start';
    const isCurrentTier = currentTier === productTier && isActive;

    return (
      <button
        key={product.node.id}
        onClick={() => !isCurrentTier && handlePurchase(product)}
        disabled={isLoading || isCurrentTier}
        className={cn(
          "relative p-4 rounded-2xl border-2 shadow-lg transition-all text-left overflow-hidden group w-full",
          config.gradient ? `bg-gradient-to-br ${config.gradient}` : 'bg-card',
          config.borderColor || 'border-border/50',
          isLoading && 'opacity-70',
          isCurrentTier && 'ring-2 ring-green-500 border-green-500',
          !isCurrentTier && 'hover:-translate-y-0.5'
        )}
      >
        {isCurrentTier && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> TWÓJ PAKIET
          </div>
        )}
        {config.popular && !isCurrentTier && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
            POPULARNE ⭐
          </div>
        )}
        
        {product.node.handle === 'pakiet-premium' && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
        )}
        
        <div className="relative flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            product.node.handle === 'pakiet-start' && "bg-muted",
            product.node.handle === 'pakiet-fit' && "bg-gradient-to-br from-primary to-secondary",
            product.node.handle === 'pakiet-premium' && "bg-gradient-to-br from-amber-500 to-orange-500"
          )}>
            <Icon className={cn(
              "w-7 h-7",
              product.node.handle === 'pakiet-start' ? 'text-foreground' : 'text-white'
            )} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg flex items-center gap-2">
              {product.node.title.replace('Pakiet ', '')} <span>{config.emoji}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {isFree ? 'Podstawowe funkcje za darmo' : product.node.handle === 'pakiet-fit' ? 'Wszystko czego potrzebujesz' : 'Pełna moc FITFLY'}
            </p>
          </div>
          <div className="text-right">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className={cn("font-extrabold text-xl", config.priceColor || 'text-foreground')}>
                  {isFree ? '0 zł' : `${price.toFixed(2).replace('.', ',')} zł`}
                </p>
                <p className="text-xs text-muted-foreground">{isFree ? 'na zawsze' : '/miesiąc'}</p>
              </>
            )}
          </div>
        </div>
        
        <div className={cn(
          "relative mt-3 pt-3 border-t flex flex-wrap gap-2",
          config.borderColor ? 'border-primary/20' : 'border-border/50'
        )}>
          {config.features.map((feature, idx) => (
            <span 
              key={idx} 
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                config.popular ? 'bg-primary/20 text-primary' : 
                product.node.handle === 'pakiet-premium' ? 'bg-amber-500/20 text-amber-700' : 
                'bg-muted'
              )}
            >
              {feature}
            </span>
          ))}
        </div>
      </button>
    );
  };

  // Sort products: START, FIT, PREMIUM
  const sortedProducts = [...products].sort((a, b) => {
    const order = ['pakiet-start', 'pakiet-fit', 'pakiet-premium'];
    return order.indexOf(a.node.handle) - order.indexOf(b.node.handle);
  });

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Więcej opcji ✨
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Odkryj wszystkie funkcje FITFLY
        </p>
      </header>

      {/* Główne opcje */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Menu główne
        </h2>
        <div className="grid gap-3">
          {menuItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => soundFeedback.navTap()}
              className={({ isActive }) => cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300',
                'bg-card border-2 border-border/50 shadow-card-playful',
                'hover:-translate-y-0.5 hover:shadow-card-playful-hover',
                isActive && 'border-primary/50 bg-primary/5'
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-playful">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg flex items-center gap-2">
                  {label} <span>{emoji}</span>
                </p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Pakiety Premium */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Pakiety FITFLY 💎
        </h2>
        <div className="grid gap-3">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map(renderPackageCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Brak dostępnych pakietów</p>
            </div>
          )}
        </div>
      </div>

      {/* Dodatkowe opcje */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Dodatkowe
        </h2>
        <div className="grid gap-3">
          {/* Przycisk pobierania aplikacji */}
          <button
            onClick={handleInstallClick}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left',
              'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30',
              'hover:-translate-y-0.5 hover:shadow-playful',
              isInstalled && 'from-green-500/20 to-green-400/20 border-green-500/30'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isInstalled ? 'bg-green-500' : 'bg-gradient-to-br from-primary to-secondary'
            )}>
              {isInstalled ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground flex items-center gap-2">
                {isInstalled ? 'Zainstalowano' : 'Pobierz aplikację'} <span>📲</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {isInstalled ? 'FITFLY jest na Twoim telefonie!' : 'Dodaj FITFLY do ekranu głównego'}
              </p>
            </div>
          </button>

          {additionalItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => soundFeedback.navTap()}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left',
                'bg-muted/50 border-2 border-border/30',
                'hover:-translate-y-0.5 hover:bg-muted'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center">
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground flex items-center gap-2">
                  {label} <span>{emoji}</span>
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Wersja */}
      <p className="text-center text-xs text-muted-foreground relative z-10 pt-4">
        FITFLY v1.0.0 • Made with 💚
      </p>

      {/* iOS Installation Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold font-display text-center">
              Zainstaluj na iPhone 📱
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Aby zainstalować FITFLY na iPhone:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  1
                </div>
                <p className="text-sm">
                  Kliknij ikonę <Share className="w-4 h-4 inline mx-1" /> <strong>Udostępnij</strong> na dole ekranu
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  2
                </div>
                <p className="text-sm">
                  Przewiń w dół i wybierz <strong>„Dodaj do ekranu głównego"</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  3
                </div>
                <p className="text-sm">
                  Kliknij <strong>„Dodaj"</strong> w prawym górnym rogu
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowIOSDialog(false)}
              className="w-full rounded-2xl font-bold"
            >
              Rozumiem! 👍
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
