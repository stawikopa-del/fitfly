// Baza produktów spożywczych z wartościami odżywczymi na 100g
export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  // Wartości na 100g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  // Domyślna porcja
  defaultServing: number; // w gramach
  servingUnit?: string; // np. "szt.", "baton", "szklanka"
}

export const productsDatabase: Product[] = [
  // === BATONY I SŁODYCZE ===
  { id: 'snickers', name: 'Snickers', brand: 'Mars', category: 'Słodycze', calories: 488, protein: 8.1, carbs: 59.5, fat: 23.8, defaultServing: 52, servingUnit: 'baton' },
  { id: 'mars', name: 'Mars', brand: 'Mars', category: 'Słodycze', calories: 449, protein: 4.3, carbs: 69.1, fat: 17.4, defaultServing: 51, servingUnit: 'baton' },
  { id: 'twix', name: 'Twix', brand: 'Mars', category: 'Słodycze', calories: 495, protein: 4.6, carbs: 63.6, fat: 24.8, defaultServing: 50, servingUnit: 'baton' },
  { id: 'bounty', name: 'Bounty', brand: 'Mars', category: 'Słodycze', calories: 487, protein: 4.1, carbs: 54.8, fat: 27.4, defaultServing: 57, servingUnit: 'baton' },
  { id: 'kitkat', name: 'KitKat', brand: 'Nestlé', category: 'Słodycze', calories: 518, protein: 6.5, carbs: 62.8, fat: 26.4, defaultServing: 41.5, servingUnit: 'baton' },
  { id: 'milky-way', name: 'Milky Way', brand: 'Mars', category: 'Słodycze', calories: 448, protein: 3.6, carbs: 71.5, fat: 16.4, defaultServing: 21.5, servingUnit: 'baton' },
  { id: 'kinder-bueno', name: 'Kinder Bueno', brand: 'Ferrero', category: 'Słodycze', calories: 572, protein: 9.2, carbs: 49.5, fat: 37.3, defaultServing: 43, servingUnit: 'baton' },
  { id: 'lion', name: 'Lion', brand: 'Nestlé', category: 'Słodycze', calories: 486, protein: 5.5, carbs: 63.5, fat: 23.2, defaultServing: 42, servingUnit: 'baton' },
  { id: 'prince-polo', name: 'Prince Polo', brand: 'Olza', category: 'Słodycze', calories: 520, protein: 6.2, carbs: 61.8, fat: 27.5, defaultServing: 35, servingUnit: 'baton' },
  { id: 'grześki', name: 'Grześki', brand: 'Goplana', category: 'Słodycze', calories: 530, protein: 7.0, carbs: 58.0, fat: 30.0, defaultServing: 36, servingUnit: 'baton' },
  { id: '3bit', name: '3 Bit', brand: 'Goplana', category: 'Słodycze', calories: 515, protein: 6.8, carbs: 60.5, fat: 27.2, defaultServing: 46, servingUnit: 'baton' },
  { id: 'ptasie-mleczko', name: 'Ptasie Mleczko', brand: 'Wedel', category: 'Słodycze', calories: 408, protein: 4.8, carbs: 70.2, fat: 12.5, defaultServing: 15, servingUnit: 'szt.' },
  { id: 'czekolada-mleczna-milka', name: 'Czekolada Mleczna', brand: 'Milka', category: 'Słodycze', calories: 530, protein: 6.3, carbs: 59.8, fat: 29.5, defaultServing: 100, servingUnit: 'tabliczka' },
  { id: 'haribo-misie', name: 'Złote Misie', brand: 'Haribo', category: 'Słodycze', calories: 343, protein: 6.9, carbs: 77.0, fat: 0.5, defaultServing: 100, servingUnit: 'opakowanie' },
  
  // === NAPOJE ===
  { id: 'coca-cola', name: 'Coca-Cola', brand: 'Coca-Cola', category: 'Napoje', calories: 42, protein: 0, carbs: 10.6, fat: 0, defaultServing: 330, servingUnit: 'puszka' },
  { id: 'coca-cola-zero', name: 'Coca-Cola Zero', brand: 'Coca-Cola', category: 'Napoje', calories: 0.4, protein: 0, carbs: 0, fat: 0, defaultServing: 330, servingUnit: 'puszka' },
  { id: 'pepsi', name: 'Pepsi', brand: 'PepsiCo', category: 'Napoje', calories: 44, protein: 0, carbs: 11.2, fat: 0, defaultServing: 330, servingUnit: 'puszka' },
  { id: 'fanta', name: 'Fanta Pomarańczowa', brand: 'Coca-Cola', category: 'Napoje', calories: 39, protein: 0, carbs: 9.3, fat: 0, defaultServing: 330, servingUnit: 'puszka' },
  { id: 'sprite', name: 'Sprite', brand: 'Coca-Cola', category: 'Napoje', calories: 32, protein: 0, carbs: 7.9, fat: 0, defaultServing: 330, servingUnit: 'puszka' },
  { id: 'red-bull', name: 'Red Bull', brand: 'Red Bull', category: 'Napoje', calories: 45, protein: 0.4, carbs: 10.1, fat: 0, defaultServing: 250, servingUnit: 'puszka' },
  { id: 'monster', name: 'Monster Energy', brand: 'Monster', category: 'Napoje', calories: 47, protein: 0, carbs: 11.0, fat: 0, defaultServing: 500, servingUnit: 'puszka' },
  { id: 'tymbark-jablko', name: 'Sok Jabłkowy', brand: 'Tymbark', category: 'Napoje', calories: 46, protein: 0.1, carbs: 11.0, fat: 0, defaultServing: 300, servingUnit: 'karton' },
  { id: 'tymbark-pomarancza', name: 'Sok Pomarańczowy', brand: 'Tymbark', category: 'Napoje', calories: 45, protein: 0.6, carbs: 10.4, fat: 0, defaultServing: 300, servingUnit: 'karton' },
  
  // === NABIAŁ ===
  { id: 'mleko-2', name: 'Mleko 2%', category: 'Nabiał', calories: 50, protein: 3.4, carbs: 4.8, fat: 2.0, defaultServing: 250, servingUnit: 'szklanka' },
  { id: 'mleko-3.2', name: 'Mleko 3.2%', category: 'Nabiał', calories: 60, protein: 3.2, carbs: 4.7, fat: 3.2, defaultServing: 250, servingUnit: 'szklanka' },
  { id: 'jogurt-naturalny', name: 'Jogurt Naturalny', category: 'Nabiał', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, defaultServing: 150, servingUnit: 'kubek' },
  { id: 'jogurt-grecki', name: 'Jogurt Grecki', category: 'Nabiał', calories: 97, protein: 9.0, carbs: 3.6, fat: 5.0, defaultServing: 170, servingUnit: 'kubek' },
  { id: 'serek-wiejski', name: 'Serek Wiejski', category: 'Nabiał', calories: 98, protein: 11.0, carbs: 3.4, fat: 4.3, defaultServing: 200, servingUnit: 'opakowanie' },
  { id: 'twarog-polslony', name: 'Twaróg Półtłusty', category: 'Nabiał', calories: 123, protein: 18.0, carbs: 3.0, fat: 4.0, defaultServing: 200, servingUnit: 'kostka' },
  { id: 'ser-zolty-gouda', name: 'Ser Żółty Gouda', category: 'Nabiał', calories: 356, protein: 25.0, carbs: 2.0, fat: 27.0, defaultServing: 30, servingUnit: 'plaster' },
  { id: 'ser-feta', name: 'Ser Feta', category: 'Nabiał', calories: 264, protein: 14.0, carbs: 4.0, fat: 21.0, defaultServing: 50, servingUnit: 'porcja' },
  { id: 'maslo', name: 'Masło', category: 'Nabiał', calories: 735, protein: 0.5, carbs: 0.6, fat: 82.5, defaultServing: 10, servingUnit: 'łyżeczka' },
  { id: 'jajko', name: 'Jajko kurze', category: 'Nabiał', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, defaultServing: 60, servingUnit: 'szt.' },
  { id: 'danio', name: 'Danio', brand: 'Danone', category: 'Nabiał', calories: 140, protein: 6.0, carbs: 17.0, fat: 5.5, defaultServing: 140, servingUnit: 'kubek' },
  { id: 'actimel', name: 'Actimel', brand: 'Danone', category: 'Nabiał', calories: 73, protein: 2.8, carbs: 11.5, fat: 1.6, defaultServing: 100, servingUnit: 'buteleczka' },
  { id: 'smetana', name: 'Śmietana 18%', category: 'Nabiał', calories: 188, protein: 2.5, carbs: 3.5, fat: 18.0, defaultServing: 30, servingUnit: 'łyżka' },
  
  // === PIECZYWO ===
  { id: 'chleb-pszenny', name: 'Chleb Pszenny', category: 'Pieczywo', calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, defaultServing: 40, servingUnit: 'kromka' },
  { id: 'chleb-razowy', name: 'Chleb Razowy', category: 'Pieczywo', calories: 250, protein: 8.5, carbs: 48.0, fat: 2.5, defaultServing: 40, servingUnit: 'kromka' },
  { id: 'bulka-pszenna', name: 'Bułka Pszenna', category: 'Pieczywo', calories: 285, protein: 9.5, carbs: 55.0, fat: 2.8, defaultServing: 50, servingUnit: 'szt.' },
  { id: 'bulka-grahamka', name: 'Bułka Grahamka', category: 'Pieczywo', calories: 270, protein: 10.0, carbs: 52.0, fat: 2.5, defaultServing: 70, servingUnit: 'szt.' },
  { id: 'bagietka', name: 'Bagietka', category: 'Pieczywo', calories: 289, protein: 9.0, carbs: 56.0, fat: 2.5, defaultServing: 150, servingUnit: 'szt.' },
  { id: 'croissant', name: 'Croissant', category: 'Pieczywo', calories: 406, protein: 8.0, carbs: 45.0, fat: 21.0, defaultServing: 60, servingUnit: 'szt.' },
  { id: 'tostowy', name: 'Chleb Tostowy', category: 'Pieczywo', calories: 255, protein: 8.0, carbs: 49.0, fat: 3.5, defaultServing: 25, servingUnit: 'kromka' },
  
  // === MIĘSO I WĘDLINY ===
  { id: 'pierś-kurczaka', name: 'Pierś z Kurczaka', category: 'Mięso', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'udo-kurczaka', name: 'Udo z Kurczaka', category: 'Mięso', calories: 209, protein: 26.0, carbs: 0, fat: 11.0, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'wołowina-mielona', name: 'Wołowina Mielona', category: 'Mięso', calories: 250, protein: 26.0, carbs: 0, fat: 15.0, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'schab-wieprzowy', name: 'Schab Wieprzowy', category: 'Mięso', calories: 171, protein: 29.0, carbs: 0, fat: 6.0, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'szynka', name: 'Szynka', category: 'Mięso', calories: 145, protein: 21.0, carbs: 2.0, fat: 5.5, defaultServing: 30, servingUnit: 'plaster' },
  { id: 'salami', name: 'Salami', category: 'Mięso', calories: 425, protein: 22.0, carbs: 2.0, fat: 36.0, defaultServing: 30, servingUnit: 'plaster' },
  { id: 'kabanos', name: 'Kabanos', category: 'Mięso', calories: 465, protein: 25.0, carbs: 1.0, fat: 40.0, defaultServing: 25, servingUnit: 'szt.' },
  { id: 'boczek', name: 'Boczek', category: 'Mięso', calories: 541, protein: 12.0, carbs: 0.6, fat: 53.0, defaultServing: 30, servingUnit: 'plaster' },
  { id: 'parówka', name: 'Parówka', category: 'Mięso', calories: 277, protein: 11.0, carbs: 2.5, fat: 25.0, defaultServing: 50, servingUnit: 'szt.' },
  { id: 'kiełbasa-krakowska', name: 'Kiełbasa Krakowska', category: 'Mięso', calories: 295, protein: 18.0, carbs: 1.0, fat: 24.0, defaultServing: 50, servingUnit: 'porcja' },
  
  // === RYBY ===
  { id: 'losos', name: 'Łosoś', category: 'Ryby', calories: 208, protein: 20.0, carbs: 0, fat: 13.0, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'tunczyk-w-puszce', name: 'Tuńczyk w Puszce', category: 'Ryby', calories: 128, protein: 26.0, carbs: 0, fat: 2.5, defaultServing: 100, servingUnit: 'puszka' },
  { id: 'dorsz', name: 'Dorsz', category: 'Ryby', calories: 82, protein: 18.0, carbs: 0, fat: 0.7, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'sledz', name: 'Śledź', category: 'Ryby', calories: 203, protein: 18.0, carbs: 0, fat: 14.0, defaultServing: 100, servingUnit: 'porcja' },
  { id: 'makrela-wedzona', name: 'Makrela Wędzona', category: 'Ryby', calories: 305, protein: 24.0, carbs: 0, fat: 23.0, defaultServing: 100, servingUnit: 'porcja' },
  
  // === WARZYWA ===
  { id: 'pomidor', name: 'Pomidor', category: 'Warzywa', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultServing: 150, servingUnit: 'szt.' },
  { id: 'ogorek', name: 'Ogórek', category: 'Warzywa', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, defaultServing: 150, servingUnit: 'szt.' },
  { id: 'marchew', name: 'Marchew', category: 'Warzywa', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, defaultServing: 80, servingUnit: 'szt.' },
  { id: 'ziemniak', name: 'Ziemniak', category: 'Warzywa', calories: 77, protein: 2.0, carbs: 17.0, fat: 0.1, defaultServing: 150, servingUnit: 'szt.' },
  { id: 'cebula', name: 'Cebula', category: 'Warzywa', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, defaultServing: 80, servingUnit: 'szt.' },
  { id: 'papryka-czerwona', name: 'Papryka Czerwona', category: 'Warzywa', calories: 31, protein: 1.0, carbs: 6.0, fat: 0.3, defaultServing: 150, servingUnit: 'szt.' },
  { id: 'salata', name: 'Sałata', category: 'Warzywa', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, defaultServing: 50, servingUnit: 'porcja' },
  { id: 'brokuly', name: 'Brokuły', category: 'Warzywa', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'szpinak', name: 'Szpinak', category: 'Warzywa', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, defaultServing: 100, servingUnit: 'porcja' },
  { id: 'awokado', name: 'Awokado', category: 'Warzywa', calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0, defaultServing: 100, servingUnit: 'połówka' },
  
  // === OWOCE ===
  { id: 'jablko', name: 'Jabłko', category: 'Owoce', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, defaultServing: 180, servingUnit: 'szt.' },
  { id: 'banan', name: 'Banan', category: 'Owoce', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, defaultServing: 120, servingUnit: 'szt.' },
  { id: 'pomarancza', name: 'Pomarańcza', category: 'Owoce', calories: 47, protein: 0.9, carbs: 12.0, fat: 0.1, defaultServing: 180, servingUnit: 'szt.' },
  { id: 'gruszka', name: 'Gruszka', category: 'Owoce', calories: 57, protein: 0.4, carbs: 15.0, fat: 0.1, defaultServing: 170, servingUnit: 'szt.' },
  { id: 'truskawki', name: 'Truskawki', category: 'Owoce', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'winogrona', name: 'Winogrona', category: 'Owoce', calories: 69, protein: 0.7, carbs: 18.0, fat: 0.2, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'mandarynka', name: 'Mandarynka', category: 'Owoce', calories: 53, protein: 0.8, carbs: 13.0, fat: 0.3, defaultServing: 80, servingUnit: 'szt.' },
  { id: 'kiwi', name: 'Kiwi', category: 'Owoce', calories: 61, protein: 1.1, carbs: 15.0, fat: 0.5, defaultServing: 75, servingUnit: 'szt.' },
  { id: 'arbuz', name: 'Arbuz', category: 'Owoce', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, defaultServing: 200, servingUnit: 'kawałek' },
  { id: 'ananas', name: 'Ananas', category: 'Owoce', calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1, defaultServing: 150, servingUnit: 'kawałek' },
  
  // === ZBOŻA I MAKARONY ===
  { id: 'ryz-bialy', name: 'Ryż Biały (ugotowany)', category: 'Zboża', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'ryz-brazowy', name: 'Ryż Brązowy (ugotowany)', category: 'Zboża', calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'makaron', name: 'Makaron (ugotowany)', category: 'Zboża', calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, defaultServing: 200, servingUnit: 'porcja' },
  { id: 'kasza-gryczana', name: 'Kasza Gryczana (ugotowana)', category: 'Zboża', calories: 92, protein: 3.4, carbs: 20.0, fat: 0.6, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'kasza-jaglana', name: 'Kasza Jaglana (ugotowana)', category: 'Zboża', calories: 119, protein: 3.5, carbs: 23.0, fat: 1.0, defaultServing: 150, servingUnit: 'porcja' },
  { id: 'platki-owsiane', name: 'Płatki Owsiane', category: 'Zboża', calories: 367, protein: 12.5, carbs: 66.0, fat: 7.0, defaultServing: 50, servingUnit: 'porcja' },
  { id: 'musli', name: 'Musli', category: 'Zboża', calories: 375, protein: 8.0, carbs: 67.0, fat: 8.5, defaultServing: 50, servingUnit: 'porcja' },
  { id: 'corn-flakes', name: 'Corn Flakes', brand: 'Kellogg\'s', category: 'Zboża', calories: 378, protein: 7.0, carbs: 84.0, fat: 0.9, defaultServing: 30, servingUnit: 'porcja' },
  { id: 'cini-minis', name: 'Cini Minis', brand: 'Nestlé', category: 'Zboża', calories: 403, protein: 5.5, carbs: 75.0, fat: 9.0, defaultServing: 30, servingUnit: 'porcja' },
  
  // === PRZEKĄSKI ===
  { id: 'chipsy-lays', name: 'Chipsy Solone', brand: 'Lay\'s', category: 'Przekąski', calories: 536, protein: 6.5, carbs: 52.0, fat: 33.0, defaultServing: 60, servingUnit: 'opakowanie' },
  { id: 'orzeszki-ziemne', name: 'Orzeszki Ziemne', category: 'Przekąski', calories: 567, protein: 26.0, carbs: 16.0, fat: 49.0, defaultServing: 50, servingUnit: 'garść' },
  { id: 'migdaly', name: 'Migdały', category: 'Przekąski', calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0, defaultServing: 30, servingUnit: 'garść' },
  { id: 'orzechy-wloskie', name: 'Orzechy Włoskie', category: 'Przekąski', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, defaultServing: 30, servingUnit: 'garść' },
  { id: 'paluszki-slone', name: 'Paluszki Słone', category: 'Przekąski', calories: 403, protein: 10.0, carbs: 74.0, fat: 7.0, defaultServing: 50, servingUnit: 'opakowanie' },
  { id: 'popcorn', name: 'Popcorn', category: 'Przekąski', calories: 387, protein: 13.0, carbs: 78.0, fat: 4.5, defaultServing: 30, servingUnit: 'porcja' },
  
  // === FAST FOOD ===
  { id: 'big-mac', name: 'Big Mac', brand: 'McDonald\'s', category: 'Fast Food', calories: 257, protein: 13.2, carbs: 20.6, fat: 13.8, defaultServing: 215, servingUnit: 'szt.' },
  { id: 'mcroyal', name: 'McRoyal', brand: 'McDonald\'s', category: 'Fast Food', calories: 235, protein: 14.0, carbs: 18.0, fat: 12.0, defaultServing: 235, servingUnit: 'szt.' },
  { id: 'cheeseburger', name: 'Cheeseburger', brand: 'McDonald\'s', category: 'Fast Food', calories: 250, protein: 12.0, carbs: 26.0, fat: 11.0, defaultServing: 118, servingUnit: 'szt.' },
  { id: 'frytki-srednie', name: 'Frytki Średnie', brand: 'McDonald\'s', category: 'Fast Food', calories: 323, protein: 3.4, carbs: 42.0, fat: 15.5, defaultServing: 114, servingUnit: 'porcja' },
  { id: 'nuggetsy', name: 'Nuggetsy (6 szt.)', brand: 'McDonald\'s', category: 'Fast Food', calories: 259, protein: 14.0, carbs: 15.0, fat: 16.0, defaultServing: 100, servingUnit: '6 szt.' },
  { id: 'pizza-margherita', name: 'Pizza Margherita', category: 'Fast Food', calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, defaultServing: 150, servingUnit: 'kawałek' },
  { id: 'kebab', name: 'Kebab w Bułce', category: 'Fast Food', calories: 235, protein: 12.0, carbs: 22.0, fat: 11.0, defaultServing: 350, servingUnit: 'szt.' },
  { id: 'hot-dog', name: 'Hot Dog', category: 'Fast Food', calories: 290, protein: 10.0, carbs: 24.0, fat: 17.0, defaultServing: 100, servingUnit: 'szt.' },
  
  // === SOSY I DODATKI ===
  { id: 'ketchup', name: 'Ketchup', category: 'Sosy', calories: 112, protein: 1.8, carbs: 26.0, fat: 0.1, defaultServing: 15, servingUnit: 'łyżka' },
  { id: 'majonez', name: 'Majonez', category: 'Sosy', calories: 680, protein: 1.0, carbs: 0.6, fat: 75.0, defaultServing: 15, servingUnit: 'łyżka' },
  { id: 'musztarda', name: 'Musztarda', category: 'Sosy', calories: 66, protein: 4.4, carbs: 6.4, fat: 3.3, defaultServing: 10, servingUnit: 'łyżeczka' },
  { id: 'oliwa', name: 'Oliwa z Oliwek', category: 'Sosy', calories: 884, protein: 0, carbs: 0, fat: 100, defaultServing: 10, servingUnit: 'łyżka' },
  { id: 'sos-sojowy', name: 'Sos Sojowy', category: 'Sosy', calories: 53, protein: 8.1, carbs: 4.9, fat: 0.1, defaultServing: 15, servingUnit: 'łyżka' },
  
  // === KAWY I HERBATY ===
  { id: 'kawa-czarna', name: 'Kawa Czarna', category: 'Napoje', calories: 2, protein: 0.3, carbs: 0, fat: 0, defaultServing: 200, servingUnit: 'filiżanka' },
  { id: 'kawa-latte', name: 'Kawa Latte', category: 'Napoje', calories: 67, protein: 3.4, carbs: 5.0, fat: 3.6, defaultServing: 300, servingUnit: 'kubek' },
  { id: 'cappuccino', name: 'Cappuccino', category: 'Napoje', calories: 74, protein: 4.0, carbs: 6.0, fat: 4.0, defaultServing: 180, servingUnit: 'filiżanka' },
  { id: 'herbata', name: 'Herbata (bez cukru)', category: 'Napoje', calories: 1, protein: 0, carbs: 0.3, fat: 0, defaultServing: 250, servingUnit: 'filiżanka' },
  
  // === BATONY PROTEINOWE ===
  { id: 'baton-proteinowy-olimp', name: 'Baton Proteinowy', brand: 'Olimp', category: 'Suplementy', calories: 365, protein: 32.0, carbs: 35.0, fat: 12.0, defaultServing: 64, servingUnit: 'baton' },
  { id: 'baton-proteinowy-bakalland', name: 'Baton Proteinowy', brand: 'Bakalland', category: 'Suplementy', calories: 340, protein: 25.0, carbs: 38.0, fat: 10.0, defaultServing: 35, servingUnit: 'baton' },
  { id: 'whey-protein', name: 'Odżywka Białkowa (porcja)', category: 'Suplementy', calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5, defaultServing: 30, servingUnit: 'porcja' },
  
  // === SŁODZIKI ===
  { id: 'cukier', name: 'Cukier', category: 'Słodziki', calories: 387, protein: 0, carbs: 100, fat: 0, defaultServing: 5, servingUnit: 'łyżeczka' },
  { id: 'miod', name: 'Miód', category: 'Słodziki', calories: 304, protein: 0.3, carbs: 82.0, fat: 0, defaultServing: 15, servingUnit: 'łyżka' },
  { id: 'dżem', name: 'Dżem Truskawkowy', category: 'Słodziki', calories: 250, protein: 0.4, carbs: 60.0, fat: 0.1, defaultServing: 20, servingUnit: 'łyżka' },
  { id: 'nutella', name: 'Nutella', brand: 'Ferrero', category: 'Słodziki', calories: 539, protein: 6.3, carbs: 57.5, fat: 31.0, defaultServing: 15, servingUnit: 'łyżka' },
  { id: 'maslo-orzechowe', name: 'Masło Orzechowe', category: 'Słodziki', calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, defaultServing: 15, servingUnit: 'łyżka' },
];

// Kategorie produktów
export const productCategories = [
  'Wszystkie',
  'Słodycze',
  'Napoje',
  'Nabiał',
  'Pieczywo',
  'Mięso',
  'Ryby',
  'Warzywa',
  'Owoce',
  'Zboża',
  'Przekąski',
  'Fast Food',
  'Sosy',
  'Suplementy',
  'Słodziki'
];
