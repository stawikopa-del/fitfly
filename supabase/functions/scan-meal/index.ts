import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  imageBase64: z.string().min(100).max(10000000), // Base64 image data
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

    const systemPrompt = `Jesteś ekspertem od żywienia i rozpoznawania posiłków ze zdjęć. Twoim zadaniem jest BARDZO DOKŁADNE oszacowanie wartości odżywczych.

ZASADY SZACOWANIA:
1. Dokładnie analizuj wielkość porcji - porównuj z talerzem/miską
2. Identyfikuj WSZYSTKIE składniki widoczne na zdjęciu
3. Szacuj wagę każdego składnika osobno
4. Sumuj kalorie i makroskładniki
5. Uwzględniaj sposób przygotowania (smażone = więcej tłuszczu)

PRZYKŁADOWE REFERENCJE:
- Średni talerz = 25cm średnicy
- Porcja ryżu (ugotowanego) = 150-200g = 180-240 kcal
- Porcja makaronu = 200g = 260-300 kcal  
- Pierś kurczaka = 150g = 165 kcal, 31g białka
- Jajko sadzone = 90 kcal, 6g białka, 7g tłuszczu
- Łyżka oliwy = 120 kcal, 14g tłuszczu
- Porcja sałatki = 50g = 10-15 kcal

ODPOWIEDZ TYLKO W FORMACIE JSON:
{
  "name": "krótka nazwa posiłku po polsku (max 35 znaków)",
  "calories": liczba_kalorii (zaokrąglona do 5),
  "protein": gramy_białka,
  "carbs": gramy_węglowodanów,
  "fat": gramy_tłuszczu,
  "confidence": "low" | "medium" | "high",
  "ingredients": ["składnik1", "składnik2"],
  "portion_estimate": "opis wielkości porcji"
}`;

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
                text: "Przeanalizuj to zdjęcie posiłku i oszacuj wartości odżywcze. Bądź dokładny!"
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
