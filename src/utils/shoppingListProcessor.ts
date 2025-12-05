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

// Słowa do usunięcia (miary, opisy, literówki)
const EXCLUDED_TOKENS = new Set([
  // Jednostki miar przepisowych (nie produkty)
  'kubek', 'kubki', 'kubków',
  'łyżka', 'łyżki', 'łyżek', 'łyżeczka', 'łyżeczki',
  'szklanka', 'szklanki', 'szklanek',
  'garść', 'garści',
  'szczypta', 'szczypt',
  'plasterek', 'plasterki', 'plasterków',
  'kawałek', 'kawałki', 'kawałków',
  'porcja', 'porcji', 'porcje',
  // Opisy gotowania
  'gotowany', 'gotowana', 'gotowanych', 'ugotowany', 'ugotowana',
  'smażony', 'smażona', 'smażonych', 'usmażony', 'usmażona',
  'pieczony', 'pieczona', 'pieczonych', 'upieczony', 'upieczona',
  'grillowany', 'grillowana', 'grillowanych',
  'pokrojony', 'pokrojona', 'pokrojonych',
  'posiekany', 'posiekana', 'posiekanych',
  'mielony', 'mielona', 'mielonych',
  'świeży', 'świeża', 'świeże', 'świeżych',
  'ciepły', 'ciepła', 'ciepłe',
  'zimny', 'zimna', 'zimne',
  'surowy', 'surowa', 'surowe',
  'drobno', 'grubo',
  // Ogólne słowa nieprzydatne
  'oraz', 'lub', 'albo', 'dla', 'bez', 'do',
  'bardzo', 'lekko', 'trochę', 'dużo', 'mało',
  'smaku', 'potrzeby', 'życzeniu',
  'opcjonalnie', 'ewentualnie',
  'dekoracji', 'podania', 'posypania',
  'itp', 'itd', 'etc',
  // Literówki i fragmenty
  'mielontm', 'kalorie', 'kcal', 'białko', 'węglowodany', 'tłuszcze',
  'śniadanie', 'obiad', 'kolacja', 'przekąska', 'posiłek',
  // Akcesoria kuchenne
  'miska', 'garnek', 'patelnia', 'blender', 'mikser',
  'deska', 'nóż', 'widelec', 'talerz',
]);

// Normalizacja polskich form gramatycznych
const POLISH_LEMMAS: Record<string, string> = {
  // Jajka
  'jajkiem': 'jajko', 'jajka': 'jajko', 'jajek': 'jajko', 
  'jajkami': 'jajko', 'jaj': 'jajko', 'jajo': 'jajko',
  
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
  'piersią': 'pierś', 'piersi': 'pierś',
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
  
  // Warzywa
  'marchewką': 'marchew', 'marchwi': 'marchew', 'marchewki': 'marchew',
  'cebulą': 'cebula', 'cebuli': 'cebula', 'cebulę': 'cebula',
  'czosnkiem': 'czosnek', 'czosnku': 'czosnek', 'ząbki': 'ząbek czosnku',
  'pomidorem': 'pomidor', 'pomidora': 'pomidor', 'pomidory': 'pomidor', 'pomidorów': 'pomidor',
  'ogórkiem': 'ogórek', 'ogórka': 'ogórek', 'ogórki': 'ogórek', 'ogórków': 'ogórek',
  'papryką': 'papryka', 'papryki': 'papryka', 'papryce': 'papryka',
  'brokułem': 'brokuł', 'brokułami': 'brokuł', 'brokuły': 'brokuł',
  'szpinakiem': 'szpinak', 'szpinaku': 'szpinak',
  'sałatą': 'sałata', 'sałaty': 'sałata', 'sałacie': 'sałata',
  'kapustą': 'kapusta', 'kapusty': 'kapusta', 'kapuście': 'kapusta',
  'ziemniakami': 'ziemniaki', 'ziemniaków': 'ziemniaki', 'ziemniak': 'ziemniaki',
  'cukinią': 'cukinia', 'cukinii': 'cukinia',
  'bakłażanem': 'bakłażan', 'bakłażana': 'bakłażan',
  'kalafiorem': 'kalafior', 'kalafiora': 'kalafior',
  'porem': 'por', 'pora': 'por',
  'selerem': 'seler', 'selera': 'seler',
  'burakiem': 'burak', 'buraka': 'burak', 'buraki': 'burak', 'burakami': 'burak',
  'awokado': 'awokado',
  'pietruszkę': 'pietruszka', 'pietruszki': 'pietruszka', 'pietruszką': 'pietruszka',
  'szczypiorkiem': 'szczypiorek', 'szczypiorku': 'szczypiorek',
  'rukolą': 'rukola', 'rukoli': 'rukola',
  
  // Owoce
  'jabłkiem': 'jabłko', 'jabłka': 'jabłko', 'jabłek': 'jabłko',
  'bananem': 'banan', 'banana': 'banan', 'banany': 'banan', 'bananów': 'banan',
  'pomarańczą': 'pomarańcza', 'pomarańczy': 'pomarańcza',
  'cytryną': 'cytryna', 'cytryny': 'cytryna',
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
  'bułką': 'bułka', 'bułki': 'bułka', 'bułek': 'bułka',
  
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
  'oliwą': 'oliwa', 'oliwy': 'oliwa',
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
  'sosem': 'sos', 'sosu': 'sos',
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

function normalizeIngredientName(raw: string): string | null {
  let cleaned = raw.toLowerCase().trim();
  
  // Usuń znaki specjalne z początku/końca
  cleaned = cleaned.replace(/^[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+|[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/g, '');
  
  // Sprawdź czy to wykluczony token
  if (EXCLUDED_TOKENS.has(cleaned)) return null;
  if (cleaned.length < 2) return null;
  
  // Lematyzacja
  if (POLISH_LEMMAS[cleaned]) {
    cleaned = POLISH_LEMMAS[cleaned];
  }
  
  // Rozwinięcie do pełnej nazwy
  if (NAME_EXPANSIONS[cleaned]) {
    cleaned = NAME_EXPANSIONS[cleaned];
  }
  
  // Kapitalizacja pierwszej litery
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function extractIngredientsFromText(text: string): RawIngredient[] {
  const results: RawIngredient[] = [];
  
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
    
    // Podziel na słowa i przetwórz
    const words = nameOnly.split(/\s+/);
    const validWords: string[] = [];
    
    for (const word of words) {
      const normalized = normalizeIngredientName(word);
      if (normalized && normalized.length >= 2) {
        validWords.push(normalized);
      }
    }
    
    // Połącz słowa w jeden składnik lub dodaj osobno
    if (validWords.length >= 1) {
      // Spróbuj złączyć przymiotnik + rzeczownik (np. "ser żółty")
      if (validWords.length === 2) {
        const combined = `${validWords[0]} ${validWords[1]}`.toLowerCase();
        const expandedCombined = NAME_EXPANSIONS[combined] || combined;
        results.push({
          name: expandedCombined.charAt(0).toUpperCase() + expandedCombined.slice(1),
          amount: quantity?.amount || 100,
          unit: quantity?.unit || 'g',
        });
      } else {
        // Dodaj każde słowo osobno (później agregacja połączy)
        for (const word of validWords) {
          results.push({
            name: word,
            amount: quantity?.amount || 100,
            unit: quantity?.unit || 'g',
          });
        }
      }
    }
  }
  
  return results;
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
