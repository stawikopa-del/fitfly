import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Loader2, AlertCircle, Star, Flame, Beef, Wheat, Plus, Smartphone, Camera, X, ScanLine, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  onAddMeal?: (meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

// Deklaracja globalnego typu dla BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap) => Promise<Array<{ rawValue: string; format: string }>>;
    };
  }
}

// Funkcja do oceny produktu w stylu FITKA
const evaluateProduct = (product: Omit<ProductData, 'score' | 'description'>): {
  score: number;
  description: string;
} => {
  let score = 5;
  const issues: string[] = [];
  const positives: string[] = [];
  
  if (product.protein >= 20) {
    score += 2;
    positives.push('mega porcja białka 💪');
  } else if (product.protein >= 10) {
    score += 1;
    positives.push('solidne białko');
  }
  if (product.sugar && product.sugar > 15) {
    score -= 2;
    issues.push('sporo cukru 🍬');
  } else if (product.sugar && product.sugar < 5) {
    score += 1;
    positives.push('mało cukru');
  }
  if (product.fat > 20) {
    score -= 1;
    issues.push('tłuszczu nie brakuje');
  }
  if (product.fiber && product.fiber >= 5) {
    score += 1;
    positives.push('błonnik na plus 🌾');
  }
  if (product.salt && product.salt > 1.5) {
    score -= 1;
    issues.push('sól w nadmiarze');
  }
  if (product.calories < 150) {
    score += 1;
    positives.push('lekkie dla sylwetki');
  } else if (product.calories > 400) {
    score -= 1;
    issues.push('kaloryczna bomba 💣');
  }
  
  score = Math.max(1, Math.min(10, score));
  
  let description = '';
  
  if (score >= 8) {
    const greatPhrases = [
      `Oho, ktoś tu wie co dobre! 🎉 ${positives.length > 0 ? positives.slice(0, 2).join(' i ') + '!' : ''} Jedz śmiało, Twoje ciało Ci podziękuje!`,
      `Wow, świetny wybór! 🌟 ${positives.length > 0 ? 'Mamy tu ' + positives[0] + '!' : ''} Takie produkty lubię najbardziej - zdrowe i smaczne!`,
      `Brawo! 👏 To jest TO! ${positives.length > 0 ? positives.slice(0, 2).join(', ') + '.' : ''} Możesz jeść bez wyrzutów sumienia!`
    ];
    description = greatPhrases[Math.floor(Math.random() * greatPhrases.length)];
  } else if (score >= 6) {
    const goodPhrases = [
      `Całkiem nieźle! 👍 ${positives.length > 0 ? 'Plus za ' + positives[0] + '.' : ''} ${issues.length > 0 ? 'Tylko uważaj na ' + issues[0] + ', okej?' : 'Można jeść regularnie!'}`,
      `Dobry wybór! 😊 ${positives.length > 0 ? positives[0] + ' to fajny bonus.' : ''} ${issues.length > 0 ? 'Miej tylko oko na ' + issues[0] + '.' : 'Smacznego!'}`,
      `Spoko produkt! ✌️ ${issues.length > 0 ? 'Jest ' + issues[0] + ', ale' : 'Ogólnie'} ${positives.length > 0 ? ' ' + positives[0] + ' nadrabia!' : ' daje radę!'}`
    ];
    description = goodPhrases[Math.floor(Math.random() * goodPhrases.length)];
  } else if (score >= 4) {
    const okPhrases = [
      `Hmm, mogło być lepiej... 🤷 ${issues.length > 0 ? issues.slice(0, 2).join(' i ') + '.' : ''} Traktuj to jako okazjonalny przysmak, nie codzienność!`,
      `No cóż... 😅 ${issues.length > 0 ? 'Mamy tu ' + issues[0] + '.' : ''} Raz na jakiś czas ujdzie, ale nie przesadzaj!`,
      `Średniak! 🙃 ${issues.length > 0 ? issues.slice(0, 2).join(', ') + '.' : ''} Jeśli bardzo lubisz - jedz rzadko. Może znajdziesz coś lepszego?`
    ];
    description = okPhrases[Math.floor(Math.random() * okPhrases.length)];
  } else {
    const badPhrases = [
      `Oj, to nie jest mój faworyt... 😬 ${issues.length > 0 ? issues.join(', ') + '!' : ''} Może poszukamy czegoś zdrowszego? Pomogę Ci znaleźć alternatywę!`,
      `Ups, czerwona lampka! 🚨 ${issues.length > 0 ? issues.join(' i ') + '.' : ''} Lepiej odpuść ten produkt - Twoje ciało zasługuje na coś lepszego!`,
      `Nie chcę być złośliwy, ale... 😅 ${issues.length > 0 ? issues.join(', ') + '.' : ''} Ten produkt to nie jest droga do formy marzeń. Szukaj dalej!`
    ];
    description = badPhrases[Math.floor(Math.random() * badPhrases.length)];
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
    
    // Inteligentne wykrywanie wielkości porcji
    let servingSize = p.serving_size;
    
    // Jeśli brak serving_size, spróbuj obliczyć z quantity (waga produktu)
    if (!servingSize && p.quantity) {
      const quantity = p.quantity.toString();
      // Sprawdź czy to pojedynczy produkt (np. "45g", "50 g", "100ml")
      const singleMatch = quantity.match(/^(\d+(?:[.,]\d+)?)\s*(g|gr|gram|ml)$/i);
      if (singleMatch) {
        // Pojedynczy produkt - cała waga = 1 porcja
        servingSize = `${singleMatch[1]}${singleMatch[2]}`;
      }
      // Sprawdź format wielopak np. "4 x 50g" - jedna sztuka = porcja
      const multiMatch = quantity.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(g|gr|gram|ml)/i);
      if (multiMatch) {
        servingSize = `${multiMatch[2]}${multiMatch[3]}`;
      }
    }
    
    // Fallback na product_quantity jeśli jest pojedyncza wartość
    if (!servingSize && p.product_quantity) {
      const pq = parseFloat(p.product_quantity);
      if (pq > 0 && pq <= 200) { // Prawdopodobnie pojedynczy produkt (do 200g)
        servingSize = `${pq}g`;
      }
    }
    
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
      serving_size: servingSize,
      image_url: p.image_url || p.image_front_url
    };
    const evaluation = evaluateProduct(productBase);
    return {
      ...productBase,
      ...evaluation
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};
export function BarcodeScanner({
  onClose,
  onAddMeal
}: BarcodeScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [customServingSize, setCustomServingSize] = useState<string>('');
  
  // Camera scanning state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fallback photo capture state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  
  // Check if BarcodeDetector is supported
  const isBarcodeDetectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const handleClose = () => {
    stopCamera();
    soundFeedback.navTap();
    onClose();
  };
  
  const handleAddToMeal = () => {
    if (product && onAddMeal) {
      // Calculate calories based on serving size
      const parseServingSize = (serving?: string): number | null => {
        if (!serving) return null;
        const gMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*g(?:r|ram)?/i);
        if (gMatch) return parseFloat(gMatch[1].replace(',', '.'));
        const mlMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
        if (mlMatch) return parseFloat(mlMatch[1].replace(',', '.'));
        const numMatch = serving.match(/^(\d+(?:[.,]\d+)?)/);
        if (numMatch) return parseFloat(numMatch[1].replace(',', '.'));
        return null;
      };
      
      const servingGrams = parseServingSize(product.serving_size) || (customServingSize ? parseFloat(customServingSize) : null);
      const multiplier = servingGrams ? servingGrams / 100 : 1;
      
      soundFeedback.success();
      onAddMeal({
        name: product.brand ? `${product.name} (${product.brand})` : product.name,
        calories: Math.round(product.calories * multiplier),
        protein: Math.round(product.protein * multiplier),
        carbs: Math.round(product.carbs * multiplier),
        fat: Math.round(product.fat * multiplier)
      });
      toast.success('Dodano do dziennika posiłków!');
      onClose();
    }
  };
  
  const resetScan = () => {
    setProduct(null);
    setError(null);
    setManualBarcode('');
    setCustomServingSize('');
    setCapturedPhoto(null);
  };

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported');
        setCameraSupported(false);
        setIsScanning(false);
        toast.error('Twoja przeglądarka nie obsługuje kamery. Spróbuj wgrać zdjęcie.');
        return;
      }
      
      // Request camera permission with mobile-optimized constraints
      let stream: MediaStream;
      try {
        // First try with environment camera (back camera on mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, min: 640 }, 
            height: { ideal: 720, min: 480 }
          },
          audio: false
        });
      } catch (envError) {
        console.log('Environment camera failed, trying default:', envError);
        // Fallback to any available camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready with timeout
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'));
          }, 10000);
          
          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            video.play()
              .then(() => resolve())
              .catch(reject);
          };
          
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video error'));
          };
        });
        
        setIsCameraActive(true);
        setIsScanning(false);
        
        // Start barcode detection only if BarcodeDetector is supported
        if (isBarcodeDetectorSupported && window.BarcodeDetector) {
          const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
          
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const barcode = barcodes[0].rawValue;
                  soundFeedback.success();
                  stopCamera();
                  setManualBarcode(barcode);
                  handleBarcodeDetected(barcode);
                }
              } catch (err) {
                // Silent fail - keep scanning
              }
            }
          }, 250);
        }
        // If BarcodeDetector is not supported, camera stays active for manual photo capture
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsScanning(false);
      
      // Handle specific permission errors
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Brak uprawnień do kamery. Sprawdź ustawienia przeglądarki.');
        setError('Musisz zezwolić na dostęp do kamery w ustawieniach przeglądarki.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('Nie znaleziono kamery');
        setCameraSupported(false);
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast.error('Kamera jest używana przez inną aplikację');
        setError('Zamknij inne aplikacje używające kamery i spróbuj ponownie.');
      } else if (err.name === 'OverconstrainedError') {
        toast.error('Kamera nie spełnia wymagań');
        setCameraSupported(false);
      } else {
        toast.error('Nie można uruchomić kamery. Spróbuj wgrać zdjęcie.');
        setCameraSupported(false);
      }
    }
  }, [isBarcodeDetectorSupported]);

  // Capture photo from video stream (fallback when BarcodeDetector not supported)
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    stopCamera();
    soundFeedback.buttonClick();
  }, []);

  // Analyze captured photo for barcode using AI
  const analyzePhotoForBarcode = async (photoData: string) => {
    setIsAnalyzingPhoto(true);
    setError(null);
    
    try {
      const base64Data = photoData.split(',')[1];
      
      const { data, error: fnError } = await supabase.functions.invoke('fitek-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: base64Data,
                  mimeType: 'image/jpeg'
                },
                {
                  type: 'text',
                  text: `Przeanalizuj to zdjęcie kodu kreskowego produktu. Znajdź numer kodu kreskowego (EAN/UPC) widoczny na zdjęciu i zwróć TYLKO sam numer, bez żadnych dodatkowych słów ani wyjaśnień. Jeśli nie możesz odczytać kodu, odpowiedz tylko: NIE_ZNALEZIONO`
                }
              ]
            }
          ],
          systemPrompt: 'Jesteś ekspertem od odczytywania kodów kreskowych. Twoim jedynym zadaniem jest odczytanie numeru kodu kreskowego ze zdjęcia i zwrócenie go. Odpowiadaj tylko numerem kodu (np. 5900617001696) lub NIE_ZNALEZIONO jeśli nie możesz go odczytać.',
          model: 'google/gemini-2.5-flash'
        }
      });

      if (fnError) throw fnError;

      const response = data?.response?.trim() || '';
      
      // Check if we got a valid barcode number
      const barcodeMatch = response.match(/\d{8,14}/);
      
      if (barcodeMatch) {
        const barcode = barcodeMatch[0];
        setManualBarcode(barcode);
        soundFeedback.success();
        toast.success(`Odczytano kod: ${barcode}`);
        handleBarcodeDetected(barcode);
      } else {
        setError('Nie udało się odczytać kodu kreskowego. Spróbuj zrobić wyraźniejsze zdjęcie lub wpisz kod ręcznie.');
        soundFeedback.error();
      }
    } catch (err) {
      console.error('Photo analysis error:', err);
      setError('Błąd podczas analizy zdjęcia. Spróbuj ponownie lub wpisz kod ręcznie.');
      soundFeedback.error();
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Handle file input for photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = e.target?.result as string;
      setCapturedPhoto(photoData);
      analyzePhotoForBarcode(photoData);
    };
    reader.readAsDataURL(file);
  };
  
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  }, []);
  
  const handleBarcodeDetected = async (barcode: string) => {
    setError(null);
    setProduct(null);
    setIsLoading(true);
    
    const productData = await fetchProductData(barcode);
    setIsLoading(false);
    
    if (productData) {
      setProduct(productData);
      // Set custom serving size from product if available
      if (productData.serving_size) {
        const gMatch = productData.serving_size.match(/(\d+(?:[.,]\d+)?)\s*g/i);
        if (gMatch) {
          setCustomServingSize(gMatch[1].replace(',', '.'));
        }
      }
      soundFeedback.success();
    } else {
      setError('Nie znaleziono produktu w bazie. Sprawdź kod i spróbuj ponownie.');
      soundFeedback.error();
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Wpisz kod kreskowy');
      return;
    }
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
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500 bg-green-500/20';
    if (score >= 6) return 'text-yellow-500 bg-yellow-500/20';
    if (score >= 4) return 'text-orange-500 bg-orange-500/20';
    return 'text-red-500 bg-red-500/20';
  };
  return <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-pt">
        <div className="flex items-center gap-3">
          <button onClick={handleClose} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold font-display text-foreground">
              Skaner produktów 📦
            </h1>
            <p className="text-xs text-muted-foreground">Sprawdź wartości odżywcze</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Hidden file input for photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Camera scanning view */}
        {isCameraActive && (
          <div className="relative bg-black rounded-3xl overflow-hidden aspect-[4/3]">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning animation overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Scanning frame */}
              <div className="relative w-64 h-40 border-2 border-primary rounded-2xl">
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                
                {/* Scanning line animation - only show if BarcodeDetector supported */}
                {isBarcodeDetectorSupported && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                )}
              </div>
            </div>
            
            {/* Close camera button */}
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Instructions and capture button */}
            <div className="absolute bottom-4 left-0 right-0 text-center space-y-3">
              <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                {isBarcodeDetectorSupported 
                  ? 'Skieruj aparat na kod kreskowy' 
                  : 'Wyceluj w kod i zrób zdjęcie'}
              </p>
              
              {/* Manual capture button - show when BarcodeDetector not supported */}
              {!isBarcodeDetectorSupported && (
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full border-4 border-black/20" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Captured photo preview and analysis */}
        {capturedPhoto && !product && (
          <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src={capturedPhoto} 
                alt="Zdjęcie kodu" 
                className="w-full aspect-video object-cover"
              />
              {isAnalyzingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Analizuję zdjęcie AI...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCapturedPhoto(null);
                  startCamera();
                }}
                disabled={isAnalyzingPhoto}
                className="flex-1 rounded-xl font-bold"
              >
                <Camera className="w-4 h-4 mr-2" />
                Nowe zdjęcie
              </Button>
              {!isAnalyzingPhoto && !error && (
                <Button
                  onClick={() => analyzePhotoForBarcode(capturedPhoto)}
                  className="flex-1 rounded-xl font-bold"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Analizuj ponownie
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Camera scan button - uses native camera input for mobile compatibility */}
        {!isCameraActive && !product && !capturedPhoto && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning || isAnalyzingPhoto}
            className="w-full bg-gradient-to-br from-primary to-secondary rounded-3xl p-5 border-2 border-primary/30 shadow-card-playful hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                {isAnalyzingPhoto ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <Camera className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-lg">Skanuj aparatem</h3>
                <p className="text-white/80 text-sm">Zrób zdjęcie kodu kreskowego</p>
              </div>
              <ScanLine className="w-6 h-6 text-white/80" />
            </div>
          </button>
        )}

        {/* Manual barcode input */}
        {!product && !isCameraActive && !capturedPhoto && (
          <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
            <p className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Lub wpisz kod ręcznie
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="np. 5900617001696"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 rounded-xl text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleManualSearch}
                disabled={isLoading || !manualBarcode.trim()}
                className="rounded-xl font-bold px-5"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Znajdziesz go pod kodem kreskowym na opakowaniu produktu
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <div className="bg-card rounded-3xl border-2 border-border/50 p-8 shadow-card-playful">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Szukam produktu...</p>
            </div>
          </div>}

        {/* Error message */}
        {error && <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-destructive">{error}</p>
              <Button variant="ghost" size="sm" onClick={resetScan} className="mt-2 text-destructive hover:text-destructive">
                Spróbuj ponownie
              </Button>
            </div>
          </div>}

        {/* Product result */}
        {product && <div className="space-y-4 animate-fade-in">
            {/* Product header */}
            <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
              <div className="flex gap-4">
                {product.image_url && <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-2xl object-cover border border-border/50" />}
                <div className="flex-1 min-w-0">
                  <h2 className="font-extrabold font-display text-foreground text-lg leading-tight">
                    {product.name}
                  </h2>
                  {product.brand && <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>}
                  {product.serving_size && <p className="text-xs text-muted-foreground mt-1">Porcja: {product.serving_size}</p>}
                </div>
              </div>
            </div>

            {/* Score - FITEK style */}
            <div className={cn(
              "rounded-3xl border-2 p-5 shadow-card-playful animate-scale-in",
              "transition-all duration-500 ease-out",
              product.score >= 8 ? "bg-green-500/10 border-green-500/30" :
              product.score >= 6 ? "bg-yellow-500/10 border-yellow-500/30" :
              product.score >= 4 ? "bg-orange-500/10 border-orange-500/30" :
              "bg-red-500/10 border-red-500/30"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                  getScoreColor(product.score)
                )}>
                  <div className="text-center">
                    <span className="text-3xl font-extrabold font-display block leading-none">{product.score}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-extrabold font-display text-foreground mb-1.5 flex items-center gap-2 flex-wrap">
                    FITEK mówi: 
                    <span className="text-lg">
                      {product.score >= 8 ? "🤩" : product.score >= 6 ? "😊" : product.score >= 4 ? "🤔" : "😬"}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto whitespace-normal" style={{ wordBreak: 'break-word' }}>
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Macros per serving */}
            {(() => {
              // Parse serving size to get grams - improved parsing
              const parseServingSize = (serving?: string): number | null => {
                if (!serving) return null;
                // Try to find grams in various formats: "50g", "50 g", "(45g)", "1 sztuka (30g)"
                const gMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*g(?:r|ram)?/i);
                if (gMatch) return parseFloat(gMatch[1].replace(',', '.'));
                // Try ml (assume ~1g per ml for drinks)
                const mlMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
                if (mlMatch) return parseFloat(mlMatch[1].replace(',', '.'));
                // Try just a number at the start (common format)
                const numMatch = serving.match(/^(\d+(?:[.,]\d+)?)/);
                if (numMatch) return parseFloat(numMatch[1].replace(',', '.'));
                return null;
              };
              
              // Always use customServingSize if set, otherwise parse from product
              const servingGrams = customServingSize 
                ? parseFloat(customServingSize) 
                : parseServingSize(product.serving_size);
              const multiplier = servingGrams ? servingGrams / 100 : null;
              const servingLabel = customServingSize ? `${customServingSize}g` : product.serving_size;
              
              return (
                <>
                  {/* Editable serving size input - ALWAYS visible */}
                  <div className="bg-muted/30 rounded-2xl border border-border/50 p-4">
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      ⚖️ Zmień wielkość porcji (g)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={product.serving_size ? `np. ${parseServingSize(product.serving_size) || 100}` : "np. 50"}
                        value={customServingSize}
                        onChange={(e) => setCustomServingSize(e.target.value)}
                        className="flex-1 rounded-xl text-base"
                      />
                      <div className="flex gap-1">
                        {[50, 100, 150].map((size) => (
                          <Button
                            key={size}
                            variant="outline"
                            size="sm"
                            onClick={() => setCustomServingSize(size.toString())}
                            className={cn(
                              "rounded-xl text-xs px-2",
                              customServingSize === size.toString() && "border-primary bg-primary/10"
                            )}
                          >
                            {size}g
                          </Button>
                        ))}
                      </div>
                    </div>
                    {product.serving_size && !customServingSize && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Domyślna porcja: {product.serving_size}
                      </p>
                    )}
                  </div>

                  {/* Per serving - primary style */}
                  {multiplier && servingLabel && (
                    <div className="bg-primary/10 rounded-3xl border-2 border-primary/30 p-5 shadow-card-playful">
                      <h3 className="font-extrabold font-display text-foreground mb-4 flex items-center gap-2">
                        🍽️ {servingLabel}
                      </h3>
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-background/80 rounded-2xl border border-primary/20">
                          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                          <p className="text-xl font-extrabold font-display text-foreground">
                            {Math.round(product.calories * multiplier)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">kcal</p>
                        </div>
                        <div className="text-center p-3 bg-background/80 rounded-2xl border border-primary/20">
                          <Beef className="w-5 h-5 mx-auto mb-1 text-red-500" />
                          <p className="text-xl font-extrabold font-display text-foreground">
                            {Math.round(product.protein * multiplier)}g
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">białko</p>
                        </div>
                        <div className="text-center p-3 bg-background/80 rounded-2xl border border-primary/20">
                          <Wheat className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                          <p className="text-xl font-extrabold font-display text-foreground">
                            {Math.round(product.carbs * multiplier)}g
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">węgle</p>
                        </div>
                        <div className="text-center p-3 bg-background/80 rounded-2xl border border-primary/20">
                          <span className="text-lg block mb-1">🧈</span>
                          <p className="text-xl font-extrabold font-display text-foreground">
                            {Math.round(product.fat * multiplier)}g
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">tłuszcz</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Per 100g - secondary style */}
                  <div className="bg-card rounded-3xl border-2 border-border/50 p-5 shadow-card-playful">
                    <h3 className="font-bold text-muted-foreground mb-4 flex items-center gap-2 text-sm">
                      📊 Na 100g
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-muted/30 rounded-xl">
                        <p className="text-base font-bold text-foreground">{product.calories}</p>
                        <p className="text-[9px] text-muted-foreground">kcal</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-xl">
                        <p className="text-base font-bold text-foreground">{Math.round(product.protein)}g</p>
                        <p className="text-[9px] text-muted-foreground">białko</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-xl">
                        <p className="text-base font-bold text-foreground">{Math.round(product.carbs)}g</p>
                        <p className="text-[9px] text-muted-foreground">węgle</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-xl">
                        <p className="text-base font-bold text-foreground">{Math.round(product.fat)}g</p>
                        <p className="text-[9px] text-muted-foreground">tłuszcz</p>
                      </div>
                    </div>

                  </div>
                </>
              );
            })()}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetScan} className="flex-1 rounded-2xl font-bold text-sm px-3">
                <Search className="w-4 h-4 mr-1" />
                Szukaj
              </Button>
              {onAddMeal && <Button onClick={handleAddToMeal} className="flex-1 rounded-2xl font-bold text-sm px-3">
                  <Plus className="w-4 h-4 mr-1" />
                  Dodaj
                </Button>}
            </div>
          </div>}
      </div>
    </div>;
}