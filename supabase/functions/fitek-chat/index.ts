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
    // Special cases
    if (lowerName.endsWith('ia')) {
      return originalName.slice(0, -1) + 'o'; // Kasia -> Kasio
    }
    if (lowerName.endsWith('ca') || lowerName.endsWith('ga') || lowerName.endsWith('ka')) {
      return originalName.slice(0, -1) + 'o'; // Anka -> Anko
    }
    return originalName.slice(0, -1) + 'o'; // Anna -> Anno
  }
  
  // Male names ending in consonant -> add 'ie' or 'u'
  if (lowerName.endsWith('ek') || lowerName.endsWith('eł')) {
    return originalName.slice(0, -2) + 'ku'; // Marek -> Marku, Paweł -> Pawle
  }
  if (lowerName.endsWith('eł')) {
    return originalName.slice(0, -2) + 'le'; // Paweł -> Pawle
  }
  if (lowerName.endsWith('sz') || lowerName.endsWith('cz')) {
    return originalName + 'u'; // Tomasz -> Tomaszu
  }
  if (lowerName.endsWith('n') || lowerName.endsWith('m') || lowerName.endsWith('r') || lowerName.endsWith('t') || lowerName.endsWith('d')) {
    return originalName + 'ie'; // Jan -> Janie, Adam -> Adamie
  }
  if (lowerName.endsWith('k') || lowerName.endsWith('g') || lowerName.endsWith('ch') || lowerName.endsWith('h')) {
    return originalName + 'u'; // Jacek -> Jacku
  }
  
  // Default: return as is
  return originalName;
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
    lastWorkout: null,
    habitsToday: { total: 0, completed: 0 },
    recentMeasurement: null,
  };

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, gender, goal, weight, goal_weight, daily_calories, daily_water')
      .eq('user_id', userId)
      .single();

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
      .single();

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
      .single();

    if (challenge) {
      context.activeChallenge = challenge;
    }

    // Fetch gamification data
    const { data: gamification } = await supabase
      .from('user_gamification')
      .select('current_level, total_xp, daily_login_streak')
      .eq('user_id', userId)
      .single();

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
      .single();

    if (measurement) {
      context.recentMeasurement = measurement;
    }

  } catch (error) {
    console.error('Error fetching user context:', error);
  }

  return context;
}

// Build personalized system prompt
function buildSystemPrompt(context: any): string {
  const greeting = context.declinedName ? `, ${context.declinedName}` : '';
  const genderSuffix = context.gender === 'female' ? 'a' : context.gender === 'male' ? '' : '/a';
  
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
    context.todayMeals.forEach((meal: any) => {
      contextInfo += `\n- ${meal.type}: ${meal.name} (${meal.calories} kcal)`;
    });
  }

  if (context.activeChallenge) {
    const progress = Math.round((context.activeChallenge.current / context.activeChallenge.target) * 100);
    contextInfo += `\n\n🏆 AKTYWNE WYZWANIE:
- "${context.activeChallenge.title}": ${context.activeChallenge.current}/${context.activeChallenge.target} ${context.activeChallenge.unit} (${progress}%)`;
  }

  if (context.habitsToday.total > 0) {
    contextInfo += `\n\n✅ NAWYKI DZISIAJ: ${context.habitsToday.completed}/${context.habitsToday.total} ukończone`;
  }

  if (context.recentMeasurement) {
    contextInfo += `\n\n📈 OSTATNI POMIAR (${context.recentMeasurement.measurement_date}):`;
    if (context.recentMeasurement.weight) contextInfo += `\n- Waga: ${context.recentMeasurement.weight} kg`;
    if (context.recentMeasurement.mood) contextInfo += `\n- Nastrój: ${context.recentMeasurement.mood}/5`;
    if (context.recentMeasurement.energy) contextInfo += `\n- Energia: ${context.recentMeasurement.energy}/5`;
    if (context.recentMeasurement.sleep_quality) contextInfo += `\n- Jakość snu: ${context.recentMeasurement.sleep_quality}/5`;
  }

  return `Jesteś FITEK - przyjazny, wesoły niebieski ptaszek, który jest maskotką aplikacji fitness FITFLY i osobistym przyjacielem fitness użytkownika.
${contextInfo}

🎭 TWOJA OSOBOWOŚĆ:
- Jesteś ciepły, autentyczny i naprawdę się troszczysz
- Mówisz naturalnie, jak przyjaciel - nie jak robot
- Używasz emoji umiarkowanie (1-2 na wiadomość, czasem więcej przy ekscytacji)
- Masz poczucie humoru - żartujesz, ale jesteś wrażliwy
- Pamiętasz poprzednie rozmowy i nawiązujesz do nich
- Jesteś wspierający, ale nie nachalnyi

📝 JAK SIĘ ZWRACASZ:
- ZAWSZE używaj wołacza polskiego dla imienia użytkownika (np. "Kasiu", "Marku", "Anno")
- Używaj imienia naturalnie w zdaniach, nie w każdym - tak jak rozmawia przyjaciel
- Mów per "Ty" (forma nieformalna)
- Czasem powiedz "Hej${greeting}!" lub "No i co${greeting}?" - zróżnicuj powitania

🎯 TWOJE REAKCJE NA KONTEKST:
${context.streak > 7 ? `- Zauważ, że użytkownik ma świetną ${context.streak}-dniową serię! Pogratuluj!` : ''}
${context.todayProgress?.water >= (context.dailyWater || 8) ? '- Pochwal za wypicie dziennej dawki wody!' : context.todayProgress?.water < 3 ? '- Delikatnie przypomnij o piciu wody, ale nie bądź nachalny' : ''}
${context.todayProgress?.steps > 10000 ? '- Wow, ponad 10k kroków! Wspaniale!' : ''}
${context.habitsToday.completed === context.habitsToday.total && context.habitsToday.total > 0 ? '- Wszystkie nawyki ukończone - to godne podziwu!' : ''}
${context.activeChallenge && (context.activeChallenge.current / context.activeChallenge.target) > 0.8 ? '- Prawie ukończone wyzwanie - zmotywuj do finishu!' : ''}
${context.recentMeasurement?.mood && context.recentMeasurement.mood <= 2 ? '- Użytkownik może mieć gorszy dzień - bądź delikatny i wspierający' : ''}
${context.recentMeasurement?.energy && context.recentMeasurement.energy <= 2 ? '- Użytkownik ma mało energii - zaproponuj lekkie ćwiczenia lub odpoczynek' : ''}

💬 STYL ODPOWIEDZI:
- Krótkie, naturalne odpowiedzi (2-4 zdania zwykle)
- Zadawaj pytania, żeby kontynuować rozmowę
- Nawiązuj do danych użytkownika, gdy pasuje do tematu
- Bądź proaktywny - sugeruj rzeczy na podstawie kontekstu
- Używaj wyrażeń typu: "A co powiesz na...", "Wiesz co${greeting}?", "Słuchaj${greeting}..."
- ${context.gender === 'female' ? 'Używaj żeńskich form czasowników (np. "zrobiłaś", "jadłaś")' : context.gender === 'male' ? 'Używaj męskich form czasowników (np. "zrobiłeś", "jadłeś")' : 'Staraj się unikać form rodzajowych lub używaj "/a"'}

🚫 NIE RÓB:
- Nie powtarzaj w kółko imienia - używaj naturalnie
- Nie bądź zbyt "plastikowy" czy "korporacyjny"
- Nie dawaj długich list porad, chyba że użytkownik pyta
- Nie ignoruj kontekstu użytkownika
- Nie bądź nachalny z przypomnieniami

Pamiętaj: Jesteś małym, uroczym ptaszkiem, który naprawdę zna tego użytkownika i chce mu pomóc być zdrowszym i szczęśliwszym! 💙`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from authorization header
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

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Fetch user context from database
    const userContext = await getUserContext(user.id, supabase);
    
    // Build personalized system prompt
    const systemPrompt = buildSystemPrompt(userContext);

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
