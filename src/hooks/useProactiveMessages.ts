import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUserProgress } from './useUserProgress';
import { supabase } from '@/integrations/supabase/client';

interface ProactiveMessage {
  id: string;
  content: string;
  type: 'greeting' | 'reminder' | 'motivation' | 'celebration';
  priority: number;
}

export function useProactiveMessages() {
  const { user } = useAuth();
  const { progress } = useUserProgress();
  const [proactiveMessage, setProactiveMessage] = useState<ProactiveMessage | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [hasShownToday, setHasShownToday] = useState(false);

  // Decline Polish name to vocative case
  const declinePolishName = useCallback((name: string): string => {
    if (!name) return "";
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.endsWith('a')) {
      return name.slice(0, -1) + 'o';
    }
    if (lowerName.endsWith('ek')) {
      return name.slice(0, -2) + 'ku';
    }
    if (lowerName.endsWith('eł')) {
      return name.slice(0, -2) + 'le';
    }
    if (lowerName.endsWith('sz') || lowerName.endsWith('cz')) {
      return name + 'u';
    }
    if (lowerName.endsWith('n') || lowerName.endsWith('m') || lowerName.endsWith('r') || lowerName.endsWith('t') || lowerName.endsWith('d')) {
      return name + 'ie';
    }
    if (lowerName.endsWith('k') || lowerName.endsWith('g') || lowerName.endsWith('ch') || lowerName.endsWith('h')) {
      return name + 'u';
    }
    
    return name;
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      }
    };

    fetchProfile();
  }, [user]);

  // Generate proactive message based on context
  const generateProactiveMessage = useCallback(() => {
    if (!user || hasShownToday) return null;

    const hour = new Date().getHours();
    const declinedName = displayName ? declinePolishName(displayName) : null;
    const nameGreeting = declinedName ? `, ${declinedName}` : '';
    
    const messages: ProactiveMessage[] = [];

    // Time-based greetings
    if (hour >= 5 && hour < 10) {
      messages.push({
        id: 'morning_greeting',
        content: `Dzień dobry${nameGreeting}! ☀️ Jak się dziś czujesz? Mam nadzieję, że wyspałeś/aś się dobrze!`,
        type: 'greeting',
        priority: 3
      });
    } else if (hour >= 10 && hour < 12) {
      messages.push({
        id: 'late_morning',
        content: `Hej${nameGreeting}! 👋 Jak mija poranek? Pamiętasz o nawodnieniu?`,
        type: 'reminder',
        priority: 2
      });
    } else if (hour >= 12 && hour < 14) {
      messages.push({
        id: 'lunch_time',
        content: `Pora obiadu${nameGreeting}! 🍽️ Co jesz dzisiaj? Mam nadzieję, że coś pysznego i zdrowego!`,
        type: 'reminder',
        priority: 2
      });
    } else if (hour >= 17 && hour < 20) {
      messages.push({
        id: 'evening',
        content: `Dobry wieczór${nameGreeting}! 🌆 Jak minął dzień? Udało się być aktywnym?`,
        type: 'greeting',
        priority: 2
      });
    }

    // Progress-based messages
    if (progress) {
      if (progress.steps > 10000) {
        messages.push({
          id: 'steps_celebration',
          content: `WOW${nameGreeting.toUpperCase()}! 🎉 Ponad ${progress.steps.toLocaleString()} kroków dzisiaj! Jesteś niesamowity/a!`,
          type: 'celebration',
          priority: 5
        });
      } else if (progress.steps > 5000 && progress.steps < 7000) {
        messages.push({
          id: 'steps_motivation',
          content: `Świetnie${nameGreeting}! 💪 Masz już ${progress.steps.toLocaleString()} kroków - jeszcze trochę do okrągłego wyniku!`,
          type: 'motivation',
          priority: 3
        });
      }

      if (progress.water < 3 && hour >= 14) {
        messages.push({
          id: 'water_reminder',
          content: `Hej${nameGreeting}! 💧 Widzę, że dziś mało piłeś/aś - co powiesz na szklankę wody teraz?`,
          type: 'reminder',
          priority: 4
        });
      }
    }

    // Sort by priority and return highest
    if (messages.length > 0) {
      messages.sort((a, b) => b.priority - a.priority);
      return messages[0];
    }

    return null;
  }, [user, displayName, declinePolishName, progress, hasShownToday]);

  // Check and set proactive message
  useEffect(() => {
    if (!user || hasShownToday) return;

    // Check if we've already shown a message today
    const lastShown = localStorage.getItem('fitek_proactive_last_shown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      setHasShownToday(true);
      return;
    }

    // Generate message after a delay (so it feels natural)
    const timer = setTimeout(() => {
      const message = generateProactiveMessage();
      if (message) {
        setProactiveMessage(message);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, generateProactiveMessage, hasShownToday]);

  const dismissMessage = useCallback(() => {
    setProactiveMessage(null);
    setHasShownToday(true);
    localStorage.setItem('fitek_proactive_last_shown', new Date().toDateString());
  }, []);

  return {
    proactiveMessage,
    dismissMessage,
    displayName,
    declinedName: displayName ? declinePolishName(displayName) : null
  };
}
