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

const systemPrompt = `Jesteś ekspertem dietetyki i fitness. Twoim zadaniem jest stworzenie spersonalizowanego, EKONOMICZNEGO planu żywieniowego w języku polskim.

ZAWSZE odpowiadaj w formacie JSON zgodnym ze strukturą:
{
  "summary": "krótkie podsumowanie planu (2-3 zdania)",
  "dailyMeals": {
    "breakfast": [{"name": "pełna nazwa posiłku", "calories": liczba, "description": "opis posiłku", "ingredients": [{"name": "pierś z kurczaka", "amount": 200, "unit": "g"}, {"name": "ryż biały", "amount": 150, "unit": "g"}]}],
    "lunch": [{"name": "pełna nazwa", "calories": liczba, "description": "opis", "ingredients": [...]}],
    "dinner": [{"name": "pełna nazwa", "calories": liczba, "description": "opis", "ingredients": [...]}],
    "snacks": [{"name": "pełna nazwa", "calories": liczba, "description": "opis", "ingredients": [...]}]
  },
  "tips": ["wskazówka 1", "wskazówka 2", ...],
  "weeklySchedule": [
    {"day": "Poniedziałek", "meals": ["posiłek 1", "posiłek 2", ...], "workoutSuggestion": "opcjonalnie"},
    ...
  ],
  "shoppingList": [
    {"name": "pierś z kurczaka", "totalAmount": 1200, "unit": "g", "category": "mieso"},
    {"name": "ryż biały", "totalAmount": 800, "unit": "g", "category": "zboza"},
    {"name": "jajka", "totalAmount": 14, "unit": "szt", "category": "nabial"}
  ]
}

ZASADY DLA SKŁADNIKÓW (BARDZO WAŻNE):
1. NAZWY SKŁADNIKÓW - używaj PEŁNYCH, KONKRETNYCH nazw w formie podstawowej (mianownik):
   - "pierś z kurczaka" NIE "pierś", "piersią", "piersi"
   - "filet z łososia" NIE "łosoś", "łososiem"
   - "jogurt naturalny" NIE "jogurt", "jogurtem"
   - "ser żółty" NIE "ser", "serem"
   - "mleko 2%" NIE "mleko", "mlekiem"
   - "jajka" NIE "jajko", "jajkiem"
   - "cebula" NIE "cebulą", "cebuli"
   - "pomidor" NIE "pomidorem", "pomidory"
   
2. PORCJE składników muszą być REALISTYCZNE dla jednego posiłku:
   - Mięso/ryba: 100-200g na posiłek (nie więcej!)
   - Warzywa: 100-200g na posiłek
   - Węglowodany (ryż, kasza, makaron): 60-100g suchego produktu na posiłek
   - Nabiał (jogurt, twaróg): 100-200g na posiłek
   - Jajka: 1-3 sztuki na posiłek
   - Ser: 30-50g na posiłek
   - Masło: 10-20g na posiłek
   
3. LISTA ZAKUPÓW - w polu "shoppingList" podaj ZSUMOWANE ilości wszystkich składników z całego tygodnia:
   - Sumuj wszystkie wystąpienia danego składnika z 7 dni
   - Używaj kategorii: "nabial", "mieso", "warzywa", "owoce", "zboza", "przyprawy", "inne"
   - Zaokrąglaj do rozsądnych wartości (np. 1150g -> 1200g)

4. EKONOMICZNE WYBORY - preferuj TAŃSZE produkty:
   - Kurczak zamiast wołowiny/łososia
   - Jajka jako główne źródło białka
   - Sezonowe warzywa (marchew, kapusta, cebula, buraki)
   - Kasza, ryż, makaron zamiast quinoa
   - Twaróg zamiast drogich serów
   - Jabłka, banany zamiast egzotycznych owoców
   
5. RÓŻNORODNOŚĆ - każdy dzień powinien mieć inne posiłki, ale używaj PODOBNYCH składników żeby zminimalizować liczbę pozycji na liście zakupów

6. NIE POWTARZAJ dokładnie tego samego posiłku dwa razy w ciągu dnia

Przykład poprawnego składnika w "ingredients":
{"name": "pierś z kurczaka", "amount": 150, "unit": "g"}
{"name": "jajka", "amount": 2, "unit": "szt"}
{"name": "ryż biały", "amount": 80, "unit": "g"}
{"name": "masło", "amount": 15, "unit": "g"}`;

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
- Liczba posiłków dziennie: ${preferences.mealsPerDay}
- Treningi tygodniowo: ${preferences.workoutsPerWeek}
${preferences.macros ? `- Rozkład makroskładników: Białko ${preferences.macros.protein}%, Węglowodany ${preferences.macros.carbs}%, Tłuszcze ${preferences.macros.fat}%` : ''}

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
