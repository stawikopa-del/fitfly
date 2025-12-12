export interface RecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
  ingredients_needed?: string[];
  tip?: string;
}

export interface DatabaseRecipe {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  difficulty: 'easy' | 'medium' | 'hard';
  total_time_minutes: number;
  servings: number;
  ingredients: string[];
  tools_needed: string[];
  steps: RecipeStep[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  image_emoji: string;
}

export const recipesDatabase: DatabaseRecipe[] = [
  // === ŚNIADANIA (6) ===
  {
    id: 'owsianka-bananowa',
    name: 'Owsianka bananowa z orzechami',
    description: 'Kremowa owsianka z dojrzałym bananem, miodem i chrupiącymi orzechami włoskimi.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 10,
    servings: 1,
    ingredients: ['50g płatków owsianych', '200ml mleka', '1 banan', '1 łyżka miodu', '20g orzechów włoskich', 'szczypta cynamonu'],
    tools_needed: ['garnek', 'łyżka'],
    steps: [
      { step_number: 1, instruction: 'Wlej mleko do garnka i zagotuj na średnim ogniu.', duration_minutes: 2, ingredients_needed: ['200ml mleka'] },
      { step_number: 2, instruction: 'Dodaj płatki owsiane i gotuj mieszając przez 3-4 minuty aż zgęstnieją.', duration_minutes: 4, ingredients_needed: ['50g płatków owsianych'], tip: 'Mieszaj regularnie, aby owsianka się nie przypaliła.' },
      { step_number: 3, instruction: 'Zdejmij z ognia. Pokrój banana w plastry i ułóż na owsiance.', ingredients_needed: ['1 banan'] },
      { step_number: 4, instruction: 'Polej miodem, posyp orzechami i cynamonem. Podawaj ciepłą!', ingredients_needed: ['1 łyżka miodu', '20g orzechów włoskich', 'szczypta cynamonu'] }
    ],
    macros: { calories: 420, protein: 12, carbs: 65, fat: 14 },
    tags: ['wegetariańskie', 'szybkie', 'zdrowe'],
    image_emoji: '🥣'
  },
  {
    id: 'jajecznica-warzywna',
    name: 'Jajecznica z warzywami',
    description: 'Puszysta jajecznica z papryką, pomidorami i szczypiorkiem.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 12,
    servings: 1,
    ingredients: ['3 jajka', '1/2 papryki czerwonej', '1 pomidor', 'garść szczypiorku', '1 łyżka masła', 'sól i pieprz'],
    tools_needed: ['patelnia', 'miska', 'widelec'],
    steps: [
      { step_number: 1, instruction: 'Pokrój paprykę i pomidora w małą kostkę.', ingredients_needed: ['1/2 papryki czerwonej', '1 pomidor'] },
      { step_number: 2, instruction: 'Rozbij jajka do miski, dodaj sól i pieprz, roztrzep widelcem.', ingredients_needed: ['3 jajka', 'sól i pieprz'] },
      { step_number: 3, instruction: 'Rozgrzej masło na patelni na średnim ogniu.', duration_minutes: 1, ingredients_needed: ['1 łyżka masła'] },
      { step_number: 4, instruction: 'Podsmaż paprykę przez 2 minuty, dodaj pomidory.', duration_minutes: 3, tip: 'Warzywa powinny lekko zmiękczyć.' },
      { step_number: 5, instruction: 'Wlej jajka i mieszaj delikatnie szpatułką aż zetną się.', duration_minutes: 2 },
      { step_number: 6, instruction: 'Posyp posiekanym szczypiorkiem i podawaj od razu!', ingredients_needed: ['garść szczypiorku'] }
    ],
    macros: { calories: 310, protein: 21, carbs: 8, fat: 22 },
    tags: ['wysokobiałkowe', 'bezglutenowe', 'keto'],
    image_emoji: '🍳'
  },
  {
    id: 'tosty-z-awokado',
    name: 'Tosty z awokado i jajkiem',
    description: 'Chrupiące tosty z kremowym awokado i jajkiem sadzonym.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 10,
    servings: 1,
    ingredients: ['2 kromki chleba', '1 dojrzałe awokado', '2 jajka', 'sok z cytryny', 'sól, pieprz', 'płatki chili'],
    tools_needed: ['toster', 'patelnia', 'widelec'],
    steps: [
      { step_number: 1, instruction: 'Opiecz chleb w tosterze na złoty kolor.', duration_minutes: 2, ingredients_needed: ['2 kromki chleba'] },
      { step_number: 2, instruction: 'Przekrój awokado, wyjmij pestkę i rozgnieć miąższ widelcem z sokiem z cytryny.', ingredients_needed: ['1 dojrzałe awokado', 'sok z cytryny'] },
      { step_number: 3, instruction: 'Usmaż jajka sadzone na rozgrzanej patelni.', duration_minutes: 3, ingredients_needed: ['2 jajka'], tip: 'Żółtko powinno pozostać płynne!' },
      { step_number: 4, instruction: 'Posmaruj tosty pastą z awokado, ułóż jajka, dopraw solą, pieprzem i płatkami chili.', ingredients_needed: ['sól, pieprz', 'płatki chili'] }
    ],
    macros: { calories: 480, protein: 18, carbs: 35, fat: 32 },
    tags: ['wegetariańskie', 'trendy', 'sycące'],
    image_emoji: '🥑'
  },
  {
    id: 'smoothie-bowl',
    name: 'Smoothie bowl z owocami',
    description: 'Gęste smoothie z mrożonymi owocami, granolą i nasionami chia.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 5,
    servings: 1,
    ingredients: ['150g mrożonych jagód', '1 banan', '100ml mleka kokosowego', '30g granoli', '1 łyżka nasion chia', 'świeże owoce do dekoracji'],
    tools_needed: ['blender'],
    steps: [
      { step_number: 1, instruction: 'Wrzuć mrożone jagody i banana do blendera.', ingredients_needed: ['150g mrożonych jagód', '1 banan'] },
      { step_number: 2, instruction: 'Dodaj mleko kokosowe i blenduj na gładką, gęstą masę.', duration_minutes: 1, ingredients_needed: ['100ml mleka kokosowego'], tip: 'Konsystencja powinna być gęstsza niż zwykłe smoothie.' },
      { step_number: 3, instruction: 'Przelej do miseczki i udekoruj granolą, nasionami chia i świeżymi owocami.', ingredients_needed: ['30g granoli', '1 łyżka nasion chia', 'świeże owoce do dekoracji'] }
    ],
    macros: { calories: 380, protein: 8, carbs: 58, fat: 14 },
    tags: ['wegańskie', 'bez gotowania', 'orzeźwiające'],
    image_emoji: '🫐'
  },
  {
    id: 'nalesniki-bananowe',
    name: 'Naleśniki bananowe',
    description: 'Puszyste naleśniki z dwóch składników - banana i jajek.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 2,
    ingredients: ['2 dojrzałe banany', '3 jajka', 'szczypta soli', 'olej do smażenia', 'jogurt grecki do podania', 'miód'],
    tools_needed: ['miska', 'patelnia', 'szpatułka'],
    steps: [
      { step_number: 1, instruction: 'Rozgnieć banany widelcem na gładką masę.', ingredients_needed: ['2 dojrzałe banany'] },
      { step_number: 2, instruction: 'Dodaj jajka i szczyptę soli, wymieszaj dokładnie.', ingredients_needed: ['3 jajka', 'szczypta soli'] },
      { step_number: 3, instruction: 'Rozgrzej odrobinę oleju na patelni na średnim ogniu.', ingredients_needed: ['olej do smażenia'] },
      { step_number: 4, instruction: 'Nakładaj małe porcje ciasta i smaż po 2 minuty z każdej strony.', duration_minutes: 8, tip: 'Rób małe naleśniki - łatwiej je przewracać!' },
      { step_number: 5, instruction: 'Podawaj z jogurtem greckim i miodem.', ingredients_needed: ['jogurt grecki do podania', 'miód'] }
    ],
    macros: { calories: 290, protein: 14, carbs: 32, fat: 12 },
    tags: ['bezglutenowe', 'wysokobiałkowe', 'dla dzieci'],
    image_emoji: '🥞'
  },
  {
    id: 'kanapka-losos',
    name: 'Kanapka z łososiem i kremowym serem',
    description: 'Elegancka kanapka z wędzonym łososiem, serem Philadelphia i kaparami.',
    category: 'breakfast',
    difficulty: 'easy',
    total_time_minutes: 5,
    servings: 1,
    ingredients: ['2 kromki chleba żytniego', '50g wędzonego łososia', '2 łyżki sera Philadelphia', 'kilka kaparów', 'świeży koperek', 'sok z cytryny'],
    tools_needed: ['nóż'],
    steps: [
      { step_number: 1, instruction: 'Posmaruj kromki chleba serem Philadelphia.', ingredients_needed: ['2 kromki chleba żytniego', '2 łyżki sera Philadelphia'] },
      { step_number: 2, instruction: 'Ułóż plastry wędzonego łososia na serze.', ingredients_needed: ['50g wędzonego łososia'] },
      { step_number: 3, instruction: 'Posyp kaparami i koperkiem, skrop sokiem z cytryny.', ingredients_needed: ['kilka kaparów', 'świeży koperek', 'sok z cytryny'] }
    ],
    macros: { calories: 320, protein: 18, carbs: 28, fat: 16 },
    tags: ['omega-3', 'szybkie', 'eleganckie'],
    image_emoji: '🥪'
  },

  // === OBIADY (10) ===
  {
    id: 'kurczak-curry',
    name: 'Kurczak curry z ryżem',
    description: 'Aromatyczny kurczak w kremowym sosie curry z mleczkiem kokosowym.',
    category: 'lunch',
    difficulty: 'medium',
    total_time_minutes: 35,
    servings: 2,
    ingredients: ['300g piersi kurczaka', '200ml mleczka kokosowego', '2 łyżki pasty curry', '1 cebula', '2 ząbki czosnku', '150g ryżu basmati', 'świeża kolendra'],
    tools_needed: ['patelnia głęboka', 'garnek', 'deska do krojenia'],
    steps: [
      { step_number: 1, instruction: 'Ugotuj ryż według instrukcji na opakowaniu.', duration_minutes: 15, ingredients_needed: ['150g ryżu basmati'] },
      { step_number: 2, instruction: 'Pokrój kurczaka w kostkę, cebulę w piórka, czosnek posiekaj.', ingredients_needed: ['300g piersi kurczaka', '1 cebula', '2 ząbki czosnku'] },
      { step_number: 3, instruction: 'Rozgrzej patelnię, obsmaż kurczaka ze wszystkich stron.', duration_minutes: 5, tip: 'Kurczak powinien być złocisty.' },
      { step_number: 4, instruction: 'Dodaj cebulę i czosnek, smaż 2 minuty.', duration_minutes: 2 },
      { step_number: 5, instruction: 'Dodaj pastę curry i mleczko kokosowe, wymieszaj.', ingredients_needed: ['2 łyżki pasty curry', '200ml mleczka kokosowego'] },
      { step_number: 6, instruction: 'Gotuj na wolnym ogniu 10 minut aż sos zgęstnieje.', duration_minutes: 10 },
      { step_number: 7, instruction: 'Podawaj z ryżem, udekoruj kolendrą.', ingredients_needed: ['świeża kolendra'] }
    ],
    macros: { calories: 520, protein: 42, carbs: 48, fat: 18 },
    tags: ['azjatyckie', 'sycące', 'aromatyczne'],
    image_emoji: '🍛'
  },
  {
    id: 'makaron-bolognese',
    name: 'Spaghetti bolognese',
    description: 'Klasyczne włoskie spaghetti z mięsnym sosem pomidorowym.',
    category: 'lunch',
    difficulty: 'medium',
    total_time_minutes: 45,
    servings: 3,
    ingredients: ['300g mięsa mielonego wołowego', '400g pomidorów krojonych', '200g spaghetti', '1 cebula', '2 marchewki', '2 ząbki czosnku', 'oregano', 'bazylia', 'parmezan'],
    tools_needed: ['duży garnek', 'patelnia głęboka', 'tarka'],
    steps: [
      { step_number: 1, instruction: 'Pokrój cebulę i marchewkę w drobną kostkę, posiekaj czosnek.', ingredients_needed: ['1 cebula', '2 marchewki', '2 ząbki czosnku'] },
      { step_number: 2, instruction: 'Na rozgrzanej patelni obsmaż mięso mielone rozbijając je na kawałki.', duration_minutes: 5, ingredients_needed: ['300g mięsa mielonego wołowego'] },
      { step_number: 3, instruction: 'Dodaj warzywa i smaż razem przez 5 minut.', duration_minutes: 5 },
      { step_number: 4, instruction: 'Wlej pomidory, dodaj oregano i bazylię, gotuj 25 minut.', duration_minutes: 25, ingredients_needed: ['400g pomidorów krojonych', 'oregano', 'bazylia'] },
      { step_number: 5, instruction: 'W międzyczasie ugotuj makaron al dente.', duration_minutes: 10, ingredients_needed: ['200g spaghetti'] },
      { step_number: 6, instruction: 'Wymieszaj makaron z sosem, podawaj z tartym parmezanem.', ingredients_needed: ['parmezan'] }
    ],
    macros: { calories: 580, protein: 35, carbs: 62, fat: 22 },
    tags: ['włoskie', 'comfort food', 'dla rodziny'],
    image_emoji: '🍝'
  },
  {
    id: 'salatka-grecka',
    name: 'Sałatka grecka',
    description: 'Orzeźwiająca sałatka z serem feta, oliwkami i świeżymi warzywami.',
    category: 'lunch',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 2,
    ingredients: ['2 pomidory', '1 ogórek', '1/2 czerwonej cebuli', '100g sera feta', '50g oliwek kalamata', '3 łyżki oliwy', 'oregano', 'sól i pieprz'],
    tools_needed: ['deska do krojenia', 'nóż', 'miska'],
    steps: [
      { step_number: 1, instruction: 'Pokrój pomidory w ósemki, ogórek w półplastry.', ingredients_needed: ['2 pomidory', '1 ogórek'] },
      { step_number: 2, instruction: 'Cebulę pokrój w cienkie piórka.', ingredients_needed: ['1/2 czerwonej cebuli'] },
      { step_number: 3, instruction: 'Ułóż warzywa w misce, dodaj oliwki.', ingredients_needed: ['50g oliwek kalamata'] },
      { step_number: 4, instruction: 'Pokrój fetę w kostkę lub pokrusz palcami na wierzch.', ingredients_needed: ['100g sera feta'] },
      { step_number: 5, instruction: 'Polej oliwą, posyp oregano, solą i pieprzem.', ingredients_needed: ['3 łyżki oliwy', 'oregano', 'sól i pieprz'] }
    ],
    macros: { calories: 320, protein: 12, carbs: 12, fat: 26 },
    tags: ['greckie', 'wegetariańskie', 'letnie'],
    image_emoji: '🥗'
  },
  {
    id: 'risotto-grzybowe',
    name: 'Risotto z grzybami',
    description: 'Kremowe risotto z aromatycznymi grzybami i parmezanem.',
    category: 'lunch',
    difficulty: 'medium',
    total_time_minutes: 40,
    servings: 2,
    ingredients: ['200g ryżu arborio', '300g grzybów mieszanych', '1 cebula', '100ml białego wina', '700ml bulionu warzywnego', '50g parmezanu', '2 łyżki masła', 'tymianek'],
    tools_needed: ['szeroki garnek', 'patelnia', 'chochla'],
    steps: [
      { step_number: 1, instruction: 'Podgrzej bulion w osobnym garnku i utrzymuj gorący.', ingredients_needed: ['700ml bulionu warzywnego'] },
      { step_number: 2, instruction: 'Na patelni podsmaż pokrojone grzyby na maśle, odstaw.', duration_minutes: 5, ingredients_needed: ['300g grzybów mieszanych', '1 łyżka masła'] },
      { step_number: 3, instruction: 'W garnku podsmaż posiekaną cebulę na maśle.', duration_minutes: 3, ingredients_needed: ['1 cebula', '1 łyżka masła'] },
      { step_number: 4, instruction: 'Dodaj ryż i smaż mieszając przez 2 minuty.', duration_minutes: 2, ingredients_needed: ['200g ryżu arborio'] },
      { step_number: 5, instruction: 'Wlej wino i mieszaj aż wyparuje.', duration_minutes: 2, ingredients_needed: ['100ml białego wina'] },
      { step_number: 6, instruction: 'Dodawaj gorący bulion chochlą po chochli, mieszając do wchłonięcia.', duration_minutes: 18, tip: 'To klucz do kremowego risotto - cierpliwość!' },
      { step_number: 7, instruction: 'Pod koniec wmieszaj grzyby, parmezan i tymianek.', ingredients_needed: ['50g parmezanu', 'tymianek'] }
    ],
    macros: { calories: 480, protein: 16, carbs: 58, fat: 18 },
    tags: ['włoskie', 'wegetariańskie', 'eleganckie'],
    image_emoji: '🍚'
  },
  {
    id: 'pieczona-pierś-kurczaka',
    name: 'Pierś kurczaka z warzywami',
    description: 'Soczysta pierś kurczaka pieczona z kolorowymi warzywami.',
    category: 'lunch',
    difficulty: 'easy',
    total_time_minutes: 40,
    servings: 2,
    ingredients: ['2 piersi kurczaka', '2 papryki', '1 cukinia', '1 czerwona cebula', '3 łyżki oliwy', 'rozmaryn', 'tymianek', 'sól i pieprz'],
    tools_needed: ['blacha do pieczenia', 'nóż', 'miska'],
    steps: [
      { step_number: 1, instruction: 'Rozgrzej piekarnik do 200°C.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Pokrój warzywa w kawałki, wymieszaj z 2 łyżkami oliwy i ziołami.', ingredients_needed: ['2 papryki', '1 cukinia', '1 czerwona cebula', '2 łyżki oliwy', 'rozmaryn', 'tymianek'] },
      { step_number: 3, instruction: 'Rozłóż warzywa na blasze.', tip: 'Warzywa nie powinny się nakładać.' },
      { step_number: 4, instruction: 'Natrzyj kurczaka oliwą, solą, pieprzem i ziołami. Ułóż na warzywach.', ingredients_needed: ['2 piersi kurczaka', '1 łyżka oliwy', 'sól i pieprz'] },
      { step_number: 5, instruction: 'Piecz 25-30 minut aż kurczak będzie złocisty.', duration_minutes: 28 }
    ],
    macros: { calories: 380, protein: 45, carbs: 15, fat: 16 },
    tags: ['wysokobiałkowe', 'dietetyczne', 'bezglutenowe'],
    image_emoji: '🍗'
  },
  {
    id: 'zupa-krem-pomidorowa',
    name: 'Krem z pomidorów',
    description: 'Aksamitna zupa pomidorowa z bazylią i grzankami.',
    category: 'lunch',
    difficulty: 'easy',
    total_time_minutes: 30,
    servings: 4,
    ingredients: ['800g pomidorów z puszki', '1 cebula', '3 ząbki czosnku', '500ml bulionu warzywnego', '100ml śmietanki', 'świeża bazylia', '2 łyżki oliwy'],
    tools_needed: ['garnek', 'blender ręczny'],
    steps: [
      { step_number: 1, instruction: 'Podsmaż posiekaną cebulę i czosnek na oliwie.', duration_minutes: 5, ingredients_needed: ['1 cebula', '3 ząbki czosnku', '2 łyżki oliwy'] },
      { step_number: 2, instruction: 'Dodaj pomidory i bulion, zagotuj.', ingredients_needed: ['800g pomidorów z puszki', '500ml bulionu warzywnego'] },
      { step_number: 3, instruction: 'Gotuj na wolnym ogniu 15 minut.', duration_minutes: 15 },
      { step_number: 4, instruction: 'Zblenduj zupę na gładki krem.', tip: 'Uważaj - gorąca zupa może pryskać!' },
      { step_number: 5, instruction: 'Wmieszaj śmietankę, dopraw do smaku. Podawaj z bazylią.', ingredients_needed: ['100ml śmietanki', 'świeża bazylia'] }
    ],
    macros: { calories: 180, protein: 5, carbs: 18, fat: 10 },
    tags: ['zupy', 'wegetariańskie', 'rozgrzewające'],
    image_emoji: '🍅'
  },
  {
    id: 'tacos-z-wolowina',
    name: 'Tacos z wołowiną',
    description: 'Chrupiące tacos z pikantną wołowiną i świeżymi dodatkami.',
    category: 'lunch',
    difficulty: 'medium',
    total_time_minutes: 25,
    servings: 2,
    ingredients: ['250g mięsa mielonego wołowego', '6 twardych tortilli taco', '1 pomidor', '1/2 cebuli', 'sałata', '50g sera cheddar', 'śmietana', 'przyprawa taco'],
    tools_needed: ['patelnia', 'tarka', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Rozgrzej piekarnik do 180°C i podgrzej tortille przez 3 minuty.', duration_minutes: 3, ingredients_needed: ['6 twardych tortilli taco'] },
      { step_number: 2, instruction: 'Podsmaż mięso z posiekaną cebulą.', duration_minutes: 5, ingredients_needed: ['250g mięsa mielonego wołowego', '1/2 cebuli'] },
      { step_number: 3, instruction: 'Dodaj przyprawę taco i 50ml wody, gotuj aż odparuje.', duration_minutes: 5, ingredients_needed: ['przyprawa taco'] },
      { step_number: 4, instruction: 'Pokrój pomidor w kostkę, potnij sałatę, zetrzyj ser.', ingredients_needed: ['1 pomidor', 'sałata', '50g sera cheddar'] },
      { step_number: 5, instruction: 'Napełnij tortille mięsem i dodatkami, polej śmietaną.', ingredients_needed: ['śmietana'] }
    ],
    macros: { calories: 520, protein: 32, carbs: 38, fat: 28 },
    tags: ['meksykańskie', 'imprezowe', 'pikantne'],
    image_emoji: '🌮'
  },
  {
    id: 'losos-pieczony',
    name: 'Łosoś pieczony z cytryną',
    description: 'Delikatny łosoś pieczony z ziołami i cytryną.',
    category: 'lunch',
    difficulty: 'easy',
    total_time_minutes: 25,
    servings: 2,
    ingredients: ['2 filety z łososia', '1 cytryna', '2 ząbki czosnku', 'świeży koperek', '2 łyżki oliwy', 'sól i pieprz'],
    tools_needed: ['blacha do pieczenia', 'folia aluminiowa'],
    steps: [
      { step_number: 1, instruction: 'Rozgrzej piekarnik do 200°C.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Ułóż filety na folii aluminiowej.', ingredients_needed: ['2 filety z łososia'] },
      { step_number: 3, instruction: 'Posiekaj czosnek, połóż na rybie z plasterkami cytryny.', ingredients_needed: ['2 ząbki czosnku', '1 cytryna'] },
      { step_number: 4, instruction: 'Skrop oliwą, dopraw, posyp koperkiem.', ingredients_needed: ['2 łyżki oliwy', 'sól i pieprz', 'świeży koperek'] },
      { step_number: 5, instruction: 'Zawiń folię i piecz 15-18 minut.', duration_minutes: 16, tip: 'Łosoś powinien być różowy w środku.' }
    ],
    macros: { calories: 380, protein: 35, carbs: 3, fat: 26 },
    tags: ['omega-3', 'dietetyczne', 'eleganckie'],
    image_emoji: '🐟'
  },
  {
    id: 'stir-fry-tofu',
    name: 'Stir-fry z tofu i warzywami',
    description: 'Szybkie danie azjatyckie z chrupiącym tofu i warzywami.',
    category: 'lunch',
    difficulty: 'easy',
    total_time_minutes: 20,
    servings: 2,
    ingredients: ['200g tofu', '1 papryka', '1 marchewka', '100g brokuła', '3 łyżki sosu sojowego', '1 łyżka oleju sezamowego', 'imbir', 'czosnek', 'sezam'],
    tools_needed: ['wok lub głęboka patelnia', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Pokrój tofu w kostkę, osusz papierowym ręcznikiem.', ingredients_needed: ['200g tofu'], tip: 'Im bardziej suche tofu, tym bardziej chrupiące!' },
      { step_number: 2, instruction: 'Pokrój warzywa w paski, brokuły w różyczki.', ingredients_needed: ['1 papryka', '1 marchewka', '100g brokuła'] },
      { step_number: 3, instruction: 'Rozgrzej olej w woku, podsmaż tofu do złocistości.', duration_minutes: 5, ingredients_needed: ['1 łyżka oleju sezamowego'] },
      { step_number: 4, instruction: 'Dodaj posiekany imbir i czosnek, smaż 30 sekund.', ingredients_needed: ['imbir', 'czosnek'] },
      { step_number: 5, instruction: 'Wrzuć warzywa i smaż na dużym ogniu 4-5 minut.', duration_minutes: 5 },
      { step_number: 6, instruction: 'Polej sosem sojowym, posyp sezamem. Podawaj!', ingredients_needed: ['3 łyżki sosu sojowego', 'sezam'] }
    ],
    macros: { calories: 280, protein: 18, carbs: 20, fat: 16 },
    tags: ['wegańskie', 'azjatyckie', 'szybkie'],
    image_emoji: '🥢'
  },
  {
    id: 'kotlet-schabowy',
    name: 'Kotlet schabowy',
    description: 'Klasyczny polski kotlet w chrupiącej panierce.',
    category: 'lunch',
    difficulty: 'medium',
    total_time_minutes: 30,
    servings: 2,
    ingredients: ['2 kotlety schabowe', '1 jajko', '50g bułki tartej', '50g mąki', 'olej do smażenia', 'sól i pieprz', 'cytryna do podania'],
    tools_needed: ['3 talerze głębokie', 'patelnia', 'tłuczek do mięsa'],
    steps: [
      { step_number: 1, instruction: 'Rozbij schabowe tłuczkiem na grubość ok. 1 cm.', ingredients_needed: ['2 kotlety schabowe'], tip: 'Rozbijaj od środka na zewnątrz.' },
      { step_number: 2, instruction: 'Dopraw mięso solą i pieprzem z obu stron.', ingredients_needed: ['sól i pieprz'] },
      { step_number: 3, instruction: 'Przygotuj 3 talerze: mąka, rozbite jajko, bułka tarta.', ingredients_needed: ['50g mąki', '1 jajko', '50g bułki tartej'] },
      { step_number: 4, instruction: 'Obtocz kotlety kolejno: mąka, jajko, bułka.', tip: 'Upewnij się, że panierka przylega równomiernie.' },
      { step_number: 5, instruction: 'Smaż na głębokim oleju 3-4 minuty z każdej strony.', duration_minutes: 8, ingredients_needed: ['olej do smażenia'] },
      { step_number: 6, instruction: 'Odsącz na papierze, podawaj z cytryną.', ingredients_needed: ['cytryna do podania'] }
    ],
    macros: { calories: 450, protein: 38, carbs: 28, fat: 22 },
    tags: ['polskie', 'tradycyjne', 'comfort food'],
    image_emoji: '🥩'
  },

  // === KOLACJE (6) ===
  {
    id: 'salatka-cezar',
    name: 'Sałatka Cezar z kurczakiem',
    description: 'Klasyczna sałatka z grillowanym kurczakiem i kremowym sosem.',
    category: 'dinner',
    difficulty: 'easy',
    total_time_minutes: 20,
    servings: 2,
    ingredients: ['2 piersi kurczaka', 'sałata rzymska', '50g parmezanu', 'grzanki', 'sos cezar', 'sól i pieprz'],
    tools_needed: ['patelnia grillowa', 'miska', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Dopraw kurczaka solą i pieprzem.', ingredients_needed: ['2 piersi kurczaka', 'sól i pieprz'] },
      { step_number: 2, instruction: 'Grilluj piersi 5-6 minut z każdej strony.', duration_minutes: 12, tip: 'Kurczak gotowy gdy sok jest przejrzysty.' },
      { step_number: 3, instruction: 'Porwij sałatę na kawałki, włóż do miski.', ingredients_needed: ['sałata rzymska'] },
      { step_number: 4, instruction: 'Pokrój kurczaka w paski, ułóż na sałacie.', tip: 'Daj kurczakowi odpocząć 3 minuty przed krojeniem.' },
      { step_number: 5, instruction: 'Dodaj grzanki, wiórki parmezanu i polej sosem.', ingredients_needed: ['50g parmezanu', 'grzanki', 'sos cezar'] }
    ],
    macros: { calories: 420, protein: 42, carbs: 18, fat: 20 },
    tags: ['wysokobiałkowe', 'lekkie', 'klasyczne'],
    image_emoji: '🥬'
  },
  {
    id: 'wrap-z-kurczakiem',
    name: 'Wrap z kurczakiem i hummusem',
    description: 'Zdrowy wrap z grillowanym kurczakiem, świeżymi warzywami i hummusem.',
    category: 'dinner',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 2,
    ingredients: ['2 tortille pszenne', '200g piersi kurczaka', '4 łyżki hummusu', 'sałata', 'pomidor', 'ogórek', 'czerwona cebula'],
    tools_needed: ['patelnia', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Pokrój kurczaka w paski, dopraw i usmaż na patelni.', duration_minutes: 8, ingredients_needed: ['200g piersi kurczaka'] },
      { step_number: 2, instruction: 'Pokrój warzywa w paski.', ingredients_needed: ['sałata', 'pomidor', 'ogórek', 'czerwona cebula'] },
      { step_number: 3, instruction: 'Rozłóż hummus na tortilli.', ingredients_needed: ['2 tortille pszenne', '4 łyżki hummusu'] },
      { step_number: 4, instruction: 'Ułóż kurczaka i warzywa na środku.', tip: 'Nie przekładaj - wrap ma się domknąć!' },
      { step_number: 5, instruction: 'Zawiń tortillę: najpierw boki, potem zroluj.', tip: 'Możesz podgrzać gotowy wrap na suchej patelni.' }
    ],
    macros: { calories: 380, protein: 32, carbs: 35, fat: 14 },
    tags: ['szybkie', 'zdrowe', 'na wynos'],
    image_emoji: '🌯'
  },
  {
    id: 'omlet-szpinakowy',
    name: 'Omlet ze szpinakiem i fetą',
    description: 'Puszysty omlet nadziewany świeżym szpinakiem i serem feta.',
    category: 'dinner',
    difficulty: 'easy',
    total_time_minutes: 10,
    servings: 1,
    ingredients: ['3 jajka', 'garść świeżego szpinaku', '30g sera feta', '1 łyżka masła', 'sól i pieprz'],
    tools_needed: ['patelnia nieprzywierająca', 'miska', 'szpatułka'],
    steps: [
      { step_number: 1, instruction: 'Rozbij jajka, dopraw solą i pieprzem, roztrzep.', ingredients_needed: ['3 jajka', 'sól i pieprz'] },
      { step_number: 2, instruction: 'Rozgrzej masło na patelni na średnim ogniu.', ingredients_needed: ['1 łyżka masła'] },
      { step_number: 3, instruction: 'Wlej jajka i gotuj nie mieszając 2 minuty.', duration_minutes: 2 },
      { step_number: 4, instruction: 'Na jedną połowę połóż szpinak i pokruszoną fetę.', ingredients_needed: ['garść świeżego szpinaku', '30g sera feta'] },
      { step_number: 5, instruction: 'Złóż omlet na pół i gotuj jeszcze minutę. Podawaj!', duration_minutes: 1 }
    ],
    macros: { calories: 340, protein: 24, carbs: 3, fat: 26 },
    tags: ['keto', 'wegetariańskie', 'szybkie'],
    image_emoji: '🍳'
  },
  {
    id: 'zupa-dyniowa',
    name: 'Kremowa zupa dyniowa',
    description: 'Aksamitna zupa z dyni z nutą imbiru i prażonymi pestkami.',
    category: 'dinner',
    difficulty: 'easy',
    total_time_minutes: 35,
    servings: 4,
    ingredients: ['500g dyni', '1 cebula', '2 ząbki czosnku', '1 kawałek imbiru', '400ml bulionu', '100ml śmietanki', 'pestki dyni do dekoracji'],
    tools_needed: ['garnek', 'blender'],
    steps: [
      { step_number: 1, instruction: 'Obierz dynię i pokrój w kostkę.', ingredients_needed: ['500g dyni'], tip: 'Dynia piżmowa jest najsłodsza!' },
      { step_number: 2, instruction: 'Podsmaż posiekaną cebulę, czosnek i imbir.', duration_minutes: 5, ingredients_needed: ['1 cebula', '2 ząbki czosnku', '1 kawałek imbiru'] },
      { step_number: 3, instruction: 'Dodaj dynię i bulion, gotuj do miękkości.', duration_minutes: 20, ingredients_needed: ['400ml bulionu'] },
      { step_number: 4, instruction: 'Zblenduj na gładki krem, wmieszaj śmietankę.', ingredients_needed: ['100ml śmietanki'] },
      { step_number: 5, instruction: 'Podawaj z prażonymi pestkami dyni.', ingredients_needed: ['pestki dyni do dekoracji'] }
    ],
    macros: { calories: 180, protein: 4, carbs: 22, fat: 9 },
    tags: ['jesienna', 'rozgrzewająca', 'wegetariańska'],
    image_emoji: '🎃'
  },
  {
    id: 'pizza-domowa',
    name: 'Domowa pizza margherita',
    description: 'Klasyczna włoska pizza z sosem pomidorowym, mozzarellą i bazylią.',
    category: 'dinner',
    difficulty: 'medium',
    total_time_minutes: 45,
    servings: 2,
    ingredients: ['250g mąki', '150ml ciepłej wody', '7g drożdży', '200g passaty', '200g mozzarelli', 'świeża bazylia', 'oliwa', 'sól'],
    tools_needed: ['miska', 'wałek', 'blacha do pieczenia'],
    steps: [
      { step_number: 1, instruction: 'Rozpuść drożdże w ciepłej wodzie, odstaw na 5 minut.', duration_minutes: 5, ingredients_needed: ['7g drożdży', '150ml ciepłej wody'] },
      { step_number: 2, instruction: 'Wymieszaj mąkę z solą, dodaj drożdże, wyrabiaj 10 minut.', duration_minutes: 10, ingredients_needed: ['250g mąki', 'sól'] },
      { step_number: 3, instruction: 'Przykryj ciasto i odstaw na 20 minut.', duration_minutes: 20 },
      { step_number: 4, instruction: 'Rozgrzej piekarnik do 250°C (max temperatura!).', tip: 'Im goręcej, tym lepsza pizza!' },
      { step_number: 5, instruction: 'Rozwałkuj ciasto, przełóż na blachę, rozsmaruj passatę.', ingredients_needed: ['200g passaty'] },
      { step_number: 6, instruction: 'Ułóż plastry mozzarelli, skrop oliwą.', ingredients_needed: ['200g mozzarelli', 'oliwa'] },
      { step_number: 7, instruction: 'Piecz 8-10 minut. Udekoruj bazylią po wyjęciu.', duration_minutes: 9, ingredients_needed: ['świeża bazylia'] }
    ],
    macros: { calories: 580, protein: 24, carbs: 68, fat: 22 },
    tags: ['włoskie', 'domowe', 'imprezowe'],
    image_emoji: '🍕'
  },
  {
    id: 'salatka-z-tunczykiem',
    name: 'Sałatka z tuńczykiem',
    description: 'Sycąca sałatka z tuńczykiem, jajkami i warzywami.',
    category: 'dinner',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 2,
    ingredients: ['1 puszka tuńczyka', '2 jajka', 'mix sałat', '1 pomidor', '1/2 ogórka', 'oliwki', 'sos vinegrette'],
    tools_needed: ['miska', 'garnek', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Ugotuj jajka na twardo (8 minut), ostudź i obierz.', duration_minutes: 10, ingredients_needed: ['2 jajka'] },
      { step_number: 2, instruction: 'Pokrój pomidora i ogórka, jajka w ćwiartki.', ingredients_needed: ['1 pomidor', '1/2 ogórka'] },
      { step_number: 3, instruction: 'Rozłóż mix sałat na talerzu.', ingredients_needed: ['mix sałat'] },
      { step_number: 4, instruction: 'Odsącz tuńczyka, rozłóż z warzywami i oliwkami.', ingredients_needed: ['1 puszka tuńczyka', 'oliwki'] },
      { step_number: 5, instruction: 'Polej sosem vinegrette i podawaj.', ingredients_needed: ['sos vinegrette'] }
    ],
    macros: { calories: 320, protein: 28, carbs: 10, fat: 20 },
    tags: ['wysokobiałkowe', 'dietetyczne', 'szybkie'],
    image_emoji: '🐟'
  },

  // === PRZEKĄSKI (5) ===
  {
    id: 'hummus-domowy',
    name: 'Domowy hummus',
    description: 'Kremowy hummus z ciecierzycy z tahini i czosnkiem.',
    category: 'snack',
    difficulty: 'easy',
    total_time_minutes: 10,
    servings: 4,
    ingredients: ['400g ciecierzycy z puszki', '3 łyżki tahini', '2 ząbki czosnku', 'sok z cytryny', '3 łyżki oliwy', 'kminek', 'papryka wędzona'],
    tools_needed: ['blender'],
    steps: [
      { step_number: 1, instruction: 'Odsącz ciecierzycę, zachowaj trochę płynu.', ingredients_needed: ['400g ciecierzycy z puszki'] },
      { step_number: 2, instruction: 'Wrzuć ciecierzycę do blendera z tahini i czosnkiem.', ingredients_needed: ['3 łyżki tahini', '2 ząbki czosnku'] },
      { step_number: 3, instruction: 'Dodaj sok z cytryny i oliwę, blenduj na gładko.', ingredients_needed: ['sok z cytryny', '2 łyżki oliwy'], tip: 'Dodawaj płyn z ciecierzycy dla kremowości.' },
      { step_number: 4, instruction: 'Dopraw kminkiem. Podawaj z oliwą i papryką.', ingredients_needed: ['kminek', 'papryka wędzona', '1 łyżka oliwy'] }
    ],
    macros: { calories: 180, protein: 8, carbs: 18, fat: 10 },
    tags: ['wegańskie', 'zdrowe', 'dip'],
    image_emoji: '🫘'
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    description: 'Meksykańska pasta z awokado z limonką i kolendrą.',
    category: 'snack',
    difficulty: 'easy',
    total_time_minutes: 10,
    servings: 4,
    ingredients: ['2 dojrzałe awokado', '1 pomidor', '1/4 cebuli', '1 papryczka jalapeño', 'sok z limonki', 'świeża kolendra', 'sól'],
    tools_needed: ['miska', 'widelec', 'nóż'],
    steps: [
      { step_number: 1, instruction: 'Przekrój awokado, wyjmij pestkę i łyżką wydobądź miąższ.', ingredients_needed: ['2 dojrzałe awokado'] },
      { step_number: 2, instruction: 'Rozgnieć awokado widelcem (niezbyt gładko!).', tip: 'Guacamole powinno mieć teksturę.' },
      { step_number: 3, instruction: 'Pokrój drobno pomidora, cebulę i jalapeño.', ingredients_needed: ['1 pomidor', '1/4 cebuli', '1 papryczka jalapeño'] },
      { step_number: 4, instruction: 'Wymieszaj wszystko, dodaj sok z limonki i posiekaną kolendrę.', ingredients_needed: ['sok z limonki', 'świeża kolendra'] },
      { step_number: 5, instruction: 'Dopraw solą i podawaj od razu z nachos!', ingredients_needed: ['sól'] }
    ],
    macros: { calories: 160, protein: 2, carbs: 8, fat: 14 },
    tags: ['meksykańskie', 'wegańskie', 'dip'],
    image_emoji: '🥑'
  },
  {
    id: 'bruschetta',
    name: 'Bruschetta z pomidorami',
    description: 'Włoska grzanka z dojrzałymi pomidorami i bazylią.',
    category: 'snack',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 4,
    ingredients: ['1 bagietka', '4 dojrzałe pomidory', '2 ząbki czosnku', 'świeża bazylia', '3 łyżki oliwy extra virgin', 'sól morska', 'ocet balsamiczny'],
    tools_needed: ['nóż', 'miska', 'toster lub grill'],
    steps: [
      { step_number: 1, instruction: 'Pokrój bagietkę w ukośne plastry grubości 2 cm.', ingredients_needed: ['1 bagietka'] },
      { step_number: 2, instruction: 'Opiecz kromki na złoty kolor.', duration_minutes: 3, tip: 'Możesz użyć tostera, grilla lub piekarnika.' },
      { step_number: 3, instruction: 'Natrzyj gorące grzanki przekrojonym ząbkiem czosnku.', ingredients_needed: ['1 ząbek czosnku'] },
      { step_number: 4, instruction: 'Pokrój pomidory w kostkę, wymieszaj z posiekanym czosnkiem, bazylią i oliwą.', ingredients_needed: ['4 dojrzałe pomidory', '1 ząbek czosnku', 'świeża bazylia', '3 łyżki oliwy extra virgin'] },
      { step_number: 5, instruction: 'Nakładaj mieszankę na grzanki, dopraw solą i octem.', ingredients_needed: ['sól morska', 'ocet balsamiczny'] }
    ],
    macros: { calories: 180, protein: 4, carbs: 22, fat: 9 },
    tags: ['włoskie', 'przystawka', 'letnie'],
    image_emoji: '🍅'
  },
  {
    id: 'kulki-energetyczne',
    name: 'Kulki energetyczne daktylowe',
    description: 'Zdrowe słodycze bez cukru z daktyli, orzechów i kakao.',
    category: 'snack',
    difficulty: 'easy',
    total_time_minutes: 15,
    servings: 12,
    ingredients: ['200g daktyli bez pestek', '100g orzechów nerkowca', '3 łyżki kakao', '2 łyżki masła orzechowego', 'wiórki kokosowe do obtoczenia'],
    tools_needed: ['blender lub malakser'],
    steps: [
      { step_number: 1, instruction: 'Jeśli daktyle są twarde, namocz je w ciepłej wodzie na 10 minut.', ingredients_needed: ['200g daktyli bez pestek'] },
      { step_number: 2, instruction: 'Wrzuć wszystkie składniki do blendera oprócz wiórków.', ingredients_needed: ['100g orzechów nerkowca', '3 łyżki kakao', '2 łyżki masła orzechowego'] },
      { step_number: 3, instruction: 'Blenduj aż powstanie kleista masa.', tip: 'Jeśli masa jest za sucha, dodaj łyżkę wody.' },
      { step_number: 4, instruction: 'Formuj małe kulki mokrymi dłońmi.', tip: 'Powinno wyjść około 12 kulek.' },
      { step_number: 5, instruction: 'Obtocz w wiórkach kokosowych, schłódź w lodówce 30 minut.', duration_minutes: 30, ingredients_needed: ['wiórki kokosowe do obtoczenia'] }
    ],
    macros: { calories: 95, protein: 2, carbs: 12, fat: 5 },
    tags: ['bez cukru', 'wegańskie', 'zdrowe słodycze'],
    image_emoji: '🍫'
  },
  {
    id: 'jogurt-z-owocami',
    name: 'Jogurt grecki z owocami i granolą',
    description: 'Kremowy jogurt z sezonowymi owocami i chrupiącą granolą.',
    category: 'snack',
    difficulty: 'easy',
    total_time_minutes: 5,
    servings: 1,
    ingredients: ['200g jogurtu greckiego', '100g mieszanych owoców', '30g granoli', '1 łyżka miodu', 'kilka listków mięty'],
    tools_needed: ['miseczka'],
    steps: [
      { step_number: 1, instruction: 'Nałóż jogurt do miseczki.', ingredients_needed: ['200g jogurtu greckiego'] },
      { step_number: 2, instruction: 'Pokrój większe owoce, mniejsze zostaw całe.', ingredients_needed: ['100g mieszanych owoców'] },
      { step_number: 3, instruction: 'Ułóż owoce na jogurcie, posyp granolą.', ingredients_needed: ['30g granoli'] },
      { step_number: 4, instruction: 'Polej miodem i udekoruj miętą.', ingredients_needed: ['1 łyżka miodu', 'kilka listków mięty'] }
    ],
    macros: { calories: 320, protein: 18, carbs: 38, fat: 12 },
    tags: ['zdrowe', 'szybkie', 'śniadaniowe'],
    image_emoji: '🍓'
  },

  // === DESERY (3) ===
  {
    id: 'brownie-czekoladowe',
    name: 'Brownie czekoladowe',
    description: 'Intensywnie czekoladowe brownie - wilgotne w środku, chrupiące na wierzchu.',
    category: 'dessert',
    difficulty: 'medium',
    total_time_minutes: 40,
    servings: 12,
    ingredients: ['200g gorzkiej czekolady', '150g masła', '200g cukru', '3 jajka', '100g mąki', '50g kakao', 'szczypta soli'],
    tools_needed: ['garnek', 'miska', 'forma do pieczenia 20x20cm'],
    steps: [
      { step_number: 1, instruction: 'Rozgrzej piekarnik do 180°C, wyłóż formę papierem.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Rozpuść czekoladę z masłem w kąpieli wodnej.', duration_minutes: 5, ingredients_needed: ['200g gorzkiej czekolady', '150g masła'] },
      { step_number: 3, instruction: 'Ubij jajka z cukrem na puszystą masę.', duration_minutes: 3, ingredients_needed: ['3 jajka', '200g cukru'] },
      { step_number: 4, instruction: 'Wmieszaj wystudzoną czekoladę do jajek.', tip: 'Czekolada nie może być gorąca!' },
      { step_number: 5, instruction: 'Przesiej mąkę z kakao i solą, delikatnie wmieszaj.', ingredients_needed: ['100g mąki', '50g kakao', 'szczypta soli'] },
      { step_number: 6, instruction: 'Wylej do formy i piecz 20-25 minut.', duration_minutes: 22, tip: 'Wierzch ma być suchy, środek lekko wilgotny!' }
    ],
    macros: { calories: 280, protein: 4, carbs: 32, fat: 16 },
    tags: ['czekoladowe', 'klasyczne', 'imprezowe'],
    image_emoji: '🍫'
  },
  {
    id: 'panna-cotta',
    name: 'Panna cotta z malinami',
    description: 'Kremowy włoski deser z sosem malinowym.',
    category: 'dessert',
    difficulty: 'easy',
    total_time_minutes: 20,
    servings: 4,
    ingredients: ['400ml śmietanki 30%', '100ml mleka', '60g cukru', '2 łyżeczki żelatyny', '1 łyżeczka ekstraktu waniliowego', '200g malin', '2 łyżki cukru pudru'],
    tools_needed: ['garnek', 'foremki', 'blender'],
    steps: [
      { step_number: 1, instruction: 'Namocz żelatynę w 3 łyżkach zimnej wody.', duration_minutes: 5, ingredients_needed: ['2 łyżeczki żelatyny'] },
      { step_number: 2, instruction: 'Zagotuj śmietankę z mlekiem, cukrem i wanilią.', duration_minutes: 3, ingredients_needed: ['400ml śmietanki 30%', '100ml mleka', '60g cukru', '1 łyżeczka ekstraktu waniliowego'] },
      { step_number: 3, instruction: 'Zdejmij z ognia, rozpuść żelatynę w gorącej masie.', tip: 'Mieszaj aż żelatyna się całkowicie rozpuści.' },
      { step_number: 4, instruction: 'Rozlej do foremek, schłódź i wstaw do lodówki na min. 4h.', duration_minutes: 240 },
      { step_number: 5, instruction: 'Zblenduj maliny z cukrem pudrem na sos.', ingredients_needed: ['200g malin', '2 łyżki cukru pudru'] },
      { step_number: 6, instruction: 'Wywróć panna cottę na talerz, polej sosem.', tip: 'Zanurz foremkę na chwilę w gorącej wodzie przed wywróceniem.' }
    ],
    macros: { calories: 320, protein: 4, carbs: 28, fat: 22 },
    tags: ['włoskie', 'eleganckie', 'na specjalne okazje'],
    image_emoji: '🍮'
  },
  {
    id: 'banan-w-czekoladzie',
    name: 'Mrożone banany w czekoladzie',
    description: 'Szybki, zdrowy deser - banany w gorzkiej czekoladzie z dodatkami.',
    category: 'dessert',
    difficulty: 'easy',
    total_time_minutes: 60,
    servings: 4,
    ingredients: ['4 banany', '150g gorzkiej czekolady', '1 łyżka oleju kokosowego', 'posypki: orzechy, wiórki kokosowe, granola'],
    tools_needed: ['patyczki do lodów', 'garnek', 'blacha z papierem do pieczenia'],
    steps: [
      { step_number: 1, instruction: 'Obierz banany, przekrój na pół, wbij patyczki.', ingredients_needed: ['4 banany'] },
      { step_number: 2, instruction: 'Zamroź banany na 30 minut.', duration_minutes: 30, tip: 'Nie muszą być całkiem zamrożone.' },
      { step_number: 3, instruction: 'Rozpuść czekoladę z olejem kokosowym.', duration_minutes: 3, ingredients_needed: ['150g gorzkiej czekolady', '1 łyżka oleju kokosowego'] },
      { step_number: 4, instruction: 'Zanurz banany w czekoladzie, posyp dodatkami.', ingredients_needed: ['posypki: orzechy, wiórki kokosowe, granola'] },
      { step_number: 5, instruction: 'Zamroź do stwardnienia czekolady (ok. 15 min).', duration_minutes: 15, tip: 'Przechowuj w zamrażarce do 2 tygodni!' }
    ],
    macros: { calories: 220, protein: 3, carbs: 28, fat: 12 },
    tags: ['zdrowe', 'dla dzieci', 'letnie'],
    image_emoji: '🍌'
  }
];

export const getRecipesByCategory = (category: DatabaseRecipe['category']) => 
  recipesDatabase.filter(r => r.category === category);

export const getRecipeById = (id: string) => 
  recipesDatabase.find(r => r.id === id);

export const searchRecipes = (query: string) => 
  recipesDatabase.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.description.toLowerCase().includes(query.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );
