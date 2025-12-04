import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, parseISO, isSameDay, addMinutes, isAfter, isBefore } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  type: string;
}

export function useCalendarNotifications() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Twoja przeglądarka nie wspiera powiadomień');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        toast.success('Powiadomienia włączone! 🔔');
        return true;
      } else if (permission === 'denied') {
        toast.error('Powiadomienia zostały zablokowane. Odblokuj je w ustawieniach przeglądarki.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Nie udało się włączyć powiadomień');
      return false;
    }
  }, []);

  // Send a notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permissionStatus !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'fitfly-calendar',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Also play a sound feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permissionStatus]);

  // Check for upcoming events and send notifications
  const checkUpcomingEvents = useCallback(async () => {
    if (!user || permissionStatus !== 'granted') return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_date', today);

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (!events || events.length === 0) return;

      const now = new Date();
      
      events.forEach((event: CalendarEvent) => {
        // Skip if already notified
        if (notifiedEvents.has(event.id)) return;

        // Parse event time
        const [hours, minutes] = event.event_time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);

        // Notify 15 minutes before the event
        const notifyTime = addMinutes(eventTime, -15);
        
        // Check if it's time to notify (within 1 minute window)
        const notifyWindowStart = notifyTime;
        const notifyWindowEnd = addMinutes(notifyTime, 1);

        if (isAfter(now, notifyWindowStart) && isBefore(now, notifyWindowEnd)) {
          sendNotification(
            `📅 ${event.title}`,
            `Za 15 minut! (${event.event_time})`,
            '/pwa-192x192.png'
          );
          
          setNotifiedEvents(prev => new Set([...prev, event.id]));
        }

        // Also notify at the exact event time
        const exactNotifyStart = eventTime;
        const exactNotifyEnd = addMinutes(eventTime, 1);

        if (isAfter(now, exactNotifyStart) && isBefore(now, exactNotifyEnd)) {
          const eventKey = `${event.id}-exact`;
          if (!notifiedEvents.has(eventKey)) {
            sendNotification(
              `🔔 ${event.title}`,
              `Czas na: ${event.title}!`,
              '/pwa-192x192.png'
            );
            
            setNotifiedEvents(prev => new Set([...prev, eventKey]));
          }
        }
      });
    } catch (error) {
      console.error('Error checking upcoming events:', error);
    }
  }, [user, permissionStatus, notifiedEvents, sendNotification]);

  // Set up interval to check for upcoming events
  useEffect(() => {
    if (!user || permissionStatus !== 'granted') return;

    // Check immediately
    checkUpcomingEvents();

    // Then check every minute
    const interval = setInterval(checkUpcomingEvents, 60000);

    return () => clearInterval(interval);
  }, [user, permissionStatus, checkUpcomingEvents]);

  // Reset notified events at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setNotifiedEvents(new Set());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // Send a test notification
  const sendTestNotification = useCallback(() => {
    if (permissionStatus !== 'granted') {
      toast.error('Najpierw włącz powiadomienia!');
      return;
    }

    sendNotification(
      '🎉 FITFLY Test',
      'Powiadomienia działają poprawnie!'
    );
    toast.success('Powiadomienie testowe wysłane!');
  }, [permissionStatus, sendNotification]);

  return {
    permissionStatus,
    requestPermission,
    sendNotification,
    sendTestNotification,
    isSupported: 'Notification' in window,
  };
}
