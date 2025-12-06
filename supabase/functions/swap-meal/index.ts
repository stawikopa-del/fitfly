import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  currentMeal: z.object({
    name: z.string(),
    calories: z.number(),
    description: z.string(),
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  }),
  userPreferences: z.object({
    dietType: z.string().optional(),
    dailyCalories: z.number().optional(),
    goal: z.enum(['lose', 'maintain', 'gain']).optional(),
    gender: z.enum(['male', 'female']).optional(),
    mealsPerDay: z.number().optional(),
  }),
  excludeMeals: z.array(z.string()).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);
    
    const { currentMeal, userPreferences, excludeMeals = [] } = validatedData;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const mealTypeNames = {
      breakfast: 'śniadanie',
      lunch: 'obiad',
      dinner: 'kolacja',
      snack: 'przekąska',
    };

    const goalDescriptions = {
      lose: 'schudnąć',
      maintain: 'utrzymać wagę',
      gain: 'przybrać na wadze',
    };

    const systemPrompt = `Jesteś ekspertem dietetyki. Wygeneruj JEDEN alternatywny przepis jako zamiennik dla podanego posiłku.

KRYTYCZNE ZASADY:
- Przepis musi być ze ŚREDNIEJ PÓŁKI CENOWEJ - używaj popularnych, łatwo dostępnych produktów
- NIE używaj drogich składników jak: łosoś, krewetki, awokado codziennie, orzechy nerkowca, stek wołowy, tofu importowane
- PREFERUJ: kurczak, jajka, ser żółty, twaróg, warzywa sezonowe, makaron, ryż, kasza, pieczywo, mleko, jogurt naturalny
- Przepis musi mieć PODOBNĄ liczbę kalorii (±50 kcal)
- Przepis musi być INNY niż oryginalny i lista wykluczonych
- Przepis musi pasować do typu posiłku

Odpowiedz TYLKO w formacie JSON:
{
  "name": "nazwa przepisu",
  "calories": liczba_kalorii,
  "description": "krótki opis przepisu (1-2 zdania)",
  "ingredients": ["składnik 1", "składnik 2", ...],
  "preparationTime": liczba_minut,
  "macros": {
    "protein": liczba_gramów,
    "carbs": liczba_gramów,
    "fat": liczba_gramów
  }
}`;

    const userPrompt = `Wygeneruj alternatywny przepis dla tego posiłku:

AKTUALNY POSIŁEK DO ZAMIANY:
- Nazwa: ${currentMeal.name}
- Typ: ${mealTypeNames[currentMeal.type]}
- Kalorie: ${currentMeal.calories} kcal
- Opis: ${currentMeal.description}

PREFERENCJE UŻYTKOWNIKA:
${userPreferences.dietType ? `- Typ diety: ${userPreferences.dietType}` : ''}
${userPreferences.goal ? `- Cel: ${goalDescriptions[userPreferences.goal]}` : ''}
${userPreferences.dailyCalories ? `- Dzienny limit kalorii: ${userPreferences.dailyCalories} kcal` : ''}

WYKLUCZONE PRZEPISY (nie powtarzaj):
${excludeMeals.length > 0 ? excludeMeals.map(m => `- ${m}`).join('\n') : '- brak'}

Wygeneruj JEDEN nowy przepis ze średniej półki cenowej, który pasuje do typu posiłku i ma podobną kaloryczność.
Zwróć TYLKO JSON bez dodatkowego tekstu.`;

    console.log("Generating swap meal for:", currentMeal.name);

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8, // Higher temperature for more variety
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Brak środków na koncie AI. Doładuj kredyty." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    console.log("AI response received, parsing...");

    // Parse JSON from response
    let mealData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        mealData = JSON.parse(jsonMatch[1]);
      } else {
        mealData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse meal data");
    }

    return new Response(JSON.stringify(mealData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error swapping meal:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
