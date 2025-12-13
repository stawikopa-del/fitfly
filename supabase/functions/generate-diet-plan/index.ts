import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  userProfile: z.object({
    weight: z.number(),
    height: z.number(),
    age: z.number(),
    gender: z.enum(['male', 'female']),
    goal: z.enum(['lose', 'maintain', 'gain']),
  }),
  preferences: z.object({
    dietType: z.string(),
    dietName: z.string().optional(),
    dailyCalories: z.number(),
    activityLevel: z.number(),
    mealsPerDay: z.number(),
    workoutsPerWeek: z.number(),
    macros: z.object({
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }).optional(),
  }),
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
    const validatedData = requestSchema.parse(body);
    
    const { userProfile, preferences } = validatedData;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const goalDescriptions = {
      lose: 'schudnąć i zredukować tkankę tłuszczową',
      maintain: 'utrzymać aktualną wagę',
      gain: 'przybrać na wadze i zbudować mięśnie',
    };

    const activityDescriptions = {
      1: 'siedzący tryb życia (mało ruchu)',
      2: 'lekka aktywność (1-2 treningi tygodniowo)',
      3: 'umiarkowana aktywność (3-4 treningi tygodniowo)',
      4: 'wysoka aktywność (5-6 treningów tygodniowo)',
      5: 'bardzo wysoka aktywność (codzienne intensywne treningi)',
    };

    // Generate meal categories based on mealsPerDay
    const getMealCategories = (mealsPerDay: number) => {
      if (mealsPerDay <= 3) {
        return {
          categories: ['breakfast', 'lunch', 'dinner'],
          polishNames: { breakfast: 'śniadanie', lunch: 'obiad', dinner: 'kolacja' },
        };
      } else if (mealsPerDay === 4) {
        return {
          categories: ['breakfast', 'lunch', 'dinner', 'snacks'],
          polishNames: { breakfast: 'śniadanie', lunch: 'obiad', dinner: 'kolacja', snacks: 'przekąska' },
        };
      } else if (mealsPerDay === 5) {
        return {
          categories: ['breakfast', 'secondBreakfast', 'lunch', 'snacks', 'dinner'],
          polishNames: { breakfast: 'śniadanie', secondBreakfast: 'drugie śniadanie', lunch: 'obiad', snacks: 'przekąska', dinner: 'kolacja' },
        };
      } else {
        return {
          categories: ['breakfast', 'secondBreakfast', 'lunch', 'snacks', 'afternoonSnack', 'dinner'],
          polishNames: { breakfast: 'śniadanie', secondBreakfast: 'drugie śniadanie', lunch: 'obiad', snacks: 'przekąska', afternoonSnack: 'podwieczorek', dinner: 'kolacja' },
        };
      }
    };

    const mealConfig = getMealCategories(preferences.mealsPerDay);
    const dailyMealsStructure = mealConfig.categories.map(cat => 
      `"${cat}": [{"name": "nazwa dania", "calories": liczba, "protein": liczba, "carbs": liczba, "fat": liczba, "description": "krótki opis", "ingredients": ["150g składnik1", "2 jajka", "1 łyżka oliwy"]}]`
    ).join(',\n    ');
    const weeklyMealsExample = mealConfig.categories.map(cat => mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]).join(', ');

    const systemPrompt = `Jesteś EKSPERTEM DIETETYKI z 20-letnim doświadczeniem w tworzeniu planów żywieniowych.

## KRYTYCZNE WYMAGANIE - DOKŁADNE SKŁADNIKI Z GRAMATURĄ

Każdy posiłek MUSI zawierać PRECYZYJNĄ listę składników z DOKŁADNYMI ilościami:

### FORMATY ILOŚCI (używaj konsekwentnie):
- GRAMY dla mięsa, ryb, warzyw, owoców: "150g piersi z kurczaka", "200g brokuła"
- SZTUKI dla jajek, bułek: "2 jajka", "1 bułka graham"
- ŁYŻKI dla przypraw, olejów, sosów: "2 łyżki oliwy", "1 łyżeczka miodu"
- SZKLANKI dla płynów, zbóż: "1 szklanka mleka", "0.5 szklanki ryżu (80g suchego)"
- PLASTRY dla sera, wędlin: "3 plastry sera żółtego (60g)", "4 plastry szynki (40g)"
- PORCJE dla jogurtów, twarogów: "1 kubek jogurtu naturalnego (150g)", "1 opakowanie twarożku (200g)"

### PRZYKŁAD POPRAWNEGO POSIŁKU:
{
  "name": "Jajecznica z warzywami na chlebie",
  "calories": 420,
  "protein": 22,
  "carbs": 35,
  "fat": 20,
  "description": "Puszysta jajecznica z papryką i pomidorem na chrupiącym pieczywie",
  "ingredients": [
    "2 jajka (L)",
    "1 łyżka masła (15g)",
    "0.5 papryki czerwonej (80g)",
    "1 średni pomidor (100g)",
    "2 kromki chleba żytniego (80g)",
    "szczypta soli i pieprzu"
  ]
}

## ZASADY CENOWE - ŚREDNIA PÓŁKA:
- PREFERUJ: kurczak, jajka, ser żółty, twaróg, jogurt naturalny, mleko, makaron, ryż, kasza, pieczywo, warzywa sezonowe
- UNIKAJ: łosoś (max 1x/tydzień), krewetki, awokado (max 2x/tydzień), drogie sery

## RÓŻNORODNOŚĆ:
- Każdy dzień tygodnia MUSI mieć INNE przepisy
- NIE powtarzaj tych samych dań
- Różnorodność smaków i technik przygotowania

LICZBA POSIŁKÓW: ${preferences.mealsPerDay} dziennie
Kategorie: ${mealConfig.categories.map(cat => mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]).join(', ')}

## FORMAT JSON:
{
  "summary": "podsumowanie (2-3 zdania)",
  "dailyMeals": {
    ${dailyMealsStructure}
  },
  "tips": ["wskazówka 1", "wskazówka 2", ...],
  "weeklySchedule": [
    {
      "day": "Poniedziałek",
      "meals": [
        {"type": "${weeklyMealsExample.split(', ')[0] || 'śniadanie'}", "mealName": "nazwa dania", "ingredients": ["składnik z ilością", ...]},
        ...dla każdej kategorii posiłku
      ]
    },
    ...dla każdego dnia tygodnia
  ]
}

## ZASADY:
- Wszystkie teksty po polsku
- Kalorie MUSZĄ sumować się do ${preferences.dailyCalories} kcal dziennie
- KAŻDY posiłek MUSI mieć pole "ingredients" z DOKŁADNYMI ilościami
- Dostosuj do typu diety: ${preferences.dietType}
- 7 różnych opcji dla każdego typu posiłku w dailyMeals
- 7 dni w weeklySchedule - każdy dzień INNE dania`;

    const userPrompt = `Stwórz KOMPLETNY plan żywieniowy z DOKŁADNYMI składnikami dla każdego posiłku.

## PROFIL UŻYTKOWNIKA:
- Waga: ${userProfile.weight} kg
- Wzrost: ${userProfile.height} cm
- Wiek: ${userProfile.age} lat
- Płeć: ${userProfile.gender === 'male' ? 'mężczyzna' : 'kobieta'}
- Cel: ${goalDescriptions[userProfile.goal]}

## PREFERENCJE DIETY:
- Typ diety: ${preferences.dietName || preferences.dietType}
- Dzienne kalorie: ${preferences.dailyCalories} kcal
- Poziom aktywności: ${activityDescriptions[preferences.activityLevel as keyof typeof activityDescriptions]}
- Liczba posiłków: ${preferences.mealsPerDay}
- Treningi tygodniowo: ${preferences.workoutsPerWeek}
${preferences.macros ? `- Makro: B ${preferences.macros.protein}%, W ${preferences.macros.carbs}%, T ${preferences.macros.fat}%` : ''}

## KRYTYCZNE WYMAGANIE:
Dla KAŻDEGO posiłku podaj PEŁNĄ listę składników z DOKŁADNYMI ilościami w gramach, sztukach lub łyżkach.
NIE pisz ogólnie "jajecznica" - napisz "2 jajka, 1 łyżka masła (15g), 50g sera, szczypta soli".

Kategorie posiłków: ${mealConfig.categories.map(cat => mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]).join(', ')}

Zwróć TYLKO prawidłowy JSON bez dodatkowego tekstu.`;

    console.log("Generating diet plan for user with preferences:", preferences);

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
        temperature: 0.7,
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

    // Parse JSON from response (handle markdown code blocks)
    let planData;
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[1]);
      } else {
        planData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse diet plan");
    }

    return new Response(JSON.stringify(planData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating diet plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
