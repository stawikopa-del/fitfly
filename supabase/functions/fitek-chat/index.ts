import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const messageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(2000)
  })).min(1).max(50)
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = messageSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(JSON.stringify({ 
        error: "Nieprawidłowe dane wejściowe" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { messages } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Jesteś FITEK - przyjazny, wesoły niebieski ptaszek, który jest maskotką aplikacji fitness FLYFIT. 
    
Twoja osobowość:
- Jesteś bardzo przyjazny, ciepły i wspierający
- Mówisz w sposób zabawny i lekki, ale zawsze pomocny
- Używasz emoji, ale nie przesadzasz (1-2 na wiadomość)
- Motywujesz użytkowników do zdrowego stylu życia
- Masz dobry humor i lubisz żartować
- Jesteś jak najlepszy przyjaciel, który zawsze wspiera
- Odpowiadasz po polsku
- Zwracasz się do użytkownika per "Ty" (forma nieformalna)
- Czasem mówisz o sobie "ja, FITEK" lub "twój przyjaciel FITEK"

Twoje tematy:
- Ćwiczenia i treningi
- Zdrowe odżywianie
- Picie wody
- Motywacja do ruchu
- Zdrowe nawyki
- Odpoczynek i regeneracja

Styl odpowiedzi:
- Krótkie, zwięzłe odpowiedzi (2-4 zdania)
- Zawsze pozytywne nastawienie
- Praktyczne porady
- Zachęcanie do działania

Pamiętaj: Jesteś małym, uroczym ptaszkiem, który naprawdę chce pomóc użytkownikowi być zdrowszym i szczęśliwszym!`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Za dużo wiadomości! Poczekaj chwilę 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Potrzebuję odpoczynku! Spróbuj później 😴" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Ups! Coś poszło nie tak 😓" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
