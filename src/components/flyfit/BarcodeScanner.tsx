import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, Camera, Loader2, AlertCircle, Star, Flame, Beef, Wheat, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { toast } from 'sonner';

interface ProductData {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  salt?: number;
  serving_size?: string;
  image_url?: string;
  score: number;
  description: string;
}

interface BarcodeScannerProps {
  onClose: () => void;
  onAddMeal?: (meal: { name: string; calories: number; protein: number; carbs: number; fat: number }) => void;
}

// Funkcja do oceny produktu
const evaluateProduct = (product: Omit<ProductData, 'score' | 'description'>): { score: number; description: string } => {
  let score = 5; // Bazowy wynik
  const issues: string[] = [];
  const positives: string[] = [];

  // Ocena na podstawie makroskładników (na 100g)
  if (product.protein >= 20) {
    score += 2;
    positives.push('wysokie białko');
  } else if (product.protein >= 10) {
    score += 1;
  }

  if (product.sugar && product.sugar > 15) {
    score -= 2;
    issues.push('dużo cukru');
  } else if (product.sugar && product.sugar < 5) {
    score += 1;
    positives.push('mało cukru');
  }

  if (product.fat > 20) {
    score -= 1;
    issues.push('wysoki tłuszcz');
  }

  if (product.fiber && product.fiber >= 5) {
    score += 1;
    positives.push('dobre źródło błonnika');
  }

  if (product.salt && product.salt > 1.5) {
    score -= 1;
    issues.push('wysoka zawartość soli');
  }

  if (product.calories < 150) {
    score += 1;
    positives.push('niskokaloryczny');
  } else if (product.calories > 400) {
    score -= 1;
  }

  // Ogranicz wynik do 1-10
  score = Math.max(1, Math.min(10, score));

  // Generuj opis
  let description = '';
  if (score >= 8) {
    description = `Świetny wybór! ${positives.length > 0 ? positives.slice(0, 2).join(', ') + '.' : ''} Ten produkt wspiera Twoje cele zdrowotne.`;
  } else if (score >= 6) {
    description = `Dobry produkt${positives.length > 0 ? ' - ' + positives[0] : ''}. ${issues.length > 0 ? 'Zwróć uwagę na ' + issues[0] + '.' : 'Można jeść regularnie.'}`;
  } else if (score >= 4) {
    description = `Przeciętny wybór. ${issues.length > 0 ? issues.slice(0, 2).join(', ') + '.' : ''} Lepiej jeść okazjonalnie.`;
  } else {
    description = `Słaby wybór dla zdrowia. ${issues.length > 0 ? issues.join(', ') + '.' : ''} Szukaj zdrowszych alternatyw.`;
  }

  return { score, description };
};

// Pobierz dane produktu z Open Food Facts
const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    const nutrients = p.nutriments || {};

    const productBase = {
      name: p.product_name_pl || p.product_name || 'Nieznany produkt',
      brand: p.brands,
      calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0),
      protein: Math.round((nutrients.proteins_100g || nutrients.proteins || 0) * 10) / 10,
      carbs: Math.round((nutrients.carbohydrates_100g || nutrients.carbohydrates || 0) * 10) / 10,
      fat: Math.round((nutrients.fat_100g || nutrients.fat || 0) * 10) / 10,
      sugar: nutrients.sugars_100g || nutrients.sugars,
      fiber: nutrients.fiber_100g || nutrients.fiber,
      salt: nutrients.salt_100g || nutrients.salt,
      serving_size: p.serving_size,
      image_url: p.image_url || p.image_front_url,
    };

    const evaluation = evaluateProduct(productBase);

    return {
      ...productBase,
      ...evaluation,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export function BarcodeScanner({ onClose, onAddMeal }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const startScanning = async () => {
    setError(null);
    setProduct(null);
    hasScannedRef.current = false;

    try {
      const html5Qrcode = new Html5Qrcode('barcode-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          
          soundFeedback.success();
          
          // Stop scanner
          await html5Qrcode.stop();
          setIsScanning(false);
          setIsLoading(true);

          // Fetch product data
          const productData = await fetchProductData(decodedText);
          setIsLoading(false);

          if (productData) {
            setProduct(productData);
            soundFeedback.buttonClick();
          } else {
            setError('Nie znaleziono produktu w bazie. Spróbuj inny produkt.');
            soundFeedback.error();
          }
        },
        () => {} // Ignore errors during scanning
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Nie udało się uruchomić aparatu. Sprawdź uprawnienia.');
      soundFeedback.error();
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = async () => {
    await stopScanning();
    soundFeedback.navTap();
    onClose();
  };

  const handleAddToMeal = () => {
    if (product && onAddMeal) {
      soundFeedback.success();
      onAddMeal({
        name: product.brand ? `${product.name} (${product.brand})` : product.name,
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
      });
      toast.success('Dodano do dziennika posiłków!');
      onClose();
    }
  };

  const resetScan = () => {
    setProduct(null);
    setError(null);
    setManualBarcode('');
    hasScannedRef.current = false;
  };

  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Wpisz kod kreskowy');
      return;
    }

    await stopScanning();
    setError(null);
    setProduct(null);
    setIsLoading(true);
    soundFeedback.buttonClick();

    const productData = await fetchProductData(manualBarcode.trim());
    setIsLoading(false);

    if (productData) {
      setProduct(productData);
      soundFeedback.success();
    } else {
      setError('Nie znaleziono produktu w bazie. Sprawdź kod i spróbuj ponownie.');
      soundFeedback.error();
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500 bg-green-500/20';
    if (score >= 6) return 'text-yellow-500 bg-yellow-500/20';
    if (score >= 4) return 'text-orange-500 bg-orange-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-pt">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold font-display text-foreground">
              Skaner produktów 📦
            </h1>
            <p className="text-xs text-muted-foreground">Zeskanuj kod kreskowy</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Scanner area */}
        <div className="relative bg-card rounded-3xl border-2 border-border/50 overflow-hidden shadow-card-playful">
          <div 
            id="barcode-reader" 
            className={cn(
              "w-full aspect-[4/3] bg-muted/50",
              !isScanning && "flex items-center justify-center"
            )}
          >
            {!isScanning && !isLoading && (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  Skieruj aparat na kod kreskowy produktu
                </p>
                <Button 
                  onClick={startScanning}
                  className="rounded-2xl font-bold"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Uruchom skaner
                </Button>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Szukam produktu...</p>
                </div>
              </div>
          )}
        </div>

        {/* Manual barcode input */}
        {!product && (
          <div className="bg-card rounded-3xl border-2 border-border/50 p-4 shadow-card-playful">
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Wpisz kod ręcznie
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="np. 5900000000001"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={handleManualSearch}
                disabled={isLoading || !manualBarcode.trim()}
                className="rounded-xl font-bold px-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Znajdziesz go pod kodem kreskowym na opakowaniu
            </p>
          </div>
        )}
          
          {isScanning && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button 
                variant="secondary" 
                onClick={stopScanning}
                className="rounded-2xl font-bold shadow-lg"
              >
                Zatrzymaj skanowanie
              </Button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-destructive">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetScan}
                className="mt-2 text-destructive hover:text-destructive"
              >
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        )}

        {/* Product result */}
        {product && (
          <div className="space-y-4 animate-fade-in">
            {/* Product header */}
            <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
              <div className="flex gap-4">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-border/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-extrabold font-display text-foreground text-lg leading-tight">
                    {product.name}
                  </h2>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                  )}
                  {product.serving_size && (
                    <p className="text-xs text-muted-foreground mt-1">Porcja: {product.serving_size}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
              <div className="flex items-center gap-4 mb-3">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  getScoreColor(product.score)
                )}>
                  <div className="text-center">
                    <Star className="w-5 h-5 mx-auto mb-0.5" />
                    <span className="text-2xl font-extrabold font-display">{product.score}</span>
                    <span className="text-xs font-bold">/10</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Ocena FITKA</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
              <h3 className="font-bold font-display text-foreground mb-4 flex items-center gap-2">
                Wartości odżywcze <span className="text-xs text-muted-foreground font-normal">(na 100g)</span>
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-lg font-extrabold font-display text-foreground">{product.calories}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">kcal</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <Beef className="w-5 h-5 mx-auto mb-1 text-red-500" />
                  <p className="text-lg font-extrabold font-display text-foreground">{product.protein}g</p>
                  <p className="text-[10px] text-muted-foreground font-medium">białko</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <Wheat className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-extrabold font-display text-foreground">{product.carbs}g</p>
                  <p className="text-[10px] text-muted-foreground font-medium">węgle</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <span className="text-lg block mb-1">🧈</span>
                  <p className="text-lg font-extrabold font-display text-foreground">{product.fat}g</p>
                  <p className="text-[10px] text-muted-foreground font-medium">tłuszcz</p>
                </div>
              </div>

              {/* Extra nutrients */}
              {(product.sugar !== undefined || product.fiber !== undefined || product.salt !== undefined) && (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3">
                  {product.sugar !== undefined && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{Math.round(product.sugar * 10) / 10}g</p>
                      <p className="text-[10px] text-muted-foreground">cukry</p>
                    </div>
                  )}
                  {product.fiber !== undefined && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{Math.round(product.fiber * 10) / 10}g</p>
                      <p className="text-[10px] text-muted-foreground">błonnik</p>
                    </div>
                  )}
                  {product.salt !== undefined && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{Math.round(product.salt * 100) / 100}g</p>
                      <p className="text-[10px] text-muted-foreground">sól</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetScan}
                className="flex-1 rounded-2xl font-bold"
              >
                <Camera className="w-4 h-4 mr-2" />
                Skanuj inny
              </Button>
              {onAddMeal && (
                <Button
                  onClick={handleAddToMeal}
                  className="flex-1 rounded-2xl font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj do posiłku
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
