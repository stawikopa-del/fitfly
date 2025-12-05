import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
  preferences: preferencesSchema
}).refine(data => data.ingredients || data.imageBase64, {
  message: 'Wymagane ingredients lub imageBase64'
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parseResult = inputSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error);
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane wejściowe", details: parseResult.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { ingredients, imageBase64, preferences } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build preferences string for prompt
    let preferencesText = '';
    if (preferences) {
      const parts = [];
      if (preferences.taste === 'sweet') parts.push('przepisy słodkie');
      if (preferences.taste === 'salty') parts.push('przepisy słone/wytrawne');
      if (preferences.maxTime) parts.push(`czas przygotowania maksymalnie ${preferences.maxTime} minut`);
      if (preferences.maxCalories) parts.push(`maksymalnie ${preferences.maxCalories} kcal na porcję`);
      if (preferences.description) parts.push(`użytkownik chce: "${preferences.description}"`);
      
      if (parts.length > 0) {
        preferencesText = `\n\nUWAGA - Preferencje użytkownika:\n- ${parts.join('\n- ')}\n\nDostosuj przepisy do tych preferencji!`;
      }
    }

    let userContent: any[];

    const recipeJsonStructure = `{
  "detected_ingredients": ["składnik1", "składnik2", ...], // tylko przy analizie zdjęcia
  "recipes": [
    {
      "name": "Nazwa przepisu",
      "ingredients": ["100g składnik1", "2 składnik2"],
      "description": "Krótki opis dania",
      "servings": 2,
      "total_time_minutes": 45,
      "tools_needed": ["patelnia", "garnek", "deska do krojenia"],
      "steps": [
        {
          "step_number": 1,
          "instruction": "Szczegółowa instrukcja kroku...",
          "duration_minutes": 5,
          "ingredients_needed": ["100g składnik1"],
          "tip": "Opcjonalna wskazówka"
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
      // Analyze fridge image
      userContent = [
        {
          type: "text",
          text: `Przeanalizuj zdjęcie lodówki i zidentyfikuj wszystkie widoczne produkty spożywcze. Następnie zaproponuj 3 przepisy, które można przygotować z tych składników.
${preferencesText}

Dla każdego przepisu podaj szczegółowe informacje:
- Nazwa przepisu
- Pełna lista składników z ilościami
- Krótki opis dania
- Liczba porcji
- Całkowity czas przygotowania w minutach
- Lista potrzebnych narzędzi kuchennych
- Kroki wykonania (każdy krok osobno z czasem trwania, składnikami potrzebnymi w danym kroku i opcjonalną wskazówką)
- Wartości odżywcze na porcję

Odpowiedz TYLKO w formacie JSON (bez markdown):
${recipeJsonStructure}`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ];
    } else if (ingredients && ingredients.length > 0) {
      // Generate recipes from ingredient list
      userContent = [
        {
          type: "text",
          text: `Mam następujące składniki: ${ingredients.join(", ")}.

Zaproponuj 3 przepisy, które można przygotować z tych składników (możesz założyć, że mam podstawowe przyprawy).
${preferencesText}

Dla każdego przepisu podaj szczegółowe informacje:
- Nazwa przepisu
- Pełna lista składników z ilościami
- Krótki opis dania
- Liczba porcji
- Całkowity czas przygotowania w minutach
- Lista potrzebnych narzędzi kuchennych
- Kroki wykonania (każdy krok osobno z czasem trwania, składnikami potrzebnymi w danym kroku i opcjonalną wskazówką)
- Wartości odżywcze na porcję

Odpowiedz TYLKO w formacie JSON (bez markdown):
${recipeJsonStructure}`
        }
      ];
    } else {
      throw new Error("Brak składników lub zdjęcia");
    }

    console.log("Sending request to Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Jesteś ekspertem kulinarnym i dietetykiem. Tworzysz zdrowe, smaczne przepisy dopasowane do dostępnych składników. Zawsze odpowiadasz w formacie JSON bez dodatkowego tekstu czy markdown."
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
