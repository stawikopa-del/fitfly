import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, Clock, Dumbbell, Utensils, Target, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  type: 'workout' | 'meal' | 'challenge' | 'habit' | 'other';
}

const eventTypeConfig = {
  workout: { icon: Dumbbell, color: 'bg-fitfly-blue', label: 'Trening' },
  meal: { icon: Utensils, color: 'bg-fitfly-green', label: 'Posiłek' },
  challenge: { icon: Target, color: 'bg-fitfly-purple', label: 'Wyzwanie' },
  habit: { icon: Sparkles, color: 'bg-fitfly-pink', label: 'Nawyk' },
  other: { icon: Sparkles, color: 'bg-fitfly-orange', label: 'Inne' },
};

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '12:00',
    type: 'workout' as CalendarEvent['type'],
  });

  // Fetch events from database
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents((data || []).map(e => ({
        ...e,
        type: e.type as CalendarEvent['type']
      })));
    };

    fetchEvents();
  }, [user]);

  const selectedDateEvents = events.filter((event) =>
    isSameDay(parseISO(event.event_date), selectedDate)
  );

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !user) return;

    setIsLoading(true);

    const eventData = {
      user_id: user.id,
      title: newEvent.title,
      event_date: format(selectedDate, 'yyyy-MM-dd'),
      event_time: newEvent.time,
      type: newEvent.type,
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      console.error('Error adding event:', error);
      toast.error('Nie udało się dodać planu');
      return;
    }

    setEvents([...events, { ...data, type: data.type as CalendarEvent['type'] }]);
    setNewEvent({ title: '', time: '12:00', type: 'workout' });
    setIsAddingEvent(false);
    toast.success('Plan dodany!');
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      toast.error('Nie udało się usunąć planu');
      return;
    }

    setEvents(events.filter((e) => e.id !== id));
    toast.success('Plan usunięty');
  };

  const datesWithEvents = events.map((e) => parseISO(e.event_date));

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold font-display flex items-center gap-2 text-foreground">
              <CalendarIcon className="w-6 h-6 text-primary" />
              Twój Kalendarz
            </h1>
            <p className="text-xs text-muted-foreground">Planuj treningi, posiłki i nawyki</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Calendar */}
        <div className="bg-card rounded-3xl p-4 border-2 border-border/50 shadow-card-playful">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={pl}
            className="pointer-events-auto mx-auto"
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))',
              },
            }}
          />
        </div>

        {/* Selected date info */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold font-display text-foreground text-lg">
            {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
          </h2>
          <Button
            size="sm"
            variant={isAddingEvent ? 'outline' : 'default'}
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            className="rounded-xl gap-1"
            disabled={!user}
          >
            {isAddingEvent ? (
              <>
                <X className="w-4 h-4" /> Anuluj
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Dodaj plan
              </>
            )}
          </Button>
        </div>

        {!user && (
          <div className="bg-primary/10 rounded-3xl p-4 text-center border-2 border-primary/30">
            <p className="text-sm text-muted-foreground">
              Zaloguj się, aby dodawać i zapisywać plany
            </p>
          </div>
        )}

        {/* Add event form */}
        {isAddingEvent && user && (
          <div className="bg-card rounded-3xl p-5 space-y-4 animate-fade-in border-2 border-border/50 shadow-card-playful">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Nazwa planu</Label>
              <Input
                placeholder="np. Trening siłowy"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="rounded-2xl h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Godzina</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-sm">Typ</Label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      type: e.target.value as CalendarEvent['type'],
                    })
                  }
                  className="w-full h-12 px-4 rounded-2xl border border-input bg-background text-sm font-medium"
                >
                  <option value="workout">Trening</option>
                  <option value="meal">Posiłek</option>
                  <option value="challenge">Wyzwanie</option>
                  <option value="habit">Nawyk</option>
                  <option value="other">Inne</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleAddEvent}
              disabled={!newEvent.title.trim() || isLoading}
              className="w-full rounded-2xl h-12"
            >
              <Plus className="w-4 h-4 mr-2" /> 
              {isLoading ? 'Dodawanie...' : 'Dodaj do kalendarza'}
            </Button>
          </div>
        )}

        {/* Events list */}
        <div className="space-y-3">
          <h3 className="font-bold font-display text-foreground">
            Plany na ten dzień 📅
          </h3>
          
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border-2 border-dashed border-border">
              <CalendarIcon className="w-14 h-14 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="font-display font-bold text-lg text-muted-foreground">Brak planów na ten dzień</p>
              <p className="text-sm text-muted-foreground mt-1">Kliknij "Dodaj plan" aby zaplanować</p>
            </div>
          ) : (
            selectedDateEvents.map((event) => {
              const config = eventTypeConfig[event.type] || eventTypeConfig.other;
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-3xl border-2 border-border/50 group animate-fade-in shadow-card-playful hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm',
                      config.color
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.event_time}</span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5 rounded-full"
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="bg-primary/10 rounded-3xl p-4 text-center border border-primary/30">
          <p className="text-sm text-muted-foreground">
            💡 Pełna integracja z kalendarzem telefonu będzie dostępna w aplikacji mobilnej
          </p>
        </div>
      </div>
    </div>
  );
}
