import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
    const dailyMealsStructure = mealConfig.categories.map(cat => `"${cat}": [{"name": "nazwa", "calories": liczba, "description": "opis"}]`).join(',\n    ');
    const weeklyMealsExample = mealConfig.categories.map(cat => `"${mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]}: nazwa"`).join(', ');

    const systemPrompt = `Jesteś ekspertem dietetyki i fitness. Twoim zadaniem jest stworzenie spersonalizowanego planu żywieniowego w języku polskim.

KRYTYCZNE ZASADY CENOWE - ŚREDNIA PÓŁKA CENOWA:
- PREFERUJ tanie, popularne produkty: kurczak, jajka, ser żółty, twaróg, jogurt naturalny, mleko, makaron, ryż, kasza gryczana/jaglana, pieczywo, warzywa sezonowe (marchew, cebula, ziemniaki, kapusta, pomidory, ogórki), jabłka, banany
- UNIKAJ drogich składników: łosoś (max 1x w tygodniu), krewetki, awokado (max 2x w tygodniu), orzechy nerkowca/makadamia, stek wołowy, importowane owoce egzotyczne, drogi ser typu brie/camembert
- DOPUSZCZALNE w umiarkowanych ilościach: tuńczyk w puszce, pierś z indyka, ser feta, orzechy włoskie/migdały, oliwa z oliwek

RÓŻNORODNOŚĆ - KAŻDY DZIEŃ INNY:
- Każdy dzień tygodnia MUSI mieć KOMPLETNIE INNE przepisy
- NIE powtarzaj tych samych dań w różne dni
- Zapewnij różnorodność smaków i składników przez cały tydzień

LICZBA POSIŁKÓW: ${preferences.mealsPerDay} posiłków dziennie
Kategorie posiłków: ${mealConfig.categories.map(cat => mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]).join(', ')}

ZAWSZE odpowiadaj w formacie JSON zgodnym ze strukturą:
{
  "summary": "krótkie podsumowanie planu (2-3 zdania)",
  "dailyMeals": {
    ${dailyMealsStructure}
  },
  "tips": ["wskazówka 1", "wskazówka 2", ...],
  "weeklySchedule": [
    {"day": "Poniedziałek", "meals": [${weeklyMealsExample}]},
    {"day": "Wtorek", "meals": [${weeklyMealsExample.replace(/nazwa/g, 'INNA nazwa')}]},
    ... (każdy dzień z INNYMI przepisami)
  ]
}

Zasady:
- Wszystkie teksty w języku polskim
- Kalorie posiłków muszą sumować się do podanej dziennej normy (${preferences.dailyCalories} kcal)
- MUSISZ wygenerować dokładnie ${preferences.mealsPerDay} kategorii posiłków
- Dostosuj posiłki do typu diety
- Podaj realistyczne, łatwe do przygotowania posiłki ZE ŚREDNIEJ PÓŁKI CENOWEJ
- Uwzględnij lokalne polskie produkty
- Dodaj 5-7 praktycznych wskazówek
- Plan tygodniowy na 7 dni - KAŻDY DZIEŃ INNE PRZEPISY
- W dailyMeals podaj po 7 różnych opcji dla każdego typu posiłku (po jednej na każdy dzień tygodnia)`;

    const userPrompt = `Stwórz plan żywieniowy dla osoby o następujących parametrach:

PROFIL UŻYTKOWNIKA:
- Waga: ${userProfile.weight} kg
- Wzrost: ${userProfile.height} cm
- Wiek: ${userProfile.age} lat
- Płeć: ${userProfile.gender === 'male' ? 'mężczyzna' : 'kobieta'}
- Cel: ${goalDescriptions[userProfile.goal]}

PREFERENCJE DIETY:
- Typ diety: ${preferences.dietName || preferences.dietType}
- Dzienne kalorie: ${preferences.dailyCalories} kcal
- Poziom aktywności: ${activityDescriptions[preferences.activityLevel as keyof typeof activityDescriptions]}
- Liczba posiłków dziennie: ${preferences.mealsPerDay} (WAŻNE: wygeneruj dokładnie tyle kategorii!)
- Treningi tygodniowo: ${preferences.workoutsPerWeek}
${preferences.macros ? `- Rozkład makroskładników: Białko ${preferences.macros.protein}%, Węglowodany ${preferences.macros.carbs}%, Tłuszcze ${preferences.macros.fat}%` : ''}

Kategorie posiłków do wygenerowania: ${mealConfig.categories.map(cat => mealConfig.polishNames[cat as keyof typeof mealConfig.polishNames]).join(', ')}

Stwórz kompletny, praktyczny plan żywieniowy. Zwróć TYLKO JSON bez dodatkowego tekstu.`;

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
