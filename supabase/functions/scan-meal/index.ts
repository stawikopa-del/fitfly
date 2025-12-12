import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  imageBase64: z.string().min(100).max(10000000),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
      return new Response(JSON.stringify({ 
        error: "Nieprawidłowe zdjęcie" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { imageBase64 } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const systemPrompt = `Jesteś EKSPERTEM DIETETYKIEM z zaawansowaną wiedzą o wizualnej analizie żywności.
Twoja specjalizacja: PRECYZYJNE rozpoznawanie posiłków ze zdjęć i szacowanie ich wartości odżywczych.

## METODOLOGIA ANALIZY WIZUALNEJ (Chain of Thought)

### KROK 1: IDENTYFIKACJA KONTEKSTU
1. Określ typ naczynia (talerz płaski/głęboki, miska, pojemnik)
2. Oszacuj średnicę naczynia:
   - Standardowy talerz obiadowy: 24-27cm
   - Talerz deserowy: 19-21cm
   - Miska: 14-18cm średnicy
   - Pojemnik lunch-box: zwykle 500-800ml
3. Zwróć uwagę na perspektywę zdjęcia

### KROK 2: DEKOMPOZYCJA WIZUALNA
Dla KAŻDEGO widocznego elementu:
1. Zidentyfikuj produkt (bądź konkretny: "pierś kurczaka grillowana" nie "kurczak")
2. Oszacuj jego wymiary na talerzu (% powierzchni)
3. Oszacuj grubość/wysokość warstwy
4. Oblicz przybliżoną wagę

REFERENCJE WIZUALNE:
- Pierś kurczaka grillowana (wielkość dłoni): 120-150g
- Porcja ryżu (wielkość pięści): 150-180g
- Porcja sałaty (duża garść): 30-50g
- Plasterek chleba: 30-40g
- Jajko sadzone: 55-65g
- Łyżka sosu: 25-35g
- Warzywa na talerzu (1/4 talerza): 80-120g

### KROK 3: ANALIZA METODY PRZYRZĄDZENIA
Szukaj wskazówek wizualnych:
- Błyszcząca powierzchnia = tłuszcz/sos
- Brązowe przypieczenie = smażenie/grillowanie
- Jednolita matowa = gotowanie
- Panierka widoczna = smażone na głębokim tłuszczu
- Widoczny sos/zalewę = dolicz kalorie

### KROK 4: BAZA KALORYCZNA (kcal/100g PRODUKTU GOTOWEGO!)

MIĘSA I BIAŁKA:
- Pierś kurczaka grillowana: 165 kcal, 31g B, 0g W, 3.6g T
- Pierś kurczaka panierowana: 250 kcal, 22g B, 12g W, 13g T
- Kotlet schabowy panierowany: 280 kcal, 20g B, 10g W, 18g T
- Kotlet mielony: 220 kcal, 18g B, 5g W, 14g T
- Kiełbasa: 300 kcal, 12g B, 2g W, 27g T
- Łosoś pieczony: 208 kcal, 25g B, 0g W, 12g T
- Dorsz pieczony: 105 kcal, 23g B, 0g W, 1g T
- Jajko sadzone: 196 kcal, 14g B, 1g W, 15g T
- Jajecznica (z masłem): 180 kcal, 12g B, 1g W, 14g T

WĘGLOWODANY:
- Ryż biały gotowany: 130 kcal, 2.7g B, 28g W, 0.3g T
- Makaron gotowany: 131 kcal, 5g B, 25g W, 1.1g T
- Ziemniaki gotowane: 87 kcal, 2g B, 20g W, 0.1g T
- Ziemniaki puree (z masłem): 113 kcal, 2g B, 16g W, 5g T
- Frytki: 312 kcal, 3.4g B, 41g W, 15g T
- Kasza gryczana: 92 kcal, 3g B, 20g W, 0.6g T
- Chleb: 265 kcal, 9g B, 49g W, 3g T
- Bułka: 280 kcal, 9g B, 53g W, 3g T

WARZYWA I SAŁATKI:
- Sałata zielona: 15 kcal, 1g B, 2g W, 0.2g T
- Pomidor: 18 kcal, 0.9g B, 3.9g W, 0.2g T
- Ogórek: 15 kcal, 0.7g B, 3.6g W, 0.1g T
- Surówka z kapusty: 30 kcal, 1g B, 6g W, 0.3g T
- Surówka z marchewki: 45 kcal, 0.8g B, 10g W, 0.2g T
- Brokuły gotowane: 35 kcal, 2.8g B, 7g W, 0.4g T
- Buraki: 43 kcal, 1.6g B, 10g W, 0.2g T

SOSY I DODATKI:
- Sos pomidorowy: 40 kcal, 1g B, 8g W, 0.5g T
- Sos śmietanowy: 150 kcal, 2g B, 5g W, 14g T
- Sos pieczeniowy: 50 kcal, 1g B, 5g W, 3g T
- Ketchup (łyżka): 20 kcal
- Majonez (łyżka): 100 kcal
- Oliwa (łyżka): 120 kcal

ZUPY:
- Rosół: 30 kcal/100ml
- Pomidorowa: 45 kcal/100ml
- Żurek: 55 kcal/100ml
- Pieczarkowa kremowa: 80 kcal/100ml

POPULARNE DANIA POLSKIE (typowa porcja):
- Schabowy z ziemniakami i surówką: 650-850 kcal
- Pierogi ruskie (10 szt): 400-500 kcal
- Pierogi z mięsem (10 szt): 500-600 kcal
- Bigos (porcja 300g): 350-450 kcal
- Gołąbki (2 szt): 400-500 kcal
- Kopytka z sosem (porcja): 450-550 kcal
- Naleśniki z serem (2 szt): 400-500 kcal
- Placki ziemniaczane (3 szt): 350-450 kcal

### KROK 5: WALIDACJA KOŃCOWA
Sprawdź czy suma makroskładników = kalorie:
Kalorie ≈ (Białko × 4) + (Węglowodany × 4) + (Tłuszcz × 9)
Dopuszczalna rozbieżność: ±10%

## FORMAT ODPOWIEDZI (TYLKO JSON!)
{
  "name": "zwięzła nazwa posiłku po polsku (max 35 znaków)",
  "calories": liczba_całkowita_zaokrąglona_do_5,
  "protein": gramy_białka_zaokrąglone,
  "carbs": gramy_węglowodanów_zaokrąglone,
  "fat": gramy_tłuszczu_zaokrąglone,
  "confidence": "low" | "medium" | "high",
  "ingredients": ["składnik1 (szacowana waga)", "składnik2 (szacowana waga)"],
  "portion_estimate": "szczegółowy opis porcji i metody przygotowania"
}

CONFIDENCE:
- "high" = wyraźne, dobrze widoczne składniki, standardowa porcja
- "medium" = częściowo widoczne, typowe danie
- "low" = niewyraźne zdjęcie, nakładające się składniki`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              },
              {
                type: "text",
                text: `Przeanalizuj to zdjęcie posiłku KROK PO KROKU:

1. KONTEKST: Jaki typ naczynia? Jaka jest jego przybliżona wielkość?
2. SKŁADNIKI: Co dokładnie widzisz? Oszacuj wagę każdego elementu.
3. PRZYGOTOWANIE: Jak to zostało przygotowane (smażone, gotowane, pieczone)?
4. OBLICZENIA: Policz kalorie i makro dla każdego składnika.
5. SUMA: Zsumuj wszystko i zwaliduj wynik.

Odpowiedz TYLKO JSON-em bez żadnego dodatkowego tekstu.`
              }
            ]
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Za dużo zapytań! Poczekaj chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limit AI wyczerpany. Spróbuj później." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Błąd podczas analizy zdjęcia" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Brak odpowiedzi od AI");
    }

    console.log("AI response:", content);

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }
    
    const mealData = JSON.parse(jsonStr);
    
    // Validate the response
    const mealSchema = z.object({
      name: z.string(),
      calories: z.number().min(0).max(5000),
      protein: z.number().min(0).max(500),
      carbs: z.number().min(0).max(500),
      fat: z.number().min(0).max(500),
      confidence: z.enum(["low", "medium", "high"]).optional(),
      ingredients: z.array(z.string()).optional(),
      portion_estimate: z.string().optional()
    });
    
    const validatedMeal = mealSchema.parse(mealData);

    // Validate macro consistency
    const calculatedCalories = (validatedMeal.protein * 4) + (validatedMeal.carbs * 4) + (validatedMeal.fat * 9);
    const difference = Math.abs(calculatedCalories - validatedMeal.calories);
    const percentDiff = (difference / validatedMeal.calories) * 100;
    
    if (percentDiff > 15) {
      console.warn(`Macro/calorie mismatch: calculated ${calculatedCalories}, reported ${validatedMeal.calories} (${percentDiff.toFixed(1)}% diff)`);
    }

    return new Response(JSON.stringify(validatedMeal), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scan meal error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Błąd podczas analizy zdjęcia" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
