// Estimated prices for products in PLN (Polish złoty)
// Based on average Polish supermarket prices (2024)

export const PRODUCT_PRICES: Record<string, {
  price: number;  // price per package/unit
  unit: string;   // what the price is for
  perKg?: number; // optional price per kg for loose items
}> = {
  // Nabiał
  'mleko': { price: 4.50, unit: 'karton 1L' },
  'jogurt': { price: 2.50, unit: 'kubek 150g' },
  'jogurt naturalny': { price: 3.50, unit: 'kubek 400g' },
  'jogurt grecki': { price: 5.00, unit: 'kubek 400g' },
  'śmietana': { price: 3.00, unit: 'kubek 200ml' },
  'kefir': { price: 4.00, unit: 'butelka 400ml' },
  'maślanka': { price: 3.50, unit: 'butelka 500ml' },
  'ser': { price: 8.00, unit: 'opakowanie 150g' },
  'ser żółty': { price: 12.00, unit: 'opakowanie 200g' },
  'ser feta': { price: 9.00, unit: 'opakowanie 200g' },
  'ser mozzarella': { price: 7.00, unit: 'opakowanie 125g' },
  'ser ricotta': { price: 8.00, unit: 'opakowanie 250g' },
  'twaróg': { price: 5.00, unit: 'opakowanie 200g' },
  'masło': { price: 8.50, unit: 'kostka 200g' },
  'jajko': { price: 12.00, unit: 'opakowanie 10 szt' },
  'jaja': { price: 12.00, unit: 'opakowanie 10 szt' },
  
  // Mięso i ryby
  'kurczak': { price: 25.00, unit: 'opakowanie 500g', perKg: 50 },
  'pierś': { price: 28.00, unit: 'opakowanie 400g', perKg: 70 },
  'pierś z kurczaka': { price: 28.00, unit: 'opakowanie 400g', perKg: 70 },
  'filet': { price: 25.00, unit: 'opakowanie 400g', perKg: 62.50 },
  'filet z kurczaka': { price: 28.00, unit: 'opakowanie 400g', perKg: 70 },
  'indyk': { price: 30.00, unit: 'opakowanie 400g', perKg: 75 },
  'wołowina': { price: 45.00, unit: 'opakowanie 500g', perKg: 90 },
  'wieprzowina': { price: 30.00, unit: 'opakowanie 500g', perKg: 60 },
  'mięso mielone': { price: 22.00, unit: 'opakowanie 400g', perKg: 55 },
  'łosoś': { price: 35.00, unit: 'porcja 200g', perKg: 175 },
  'tuńczyk': { price: 12.00, unit: 'puszka 170g' },
  'szynka': { price: 4.50, unit: 'plasterki 100g', perKg: 45 },
  'boczek': { price: 12.00, unit: 'opakowanie 150g', perKg: 80 },
  'kiełbasa': { price: 15.00, unit: 'sztuka 300g', perKg: 50 },
  'krewetka': { price: 35.00, unit: 'opakowanie 200g', perKg: 175 },
  'krewetki': { price: 35.00, unit: 'opakowanie 200g', perKg: 175 },
  'ryba': { price: 25.00, unit: 'porcja 300g', perKg: 83 },
  
  // Warzywa
  'marchew': { price: 1.00, unit: 'szt', perKg: 4 },
  'cebula': { price: 0.80, unit: 'szt', perKg: 3 },
  'czosnek': { price: 2.50, unit: 'główka' },
  'pomidor': { price: 1.50, unit: 'szt', perKg: 10 },
  'pomidory': { price: 1.50, unit: 'szt', perKg: 10 },
  'ogórek': { price: 2.00, unit: 'szt', perKg: 6 },
  'sałata': { price: 4.00, unit: 'główka' },
  'papryka': { price: 4.00, unit: 'szt', perKg: 18 },
  'brokuł': { price: 6.00, unit: 'szt', perKg: 12 },
  'brokuły': { price: 6.00, unit: 'szt', perKg: 12 },
  'szpinak': { price: 6.00, unit: 'opakowanie 150g', perKg: 40 },
  'kapusta': { price: 4.00, unit: 'główka', perKg: 3 },
  'ziemniak': { price: 5.00, unit: 'kg', perKg: 5 },
  'ziemniaki': { price: 5.00, unit: 'kg', perKg: 5 },
  'cukinia': { price: 4.00, unit: 'szt', perKg: 8 },
  'bakłażan': { price: 5.00, unit: 'szt', perKg: 10 },
  'kalafior': { price: 7.00, unit: 'szt', perKg: 8 },
  'por': { price: 3.00, unit: 'szt' },
  'seler': { price: 4.00, unit: 'szt', perKg: 8 },
  'burak': { price: 1.50, unit: 'szt', perKg: 4 },
  'buraki': { price: 1.50, unit: 'szt', perKg: 4 },
  'awokado': { price: 6.00, unit: 'szt' },
  'pietruszka': { price: 3.00, unit: 'pęczek' },
  'szczypiorek': { price: 3.00, unit: 'pęczek' },
  'rukola': { price: 5.00, unit: 'opakowanie 100g', perKg: 50 },
  'jarmuż': { price: 5.00, unit: 'opakowanie 150g', perKg: 33 },
  'fasola': { price: 6.00, unit: 'puszka 400g' },
  'ciecierzyca': { price: 5.00, unit: 'puszka 400g' },
  'groszek': { price: 4.00, unit: 'puszka 400g' },
  'kukurydza': { price: 4.50, unit: 'puszka 400g' },
  
  // Owoce
  'jabłko': { price: 1.50, unit: 'szt', perKg: 6 },
  'jabłka': { price: 1.50, unit: 'szt', perKg: 6 },
  'banan': { price: 1.00, unit: 'szt', perKg: 6 },
  'banany': { price: 1.00, unit: 'szt', perKg: 6 },
  'pomarańcza': { price: 2.00, unit: 'szt', perKg: 8 },
  'pomarańcze': { price: 2.00, unit: 'szt', perKg: 8 },
  'cytryna': { price: 1.50, unit: 'szt', perKg: 12 },
  'grejpfrut': { price: 3.00, unit: 'szt', perKg: 8 },
  'kiwi': { price: 2.00, unit: 'szt' },
  'truskawka': { price: 12.00, unit: 'opakowanie 250g', perKg: 48 },
  'truskawki': { price: 12.00, unit: 'opakowanie 250g', perKg: 48 },
  'malina': { price: 10.00, unit: 'opakowanie 125g', perKg: 80 },
  'maliny': { price: 10.00, unit: 'opakowanie 125g', perKg: 80 },
  'jagoda': { price: 10.00, unit: 'opakowanie 125g', perKg: 80 },
  'jagody': { price: 10.00, unit: 'opakowanie 125g', perKg: 80 },
  'borówka': { price: 12.00, unit: 'opakowanie 125g', perKg: 96 },
  'borówki': { price: 12.00, unit: 'opakowanie 125g', perKg: 96 },
  'winogrona': { price: 15.00, unit: 'kiść 500g', perKg: 30 },
  'mango': { price: 8.00, unit: 'szt' },
  'ananas': { price: 10.00, unit: 'szt' },
  'gruszka': { price: 2.00, unit: 'szt', perKg: 8 },
  
  // Zboża i makarony
  'ryż': { price: 8.00, unit: 'opakowanie 1kg', perKg: 8 },
  'makaron': { price: 5.00, unit: 'opakowanie 500g', perKg: 10 },
  'spaghetti': { price: 5.00, unit: 'opakowanie 500g', perKg: 10 },
  'kasza': { price: 6.00, unit: 'opakowanie 400g', perKg: 15 },
  'kasza gryczana': { price: 7.00, unit: 'opakowanie 400g', perKg: 17.50 },
  'kasza jaglana': { price: 8.00, unit: 'opakowanie 400g', perKg: 20 },
  'płatki owsiane': { price: 5.00, unit: 'opakowanie 500g', perKg: 10 },
  'płatki': { price: 5.00, unit: 'opakowanie 500g', perKg: 10 },
  'mąka': { price: 4.00, unit: 'opakowanie 1kg', perKg: 4 },
  'quinoa': { price: 15.00, unit: 'opakowanie 250g', perKg: 60 },
  'kuskus': { price: 6.00, unit: 'opakowanie 300g', perKg: 20 },
  
  // Pieczywo
  'chleb': { price: 5.00, unit: 'bochenek' },
  'bułka': { price: 1.00, unit: 'szt' },
  'bułki': { price: 1.00, unit: 'szt' },
  'toast': { price: 6.00, unit: 'opakowanie 500g' },
  'tortilla': { price: 8.00, unit: 'opakowanie 6 szt' },
  'bagietka': { price: 4.00, unit: 'szt' },
  
  // Przyprawy i oleje
  'sól': { price: 2.00, unit: 'opakowanie 1kg' },
  'pieprz': { price: 6.00, unit: 'słoiczek 20g' },
  'oregano': { price: 4.00, unit: 'słoiczek 10g' },
  'bazylia': { price: 4.00, unit: 'słoiczek 10g' },
  'tymianek': { price: 4.00, unit: 'słoiczek 10g' },
  'kurkuma': { price: 5.00, unit: 'słoiczek 20g' },
  'cynamon': { price: 4.00, unit: 'słoiczek 15g' },
  'imbir': { price: 3.00, unit: 'korzeń 50g' },
  'curry': { price: 5.00, unit: 'słoiczek 20g' },
  'papryka słodka': { price: 4.00, unit: 'słoiczek 20g' },
  'oliwa': { price: 25.00, unit: 'butelka 500ml', perKg: 50 },
  'oliwa z oliwek': { price: 25.00, unit: 'butelka 500ml', perKg: 50 },
  'olej': { price: 12.00, unit: 'butelka 1L', perKg: 12 },
  'olej kokosowy': { price: 20.00, unit: 'słoik 500ml' },
  'ocet': { price: 5.00, unit: 'butelka 500ml' },
  'sos sojowy': { price: 8.00, unit: 'butelka 150ml' },
  
  // Słodycze i przekąski
  'miód': { price: 25.00, unit: 'słoik 400g', perKg: 62.50 },
  'cukier': { price: 5.00, unit: 'opakowanie 1kg', perKg: 5 },
  'orzechy': { price: 12.00, unit: 'opakowanie 100g', perKg: 120 },
  'orzechy włoskie': { price: 15.00, unit: 'opakowanie 100g', perKg: 150 },
  'migdały': { price: 15.00, unit: 'opakowanie 100g', perKg: 150 },
  'czekolada': { price: 6.00, unit: 'tabliczka 100g', perKg: 60 },
  'czekolada gorzka': { price: 8.00, unit: 'tabliczka 100g', perKg: 80 },
  'dżem': { price: 8.00, unit: 'słoik 280g', perKg: 28.50 },
  'masło orzechowe': { price: 18.00, unit: 'słoik 350g', perKg: 51 },
  'nutella': { price: 20.00, unit: 'słoik 400g', perKg: 50 },
  'syrop klonowy': { price: 25.00, unit: 'butelka 250ml' },
  'rodzynki': { price: 6.00, unit: 'opakowanie 100g', perKg: 60 },
  'suszone owoce': { price: 10.00, unit: 'opakowanie 100g', perKg: 100 },
  
  // Inne
  'tofu': { price: 10.00, unit: 'opakowanie 200g', perKg: 50 },
  'hummus': { price: 8.00, unit: 'opakowanie 200g', perKg: 40 },
  'pasta': { price: 6.00, unit: 'opakowanie 200g' },
  'sos': { price: 8.00, unit: 'słoik 400g', perKg: 20 },
  'sos pomidorowy': { price: 6.00, unit: 'słoik 400g', perKg: 15 },
  'passata': { price: 5.00, unit: 'butelka 700g', perKg: 7 },
  'koncentrat pomidorowy': { price: 4.00, unit: 'puszka 200g', perKg: 20 },
  'bulion': { price: 3.00, unit: 'opakowanie 60g' },
  'drożdże': { price: 2.00, unit: 'opakowanie 100g' },
  'proszek do pieczenia': { price: 2.00, unit: 'opakowanie 30g' },
  'wanilia': { price: 5.00, unit: 'opakowanie 10g' },
  'kakao': { price: 8.00, unit: 'opakowanie 100g', perKg: 80 },
  'kawa': { price: 25.00, unit: 'opakowanie 250g', perKg: 100 },
  'herbata': { price: 10.00, unit: 'opakowanie 20 szt' },
  'woda': { price: 2.00, unit: 'butelka 1.5L' },
  'sok': { price: 5.00, unit: 'karton 1L' },
  'sok pomarańczowy': { price: 6.00, unit: 'karton 1L' },
};

// Function to estimate price for an ingredient
export const estimateIngredientPrice = (
  ingredientName: string,
  packageCount: number = 1
): number => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Direct match
  if (PRODUCT_PRICES[normalizedName]) {
    return PRODUCT_PRICES[normalizedName].price * packageCount;
  }
  
  // Partial match - find product that contains or is contained in the name
  for (const [productName, priceInfo] of Object.entries(PRODUCT_PRICES)) {
    if (normalizedName.includes(productName) || productName.includes(normalizedName)) {
      return priceInfo.price * packageCount;
    }
  }
  
  // No match - return average estimate
  return 5.00 * packageCount; // Default 5 PLN per unknown item
};

// Function to calculate total shopping list cost
export const calculateShoppingListTotal = (
  ingredients: Array<{
    name: string;
    packageCount?: number;
    amount?: number;
    unit?: string;
  }>
): { total: number; breakdown: Array<{ name: string; price: number }> } => {
  const breakdown: Array<{ name: string; price: number }> = [];
  let total = 0;
  
  for (const ingredient of ingredients) {
    const count = ingredient.packageCount || 1;
    const price = estimateIngredientPrice(ingredient.name, count);
    breakdown.push({ name: ingredient.name, price });
    total += price;
  }
  
  return { total, breakdown };
};
