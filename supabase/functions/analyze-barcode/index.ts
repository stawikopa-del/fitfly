import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
    const body = await req.json();
    
    const parseResult = inputSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error);
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

    console.log("Analyzing barcode image, base64 length:", base64Data.length);

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
            content: "Jesteś ekspertem od odczytywania kodów kreskowych. Twoim JEDYNYM zadaniem jest odczytanie numeru kodu kreskowego (EAN/UPC) ze zdjęcia i zwrócenie go. Szukaj ciągów cyfr o długości 8-14 znaków. Odpowiadaj TYLKO numerem kodu (np. 5900617001696) lub słowem NIE_ZNALEZIONO jeśli nie możesz go odczytać. Żadnych dodatkowych słów ani wyjaśnień."
          },
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
                text: "Znajdź i odczytaj numer kodu kreskowego na tym zdjęciu. Odpowiedz TYLKO numerem (8-14 cyfr) lub NIE_ZNALEZIONO."
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
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log("AI response:", content);

    // Extract barcode number from response
    const barcodeMatch = content.match(/\d{8,14}/);
    
    if (barcodeMatch) {
      const barcode = barcodeMatch[0];
      console.log("Found barcode:", barcode);
      return new Response(JSON.stringify({ barcode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      console.log("No barcode found in response:", content);
      return new Response(JSON.stringify({ barcode: null, message: "Nie znaleziono kodu kreskowego" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Analyze barcode error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Błąd podczas analizy zdjęcia" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
