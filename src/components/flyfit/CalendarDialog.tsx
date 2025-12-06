import { useState, useEffect } from 'react';
import { Calendar, Plus, X, Clock, Dumbbell, Utensils, Target, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import fitekDzwoni from '@/assets/fitek/fitek-dzwoni.png';

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

interface CalendarDialogProps {
  trigger: React.ReactNode;
}

export function CalendarDialog({ trigger }: CalendarDialogProps) {
  const { user } = useAuth();
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
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-display flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-muted shadow-sm border border-border/30 flex items-center justify-center shrink-0">
              <img src={fitekDzwoni} alt="FITEK z dzwonkiem" className="w-7 h-7 object-contain" />
            </div>
            Twój Kalendarz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-card rounded-2xl p-3 border border-border/50 flex justify-center">
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
            <h3 className="font-bold text-foreground">
              {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
            </h3>
            <Button
              size="sm"
              variant="outline"
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
            <div className="bg-primary/10 rounded-2xl p-3 text-center">
              <p className="text-sm text-muted-foreground">
                Zaloguj się, aby dodawać i zapisywać plany
              </p>
            </div>
          )}

          {/* Add event form */}
          {isAddingEvent && user && (
            <div className="bg-muted/50 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Nazwa planu</Label>
                <Input
                  placeholder="np. Trening siłowy"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="font-bold text-sm">Godzina</Label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="rounded-xl"
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
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
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
                className="w-full rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" /> 
                {isLoading ? 'Dodawanie...' : 'Dodaj do kalendarza'}
              </Button>
            </div>
          )}

          {/* Events list */}
          <div className="space-y-2">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Brak planów na ten dzień</p>
                <p className="text-xs">Kliknij "Dodaj plan" aby zaplanować</p>
              </div>
            ) : (
              selectedDateEvents.map((event) => {
                const config = eventTypeConfig[event.type] || eventTypeConfig.other;
                const Icon = config.icon;

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/50 group animate-fade-in"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-white',
                        config.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{event.event_time}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Info about native calendar */}
          <div className="bg-primary/10 rounded-2xl p-3 text-center">
            <p className="text-xs text-muted-foreground">
              💡 Pełna integracja z kalendarzem telefonu będzie dostępna w aplikacji mobilnej
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
