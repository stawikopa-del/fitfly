import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const preferencesSchema = z.object({
  taste: z.string().optional(),
  maxTime: z.number().min(5).max(180).optional(),
  maxCalories: z.number().min(50).max(2000).optional(),
  description: z.string().max(500).optional()
}).optional();

const inputSchema = z.object({
  ingredients: z.array(z.string().min(1).max(100)).max(30).optional(),
  imageBase64: z.string().max(10_000_000).optional(),
  preferences: preferencesSchema,
  singleRecipe: z.boolean().optional(),
  excludeRecipes: z.array(z.string()).optional()
}).refine(data => data.ingredients || data.imageBase64, {
  message: 'Wymagane ingredients lub imageBase64'
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    const body = await req.json();
    const parseResult = inputSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error);
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane wejściowe", details: parseResult.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { ingredients, imageBase64, preferences, singleRecipe, excludeRecipes } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const recipeCount = singleRecipe ? 1 : 3;
    let excludeText = '';
    if (excludeRecipes && excludeRecipes.length > 0) {
      excludeText = `\n\n⚠️ KRYTYCZNE: NIE GENERUJ tych przepisów (już zostały pokazane użytkownikowi): ${excludeRecipes.join(', ')}. 
Zaproponuj CAŁKOWICIE INNE przepisy - inne dania, inne techniki gotowania, inne kombinacje składników!`;
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build preferences string for prompt
    let preferencesText = '';
    if (preferences) {
      const parts = [];
      if (preferences.taste === 'sweet') parts.push('TYLKO przepisy słodkie (desery, słodkie śniadania)');
      if (preferences.taste === 'salty') parts.push('TYLKO przepisy wytrawne/słone');
      if (preferences.maxTime) parts.push(`czas przygotowania MAKSYMALNIE ${preferences.maxTime} minut (uwzględnij to w krokach!)`);
      if (preferences.maxCalories) parts.push(`MAKSYMALNIE ${preferences.maxCalories} kcal na porcję - ŚCIŚLE PRZESTRZEGAJ`);
      if (preferences.description) parts.push(`SPECJALNE WYMAGANIA UŻYTKOWNIKA: "${preferences.description}" - TO JEST PRIORYTET!`);
      
      if (parts.length > 0) {
        preferencesText = `\n\n🎯 OBOWIĄZKOWE PREFERENCJE UŻYTKOWNIKA:\n- ${parts.join('\n- ')}\n\nKAŻDY przepis MUSI spełniać WSZYSTKIE te wymagania!`;
      }
    }

    let userContent: any[];

    const systemPrompt = `Jesteś MISTRZEM KUCHNI i EKSPERTEM DIETETYKIEM z wieloletnim doświadczeniem.
Twoja specjalizacja: tworzenie REALISTYCZNYCH, PROSTYCH przepisów z dostępnych składników.

## ZASADY TWORZENIA PRZEPISÓW

### ZASADA 1: REALIZM I PROSTOTA
- Twórz przepisy, które NAPRAWDĘ da się przygotować
- Używaj TYLKO składników, które użytkownik podał (+ podstawowe przyprawy)
- Nie wymyślaj egzotycznych technik
- Preferuj proste, domowe metody gotowania

### ZASADA 2: DOKŁADNOŚĆ CZASOWA
- Podawaj REALISTYCZNY czas przygotowania
- Uwzględnij: krojenie, gotowanie, smażenie, czekanie
- Każdy krok musi mieć sensowny czas
- Suma czasów kroków ≈ total_time_minutes

### ZASADA 3: PRECYZJA ŻYWIENIOWA
Oblicz makro dla KAŻDEGO składnika i zsumuj:

BAZA KALORYCZNA (na 100g gotowego produktu):
MIĘSA: pierś kurczaka 165kcal/31B, wołowina 250kcal/26B, wieprzowina 200kcal/25B
RYBY: łosoś 208kcal/25B, dorsz 105kcal/23B, tuńczyk 130kcal/29B
WĘGLE: ryż gotowany 130kcal/28W, makaron 131kcal/25W, ziemniaki 87kcal/20W
NABIAŁ: jajko 155kcal/13B, ser żółty 350kcal/25B, jogurt 60kcal/4B
WARZYWA: większość 20-50kcal, pomidor 18kcal, papryka 26kcal

WALIDACJA: Kalorie ≈ (B×4) + (W×4) + (T×9) z tolerancją ±10%

### ZASADA 4: SPRZĘT KUCHENNY
Wymieniaj TYLKO niezbędne URZĄDZENIA:
✅ Poprawne: piekarnik, kuchenka, mikrofalówka, mikser, blender, robot kuchenny, toster, grill, frytkownica, parowar
❌ NIE wymieniaj: noże, deski, garnki, patelnie, miski (to oczywiste)

### ZASADA 5: SZCZEGÓŁOWE KROKI
Każdy krok musi zawierać:
- Konkretną instrukcję (nie ogólniki)
- Czas trwania tego kroku
- Składniki używane w tym kroku
- Opcjonalną wskazówkę dla początkujących`;

    const recipeJsonStructure = `{
  "detected_ingredients": ["produkt1", "produkt2", ...], // TYLKO przy analizie zdjęcia lodówki
  "recipes": [
    {
      "name": "Konkretna nazwa dania",
      "ingredients": ["150g składnik1", "2 łyżki składnik2", "szczypta soli"],
      "description": "Krótki, apetyczny opis dania (1-2 zdania)",
      "servings": 2,
      "total_time_minutes": 35,
      "tools_needed": ["piekarnik", "mikser"],
      "steps": [
        {
          "step_number": 1,
          "instruction": "Szczegółowa instrukcja - CO robić, JAK i DLACZEGO",
          "duration_minutes": 5,
          "ingredients_needed": ["150g składnik1", "sól"],
          "tip": "Wskazówka dla początkujących (opcjonalna)"
        }
      ],
      "macros": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 15
      }
    }
  ]
}`;

    if (imageBase64) {
      // Analyze fridge image with advanced prompt
      userContent = [
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        },
        {
          type: "text",
          text: `## ZADANIE: Analiza lodówki i generowanie przepisów

### KROK 1: SKANOWANIE LODÓWKI
Przeanalizuj zdjęcie BARDZO DOKŁADNIE:
- Szukaj produktów na KAŻDEJ półce
- Zwróć uwagę na drzwi lodówki
- Identyfikuj produkty po opakowaniach, kolorach, kształtach
- Uwzględnij częściowo widoczne produkty

SZUKAJ:
🥛 Nabiał: mleko, jogurty, sery, masło, śmietana
🥚 Jajka
🥩 Mięso i wędliny
🐟 Ryby
🥬 Warzywa: pomidory, ogórki, papryka, sałata, cebula, marchew
🍎 Owoce
🥫 Słoiki i puszki
🧃 Napoje i sosy
🍞 Pieczywo

### KROK 2: GENEROWANIE ${recipeCount} PRZEPISÓW
Stwórz ${recipeCount} ${recipeCount === 1 ? 'przepis' : 'różne przepisy'} używając TYLKO wykrytych składników.
${preferencesText}${excludeText}

Pamiętaj:
- Przepisy muszą być REALISTYCZNE
- Używaj TYLKO tego, co widzisz + podstawowe przyprawy
- Różnicuj techniki gotowania między przepisami

### FORMAT ODPOWIEDZI (TYLKO JSON!):
${recipeJsonStructure}`
        }
      ];
    } else if (ingredients && ingredients.length > 0) {
      // Generate recipes from ingredient list
      userContent = [
        {
          type: "text",
          text: `## ZADANIE: Stwórz ${recipeCount} ${recipeCount === 1 ? 'przepis' : 'przepisy'}

### DOSTĘPNE SKŁADNIKI:
${ingredients.map(i => `- ${i}`).join('\n')}

### ZAŁOŻENIA:
- Masz dostęp do podstawowych przypraw: sól, pieprz, olej, cukier
- Masz podstawowe zioła: bazylia, oregano, tymianek
- Nie dodawaj składników, których użytkownik nie podał
${preferencesText}${excludeText}

### WYMAGANIA:
- Każdy przepis musi używać GŁÓWNIE podanych składników
- Przepisy mają być RÓŻNORODNE (różne techniki, różne smaki)
- Makra muszą być PRECYZYJNE i ZWALIDOWANE
- Kroki muszą być SZCZEGÓŁOWE i dla POCZĄTKUJĄCYCH zrozumiałe

### FORMAT ODPOWIEDZI (TYLKO JSON!):
${recipeJsonStructure}`
        }
      ];
    } else {
      throw new Error("Brak składników lub zdjęcia");
    }

    console.log("Sending request to Lovable AI...");

    // Use gemini-2.5-pro for image analysis (better at visual recognition)
    const modelToUse = imageBase64 ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userContent
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Brak środków na koncie AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("Raw AI response:", content);

    // Parse JSON from response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Fix common AI hallucination issues - remove invalid patterns
      cleanContent = cleanContent.replace(/\s*plugins:\s*\{\},?\s*/g, '');
      cleanContent = cleanContent.replace(/,\s*,/g, ','); // double commas
      cleanContent = cleanContent.replace(/,\s*\]/g, ']'); // trailing comma in array
      cleanContent = cleanContent.replace(/,\s*\}/g, '}'); // trailing comma in object
      
      parsedContent = JSON.parse(cleanContent);
      
      // Validate macros for each recipe
      if (parsedContent.recipes) {
        for (const recipe of parsedContent.recipes) {
          if (recipe.macros) {
            const { calories, protein, carbs, fat } = recipe.macros;
            const calculated = (protein * 4) + (carbs * 4) + (fat * 9);
            const diff = Math.abs(calculated - calories);
            const percentDiff = (diff / calories) * 100;
            
            if (percentDiff > 15) {
              console.warn(`Recipe "${recipe.name}": macro mismatch - calculated ${calculated}, reported ${calories}`);
            }
          }
        }
      }
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content that failed to parse:", content?.substring(0, 500));
      
      // Return empty recipes as fallback
      parsedContent = {
        detected_ingredients: [],
        recipes: []
      };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-recipes:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
