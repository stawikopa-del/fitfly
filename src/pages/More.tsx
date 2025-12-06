import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Trophy, User, Settings, HelpCircle, Info, Heart, Download, Check, Share, Award, Crown, Zap, Star, Loader2, CheckCircle2, RefreshCw, ArrowRight, Sparkles, Scale, Target, Users, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { TestimonialsCarousel } from '@/components/flyfit/TestimonialsCarousel';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchSubscriptionProducts, createStorefrontCheckout, ShopifyProduct } from '@/lib/shopify';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import fitekKasa from '@/assets/fitek/fitek-kasa.png';

const menuItems = [
  { to: '/postepy', icon: TrendingUp, label: 'Postępy', emoji: '📊', description: 'Sprawdź swoje statystyki' },
  { to: '/cele', icon: Target, label: 'Cele', emoji: '🎯', description: 'Ustal i śledź swoje cele' },
  { to: '/wyzwania', icon: Trophy, label: 'Wyzwania', emoji: '🏆', description: 'Podejmij nowe wyzwania' },
  { to: '/znajomi', icon: Users, label: 'Znajomi', emoji: '👥', description: 'Dodaj znajomych i rywalizuj' },
  { to: '/osiagniecia', icon: Award, label: 'Osiągnięcia', emoji: '🎖️', description: 'Poziomy, odznaki i XP' },
  { to: '/lista-zakupow', icon: ShoppingCart, label: 'Lista zakupów', emoji: '🛒', description: 'Zaplanuj zakupy na okres diety' },
];

const additionalItems = [
  { to: '/profil', icon: User, label: 'Profil', emoji: '👤', description: 'Twoje dane i cele' },
  { to: '/ustawienia', icon: Settings, label: 'Ustawienia', emoji: '⚙️', description: 'Dostosuj aplikację' },
  { to: '/o-nas', icon: Heart, label: 'O nas', emoji: '💚', description: 'Poznaj FITFLY' },
  { to: '/pomoc', icon: HelpCircle, label: 'Pomoc', emoji: '❓', description: 'FAQ i wsparcie' },
  { to: '/informacje', icon: Info, label: 'Informacje', emoji: 'ℹ️', description: 'Wersja i licencje' },
];

// Package display config
const packageConfig: Record<string, { icon: typeof Zap; emoji: string; shortDesc: string; popular?: boolean; gradient?: string; borderColor?: string; priceColor?: string }> = {
  'pakiet-start': {
    icon: Zap,
    emoji: '⚡',
    shortDesc: 'Podstawowe funkcje za darmo',
  },
  'pakiet-fit': {
    icon: Star,
    emoji: '🌟',
    shortDesc: 'Wszystko czego potrzebujesz',
    popular: true,
    gradient: 'from-primary/10 to-secondary/10',
    borderColor: 'border-primary/50',
    priceColor: 'text-primary',
  },
  'pakiet-premium': {
    icon: Crown,
    emoji: '👑',
    shortDesc: 'Pełna moc FITFLY',
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    priceColor: 'text-amber-600',
  },
};

// Features for comparison
const TIER_COMPARISON = [
  { feature: 'Śledzenie aktywności', start: true, fit: true, premium: true },
  { feature: 'Tracker wody', start: true, fit: true, premium: true },
  { feature: 'Dziennik posiłków', start: true, fit: true, premium: true },
  { feature: 'Czat z FITEK', start: true, fit: true, premium: true },
  { feature: 'AI przepisy', start: false, fit: true, premium: true },
  { feature: 'Spersonalizowane plany', start: false, fit: true, premium: true },
  { feature: 'Brak reklam', start: false, fit: true, premium: true },
  { feature: 'Trener AI 1-na-1', start: false, fit: false, premium: true },
  { feature: 'Ekskluzywne wyzwania', start: false, fit: false, premium: true },
  { feature: 'Priorytetowe wsparcie', start: false, fit: false, premium: true },
];

// Map handles to tiers
const HANDLE_TO_TIER: Record<string, SubscriptionTier> = {
  'pakiet-start': 'start',
  'pakiet-fit': 'fit',
  'pakiet-premium': 'premium',
};

export default function More() {
  const { isInstallable, isInstalled, promptInstall, showIOSInstructions } = usePWAInstall();
  const { currentTier, isActive, loading: subscriptionLoading, subscription } = useSubscription();
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
      <div
        key={product.node.id}
        className={cn(
          "relative rounded-2xl transition-all overflow-hidden",
          isCurrentTier && "p-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        )}
      >
        <button
          onClick={() => !isCurrentTier && handlePurchase(product)}
          disabled={isLoading || isCurrentTier}
          className={cn(
            "relative p-4 rounded-xl border-2 shadow-lg transition-all text-left overflow-hidden group w-full",
            config.gradient ? `bg-gradient-to-br ${config.gradient}` : 'bg-card',
            isCurrentTier ? 'border-transparent bg-card' : config.borderColor || 'border-border/50',
            isLoading && 'opacity-70',
            !isCurrentTier && 'hover:-translate-y-0.5'
          )}
        >
          {isCurrentTier && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 
              <span>TWÓJ AKTYWNY PAKIET</span>
              {subscription?.ends_at && (
                <span className="opacity-80">• do {format(new Date(subscription.ends_at), 'd MMM yyyy', { locale: pl })}</span>
              )}
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
          
          <div className={cn("relative flex items-center gap-4", isCurrentTier && "mt-6")}>
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
                {isCurrentTier ? 'Korzystasz z tego pakietu' : config.shortDesc}
              </p>
            </div>
            <div className="text-right">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : isCurrentTier ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-green-600 font-bold mt-1">Aktywny</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={cn("font-extrabold whitespace-nowrap", config.priceColor || 'text-foreground')}>
                      <span className="text-xl">{isFree ? '0' : price.toFixed(2).replace('.', ',')}</span>
                      <span className="text-sm ml-0.5">zł</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{isFree ? 'na zawsze' : 'miesięcznie'}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          </div>
          
          {/* Przycisk przedłużenia dla aktywnego pakietu */}
          {isCurrentTier && !isFree && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase(product);
              }}
              disabled={isLoading}
              className="relative mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Przedłuż subskrypcję
                </>
              )}
            </button>
          )}
        </button>
      </div>
    );
  };

  // Sort products: START, FIT, PREMIUM
  const sortedProducts = [...products].sort((a, b) => {
    const order = ['pakiet-start', 'pakiet-fit', 'pakiet-premium'];
    return order.indexOf(a.node.handle) - order.indexOf(b.node.handle);
  });

  return (
    <div className="px-5 py-8 space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          Więcej opcji ✨
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          Odkryj wszystkie funkcje FITFLY
        </p>
      </header>

      {/* Główne opcje */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Menu główne
        </h2>
        <div className="grid gap-4">
          {menuItems.map(({ to, icon: Icon, label, emoji, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => soundFeedback.navTap()}
              className={({ isActive }) => cn(
                'flex items-center gap-4 p-5 rounded-2xl transition-all duration-300',
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
      <div className="space-y-5">
        <div className="text-center">
          <img 
            src={fitekKasa} 
            alt="FITEK z pieniędzmi" 
            className="w-20 h-20 object-contain mx-auto mb-2 animate-float"
          />
          <h2 className="text-lg font-extrabold font-display text-foreground">
            Pakiety FITFLY 💎
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Wybierz idealny plan dla siebie</p>
        </div>
        
        {/* Przycisk porównaj - wyróżniony */}
        <div className="animate-float flex justify-center py-2" style={{ animationDelay: '0s' }}>
          <button
            onClick={() => {
              soundFeedback.buttonClick();
              document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3.5 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(139,92,246,0.4)] hover:shadow-[0_8px_40px_rgb(139,92,246,0.6)] transition-all duration-300 hover:scale-105"
          >
            <Scale className="w-5 h-5" />
            Porównaj wszystkie pakiety
          </button>
        </div>

        <div className="grid gap-4 pt-2">
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

      {/* Sekcja porównania - przekonująca */}
      <div id="comparison-section" className="space-y-6 pt-4">
        {/* Hero przekonujący */}
        <div className="animate-float text-center bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-3xl p-6 border-2 border-primary/20">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-xl font-extrabold font-display text-foreground mb-2">
            Odblokuj pełną moc FITFLY!
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Dołącz do tysięcy osób, które osiągają swoje cele zdrowotne szybciej z pakietami premium
          </p>
        </div>

        {/* Korzyści w gridzie */}
        <div className="grid grid-cols-2 gap-3">
          <div className="animate-float bg-card rounded-2xl p-4 border border-border/50 shadow-card-playful" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl mb-2">🤖</div>
            <h4 className="font-bold text-foreground text-sm">AI Przepisy</h4>
            <p className="text-xs text-muted-foreground mt-1">Spersonalizowane przepisy na podstawie Twoich preferencji</p>
          </div>
          <div className="animate-float bg-card rounded-2xl p-4 border border-border/50 shadow-card-playful" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-bold text-foreground text-sm">Plany treningowe</h4>
            <p className="text-xs text-muted-foreground mt-1">Dostosowane do Twoich celów i możliwości</p>
          </div>
          <div className="animate-float bg-card rounded-2xl p-4 border border-border/50 shadow-card-playful" style={{ animationDelay: '0.3s' }}>
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-bold text-foreground text-sm">Ekskluzywne wyzwania</h4>
            <p className="text-xs text-muted-foreground mt-1">Dodatkowe nagrody i motywacja</p>
          </div>
          <div className="animate-float bg-card rounded-2xl p-4 border border-border/50 shadow-card-playful" style={{ animationDelay: '0.4s' }}>
            <div className="text-2xl mb-2">💬</div>
            <h4 className="font-bold text-foreground text-sm">Trener AI 1-na-1</h4>
            <p className="text-xs text-muted-foreground mt-1">Osobisty asystent fitness na wyciągnięcie ręki</p>
          </div>
        </div>

        {/* Tabela porównania */}
        <div className="bg-card rounded-3xl border-2 border-border/50 overflow-hidden shadow-card-playful">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 text-center border-b border-border/50">
            <h4 className="font-extrabold font-display text-foreground">Porównanie pakietów</h4>
          </div>
          
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 border-b border-border/50">
            <div className="text-xs font-bold text-muted-foreground">Funkcja</div>
            <div className="text-center">
              <span className="text-xs font-bold">START</span>
              <p className="text-[10px] text-muted-foreground">0 zł</p>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-primary">FIT ⭐</span>
              <p className="text-[10px] text-muted-foreground">19,99 zł</p>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-amber-600">PREMIUM 👑</span>
              <p className="text-[10px] text-muted-foreground">39,99 zł</p>
            </div>
          </div>

          {/* Features */}
          <div className="divide-y divide-border/30">
            {TIER_COMPARISON.map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-center p-3 hover:bg-muted/20 transition-colors">
                <span className="text-xs text-foreground font-medium">{row.feature}</span>
                <div className="flex justify-center">
                  {row.start ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.fit ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.premium ? (
                    <Check className="w-4 h-4 text-amber-500" />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-border/50">
            <p className="text-center text-xs text-muted-foreground mb-3">
              💡 Pakiet <strong className="text-primary">FIT</strong> wybiera 78% naszych użytkowników!
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Wybierz swój pakiet 🎯
            </Button>
          </div>
        </div>

        {/* Social proof carousel */}
        <TestimonialsCarousel />
      </div>

      {/* Dodatkowe opcje */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
          Dodatkowe
        </h2>
        <div className="grid gap-4">
          {/* Przycisk pobierania aplikacji */}
          <button
            onClick={handleInstallClick}
            className={cn(
              'flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 w-full text-left',
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
                'flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 w-full text-left',
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
