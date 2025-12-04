import { useState } from 'react';
import { Calendar, Plus, X, Clock, Dumbbell, Utensils, Target, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'workout' | 'meal' | 'challenge' | 'other';
}

const eventTypeConfig = {
  workout: { icon: Dumbbell, color: 'bg-fitfly-blue', label: 'Trening' },
  meal: { icon: Utensils, color: 'bg-fitfly-green', label: 'Posiłek' },
  challenge: { icon: Target, color: 'bg-fitfly-purple', label: 'Wyzwanie' },
  other: { icon: Sparkles, color: 'bg-fitfly-orange', label: 'Inne' },
};

interface CalendarDialogProps {
  trigger: React.ReactNode;
}

export function CalendarDialog({ trigger }: CalendarDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Poranny trening',
      date: new Date(),
      time: '07:00',
      type: 'workout',
    },
    {
      id: '2',
      title: 'Zdrowe śniadanie',
      date: new Date(),
      time: '08:00',
      type: 'meal',
    },
  ]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '12:00',
    type: 'workout' as CalendarEvent['type'],
  });

  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      type: newEvent.type,
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', time: '12:00', type: 'workout' });
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const datesWithEvents = events.map((e) => e.date);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Twój Kalendarz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-card rounded-2xl p-3 border border-border/50">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={pl}
              className="pointer-events-auto"
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

          {/* Add event form */}
          {isAddingEvent && (
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
                    <option value="other">Inne</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleAddEvent}
                disabled={!newEvent.title.trim()}
                className="w-full rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" /> Dodaj do kalendarza
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
                const config = eventTypeConfig[event.type];
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
                        <span>{event.time}</span>
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
