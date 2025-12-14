import { useState, useMemo } from 'react';
import { Search, ArrowLeft, Scale, X, Package, ChevronRight, Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { productsDatabase, productCategories, Product } from '@/data/productsDatabase';
import { soundFeedback } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';

interface ProductDatabaseSearchProps {
  onBack: () => void;
  onAddProduct: (product: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export function ProductDatabaseSearch({ onBack, onAddProduct }: ProductDatabaseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [servingGrams, setServingGrams] = useState('');

  // Filtrowanie produktów
  const filteredProducts = useMemo(() => {
    let products = productsDatabase;
    
    // Filtrowanie po kategorii
    if (selectedCategory !== 'Wszystkie') {
      products = products.filter(p => p.category === selectedCategory);
    }
    
    // Filtrowanie po wyszukiwaniu
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }
    
    return products;
  }, [searchQuery, selectedCategory]);

  // Obliczanie makro dla wybranej porcji
  const calculatedNutrition = useMemo(() => {
    if (!selectedProduct || !servingGrams) return null;
    
    const grams = parseFloat(servingGrams) || 0;
    const multiplier = grams / 100;
    
    return {
      calories: Math.round(selectedProduct.calories * multiplier),
      protein: Math.round(selectedProduct.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedProduct.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedProduct.fat * multiplier * 10) / 10,
    };
  }, [selectedProduct, servingGrams]);

  const handleSelectProduct = (product: Product) => {
    soundFeedback.buttonClick();
    setSelectedProduct(product);
    setServingGrams(product.defaultServing.toString());
  };

  const handleQuickServing = (grams: number) => {
    soundFeedback.buttonClick();
    setServingGrams(grams.toString());
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !calculatedNutrition) return;
    
    soundFeedback.success();
    onAddProduct({
      name: `${selectedProduct.name}${selectedProduct.brand ? ` (${selectedProduct.brand})` : ''} - ${servingGrams}g`,
      calories: calculatedNutrition.calories,
      protein: Math.round(calculatedNutrition.protein),
      carbs: Math.round(calculatedNutrition.carbs),
      fat: Math.round(calculatedNutrition.fat),
    });
  };

  // Widok szczegółów produktu
  if (selectedProduct) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              soundFeedback.buttonClick();
              setSelectedProduct(null);
            }}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate">{selectedProduct.name}</h3>
            {selectedProduct.brand && (
              <p className="text-xs text-muted-foreground">{selectedProduct.brand}</p>
            )}
          </div>
        </div>

        {/* Wartości na 100g */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Wartości na 100g:</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{selectedProduct.calories}</p>
              <p className="text-[10px] text-muted-foreground">kcal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">{selectedProduct.protein}g</p>
              <p className="text-[10px] text-muted-foreground">białko</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent">{selectedProduct.carbs}g</p>
              <p className="text-[10px] text-muted-foreground">węgle</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">{selectedProduct.fat}g</p>
              <p className="text-[10px] text-muted-foreground">tłuszcz</p>
            </div>
          </div>
        </div>

        {/* Wybór porcji */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-muted-foreground" />
            Waga porcji (g)
          </Label>
          
          <div className="flex gap-2">
            <Input
              type="number"
              value={servingGrams}
              onChange={(e) => setServingGrams(e.target.value)}
              placeholder="Wpisz wagę"
              className="flex-1 rounded-xl h-11"
              min="1"
              max="2000"
            />
          </div>
          
          {/* Szybki wybór */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full text-xs h-8",
                servingGrams === selectedProduct.defaultServing.toString() && "border-primary bg-primary/10"
              )}
              onClick={() => handleQuickServing(selectedProduct.defaultServing)}
            >
              {selectedProduct.defaultServing}g ({selectedProduct.servingUnit || '1 porcja'})
            </Button>
            {selectedProduct.defaultServing !== 50 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full text-xs h-8",
                  servingGrams === '50' && "border-primary bg-primary/10"
                )}
                onClick={() => handleQuickServing(50)}
              >
                50g
              </Button>
            )}
            {selectedProduct.defaultServing !== 100 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full text-xs h-8",
                  servingGrams === '100' && "border-primary bg-primary/10"
                )}
                onClick={() => handleQuickServing(100)}
              >
                100g
              </Button>
            )}
            {selectedProduct.defaultServing !== 150 && selectedProduct.defaultServing < 150 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full text-xs h-8",
                  servingGrams === '150' && "border-primary bg-primary/10"
                )}
                onClick={() => handleQuickServing(150)}
              >
                150g
              </Button>
            )}
          </div>
        </div>

        {/* Obliczone wartości */}
        {calculatedNutrition && (
          <div className="bg-secondary/10 rounded-2xl p-4 border-2 border-secondary/30">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Wartości dla {servingGrams}g:
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-card rounded-xl p-2">
                <p className="text-xl font-bold text-foreground">{calculatedNutrition.calories}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              <div className="bg-card rounded-xl p-2">
                <p className="text-xl font-bold text-destructive">{calculatedNutrition.protein}g</p>
                <p className="text-[10px] text-muted-foreground">białko</p>
              </div>
              <div className="bg-card rounded-xl p-2">
                <p className="text-xl font-bold text-accent">{calculatedNutrition.carbs}g</p>
                <p className="text-[10px] text-muted-foreground">węgle</p>
              </div>
              <div className="bg-card rounded-xl p-2">
                <p className="text-xl font-bold text-primary">{calculatedNutrition.fat}g</p>
                <p className="text-[10px] text-muted-foreground">tłuszcz</p>
              </div>
            </div>
          </div>
        )}

        {/* Przycisk dodania */}
        <Button 
          onClick={handleAddProduct} 
          disabled={!calculatedNutrition || calculatedNutrition.calories === 0}
          className="w-full rounded-2xl h-12 bg-secondary hover:bg-secondary/90"
        >
          <Check className="w-4 h-4 mr-2" />
          Dodaj {selectedProduct.name}
        </Button>
      </div>
    );
  }

  // Widok wyszukiwania
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            soundFeedback.buttonClick();
            onBack();
          }}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-foreground">Baza produktów</h3>
          <p className="text-xs text-muted-foreground">Wyszukaj produkt i dodaj do posiłku</p>
        </div>
      </div>

      {/* Wyszukiwarka */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Szukaj produktu, np. Snickers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 rounded-2xl h-12 border-2"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Kategorie */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {productCategories.map(category => (
            <button
              key={category}
              onClick={() => {
                soundFeedback.buttonClick();
                setSelectedCategory(category);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Lista produktów */}
      <ScrollArea className="h-[300px] -mx-2 px-2">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground font-medium">Nie znaleziono produktów</p>
            <p className="text-xs text-muted-foreground mt-1">
              Spróbuj wpisać inną nazwę
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="w-full p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3 text-left group"
              >
                {/* Kalorie po lewej */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-orange-200/20 flex flex-col items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-accent mb-0.5" />
                  <span className="text-sm font-bold text-foreground">{product.calories}</span>
                  <span className="text-[8px] text-muted-foreground -mt-0.5">kcal</span>
                </div>
                
                {/* Info produktu */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{product.name}</p>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  )}
                  <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span className="text-destructive">B: {product.protein}g</span>
                    <span className="text-accent">W: {product.carbs}g</span>
                    <span className="text-primary">T: {product.fat}g</span>
                    <span className="ml-auto">{product.defaultServing}g</span>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <p className="text-[10px] text-muted-foreground text-center">
        {filteredProducts.length} produktów w bazie
      </p>
    </div>
  );
}
