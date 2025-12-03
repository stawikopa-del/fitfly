import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userContent: any[];

    if (imageBase64) {
      // Analyze fridge image
      userContent = [
        {
          type: "text",
          text: `Przeanalizuj zdjęcie lodówki i zidentyfikuj wszystkie widoczne produkty spożywcze. Następnie zaproponuj 3 przepisy, które można przygotować z tych składników.

Dla każdego przepisu podaj:
- Nazwa przepisu
- Lista składników z ilościami
- Krótki opis przygotowania (max 3 zdania)
- Wartości odżywcze na porcję: kalorie, białko (g), węglowodany (g), tłuszcze (g)

Odpowiedz w formacie JSON:
{
  "detected_ingredients": ["składnik1", "składnik2", ...],
  "recipes": [
    {
      "name": "Nazwa przepisu",
      "ingredients": ["100g składnik1", "2 składnik2"],
      "description": "Krótki opis przygotowania...",
      "servings": 2,
      "macros": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 15
      }
    }
  ]
}`
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

Dla każdego przepisu podaj:
- Nazwa przepisu
- Lista składników z ilościami
- Krótki opis przygotowania (max 3 zdania)
- Wartości odżywcze na porcję: kalorie, białko (g), węglowodany (g), tłuszcze (g)

Odpowiedz TYLKO w formacie JSON (bez markdown):
{
  "recipes": [
    {
      "name": "Nazwa przepisu",
      "ingredients": ["100g składnik1", "2 składnik2"],
      "description": "Krótki opis przygotowania...",
      "servings": 2,
      "macros": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 15
      }
    }
  ]
}`
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Nie udało się przetworzyć odpowiedzi AI");
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
