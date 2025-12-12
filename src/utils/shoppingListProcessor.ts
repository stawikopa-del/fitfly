/**
 * Advanced Shopping List Processor
 * Converts recipe ingredients into practical, purchasable shopping list items
 */

// =====================================================
// KONFIGURACJA OPAKOWAŃ - możliwość nadpisania globalnie
// =====================================================

export interface PackageConfig {
  sizes: number[];           // Dostępne rozmiary opakowań (od najmniejszego)
  unit: string;              // Jednostka (g, ml, szt)
  packageName: string;       // Nazwa opakowania
  weightPerPiece?: number;   // Średnia waga sztuki (dla konwersji g->szt)
  defaultSize?: number;      // Domyślny rozmiar opakowania
}

export const PACKAGE_CONFIGURATIONS: Record<string, PackageConfig> = {
  // === JAJKA ===
  'jajko': { sizes: [6, 10, 12], unit: 'szt', packageName: 'opakowanie', weightPerPiece: 50 },
  'jajka': { sizes: [6, 10, 12], unit: 'szt', packageName: 'opakowanie', weightPerPiece: 50 },
  
  // === NABIAŁ ===
  'masło': { sizes: [200, 250], unit: 'g', packageName: 'kostka', defaultSize: 200 },
  'mleko': { sizes: [500, 1000], unit: 'ml', packageName: 'karton', defaultSize: 1000 },
  'śmietana': { sizes: [200, 400], unit: 'ml', packageName: 'kubek', defaultSize: 200 },
  'śmietanka': { sizes: [200, 500], unit: 'ml', packageName: 'kubek', defaultSize: 200 },
  'jogurt': { sizes: [150, 200, 400], unit: 'g', packageName: 'kubek', defaultSize: 150 },
  'kefir': { sizes: [400, 1000], unit: 'ml', packageName: 'butelka', defaultSize: 400 },
  'twaróg': { sizes: [200, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 200 },
  'ser żółty': { sizes: [150, 250, 400], unit: 'g', packageName: 'opakowanie', defaultSize: 150 },
  'ser biały': { sizes: [200, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 200 },
  'ser': { sizes: [150, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 150 },
  'mozzarella': { sizes: [125, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 125 },
  'feta': { sizes: [150, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 150 },
  'parmezan': { sizes: [100, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  
  // === MIĘSO I RYBY ===
  'pierś z kurczaka': { sizes: [400, 500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'pierś': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'udko z kurczaka': { sizes: [500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'kurczak': { sizes: [500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'indyk': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'wołowina': { sizes: [400, 500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'wieprzowina': { sizes: [400, 500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'mięso mielone': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'łosoś': { sizes: [200, 300, 400], unit: 'g', packageName: 'filet', defaultSize: 200 },
  'dorsz': { sizes: [200, 300, 400], unit: 'g', packageName: 'filet', defaultSize: 200 },
  'tuńczyk': { sizes: [170, 185], unit: 'g', packageName: 'puszka', defaultSize: 170 },
  'szynka': { sizes: [100, 150, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'boczek': { sizes: [150, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 150 },
  'kiełbasa': { sizes: [300, 400], unit: 'g', packageName: 'sztuka', defaultSize: 300 },
  'krewetki': { sizes: [200, 400], unit: 'g', packageName: 'opakowanie', defaultSize: 200 },
  
  // === PIECZYWO ===
  'chleb': { sizes: [1], unit: 'szt', packageName: 'bochenek' },
  'bułka': { sizes: [1], unit: 'szt', packageName: 'sztuka' },
  'toast': { sizes: [500], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'tortilla': { sizes: [6, 8], unit: 'szt', packageName: 'opakowanie', defaultSize: 6 },
  
  // === ZBOŻA I MAKARONY ===
  'mąka': { sizes: [1000, 2000], unit: 'g', packageName: 'opakowanie', defaultSize: 1000 },
  'mąka pszenna': { sizes: [1000, 2000], unit: 'g', packageName: 'opakowanie', defaultSize: 1000 },
  'ryż': { sizes: [500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 1000 },
  'makaron': { sizes: [500], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'kasza': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'kasza gryczana': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'kasza jaglana': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'płatki owsiane': { sizes: [500, 1000], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'płatki': { sizes: [500], unit: 'g', packageName: 'opakowanie', defaultSize: 500 },
  'quinoa': { sizes: [250, 400], unit: 'g', packageName: 'opakowanie', defaultSize: 250 },
  'kuskus': { sizes: [250, 400], unit: 'g', packageName: 'opakowanie', defaultSize: 250 },
  
  // === WARZYWA (szt) ===
  'marchew': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 100 },
  'cebula': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 120 },
  'czosnek': { sizes: [1], unit: 'szt', packageName: 'główka', weightPerPiece: 40 },
  'ząbek czosnku': { sizes: [1], unit: 'szt', packageName: 'ząbek', weightPerPiece: 5 },
  'pomidor': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 150 },
  'ogórek': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 200 },
  'ogórek kiszony': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 100 },
  'papryka': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 180 },
  'brokuł': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 400 },
  'kalafior': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 600 },
  'sałata': { sizes: [1], unit: 'szt', packageName: 'główka', weightPerPiece: 200 },
  'kapusta': { sizes: [1], unit: 'szt', packageName: 'główka', weightPerPiece: 1500 },
  'por': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 150 },
  'seler': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 300 },
  'burak': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 200 },
  'cukinia': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 300 },
  'bakłażan': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 350 },
  'awokado': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 200 },
  'ziemniak': { sizes: [1000, 2000], unit: 'g', packageName: 'kg', weightPerPiece: 150 },
  'ziemniaki': { sizes: [1000, 2000], unit: 'g', packageName: 'kg', weightPerPiece: 150 },
  
  // === WARZYWA (opakowanie) ===
  'szpinak': { sizes: [150, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 150 },
  'rukola': { sizes: [100, 150], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'roszponka': { sizes: [100, 150], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'pomidory suszone': { sizes: [150, 200], unit: 'g', packageName: 'słoik', defaultSize: 200 },
  'koncentrat pomidorowy': { sizes: [70, 200], unit: 'g', packageName: 'puszka', defaultSize: 70 },
  'passata': { sizes: [500, 700], unit: 'ml', packageName: 'butelka', defaultSize: 500 },
  'pomidory krojone': { sizes: [400], unit: 'g', packageName: 'puszka', defaultSize: 400 },
  'pietruszka': { sizes: [1], unit: 'pęczek', packageName: 'pęczek' },
  'szczypiorek': { sizes: [1], unit: 'pęczek', packageName: 'pęczek' },
  'koperek': { sizes: [1], unit: 'pęczek', packageName: 'pęczek' },
  'bazylia': { sizes: [1], unit: 'doniczka', packageName: 'doniczka' },
  
  // === OWOCE ===
  'jabłko': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 180 },
  'banan': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 120 },
  'pomarańcza': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 200 },
  'cytryna': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 80 },
  'grejpfrut': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 300 },
  'kiwi': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 80 },
  'mango': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 300 },
  'ananas': { sizes: [1], unit: 'szt', packageName: 'sztuka', weightPerPiece: 1500 },
  'truskawki': { sizes: [250, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 250 },
  'maliny': { sizes: [125, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 125 },
  'borówki': { sizes: [125, 250], unit: 'g', packageName: 'opakowanie', defaultSize: 125 },
  'jagody': { sizes: [125], unit: 'g', packageName: 'opakowanie', defaultSize: 125 },
  'winogrona': { sizes: [500], unit: 'g', packageName: 'kiść', defaultSize: 500 },
  
  // === PRZYPRAWY ===
  'sól': { sizes: [1000], unit: 'g', packageName: 'opakowanie', defaultSize: 1000 },
  'pieprz': { sizes: [20, 50], unit: 'g', packageName: 'słoiczek', defaultSize: 20 },
  'oregano': { sizes: [10, 20], unit: 'g', packageName: 'słoiczek', defaultSize: 10 },
  'bazylia suszona': { sizes: [10, 20], unit: 'g', packageName: 'słoiczek', defaultSize: 10 },
  'tymianek': { sizes: [10, 20], unit: 'g', packageName: 'słoiczek', defaultSize: 10 },
  'kurkuma': { sizes: [20, 40], unit: 'g', packageName: 'słoiczek', defaultSize: 20 },
  'curry': { sizes: [20, 40], unit: 'g', packageName: 'słoiczek', defaultSize: 20 },
  'papryka słodka': { sizes: [20, 50], unit: 'g', packageName: 'słoiczek', defaultSize: 20 },
  'cynamon': { sizes: [15, 30], unit: 'g', packageName: 'słoiczek', defaultSize: 15 },
  'imbir': { sizes: [1], unit: 'szt', packageName: 'korzeń', weightPerPiece: 50 },
  
  // === OLEJE I PŁYNY ===
  'oliwa': { sizes: [500, 750, 1000], unit: 'ml', packageName: 'butelka', defaultSize: 500 },
  'oliwa z oliwek': { sizes: [500, 750, 1000], unit: 'ml', packageName: 'butelka', defaultSize: 500 },
  'olej': { sizes: [1000], unit: 'ml', packageName: 'butelka', defaultSize: 1000 },
  'olej rzepakowy': { sizes: [1000], unit: 'ml', packageName: 'butelka', defaultSize: 1000 },
  'olej kokosowy': { sizes: [200, 500], unit: 'ml', packageName: 'słoik', defaultSize: 200 },
  'ocet': { sizes: [500], unit: 'ml', packageName: 'butelka', defaultSize: 500 },
  'ocet balsamiczny': { sizes: [250, 500], unit: 'ml', packageName: 'butelka', defaultSize: 250 },
  'sos sojowy': { sizes: [150, 250], unit: 'ml', packageName: 'butelka', defaultSize: 150 },
  'mleko kokosowe': { sizes: [400], unit: 'ml', packageName: 'puszka', defaultSize: 400 },
  
  // === SŁODYCZE I PRZEKĄSKI ===
  'cukier': { sizes: [1000], unit: 'g', packageName: 'opakowanie', defaultSize: 1000 },
  'cukier puder': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
  'miód': { sizes: [350, 400], unit: 'g', packageName: 'słoik', defaultSize: 400 },
  'dżem': { sizes: [280, 350], unit: 'g', packageName: 'słoik', defaultSize: 280 },
  'czekolada': { sizes: [100], unit: 'g', packageName: 'tabliczka', defaultSize: 100 },
  'czekolada gorzka': { sizes: [100], unit: 'g', packageName: 'tabliczka', defaultSize: 100 },
  'orzechy': { sizes: [100, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'orzechy włoskie': { sizes: [100, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'migdały': { sizes: [100, 200], unit: 'g', packageName: 'opakowanie', defaultSize: 100 },
  'masło orzechowe': { sizes: [350, 500], unit: 'g', packageName: 'słoik', defaultSize: 350 },
  
  // === INNE ===
  'tofu': { sizes: [200, 400], unit: 'g', packageName: 'opakowanie', defaultSize: 200 },
  'hummus': { sizes: [200], unit: 'g', packageName: 'opakowanie', defaultSize: 200 },
  'proszek do pieczenia': { sizes: [18, 30], unit: 'g', packageName: 'saszetka', defaultSize: 18 },
  'drożdże': { sizes: [7, 42], unit: 'g', packageName: 'opakowanie', defaultSize: 7 },
  'żelatyna': { sizes: [20], unit: 'g', packageName: 'opakowanie', defaultSize: 20 },
  'bulion': { sizes: [60, 180], unit: 'g', packageName: 'opakowanie', defaultSize: 60 },
  'fasola': { sizes: [400], unit: 'g', packageName: 'puszka', defaultSize: 400 },
  'ciecierzyca': { sizes: [400], unit: 'g', packageName: 'puszka', defaultSize: 400 },
  'soczewica': { sizes: [400, 500], unit: 'g', packageName: 'opakowanie', defaultSize: 400 },
};

// =====================================================
// NORMALIZACJA NAZW - rozszerzony słownik
// =====================================================

const NAME_EXPANSIONS: Record<string, string> = {
  // Mięso - ogólne -> konkretne
  'pierś': 'pierś z kurczaka (bez kości, bez skóry)',
  'filet': 'filet z kurczaka (bez kości)',
  'mięso': 'mięso wieprzowe',
  'mięso mielone': 'mięso mielone wieprzowo-wołowe',
  'ryba': 'filet z dorsza',
  'łosoś': 'filet z łososia',
  'tuńczyk': 'tuńczyk w sosie własnym (puszka)',
  
  // Nabiał - ogólne -> konkretne
  'ser': 'ser żółty (plastry)',
  'twaróg': 'twaróg półtłusty',
  'jogurt': 'jogurt naturalny',
  'śmietana': 'śmietana 18%',
  'śmietanka': 'śmietanka 30%',
  'kefir': 'kefir 2%',
  
  // Zboża
  'mąka': 'mąka pszenna typ 500',
  'kasza': 'kasza gryczana',
  'ryż': 'ryż biały długoziarnisty',
  'makaron': 'makaron spaghetti',
  'płatki': 'płatki owsiane górskie',
  
  // Przyprawy
  'oliwa': 'oliwa z oliwek extra virgin',
  'olej': 'olej rzepakowy',
  'ocet': 'ocet winny biały',
};

// =====================================================
// SŁOWNIK PRAWDZIWYCH PRODUKTÓW SPOŻYWCZYCH
// Tylko te słowa mogą być dodane do listy zakupów
// =====================================================

const VALID_FOOD_PRODUCTS = new Set([
  // === NABIAŁ ===
  'jajko', 'jajka', 'mleko', 'masło', 'ser', 'ser żółty', 'ser biały', 'ser feta', 'ser mozzarella',
  'ser parmezan', 'ser ricotta', 'ser mascarpone', 'ser gorgonzola', 'ser camembert', 'ser brie',
  'twaróg', 'twaróg chudy', 'twaróg półtłusty', 'jogurt', 'jogurt naturalny', 'jogurt grecki',
  'śmietana', 'śmietanka', 'kefir', 'maślanka', 'serek wiejski', 'serek homogenizowany',
  
  // === MIĘSO ===
  'kurczak', 'pierś z kurczaka', 'udko z kurczaka', 'skrzydełka', 'podudzie',
  'indyk', 'pierś z indyka', 'wołowina', 'antrykot', 'rostbef', 'befsztyk',
  'wieprzowina', 'schab', 'karkówka', 'boczek', 'żeberka', 'golonka',
  'mięso mielone', 'mięso mielone wołowe', 'mięso mielone wieprzowe', 'mięso mielone drobiowe',
  'szynka', 'kiełbasa', 'parówki', 'kabanosy', 'salami', 'mortadela',
  'wędlina', 'polędwica', 'baleron',
  
  // === RYBY I OWOCE MORZA ===
  'łosoś', 'filet z łososia', 'dorsz', 'filet z dorsza', 'tuńczyk', 'makrela', 'śledź',
  'pstrąg', 'tilapia', 'morszczuk', 'halibut', 'sandacz', 'karp', 'szczupak',
  'krewetki', 'małże', 'ośmiornica', 'kalmary', 'przegrzebki',
  
  // === WARZYWA ===
  'marchew', 'marchewka', 'cebula', 'czosnek', 'pomidor', 'pomidory', 'ogórek', 'ogórki',
  'ogórek kiszony', 'ogórki kiszone', 'papryka', 'brokuł', 'brokuły', 'kalafior',
  'szpinak', 'sałata', 'kapusta', 'kapusta pekińska', 'kapusta kiszona',
  'ziemniaki', 'ziemniak', 'bataty', 'cukinia', 'bakłażan', 'dynia',
  'por', 'seler', 'seler naciowy', 'burak', 'buraki', 'rzodkiewka',
  'pietruszka', 'szczypiorek', 'koperek', 'rukola', 'roszponka',
  'awokado', 'kukurydza', 'groszek', 'fasola', 'fasola szparagowa',
  'szparagi', 'karczoch', 'fenkuł', 'jarmuż', 'botwina',
  'pomidory koktajlowe', 'pomidory suszone', 'koncentrat pomidorowy', 'passata',
  
  // === OWOCE ===
  'jabłko', 'jabłka', 'banan', 'banany', 'pomarańcza', 'pomarańcze',
  'cytryna', 'cytryny', 'limonka', 'grejpfrut', 'mandarynka',
  'kiwi', 'mango', 'ananas', 'arbuz', 'melon', 'gruszka',
  'śliwka', 'brzoskwinia', 'nektarynka', 'morela', 'wiśnia', 'czereśnia',
  'truskawki', 'maliny', 'borówki', 'jagody', 'jeżyny', 'porzeczki',
  'winogrona', 'figi', 'daktyle', 'rodzynki', 'żurawina', 'granat',
  
  // === PIECZYWO ===
  'chleb', 'chleb pszenny', 'chleb żytni', 'chleb razowy', 'chleb graham',
  'bułka', 'bułki', 'bagietka', 'rogal', 'croissant', 'toast', 'tosty',
  'tortilla', 'pita', 'bułka tarta', 'chałka',
  
  // === ZBOŻA I MAKARONY ===
  'ryż', 'ryż biały', 'ryż brązowy', 'ryż basmati', 'ryż jaśminowy',
  'makaron', 'makaron spaghetti', 'makaron penne', 'makaron fusilli', 'makaron tagliatelle',
  'kasza', 'kasza gryczana', 'kasza jaglana', 'kasza jęczmienna', 'kasza kuskus',
  'mąka', 'mąka pszenna', 'mąka żytnia', 'mąka orkiszowa',
  'płatki owsiane', 'płatki', 'owsianka', 'musli', 'granola',
  'quinoa', 'bulgur', 'amarantus', 'kuskus',
  
  // === PRZYPRAWY I ZIOŁA ===
  'sól', 'pieprz', 'papryka słodka', 'papryka ostra', 'kurkuma', 'curry', 'chili',
  'oregano', 'bazylia', 'tymianek', 'rozmaryn', 'majeranek', 'lubczyk', 'estragon',
  'cynamon', 'gałka muszkatołowa', 'imbir', 'goździki', 'anyż', 'kardamon',
  'kminek', 'kolendra', 'koperek', 'natka pietruszki',
  'liść laurowy', 'ziele angielskie',
  
  // === OLEJE I TŁUSZCZE ===
  'oliwa', 'oliwa z oliwek', 'olej', 'olej rzepakowy', 'olej słonecznikowy', 'olej kokosowy',
  'olej lniany', 'smalec', 'masło klarowane',
  
  // === OCTY I SOSY ===
  'ocet', 'ocet balsamiczny', 'ocet jabłkowy', 'ocet winny',
  'sos sojowy', 'sos worcester', 'sos teriyaki', 'sos sriracha', 'sos tabasco',
  'ketchup', 'musztarda', 'majonez', 'sos tatarski',
  
  // === SŁODYCZE I PRZEKĄSKI ===
  'cukier', 'cukier puder', 'cukier trzcinowy', 'miód', 'syrop klonowy',
  'dżem', 'marmolada', 'nutella', 'krem czekoladowy',
  'czekolada', 'czekolada gorzka', 'czekolada mleczna', 'czekolada biała',
  'kakao', 'kawa', 'herbata',
  
  // === ORZECHY I NASIONA ===
  'orzechy', 'orzechy włoskie', 'orzechy laskowe', 'orzechy nerkowca', 'migdały',
  'orzechy ziemne', 'orzeszki ziemne', 'pistacje', 'orzechy pekan', 'orzechy brazylijskie',
  'masło orzechowe', 'tahini', 'sezam', 'siemię lniane', 'nasiona chia',
  'pestki dyni', 'pestki słonecznika', 'kokos', 'wiórki kokosowe',
  
  // === ROŚLINY STRĄCZKOWE ===
  'ciecierzyca', 'soczewica', 'soczewica czerwona', 'fasola biała', 'fasola czerwona',
  'fasola czarna', 'groch', 'bób', 'edamame',
  
  // === PRODUKTY GOTOWE ===
  'tofu', 'tempeh', 'hummus', 'pesto', 'bulion', 'rosół', 'kostka rosołowa',
  'mleko kokosowe', 'śmietanka kokosowa', 'pasta curry',
  
  // === PRZETWORY ===
  'pomidory w puszce', 'groszek w puszce', 'kukurydza w puszce',
  'tuńczyk w puszce', 'sardynki', 'szprotki',
  
  // === NAPOJE ===
  'woda', 'sok', 'sok pomarańczowy', 'sok jabłkowy', 'kompot',
  
  // === PRODUKTY DO PIECZENIA ===
  'proszek do pieczenia', 'soda oczyszczona', 'drożdże', 'drożdże suche',
  'żelatyna', 'wanilia', 'ekstrakt waniliowy', 'aromat',
  'skrobia', 'skrobia ziemniaczana', 'budyń',
]);

// Słowa CAŁKOWICIE wykluczane (nie produkty)
const EXCLUDED_TOKENS = new Set([
  // === JEDNOSTKI MIAR (NIE PRODUKTY) ===
  'kubek', 'kubki', 'kubków', 'kubka',
  'łyżka', 'łyżki', 'łyżek', 'łyżką', 'łyżeczka', 'łyżeczki', 'łyżeczek',
  'szklanka', 'szklanki', 'szklanek', 'szklanką',
  'garść', 'garści', 'garścią',
  'szczypta', 'szczypt', 'szczyptą',
  'plasterek', 'plasterki', 'plasterków', 'plasterkami',
  'kawałek', 'kawałki', 'kawałków', 'kawałkami',
  'porcja', 'porcji', 'porcje', 'porcją',
  'kromka', 'kromki', 'kromek', 'kromką', 'kromkami',
  'kostka', 'kostki', 'kostek', 'kostką',
  
  // === LICZEBNIKI I ILOŚCI ===
  'dwie', 'dwóch', 'dwoma', 'dwa', 'trzy', 'trzech', 'trzema', 'cztery', 'pięć',
  'jeden', 'jedna', 'jedno', 'jedną', 'jednego',
  'kilka', 'kilku', 'wiele', 'wielu', 'parę', 'paru',
  'ilość', 'ilości', 'ilością',
  'połowa', 'połowy', 'połówka', 'ćwierć',
  
  // === PRZYMIOTNIKI I PRZYSŁÓWKI ===
  'świeży', 'świeża', 'świeże', 'świeżych', 'świeżo',
  'ciepły', 'ciepła', 'ciepłe', 'ciepłych',
  'zimny', 'zimna', 'zimne', 'zimnych',
  'gorący', 'gorąca', 'gorące',
  'surowy', 'surowa', 'surowe',
  'drobno', 'grubo', 'cienko', 'grubą',
  'duży', 'duża', 'duże', 'dużych', 'duży',
  'mały', 'mała', 'małe', 'małych',
  'średni', 'średnia', 'średnie',
  'biały', 'biała', 'białe', 'białym', 'białego',
  'czarny', 'czarna', 'czarne', 'czarnym',
  'żółty', 'żółta', 'żółte', 'żółtym',
  'zielony', 'zielona', 'zielone', 'zielonym',
  'czerwony', 'czerwona', 'czerwone', 'czerwonym',
  'chudy', 'chuda', 'chude', 'chudym', 'chudego',
  'tłusty', 'tłusta', 'tłuste', 'tłustym',
  'klasyczny', 'klasyczna', 'klasyczne', 'klasycznym',
  'domowy', 'domowa', 'domowe', 'domowym',
  'naturalny', 'naturalna', 'naturalne', 'naturalnym',
  
  // === CZASOWNIKI I FORMY ODCZASOWNIKOWE ===
  'gotowany', 'gotowana', 'gotowanych', 'gotowanym', 'ugotowany', 'ugotowana',
  'smażony', 'smażona', 'smażonych', 'smażonym', 'usmażony', 'usmażona',
  'pieczony', 'pieczona', 'pieczonych', 'pieczonym', 'upieczony', 'upieczona',
  'grillowany', 'grillowana', 'grillowanych', 'grillowanym',
  'duszony', 'duszona', 'duszonych', 'duszoną', 'duszonym',
  'pokrojony', 'pokrojona', 'pokrojonych', 'pokrojoną',
  'posiekany', 'posiekana', 'posiekanych', 'posiekaną',
  'starty', 'starta', 'startych', 'startym', 'starty',
  'mielony', 'mielona', 'mielonych', 'mielonego', 'mielonym',
  'podany', 'podana', 'podanych', 'podaną',
  'przygotowany', 'przygotowana', 'przygotowanych',
  'marynowany', 'marynowana', 'marynowanych',
  'blanszowany', 'blanszowana',
  'wędzony', 'wędzona', 'wędzonych', 'wędzoną',
  
  // === PRZYIMKI I SPÓJNIKI ===
  'na', 'do', 'z', 'ze', 'w', 'we', 'po', 'od', 'dla', 'bez', 'przy', 'za', 'pod', 'nad',
  'oraz', 'lub', 'albo', 'i', 'a', 'też', 'także', 'również',
  
  // === SŁOWA OPISOWE ===
  'smaku', 'smak', 'smakiem',
  'potrzeby', 'potrzeba', 'potrzebny',
  'życzeniu', 'życzenie',
  'opcjonalnie', 'ewentualnie', 'dodatkowo',
  'dekoracji', 'dekoracja', 'posypania', 'polania',
  'podania', 'podanie',
  'sposób', 'sposobe', 'sposobem',
  'bazie', 'baza', 'bazą', 'podstawie',
  'dodatek', 'dodatkiem', 'dodatku',
  'itp', 'itd', 'etc', 'np',
  
  // === NAZWY POTRAW (NIE PRODUKTY) ===
  'kanapka', 'kanapki', 'kanapek', 'kanapką',
  'zupa', 'zupy', 'zupą',
  'sałatka', 'sałatki', 'sałatkę', 'sałatką',
  'danie', 'dania', 'dań',
  'potrawa', 'potrawy', 'potrawą',
  'śniadanie', 'obiad', 'kolacja', 'przekąska', 'posiłek',
  'deser', 'desery',
  
  // === LITERÓWKI I BŁĘDY ===
  'mielontm', 'kalorie', 'kcal', 'białko', 'węglowodany', 'tłuszcze',
  'gram', 'gramy', 'gramów', 'litr', 'litry', 'litrów',
  
  // === AKCESORIA KUCHENNE ===
  'miska', 'garnek', 'patelnia', 'blender', 'mikser',
  'deska', 'nóż', 'widelec', 'talerz', 'rondel',
  'piekarnik', 'kuchenka', 'lodówka',
  
  // === INNE NIEDOZWOLONE ===
  'wodzie', 'wody', 'wodą',  // "na wodzie" - nie produkt
  'ogniu', 'ognia',
  'parze', 'pary', 'parą',
  'minute', 'minut', 'minuty', 'minutę',
  'godziny', 'godzin', 'godzinę',
]);

// Złożone wyrażenia produktowe (przymiotnik + rzeczownik = pełny produkt)
const COMPOUND_PRODUCTS: Record<string, string> = {
  'ogórki kiszone': 'ogórki kiszone',
  'ogórek kiszony': 'ogórek kiszony',
  'kiszone ogórki': 'ogórki kiszone',
  'kapusta kiszona': 'kapusta kiszona',
  'kiszona kapusta': 'kapusta kiszona',
  'twaróg chudy': 'twaróg chudy',
  'chudy twaróg': 'twaróg chudy',
  'pierś drobiowa': 'pierś z kurczaka',
  'drobiowa pierś': 'pierś z kurczaka',
  'pierś kurczaka': 'pierś z kurczaka',
  'mięso mielone': 'mięso mielone',
  'mielone mięso': 'mięso mielone',
  'ser żółty': 'ser żółty',
  'żółty ser': 'ser żółty',
  'ser biały': 'ser biały',
  'biały ser': 'ser biały',
  'masło orzechowe': 'masło orzechowe',
  'orzechowe masło': 'masło orzechowe',
  'płatki owsiane': 'płatki owsiane',
  'owsiane płatki': 'płatki owsiane',
  'oliwa oliwek': 'oliwa z oliwek',
  'pomidory suszone': 'pomidory suszone',
  'suszone pomidory': 'pomidory suszone',
  'mleko kokosowe': 'mleko kokosowe',
  'kokosowe mleko': 'mleko kokosowe',
  'czekolada gorzka': 'czekolada gorzka',
  'gorzka czekolada': 'czekolada gorzka',
  'ryż brązowy': 'ryż brązowy',
  'brązowy ryż': 'ryż brązowy',
  'kasza gryczana': 'kasza gryczana',
  'gryczana kasza': 'kasza gryczana',
  'fasola szparagowa': 'fasola szparagowa',
  'szparagowa fasola': 'fasola szparagowa',
};

// Formy gramatyczne -> forma podstawowa produktu
const POLISH_LEMMAS: Record<string, string> = {
  // Jajka
  'jajkiem': 'jajko', 'jajka': 'jajka', 'jajek': 'jajka', 
  'jajkami': 'jajka', 'jaj': 'jajka', 'jajo': 'jajko',
  
  // Nabiał
  'mlekiem': 'mleko', 'mleka': 'mleko', 'mleku': 'mleko',
  'masłem': 'masło', 'masła': 'masło', 'maśle': 'masło',
  'serem': 'ser', 'sera': 'ser', 'serze': 'ser', 'serami': 'ser',
  'śmietaną': 'śmietana', 'śmietany': 'śmietana', 'śmietanie': 'śmietana',
  'śmietanką': 'śmietanka', 'śmietanki': 'śmietanka',
  'jogurtem': 'jogurt', 'jogurtu': 'jogurt', 'jogurtami': 'jogurt',
  'twarogiem': 'twaróg', 'twarogu': 'twaróg',
  'kefirem': 'kefir', 'kefiru': 'kefir',
  
  // Mięso
  'kurczakiem': 'kurczak', 'kurczaka': 'kurczak',
  'piersią': 'pierś z kurczaka', 'piersi': 'pierś z kurczaka',
  'filetem': 'filet', 'fileta': 'filet', 'filety': 'filet',
  'indykiem': 'indyk', 'indyka': 'indyk',
  'wołowiną': 'wołowina', 'wołowiny': 'wołowina',
  'wieprzowiną': 'wieprzowina', 'wieprzowiny': 'wieprzowina',
  'łososiem': 'łosoś', 'łososia': 'łosoś',
  'tuńczykiem': 'tuńczyk', 'tuńczyka': 'tuńczyk',
  'krewetkami': 'krewetki', 'krewetkę': 'krewetki', 'krewetek': 'krewetki',
  'szynką': 'szynka', 'szynki': 'szynka',
  'boczkiem': 'boczek', 'boczku': 'boczek',
  'kiełbasą': 'kiełbasa', 'kiełbasy': 'kiełbasa',
  'mięsem': 'mięso', 'mięsa': 'mięso',
  'mielonego': 'mięso mielone', 'mielonym': 'mięso mielone',
  
  // Warzywa
  'marchewką': 'marchew', 'marchwi': 'marchew', 'marchewki': 'marchew',
  'cebulą': 'cebula', 'cebuli': 'cebula', 'cebulę': 'cebula',
  'czosnkiem': 'czosnek', 'czosnku': 'czosnek', 'ząbki': 'czosnek', 'ząbek': 'czosnek',
  'pomidorem': 'pomidor', 'pomidora': 'pomidor', 'pomidorów': 'pomidory',
  'ogórkiem': 'ogórek', 'ogórka': 'ogórek', 'ogórków': 'ogórki',
  'papryką': 'papryka', 'papryki': 'papryka', 'papryce': 'papryka',
  'brokułem': 'brokuł', 'brokułami': 'brokuły', 'brokułów': 'brokuły',
  'szpinakiem': 'szpinak', 'szpinaku': 'szpinak',
  'sałatą': 'sałata', 'sałaty': 'sałata', 'sałacie': 'sałata',
  'kapustą': 'kapusta', 'kapusty': 'kapusta', 'kapuście': 'kapusta',
  'ziemniakami': 'ziemniaki', 'ziemniaków': 'ziemniaki',
  'cukinią': 'cukinia', 'cukinii': 'cukinia',
  'bakłażanem': 'bakłażan', 'bakłażana': 'bakłażan',
  'kalafiorem': 'kalafior', 'kalafiora': 'kalafior',
  'porem': 'por', 'pora': 'por',
  'selerem': 'seler', 'selera': 'seler',
  'burakiem': 'burak', 'buraka': 'burak', 'burakami': 'buraki',
  'awokado': 'awokado',
  'pietruszkę': 'pietruszka', 'pietruszki': 'pietruszka', 'pietruszką': 'pietruszka',
  'szczypiorkiem': 'szczypiorek', 'szczypiorku': 'szczypiorek',
  'rukolą': 'rukola', 'rukoli': 'rukola',
  
  // Owoce
  'jabłkiem': 'jabłko', 'jabłka': 'jabłka', 'jabłek': 'jabłka',
  'bananem': 'banan', 'banana': 'banan', 'bananów': 'banany',
  'pomarańczą': 'pomarańcza', 'pomarańczy': 'pomarańcze',
  'cytryną': 'cytryna', 'cytryny': 'cytryny',
  'truskawkami': 'truskawki', 'truskawek': 'truskawki',
  'malinami': 'maliny', 'malin': 'maliny',
  'jagodami': 'jagody', 'jagód': 'jagody',
  'borówkami': 'borówki', 'borówek': 'borówki',
  'winogronami': 'winogrona', 'winogron': 'winogrona',
  
  // Zboża
  'ryżem': 'ryż', 'ryżu': 'ryż',
  'makaronem': 'makaron', 'makaronu': 'makaron',
  'kaszą': 'kasza', 'kaszy': 'kasza',
  'mąką': 'mąka', 'mąki': 'mąka',
  'płatkami': 'płatki owsiane', 'płatków': 'płatki owsiane',
  'chlebem': 'chleb', 'chleba': 'chleb',
  'bułką': 'bułka', 'bułki': 'bułki', 'bułek': 'bułki',
  
  // Przyprawy
  'solą': 'sól', 'soli': 'sól',
  'pieprzem': 'pieprz', 'pieprzu': 'pieprz',
  'bazylią': 'bazylia', 'bazylii': 'bazylia',
  'oregano': 'oregano',
  'tymiankiem': 'tymianek', 'tymianku': 'tymianek',
  'kurkumą': 'kurkuma', 'kurkumy': 'kurkuma',
  'curry': 'curry',
  'cynamonem': 'cynamon', 'cynamonu': 'cynamon',
  'imbirem': 'imbir', 'imbiru': 'imbir',
  'oliwą': 'oliwa z oliwek', 'oliwy': 'oliwa z oliwek',
  'olejem': 'olej', 'oleju': 'olej',
  'octem': 'ocet', 'octu': 'ocet',
  'miodem': 'miód', 'miodu': 'miód',
  'cukrem': 'cukier', 'cukru': 'cukier',
  
  // Inne
  'orzechami': 'orzechy', 'orzechów': 'orzechy', 'orzeszkami': 'orzechy',
  'migdałami': 'migdały', 'migdałów': 'migdały',
  'czekoladą': 'czekolada', 'czekolady': 'czekolada',
  'dżemem': 'dżem', 'dżemu': 'dżem',
  'hummusem': 'hummus', 'hummusu': 'hummus',
  'tofu': 'tofu',
  'sosem': 'sos sojowy', 'sosu': 'sos sojowy',
  'pastą': 'pasta', 'pasty': 'pasta',
};

// =====================================================
// KONWERSJE JEDNOSTEK
// =====================================================

interface UnitConversion {
  amount: number;
  unit: 'g' | 'ml' | 'szt';
}

const UNIT_TO_GRAMS: Record<string, number> = {
  'kg': 1000,
  'dag': 10,
  'g': 1,
  'l': 1000,  // ml dla płynów
  'ml': 1,
  'łyżka': 15,
  'łyżki': 15,
  'łyżek': 15,
  'łyżeczka': 5,
  'łyżeczki': 5,
  'szklanka': 250,
  'szklanki': 250,
  'kubek': 250,
  'kubki': 250,
  'garść': 30,
  'garści': 30,
  'szczypta': 1,
  'szczypt': 1,
  'kostka': 200, // masło
  'kostek': 200,
  'kostki': 200,
  'plaster': 20,
  'plastry': 20,
  'plasterek': 20,
  'plasterki': 20,
};

function parseQuantity(text: string): UnitConversion | null {
  // Wzorce: "100g", "1.5 kg", "2 łyżki", "1/2 kostki", "500ml"
  const patterns = [
    // Liczba + jednostka
    /(\d+[,.]?\d*)\s*(kg|dag|g|ml|l|szt|sztuk|sztuki)\b/gi,
    // Ułamek + jednostka
    /(\d+)\/(\d+)\s*(kostki?|łyżk[aei]?|szklan[kia]?|garść|garści|szt|sztuk)/gi,
    // Słowne: "pół kostki", "ćwierć"
    /(pół|połowa|ćwierć)\s*(kostki?|łyżk[aei]?|szklan[kia]?)/gi,
    // Liczba + łyżka/szklanka
    /(\d+[,.]?\d*)\s*(łyżk[aei]?|łyżeczk[aei]?|szklan[kia]?|kubk[aóię]?|garść|garści|kostek|kostki)/gi,
  ];
  
  // Próbuj liczba + jednostka
  const match1 = text.match(/(\d+[,.]?\d*)\s*(kg|dag|g|ml|l|szt|sztuk|sztuki)\b/i);
  if (match1) {
    const value = parseFloat(match1[1].replace(',', '.'));
    const unit = match1[2].toLowerCase();
    const multiplier = UNIT_TO_GRAMS[unit] || 1;
    const isLiquid = ['ml', 'l'].includes(unit);
    return { amount: value * multiplier, unit: isLiquid ? 'ml' : 'g' };
  }
  
  // Ułamek: "1/2", "1/4"
  const match2 = text.match(/(\d+)\/(\d+)\s*(kostek|kostki|kostka|łyżk|szklan)?/i);
  if (match2) {
    const fraction = parseInt(match2[1]) / parseInt(match2[2]);
    const unitPart = (match2[3] || '').toLowerCase();
    const multiplier = UNIT_TO_GRAMS[unitPart] || UNIT_TO_GRAMS['kostka'] || 200;
    return { amount: fraction * multiplier, unit: 'g' };
  }
  
  // Słowne ułamki
  if (/pół|połowa/i.test(text)) {
    const hasKostka = /kostk/i.test(text);
    return { amount: hasKostka ? 100 : 125, unit: 'g' };
  }
  if (/ćwierć/i.test(text)) {
    return { amount: 50, unit: 'g' };
  }
  
  // Łyżki, szklanki
  const match3 = text.match(/(\d+[,.]?\d*)\s*(łyżk[aei]?|łyżeczk[aei]?|szklan[kia]?|kubk[aóię]?|garść|garści|kostek|kostki)/i);
  if (match3) {
    const value = parseFloat(match3[1].replace(',', '.'));
    const unit = match3[2].toLowerCase();
    let multiplier = 15; // domyślnie łyżka
    if (/łyżeczk/i.test(unit)) multiplier = 5;
    if (/szklan|kubk/i.test(unit)) multiplier = 250;
    if (/garść/i.test(unit)) multiplier = 30;
    if (/kostek|kostki/i.test(unit)) multiplier = 200;
    return { amount: value * multiplier, unit: 'g' };
  }
  
  return null;
}

// =====================================================
// PRZETWARZANIE SKŁADNIKÓW
// =====================================================

export interface ProcessedIngredient {
  name: string;               // Znormalizowana, konkretna nazwa
  originalNames: string[];    // Oryginalne nazwy z przepisów
  totalAmount: number;        // Suma w jednostkach bazowych (g/ml/szt)
  unit: 'g' | 'ml' | 'szt';   // Jednostka bazowa
  packageCount: number;       // Liczba opakowań do kupienia
  packageSize: number;        // Rozmiar opakowania
  packageName: string;        // Nazwa opakowania (np. "kostka", "karton")
  displayText: string;        // Tekst do wyświetlenia: "2 kostki (400g)"
  category: string;           // Kategoria produktu
  needsVerification: boolean; // Czy oznaczyć "sprawdź ilość"
}

interface RawIngredient {
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'szt';
}

// =====================================================
// WALIDACJA CZY SŁOWO JEST PRAWDZIWYM PRODUKTEM
// =====================================================

function isValidFoodProduct(word: string): boolean {
  const lower = word.toLowerCase();
  
  // Sprawdź bezpośrednio w słowniku produktów
  if (VALID_FOOD_PRODUCTS.has(lower)) return true;
  
  // Sprawdź czy po lematyzacji jest w słowniku
  const lemma = POLISH_LEMMAS[lower];
  if (lemma && VALID_FOOD_PRODUCTS.has(lemma.toLowerCase())) return true;
  
  // Sprawdź częściowe dopasowanie do znanych produktów
  for (const product of VALID_FOOD_PRODUCTS) {
    if (product.includes(lower) && lower.length >= 4) return true;
    if (lower.includes(product) && product.length >= 4) return true;
  }
  
  return false;
}

function normalizeIngredientName(raw: string): string | null {
  let cleaned = raw.toLowerCase().trim();
  
  // Usuń znaki specjalne z początku/końca
  cleaned = cleaned.replace(/^[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+|[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/g, '');
  
  // BEZWZGLĘDNIE odrzuć jeśli to wykluczony token
  if (EXCLUDED_TOKENS.has(cleaned)) return null;
  
  // Odrzuć za krótkie słowa
  if (cleaned.length < 3) return null;
  
  // Lematyzacja - zamiana formy gramatycznej na podstawową
  if (POLISH_LEMMAS[cleaned]) {
    cleaned = POLISH_LEMMAS[cleaned];
  }
  
  // Rozwinięcie do pełnej nazwy (np. "pierś" -> "pierś z kurczaka")
  if (NAME_EXPANSIONS[cleaned]) {
    cleaned = NAME_EXPANSIONS[cleaned];
  }
  
  // KLUCZOWA WALIDACJA: Sprawdź czy to jest prawdziwy produkt spożywczy
  if (!isValidFoodProduct(cleaned)) {
    return null;
  }
  
  // Kapitalizacja pierwszej litery
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function extractIngredientsFromText(text: string): RawIngredient[] {
  const results: RawIngredient[] = [];
  
  // Najpierw sprawdź złożone produkty (2-3 słowa)
  const textLower = text.toLowerCase();
  for (const [compound, normalized] of Object.entries(COMPOUND_PRODUCTS)) {
    if (textLower.includes(compound)) {
      const quantity = parseQuantity(text);
      results.push({
        name: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        amount: quantity?.amount || 1,
        unit: quantity?.unit || 'szt',
      });
      // Oznacz te słowa jako przetworzone, żeby nie dodawać ich osobno
      text = text.replace(new RegExp(compound, 'gi'), ' ');
    }
  }
  
  // Podziel tekst na części
  const parts = text.split(/[,;:\(\)\[\]•\-–—]+/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Wyodrębnij ilość
    const quantity = parseQuantity(trimmed);
    
    // Usuń ilości z tekstu, żeby zostały same nazwy
    const nameOnly = trimmed
      .replace(/\d+[,.]?\d*\s*(kg|dag|g|ml|l|szt|sztuk|sztuki|łyżk[aei]?|łyżeczk[aei]?|szklan[kia]?|kubk[aóię]?|garść|garści|kostek|kostki|plaster[keiy]?)\b/gi, '')
      .replace(/\d+\/\d+/g, '')
      .replace(/pół|połowa|ćwierć/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Podziel na słowa i przetwórz - TYLKO PRAWIDŁOWE PRODUKTY
    const words = nameOnly.split(/\s+/);
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
      if (!cleanWord || cleanWord.length < 3) continue;
      
      const normalized = normalizeIngredientName(cleanWord);
      // normalizeIngredientName już sprawdza czy to prawdziwy produkt
      if (normalized) {
        // Sprawdź czy ten produkt już nie został dodany jako część złożonego produktu
        const alreadyAdded = results.some(r => 
          r.name.toLowerCase() === normalized.toLowerCase() ||
          r.name.toLowerCase().includes(normalized.toLowerCase())
        );
        
        if (!alreadyAdded) {
          // Domyślna ilość: 1 szt jeśli brak informacji o ilości (nie 100g!)
          results.push({
            name: normalized,
            amount: quantity?.amount || 1,
            unit: quantity?.unit || 'szt',
          });
        }
      }
    }
  }
  
  // Usuń duplikaty
  const uniqueResults: RawIngredient[] = [];
  const seen = new Set<string>();
  
  for (const ing of results) {
    const key = ing.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(ing);
    }
  }
  
  return uniqueResults;
}

// =====================================================
// AGREGACJA I OBLICZANIE OPAKOWAŃ
// =====================================================

function calculatePackages(
  name: string, 
  totalAmount: number, 
  unit: 'g' | 'ml' | 'szt'
): { count: number; size: number; packageName: string } {
  const lowerName = name.toLowerCase();
  
  // Znajdź konfigurację opakowania
  let config: PackageConfig | undefined;
  
  // Dokładne dopasowanie
  config = PACKAGE_CONFIGURATIONS[lowerName];
  
  // Częściowe dopasowanie
  if (!config) {
    for (const [key, value] of Object.entries(PACKAGE_CONFIGURATIONS)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        config = value;
        break;
      }
    }
  }
  
  if (!config) {
    // Domyślne opakowanie
    return { count: 1, size: 0, packageName: 'opakowanie' };
  }
  
  // Konwersja waga -> sztuki dla produktów sztukowych
  let effectiveAmount = totalAmount;
  if (config.unit === 'szt' && unit === 'g' && config.weightPerPiece) {
    effectiveAmount = Math.ceil(totalAmount / config.weightPerPiece);
  }
  
  // Wybierz najmniejsze opakowanie pokrywające zapotrzebowanie
  const defaultSize = config.defaultSize || config.sizes[0];
  
  // Dla produktów z wieloma rozmiarami opakowań (np. jajka 6/10/12)
  if (config.sizes.length > 1 && config.unit === 'szt') {
    // Znajdź optymalną kombinację
    let bestCount = Infinity;
    let bestSize = config.sizes[0];
    
    for (const size of config.sizes) {
      const needed = Math.ceil(effectiveAmount / size);
      if (needed * size >= effectiveAmount && needed < bestCount) {
        bestCount = needed;
        bestSize = size;
      }
    }
    
    return { 
      count: Math.max(1, bestCount), 
      size: bestSize, 
      packageName: config.packageName 
    };
  }
  
  // Dla produktów wagowych/objętościowych
  const count = Math.ceil(effectiveAmount / defaultSize);
  return { 
    count: Math.max(1, count), 
    size: defaultSize, 
    packageName: config.packageName 
  };
}

// =====================================================
// KATEGORYZACJA
// =====================================================

const CATEGORIES: Record<string, { label: string; emoji: string; keywords: string[] }> = {
  pieczywo: { label: 'Pieczywo', emoji: '🍞', keywords: ['chleb', 'bułk', 'bagiet', 'rogal', 'toast', 'tortilla'] },
  nabial: { label: 'Nabiał', emoji: '🥛', keywords: ['mleko', 'ser', 'jogurt', 'śmietana', 'masło', 'twaróg', 'kefir', 'maślank', 'jaj', 'mozzarella', 'feta', 'parmezan'] },
  mieso: { label: 'Mięso i ryby', emoji: '🥩', keywords: ['kurczak', 'wołowin', 'wieprzow', 'mięso', 'szynk', 'boczek', 'kiełbas', 'ryb', 'łosoś', 'dorsz', 'tuńczyk', 'krewetk', 'indyk', 'pierś', 'filet'] },
  warzywa: { label: 'Warzywa', emoji: '🥬', keywords: ['marchew', 'cebul', 'czosnek', 'pomidor', 'ogórek', 'sałat', 'papryka', 'brokuł', 'szpinak', 'kapust', 'ziemniak', 'cukini', 'bakłażan', 'kalafior', 'por', 'seler', 'burak', 'awokado', 'pietruszk', 'szczypior', 'rukola', 'roszponka'] },
  owoce: { label: 'Owoce', emoji: '🍎', keywords: ['jabłk', 'banan', 'pomarańcz', 'cytryn', 'truskawk', 'maliny', 'jagod', 'winogrona', 'arbuz', 'melon', 'grejpfrut', 'kiwi', 'mango', 'ananas', 'borówk'] },
  przyprawy: { label: 'Przyprawy i oleje', emoji: '🧂', keywords: ['sól', 'pieprz', 'oregano', 'bazylia', 'tymianek', 'kurkuma', 'curry', 'cynamon', 'imbir', 'przyprawa', 'oliw', 'olej', 'ocet', 'sos sojowy'] },
  zboza: { label: 'Zboża i makarony', emoji: '🍝', keywords: ['ryż', 'makaron', 'kasza', 'płatki', 'mąka', 'owsian', 'quinoa', 'kuskus', 'spaghetti'] },
  napoje: { label: 'Napoje', emoji: '🥤', keywords: ['woda', 'sok', 'herbat', 'kawa', 'napój', 'kompot', 'mleko kokosowe'] },
  slodycze: { label: 'Słodycze i przekąski', emoji: '🍫', keywords: ['czekolad', 'cukier', 'miód', 'dżem', 'ciast', 'baton', 'herbatnik', 'orzechy', 'bakalie', 'migdał', 'masło orzechowe'] },
  inne: { label: 'Inne', emoji: '📦', keywords: [] },
};

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [category, { keywords }] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return category;
    }
  }
  return 'inne';
}

// =====================================================
// FORMATOWANIE WYŚWIETLANIA
// =====================================================

function formatDisplayText(
  packageCount: number,
  packageSize: number,
  packageName: string,
  totalAmount: number,
  unit: 'g' | 'ml' | 'szt'
): string {
  const pluralForms: Record<string, [string, string, string]> = {
    'opakowanie': ['opakowanie', 'opakowania', 'opakowań'],
    'karton': ['karton', 'kartony', 'kartonów'],
    'butelka': ['butelka', 'butelki', 'butelek'],
    'kubek': ['kubek', 'kubki', 'kubków'],
    'słoik': ['słoik', 'słoiki', 'słoików'],
    'słoiczek': ['słoiczek', 'słoiczki', 'słoiczków'],
    'sztuka': ['sztuka', 'sztuki', 'sztuk'],
    'puszka': ['puszka', 'puszki', 'puszek'],
    'kostka': ['kostka', 'kostki', 'kostek'],
    'tabliczka': ['tabliczka', 'tabliczki', 'tabliczek'],
    'główka': ['główka', 'główki', 'główek'],
    'bochenek': ['bochenek', 'bochenki', 'bochenków'],
    'kiść': ['kiść', 'kiście', 'kiści'],
    'porcja': ['porcja', 'porcje', 'porcji'],
    'filet': ['filet', 'filety', 'filetów'],
    'pęczek': ['pęczek', 'pęczki', 'pęczków'],
    'korzeń': ['korzeń', 'korzenie', 'korzeni'],
    'doniczka': ['doniczka', 'doniczki', 'doniczek'],
    'saszetka': ['saszetka', 'saszetki', 'saszetek'],
    'kg': ['kg', 'kg', 'kg'],
    'szt': ['szt', 'szt', 'szt'],
  };
  
  const getPluralForm = (name: string, count: number): string => {
    const forms = pluralForms[name] || [name, name, name];
    if (count === 1) return forms[0];
    if (count >= 2 && count <= 4) return forms[1];
    return forms[2];
  };
  
  const plural = getPluralForm(packageName, packageCount);
  
  // Format ilości
  let amountStr = '';
  if (totalAmount > 0 && unit !== 'szt') {
    if (totalAmount >= 1000 && unit === 'g') {
      amountStr = `${(totalAmount / 1000).toFixed(1).replace('.0', '')} kg`;
    } else if (totalAmount >= 1000 && unit === 'ml') {
      amountStr = `${(totalAmount / 1000).toFixed(1).replace('.0', '')} l`;
    } else {
      amountStr = `${Math.round(totalAmount)} ${unit}`;
    }
  }
  
  // Dla produktów sztukowych bez dodatkowego opakowania
  if (packageName === 'sztuka' || packageName === 'szt') {
    return `${packageCount} ${getPluralForm('szt', packageCount)}`;
  }
  
  // Dla opakowań z wieloma sztukami (jajka)
  if (packageSize > 1 && unit === 'szt') {
    const totalPieces = packageCount * packageSize;
    return `${packageCount} ${plural} (${totalPieces} szt)`;
  }
  
  // Dla produktów wagowych/objętościowych
  if (packageSize > 0 && amountStr) {
    const totalPackageAmount = packageCount * packageSize;
    const packageAmountStr = unit === 'g' && totalPackageAmount >= 1000 
      ? `${(totalPackageAmount / 1000).toFixed(1).replace('.0', '')} kg`
      : unit === 'ml' && totalPackageAmount >= 1000
        ? `${(totalPackageAmount / 1000).toFixed(1).replace('.0', '')} l`
        : `${totalPackageAmount} ${unit}`;
    
    if (packageCount === 1) {
      return `${packageCount} ${plural} (${amountStr})`;
    }
    return `${packageCount} ${plural} (${packageCount} x ${packageSize}${unit} = ${packageAmountStr})`;
  }
  
  return `${packageCount} ${plural}`;
}

// =====================================================
// GŁÓWNA FUNKCJA PRZETWARZANIA
// =====================================================

export interface MealData {
  name: string;
  description?: string;
}

export function processShoppingList(
  meals: MealData[],
  dayMultiplier: number = 1
): ProcessedIngredient[] {
  // Agreguj składniki
  const aggregated = new Map<string, {
    originalNames: Set<string>;
    totalAmount: number;
    unit: 'g' | 'ml' | 'szt';
  }>();
  
  for (const meal of meals) {
    const text = `${meal.name} ${meal.description || ''}`;
    const extracted = extractIngredientsFromText(text);
    
    for (const ing of extracted) {
      const key = ing.name.toLowerCase();
      const existing = aggregated.get(key);
      
      if (existing) {
        existing.originalNames.add(ing.name);
        existing.totalAmount += ing.amount * dayMultiplier;
        // Zachowaj jednostkę z pierwszego wystąpienia
      } else {
        aggregated.set(key, {
          originalNames: new Set([ing.name]),
          totalAmount: ing.amount * dayMultiplier,
          unit: ing.unit,
        });
      }
    }
  }
  
  // Przetwórz na wynikową listę
  const results: ProcessedIngredient[] = [];
  
  for (const [key, data] of aggregated) {
    // Użyj najdłuższej nazwy jako najbardziej precyzyjnej
    const names = Array.from(data.originalNames);
    const bestName = names.reduce((a, b) => a.length > b.length ? a : b);
    
    // Oblicz opakowania
    const { count, size, packageName } = calculatePackages(bestName, data.totalAmount, data.unit);
    
    // Kategoryzuj
    const category = categorizeIngredient(bestName);
    
    // Formatuj wyświetlanie
    const displayText = formatDisplayText(count, size, packageName, data.totalAmount, data.unit);
    
    // Sprawdź czy wymaga weryfikacji
    const needsVerification = count === 1 && size === 0;
    
    results.push({
      name: bestName,
      originalNames: names,
      totalAmount: data.totalAmount,
      unit: data.unit,
      packageCount: count,
      packageSize: size,
      packageName,
      displayText: needsVerification ? `${displayText} (sprawdź ilość)` : displayText,
      category,
      needsVerification,
    });
  }
  
  // Sortuj: najpierw kategorie, potem alfabetycznie
  const categoryOrder = Object.keys(CATEGORIES);
  results.sort((a, b) => {
    const catCompare = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (catCompare !== 0) return catCompare;
    return a.name.localeCompare(b.name, 'pl');
  });
  
  return results;
}

// =====================================================
// EKSPORT KONFIGURACJI
// =====================================================

export const CATEGORY_CONFIG = CATEGORIES;

export function getDefaultPackageConfig(): Record<string, PackageConfig> {
  return { ...PACKAGE_CONFIGURATIONS };
}

// =====================================================
// PRZYKŁADY TRANSFORMACJI (dla testów)
// =====================================================

export function runExamples(): Array<{ input: string; output: ProcessedIngredient[] }> {
  const examples = [
    // Przykład 1: Jajka 600g -> sztuki -> opakowania
    { meals: [{ name: 'Omlet', description: 'jajka 600g' }], days: 1 },
    // Przykład 2: Masło 1.5 kostki
    { meals: [{ name: 'Ciasto', description: 'masło 1.5 kostki, mąka 500g' }], days: 1 },
    // Przykład 3: Mąka sumowana
    { meals: [
      { name: 'Naleśniki', description: 'mąka 700g' },
      { name: 'Placki', description: 'mąka 500g' }
    ], days: 1 },
    // Przykład 4: Mleko w różnych formach
    { meals: [
      { name: 'Płatki', description: 'mleko 200ml' },
      { name: 'Kawa', description: 'mleko 800ml' }
    ], days: 1 },
    // Przykład 5: Kompleksowy przepis
    { meals: [{ 
      name: 'Kurczak z warzywami', 
      description: 'pierś z kurczaka 400g, 2 marchewki, 1 cebula, czosnek 3 ząbki, oliwa 2 łyżki, sól i pieprz do smaku' 
    }], days: 3 },
  ];
  
  return examples.map((ex, idx) => ({
    input: `Przykład ${idx + 1}: ${ex.meals.map(m => `${m.name} (${m.description})`).join(', ')} x ${ex.days} dni`,
    output: processShoppingList(ex.meals, ex.days),
  }));
}
