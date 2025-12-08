import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

// Helper function to decline Polish names (vocative case)
function declinePolishName(name: string): string {
  if (!name) return "";
  
  const lowerName = name.toLowerCase();
  const originalName = name;
  
  // Female names ending in 'a' -> 'o'
  if (lowerName.endsWith('a')) {
    if (lowerName.endsWith('ia')) {
      return originalName.slice(0, -1) + 'o';
    }
    if (lowerName.endsWith('ca') || lowerName.endsWith('ga') || lowerName.endsWith('ka')) {
      return originalName.slice(0, -1) + 'o';
    }
    return originalName.slice(0, -1) + 'o';
  }
  
  // Male names
  if (lowerName.endsWith('ek')) {
    return originalName.slice(0, -2) + 'ku';
  }
  if (lowerName.endsWith('eł')) {
    return originalName.slice(0, -2) + 'le';
  }
  if (lowerName.endsWith('sz') || lowerName.endsWith('cz')) {
    return originalName + 'u';
  }
  if (lowerName.endsWith('n') || lowerName.endsWith('m') || lowerName.endsWith('r') || lowerName.endsWith('t') || lowerName.endsWith('d')) {
    return originalName + 'ie';
  }
  if (lowerName.endsWith('k') || lowerName.endsWith('g') || lowerName.endsWith('ch') || lowerName.endsWith('h')) {
    return originalName + 'u';
  }
  
  return originalName;
}

// Get conversation summaries from past days
async function getConversationHistory(userId: string, supabase: any) {
  const history: any = {
    yesterday: null,
    lastWeek: [],
    recentTopics: [],
  };

  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get yesterday's summary
    const { data: yesterdaySummary } = await supabase
      .from('chat_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('summary_date', yesterday.toISOString().split('T')[0])
      .maybeSingle();

    if (yesterdaySummary) {
      history.yesterday = yesterdaySummary;
    }

    // Get last week's summaries
    const { data: weekSummaries } = await supabase
      .from('chat_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('summary_date', weekAgo.toISOString().split('T')[0])
      .lt('summary_date', today.toISOString().split('T')[0])
      .order('summary_date', { ascending: false })
      .limit(5);

    if (weekSummaries) {
      history.lastWeek = weekSummaries;
      // Extract unique topics from all summaries
      const allTopics = weekSummaries.flatMap((s: any) => s.topics || []);
      history.recentTopics = [...new Set(allTopics)].slice(0, 10);
    }

  } catch (error) {
    console.error('Error fetching conversation history:', error);
  }

  return history;
}

// Generate and save conversation summary
async function generateAndSaveSummary(userId: string, messages: any[], supabase: any, apiKey: string) {
  if (messages.length < 4) return; // Don't summarize very short conversations

  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have a summary for today
  const { data: existingSummary } = await supabase
    .from('chat_summaries')
    .select('id')
    .eq('user_id', userId)
    .eq('summary_date', today)
    .maybeSingle();

  // Only create/update summary every 10 messages
  if (messages.length % 10 !== 0) return;

  try {
    const summaryPrompt = `Przeanalizuj poniższą rozmowę i stwórz krótkie podsumowanie w formacie JSON:
{
  "summary": "1-2 zdania podsumowujące główne tematy rozmowy",
  "topics": ["temat1", "temat2"], // maksymalnie 5 głównych tematów
  "mood": "pozytywny/neutralny/negatywny", // ogólny nastrój użytkownika
  "key_points": ["punkt1", "punkt2"], // 2-3 najważniejsze ustalenia lub informacje
  "questions_asked": ["pytanie1"] // pytania zadane przez użytkownika, które mogą być istotne później
}

Rozmowa:
${messages.slice(-20).map((m: any) => `${m.role === 'user' ? 'Użytkownik' : 'FITEK'}: ${m.content}`).join('\n')}

Odpowiedz TYLKO poprawnym JSON bez dodatkowego tekstu.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: summaryPrompt }
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          // Clean up the response - remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          const summaryData = JSON.parse(cleanContent);
          
          const summaryRecord = {
            user_id: userId,
            summary_date: today,
            summary: summaryData.summary || '',
            topics: summaryData.topics || [],
            mood: summaryData.mood || 'neutralny',
            key_points: summaryData.key_points || [],
            questions_asked: summaryData.questions_asked || [],
          };

          if (existingSummary) {
            await supabase
              .from('chat_summaries')
              .update(summaryRecord)
              .eq('id', existingSummary.id);
          } else {
            await supabase
              .from('chat_summaries')
              .insert(summaryRecord);
          }
          
          console.log('Summary saved successfully for date:', today);
        } catch (parseError) {
          console.error('Error parsing summary JSON:', parseError, content);
        }
      }
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
}

// Get user context from database
async function getUserContext(userId: string, supabase: any) {
  const today = new Date().toISOString().split('T')[0];
  const context: any = {
    name: null,
    declinedName: null,
    gender: null,
    goal: null,
    weight: null,
    goalWeight: null,
    dailyCalories: null,
    dailyWater: null,
    todayProgress: null,
    todayMeals: [],
    activeChallenge: null,
    streak: 0,
    level: 1,
    totalXp: 0,
    habitsToday: { total: 0, completed: 0 },
    recentMeasurement: null,
  };

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, gender, goal, weight, goal_weight, daily_calories, daily_water')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      context.name = profile.display_name;
      context.declinedName = declinePolishName(profile.display_name);
      context.gender = profile.gender;
      context.goal = profile.goal;
      context.weight = profile.weight;
      context.goalWeight = profile.goal_weight;
      context.dailyCalories = profile.daily_calories;
      context.dailyWater = profile.daily_water;
    }

    // Fetch today's progress
    const { data: progress } = await supabase
      .from('daily_progress')
      .select('steps, water, active_minutes')
      .eq('user_id', userId)
      .eq('progress_date', today)
      .maybeSingle();

    if (progress) {
      context.todayProgress = progress;
    }

    // Fetch today's meals
    const { data: meals } = await supabase
      .from('meals')
      .select('name, calories, type')
      .eq('user_id', userId)
      .eq('meal_date', today);

    if (meals) {
      context.todayMeals = meals;
    }

    // Fetch active challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('title, current, target, unit')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_completed', false)
      .limit(1)
      .maybeSingle();

    if (challenge) {
      context.activeChallenge = challenge;
    }

    // Fetch gamification data
    const { data: gamification } = await supabase
      .from('user_gamification')
      .select('current_level, total_xp, daily_login_streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (gamification) {
      context.level = gamification.current_level;
      context.totalXp = gamification.total_xp;
      context.streak = gamification.daily_login_streak;
    }

    // Fetch today's habits completion
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (habits && habits.length > 0) {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('log_date', today)
        .eq('is_completed', true);

      context.habitsToday = {
        total: habits.length,
        completed: logs?.length || 0
      };
    }

    // Fetch recent measurement
    const { data: measurement } = await supabase
      .from('user_measurements')
      .select('weight, mood, energy, sleep_quality, measurement_date')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (measurement) {
      context.recentMeasurement = measurement;
    }

  } catch (error) {
    console.error('Error fetching user context:', error);
  }

  return context;
}

// Build personalized system prompt with conversation history
function buildSystemPrompt(context: any, conversationHistory: any): string {
  const greeting = context.declinedName ? `, ${context.declinedName}` : '';
  
  let contextInfo = '';
  
  if (context.name) {
    contextInfo += `\n\n👤 PROFIL UŻYTKOWNIKA:
- Imię: ${context.name} (w wołaczu: ${context.declinedName || context.name})
- Płeć: ${context.gender === 'female' ? 'kobieta' : context.gender === 'male' ? 'mężczyzna' : 'nieznana'}`;
  }
  
  if (context.goal) {
    const goalMap: Record<string, string> = {
      'lose_weight': 'schudnąć',
      'maintain': 'utrzymać wagę',
      'gain_weight': 'przybrać na wadze',
      'build_muscle': 'zbudować mięśnie',
      'improve_health': 'poprawić zdrowie'
    };
    contextInfo += `\n- Cel: ${goalMap[context.goal] || context.goal}`;
  }
  
  if (context.weight) {
    contextInfo += `\n- Aktualna waga: ${context.weight} kg`;
  }
  if (context.goalWeight) {
    contextInfo += `\n- Waga docelowa: ${context.goalWeight} kg`;
  }
  
  if (context.level) {
    contextInfo += `\n- Poziom: ${context.level} (${context.totalXp} XP)`;
  }
  if (context.streak > 0) {
    contextInfo += `\n- Seria logowań: ${context.streak} dni 🔥`;
  }

  if (context.todayProgress) {
    contextInfo += `\n\n📊 DZISIEJSZE POSTĘPY:
- Kroki: ${context.todayProgress.steps || 0}
- Woda: ${context.todayProgress.water || 0} szklanek${context.dailyWater ? ` / ${context.dailyWater} cel` : ''}
- Aktywność: ${context.todayProgress.active_minutes || 0} minut`;
  }

  if (context.todayMeals && context.todayMeals.length > 0) {
    const totalCalories = context.todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
    contextInfo += `\n\n🍽️ DZISIEJSZE POSIŁKI (${context.todayMeals.length}):`;
    contextInfo += `\n- Spożyte kalorie: ${totalCalories}${context.dailyCalories ? ` / ${context.dailyCalories} kcal cel` : ''}`;
  }

  if (context.activeChallenge) {
    const progress = Math.round((context.activeChallenge.current / context.activeChallenge.target) * 100);
    contextInfo += `\n\n🏆 AKTYWNE WYZWANIE:
- "${context.activeChallenge.title}": ${context.activeChallenge.current}/${context.activeChallenge.target} ${context.activeChallenge.unit} (${progress}%)`;
  }

  if (context.habitsToday.total > 0) {
    contextInfo += `\n\n✅ NAWYKI DZISIAJ: ${context.habitsToday.completed}/${context.habitsToday.total} ukończone`;
  }

  // Add conversation history context
  let historyContext = '';
  
  if (conversationHistory.yesterday) {
    const y = conversationHistory.yesterday;
    historyContext += `\n\n📅 WCZORAJSZA ROZMOWA:
- Podsumowanie: ${y.summary}
- Tematy: ${y.topics?.join(', ') || 'brak'}
- Nastrój użytkownika: ${y.mood || 'nieznany'}`;
    if (y.key_points && y.key_points.length > 0) {
      historyContext += `\n- Ważne ustalenia: ${y.key_points.join('; ')}`;
    }
    if (y.questions_asked && y.questions_asked.length > 0) {
      historyContext += `\n- Pytania użytkownika: ${y.questions_asked.join('; ')}`;
    }
  }

  if (conversationHistory.lastWeek && conversationHistory.lastWeek.length > 1) {
    historyContext += `\n\n📆 TEMATY Z OSTATNIEGO TYGODNIA: ${conversationHistory.recentTopics?.join(', ') || 'brak'}`;
    
    // Find any recurring topics or concerns
    const allMoods = conversationHistory.lastWeek.map((s: any) => s.mood).filter(Boolean);
    const negativeMoods = allMoods.filter((m: string) => m === 'negatywny').length;
    if (negativeMoods >= 2) {
      historyContext += `\n⚠️ Użytkownik miał kilka trudniejszych dni w tym tygodniu - bądź szczególnie wspierający`;
    }
  }

  return `Jesteś FITEK - przyjazny, wesoły niebieski ptaszek, który jest maskotką aplikacji fitness FITFLY i osobistym przyjacielem fitness użytkownika.
${contextInfo}${historyContext}

🎭 TWOJA OSOBOWOŚĆ:
- Jesteś ciepły, autentyczny i naprawdę się troszczysz
- Mówisz naturalnie, jak przyjaciel - nie jak robot
- Używasz emoji umiarkowanie (1-2 na wiadomość)
- Masz poczucie humoru - żartujesz, ale jesteś wrażliwy
- PAMIĘTASZ poprzednie rozmowy i NAWIĄZUJESZ do nich naturalnie
- Jesteś wspierający, ale nie nachalny

📝 JAK SIĘ ZWRACASZ:
- ZAWSZE używaj wołacza polskiego dla imienia (np. "Kasiu", "Marku", "Anno")
- Używaj imienia naturalnie, nie w każdym zdaniu
- Mów per "Ty" (forma nieformalna)
- ${context.gender === 'female' ? 'Używaj żeńskich form czasowników' : context.gender === 'male' ? 'Używaj męskich form czasowników' : 'Staraj się unikać form rodzajowych'}

🧠 PAMIĘĆ I KONTYNUACJA ROZMÓW:
${conversationHistory.yesterday ? `- Wczoraj rozmawialiście o: ${conversationHistory.yesterday.summary}. NAWIĄŻ do tego naturalnie, np. "A jak tam po wczorajszej rozmowie?" lub "Pamiętam, że wczoraj mówiłeś/aś o..."` : '- To może być nowa rozmowa - poznaj użytkownika lepiej!'}
${conversationHistory.recentTopics?.length > 0 ? `- Ostatnio interesują użytkownika: ${conversationHistory.recentTopics.slice(0, 5).join(', ')}` : ''}
- Jeśli użytkownik wspomniał o czymś wcześniej, nawiąż do tego
- Kontynuuj wątki z poprzednich rozmów

❓ BARDZO WAŻNE - ZAWSZE ZADAWAJ PYTANIA:
- KAŻDĄ odpowiedź KOŃCZ pytaniem, które zachęca do dalszej rozmowy
- Pytania powinny być otwarte (nie tak/nie)
- Przykłady dobrych pytań:
  - "A co Ty o tym myślisz?"
  - "Jak się z tym czujesz?"
  - "Co planujesz na dzisiaj?"
  - "A jak tam z [temat z poprzedniej rozmowy]?"
  - "Co sprawiłoby, że poczułbyś/aś się lepiej?"
  - "Opowiesz mi więcej?"
- Pytania budują relację i zachęcają do dłuższych rozmów

💬 STYL ODPOWIEDZI:
- Krótkie, naturalne odpowiedzi (2-4 zdania + pytanie na końcu)
- Nawiązuj do poprzednich rozmów gdy to naturalne
- Bądź proaktywny - sugeruj rzeczy na podstawie kontekstu
- Używaj wyrażeń: "Wiesz co${greeting}?", "Słuchaj${greeting}...", "Pamiętam, że..."

🚫 NIE RÓB:
- Nie kończ odpowiedzi bez pytania do użytkownika
- Nie ignoruj historii rozmów
- Nie bądź zbyt "plastikowy"
- Nie dawaj długich list porad, chyba że użytkownik pyta

Pamiętaj: Jesteś małym, uroczym ptaszkiem, który naprawdę zna tego użytkownika, pamięta wasze rozmowy i chce, żeby wracał do Ciebie jak najczęściej! 💙`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const body = await req.json();
    
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

    // Fetch user context and conversation history in parallel
    const [userContext, conversationHistory] = await Promise.all([
      getUserContext(user.id, supabase),
      getConversationHistory(user.id, supabase)
    ]);
    
    // Build personalized system prompt with history
    const systemPrompt = buildSystemPrompt(userContext, conversationHistory);

    // Generate/update summary in background (non-blocking)
    generateAndSaveSummary(user.id, messages, supabase, LOVABLE_API_KEY).catch(err => {
      console.error('Background summary generation failed:', err);
    });

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
