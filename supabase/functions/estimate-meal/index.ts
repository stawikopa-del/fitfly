import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  description: z.string().min(3).max(500)
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const parseResult = inputSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ 
        error: "Opis posiłku musi mieć od 3 do 500 znaków" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { description } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Jesteś PROFESJONALNYM DIETETYKIEM KLINICZNYM z 20-letnim doświadczeniem w analizie żywienia. 
Twoja specjalizacja to PRECYZYJNE szacowanie wartości odżywczych posiłków.

## METODOLOGIA ANALIZY (Chain of Thought)

KROK 1: DEKOMPOZYCJA POSIŁKU
- Zidentyfikuj KAŻDY składnik osobno
- Rozpoznaj warianty (np. "kurczak" = pierś vs udo vs skrzydełko)
- Określ metody przygotowania (surowe/gotowane/smażone)

KROK 2: SZACOWANIE PORCJI (KRYTYCZNE!)
Użyj tych referencji:
- Garść = 30g (orzechy, rodzynki)
- Łyżka = 15ml/g płynów, 10g sypkich
- Łyżeczka = 5ml
- Szklanka = 250ml
- Kromka chleba = 40g
- "Mała porcja" = 100-150g
- "Średnia porcja" = 150-250g  
- "Duża porcja" = 250-400g
- Jeden kotlet = 100-150g (surowy), 80-120g (po smażeniu)
- Jeden naleśnik = 50-80g
- Jedna pierożka = 20-25g

KROK 3: BAZA KALORYCZNA (kcal/100g PRODUKTU GOTOWEGO!)
MIĘSA I BIAŁKA:
- Pierś kurczaka gotowana: 165 kcal, 31g B, 0g W, 3.6g T
- Pierś kurczaka smażona: 195 kcal, 29g B, 1g W, 8g T
- Udo kurczaka (bez skóry): 177 kcal, 26g B, 0g W, 8g T
- Wołowina mielona (15% tł): 250 kcal, 26g B, 0g W, 15g T
- Wieprzowina schab: 143 kcal, 26g B, 0g W, 4g T
- Łosoś pieczony: 208 kcal, 25g B, 0g W, 12g T
- Jajko całe: 155 kcal, 13g B, 1g W, 11g T (jedno = ~75kcal)
- Jajecznica (2 jajka + masło): 280-350 kcal
- Tofu: 76 kcal, 8g B, 2g W, 5g T

WĘGLOWODANY (GOTOWANE!):
- Ryż biały gotowany: 130 kcal, 2.7g B, 28g W, 0.3g T
- Ryż brązowy gotowany: 123 kcal, 2.6g B, 25g W, 1g T
- Makaron gotowany: 131 kcal, 5g B, 25g W, 1.1g T
- Ziemniaki gotowane: 87 kcal, 2g B, 20g W, 0.1g T
- Ziemniaki puree: 113 kcal, 2g B, 16g W, 5g T
- Kasza gryczana: 92 kcal, 3g B, 20g W, 0.6g T
- Chleb pszenny: 265 kcal, 9g B, 49g W, 3g T
- Chleb razowy: 250 kcal, 8g B, 46g W, 3g T
- Bułka: 280 kcal, 9g B, 53g W, 3g T

WARZYWA:
- Sałata: 15 kcal, 1g B, 2g W, 0.2g T
- Pomidor: 18 kcal, 0.9g B, 3.9g W, 0.2g T
- Ogórek: 15 kcal, 0.7g B, 3.6g W, 0.1g T
- Papryka: 26 kcal, 1g B, 6g W, 0.2g T
- Brokuły gotowane: 35 kcal, 2.8g B, 7g W, 0.4g T
- Marchewka: 41 kcal, 0.9g B, 10g W, 0.2g T
- Kapusta: 25 kcal, 1.3g B, 6g W, 0.1g T

OWOCE:
- Jabłko (średnie): 52 kcal, 0.3g B, 14g W, 0.2g T (jedno ~95 kcal)
- Banan: 89 kcal, 1.1g B, 23g W, 0.3g T (jeden ~105 kcal)
- Pomarańcza: 47 kcal, 0.9g B, 12g W, 0.1g T
- Truskawki: 32 kcal, 0.7g B, 8g W, 0.3g T
- Borówki: 57 kcal, 0.7g B, 14g W, 0.3g T

NABIAŁ:
- Mleko 2%: 50 kcal, 3.4g B, 4.8g W, 2g T
- Mleko 3.2%: 64 kcal, 3.2g B, 4.7g W, 3.5g T
- Jogurt naturalny 2%: 60 kcal, 4g B, 6g W, 2g T
- Jogurt grecki 10%: 130 kcal, 5g B, 4g W, 10g T
- Ser żółty: 350 kcal, 25g B, 1g W, 27g T
- Ser biały twarogowy: 98 kcal, 18g B, 4g W, 1g T
- Serek wiejski: 98 kcal, 11g B, 3g W, 5g T
- Śmietana 18%: 170 kcal, 2.5g B, 3.5g W, 18g T
- Masło: 717 kcal, 0.9g B, 0.1g W, 81g T

TŁUSZCZE:
- Olej/oliwa: 884 kcal, 0g B, 0g W, 100g T
- Łyżka oleju: ~120 kcal
- Łyżeczka masła: ~35 kcal

SŁODYCZE/PRZEKĄSKI:
- Czekolada mleczna: 535 kcal, 8g B, 56g W, 30g T
- Baton Snickers (52g): 245 kcal
- Chipsy: 536 kcal, 6g B, 53g W, 33g T
- Herbatniki: 440 kcal, 7g B, 68g W, 15g T

KROK 4: MODYFIKATORY GOTOWANIA
- Smażenie na głębokim tłuszczu: +80-150 kcal/100g
- Smażenie na łyżce oleju: +40-80 kcal/porcję
- Panierowane i smażone: +100-150 kcal/100g
- Z sosem śmietanowym: +100-200 kcal/porcję
- Z sosem pomidorowym: +30-50 kcal/porcję
- Z serem gratinowane: +100-150 kcal/porcję

KROK 5: TYPOWE POLSKIE PORCJE
- Śniadanie: 300-500 kcal
- II śniadanie: 150-300 kcal
- Obiad tradycyjny: 600-900 kcal
- Podwieczorek: 100-200 kcal
- Kolacja: 300-500 kcal

KROK 6: WALIDACJA KOŃCOWA
Sprawdź czy suma makroskładników = kalorie:
Kalorie ≈ (Białko × 4) + (Węglowodany × 4) + (Tłuszcz × 9)
Dopuszczalna rozbieżność: ±10%

## FORMAT ODPOWIEDZI (TYLKO JSON!)
{
  "name": "zwięzła nazwa posiłku (max 35 znaków)",
  "calories": liczba_całkowita_zaokrąglona_do_5,
  "protein": gramy_białka_zaokrąglone,
  "carbs": gramy_węglowodanów_zaokrąglone,
  "fat": gramy_tłuszczu_zaokrąglone,
  "confidence": "low" | "medium" | "high"
}

CONFIDENCE:
- "high" = konkretne składniki i ilości podane
- "medium" = typowe danie, standardowa porcja
- "low" = niejasny opis, duża niepewność`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Przeanalizuj krok po kroku i PRECYZYJNIE oszacuj wartości odżywcze dla: "${description}"

Myśl metodycznie:
1. Jakie składniki zawiera ten posiłek?
2. Jaka jest prawdopodobna wielkość porcji?
3. Jak został przygotowany?
4. Oblicz kalorie i makro dla każdego składnika
5. Zsumuj i zwaliduj wynik

Odpowiedz TYLKO JSON-em.` },
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
      return new Response(JSON.stringify({ error: "Błąd podczas szacowania posiłku" }), {
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
      confidence: z.enum(["low", "medium", "high"]).optional()
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
    console.error("Estimate meal error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Błąd podczas przetwarzania" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
