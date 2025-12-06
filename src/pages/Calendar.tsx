import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, Clock, Dumbbell, Utensils, Target, Sparkles, ArrowLeft, CalendarDays, LayoutGrid, ChevronLeft, ChevronRight, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from 'date-fns';
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
  type: string;
}

type PredefinedType = 'workout' | 'meal' | 'challenge' | 'habit' | 'other';

const eventTypeConfig: Record<string, { icon: any; color: string; textColor: string; dotColor: string; label: string; emoji: string }> = {
  workout: { icon: Dumbbell, color: 'bg-fitfly-blue', textColor: 'text-fitfly-blue', dotColor: 'bg-blue-500', label: 'Trening', emoji: '💪' },
  meal: { icon: Utensils, color: 'bg-fitfly-green', textColor: 'text-fitfly-green', dotColor: 'bg-green-500', label: 'Posiłek', emoji: '🍽️' },
  challenge: { icon: Target, color: 'bg-fitfly-purple', textColor: 'text-fitfly-purple', dotColor: 'bg-purple-500', label: 'Wyzwanie', emoji: '🏆' },
  habit: { icon: Sparkles, color: 'bg-fitfly-pink', textColor: 'text-fitfly-pink', dotColor: 'bg-pink-500', label: 'Nawyk', emoji: '✨' },
  other: { icon: Pencil, color: 'bg-fitfly-orange', textColor: 'text-fitfly-orange', dotColor: 'bg-orange-500', label: 'Własne', emoji: '✏️' },
};

const predefinedTypes: PredefinedType[] = ['workout', 'meal', 'challenge', 'habit', 'other'];

const getEventConfig = (type: string) => {
  if (eventTypeConfig[type]) {
    return eventTypeConfig[type];
  }
  // Custom type - use "other" styling but show custom label
  return {
    ...eventTypeConfig.other,
    label: type,
  };
};

const isCustomType = (type: string) => !predefinedTypes.includes(type as PredefinedType);

type ViewMode = 'month' | 'week';

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    time: '',
    type: 'workout',
    customType: '',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '12:00',
    type: 'workout',
    customType: '',
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

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.event_date), date));
  };

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !user) return;
    if (newEvent.type === 'other' && !newEvent.customType.trim()) {
      toast.error('Wpisz własny typ wydarzenia');
      return;
    }

    setIsLoading(true);

    const finalType = newEvent.type === 'other' && newEvent.customType.trim() 
      ? newEvent.customType.trim() 
      : newEvent.type;

    const eventData = {
      user_id: user.id,
      title: newEvent.title,
      event_date: format(selectedDate, 'yyyy-MM-dd'),
      event_time: newEvent.time,
      type: finalType,
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

    setEvents([...events, { ...data, type: data.type }]);
    setNewEvent({ title: '', time: '12:00', type: 'workout', customType: '' });
    setIsAddingEvent(false);
    toast.success('Plan dodany!');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    const isPredefined = predefinedTypes.includes(event.type as PredefinedType);
    setEditForm({
      title: event.title,
      time: event.event_time,
      type: isPredefined ? event.type : 'other',
      customType: isPredefined ? '' : event.type,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEventId || !editForm.title.trim()) return;
    if (editForm.type === 'other' && !editForm.customType.trim()) {
      toast.error('Wpisz własny typ wydarzenia');
      return;
    }

    setIsLoading(true);

    const finalType = editForm.type === 'other' && editForm.customType.trim()
      ? editForm.customType.trim()
      : editForm.type;

    const { error } = await supabase
      .from('calendar_events')
      .update({
        title: editForm.title,
        event_time: editForm.time,
        type: finalType,
      })
      .eq('id', editingEventId);

    setIsLoading(false);

    if (error) {
      console.error('Error updating event:', error);
      toast.error('Nie udało się zaktualizować planu');
      return;
    }

    setEvents(events.map(e => 
      e.id === editingEventId 
        ? { ...e, title: editForm.title, event_time: editForm.time, type: finalType }
        : e
    ));
    setEditingEventId(null);
    toast.success('Plan zaktualizowany!');
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditForm({ title: '', time: '', type: 'workout', customType: '' });
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
        <div className="flex items-center justify-between max-w-2xl mx-auto">
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
          
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-2xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('month')}
              className={cn(
                "rounded-xl h-8 px-3",
                viewMode === 'month' && "bg-background shadow-sm"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('week')}
              className={cn(
                "rounded-xl h-8 px-3",
                viewMode === 'week' && "bg-background shadow-sm"
              )}
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Category Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {predefinedTypes.map((key) => (
            <div 
              key={key} 
              className="flex items-center gap-1.5 bg-card rounded-full px-3 py-1.5 border border-border/50"
            >
              <div className={cn("w-2.5 h-2.5 rounded-full", eventTypeConfig[key].dotColor)} />
              <span className="text-xs font-medium text-muted-foreground">{eventTypeConfig[key].label}</span>
            </div>
          ))}
        </div>

        {/* Month View - custom tiles matching week view style */}
        {viewMode === 'month' && (
          <div className="bg-card rounded-3xl p-4 border-2 border-border/50 shadow-card-playful">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="rounded-xl w-8 h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-bold font-display text-foreground text-center text-sm">
                {format(selectedDate, 'LLLL yyyy', { locale: pl })}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="rounded-xl w-8 h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Monday = 0
                const daysInMonth = lastDayOfMonth.getDate();
                const today = new Date();
                
                const cells = [];
                
                // Empty cells before first day
                for (let i = 0; i < startDay; i++) {
                  cells.push(
                    <div key={`empty-${i}`} className="py-2 sm:py-3" />
                  );
                }
                
                // Day cells
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dayEvents = getEventsForDate(date);
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  
                  cells.push(
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl transition-all duration-200",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : isTodayDate
                          ? "bg-secondary/20 text-secondary-foreground border-2 border-secondary"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      )}
                    >
                      <span className={cn(
                        "text-[11px] sm:text-sm font-bold",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {day}
                      </span>
                      
                      {/* Event Dots */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                          {dayEvents.slice(0, 2).map((event, idx) => {
                            const config = getEventConfig(event.type);
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                                  isSelected ? "bg-primary-foreground/80" : config.dotColor
                                )}
                              />
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <span className={cn(
                              "text-[6px] sm:text-[7px] font-bold",
                              isSelected ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              +{dayEvents.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                }
                
                return cells;
              })()}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="bg-card rounded-3xl p-4 border-2 border-border/50 shadow-card-playful">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                className="rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="font-bold font-display text-foreground text-center">
                {format(weekStart, 'd MMM', { locale: pl })} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: pl })}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                className="rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Week Days Grid - compact style like MealCalendar */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day Cells */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col items-center py-2 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : isTodayDate
                        ? "bg-secondary/20 text-secondary-foreground border-2 border-secondary"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] sm:text-xs font-bold",
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {dayNames[day.getDay()]}
                    </span>
                    <span className={cn(
                      "text-[9px] sm:text-[10px] mt-0.5 sm:mt-1",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {format(day, 'dd.MM')}
                    </span>
                    
                    {/* Event Dots */}
                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {dayEvents.slice(0, 3).map((event, idx) => {
                          const config = getEventConfig(event.type);
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                                isSelected ? "bg-primary-foreground/80" : config.dotColor
                              )}
                            />
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className={cn(
                            "text-[7px] sm:text-[8px] font-bold",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                      type: e.target.value,
                      customType: e.target.value === 'other' ? newEvent.customType : '',
                    })
                  }
                  className="w-full h-12 px-4 rounded-2xl border border-input bg-background text-sm font-medium"
                >
                  {predefinedTypes.map((key) => (
                    <option key={key} value={key}>
                      {eventTypeConfig[key].emoji} {eventTypeConfig[key].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {newEvent.type === 'other' && (
              <div className="space-y-2 animate-fade-in">
                <Label className="font-bold text-sm">Nazwa własnego typu</Label>
                <Input
                  placeholder="np. Medytacja, Spacer, Spotkanie..."
                  value={newEvent.customType}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, customType: e.target.value })
                  }
                  className="rounded-2xl h-12"
                  maxLength={30}
                />
              </div>
            )}

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
          <h3 className="font-bold font-display text-foreground text-center">
            Plany na ten dzień 📅
          </h3>
          
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border-2 border-dashed border-border">
              <CalendarIcon className="w-14 h-14 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="font-display font-bold text-lg text-muted-foreground">Brak planów na ten dzień</p>
              <p className="text-sm text-muted-foreground mt-1">Kliknij "Dodaj plan" aby zaplanować</p>
            </div>
          ) : (
            selectedDateEvents
              .sort((a, b) => a.event_time.localeCompare(b.event_time))
              .map((event) => {
                const config = getEventConfig(event.type);
                const Icon = config.icon;
                const isEditing = editingEventId === event.id;

                if (isEditing) {
                  return (
                    <div
                      key={event.id}
                      className="p-4 bg-card rounded-3xl border-2 border-primary/50 animate-fade-in shadow-card-playful space-y-3"
                    >
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">Nazwa</Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="rounded-2xl h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="font-bold text-sm">Godzina</Label>
                          <Input
                            type="time"
                            value={editForm.time}
                            onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                            className="rounded-2xl h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-sm">Typ</Label>
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ 
                              ...editForm, 
                              type: e.target.value,
                              customType: e.target.value === 'other' ? editForm.customType : ''
                            })}
                            className="w-full h-10 px-3 rounded-2xl border border-input bg-background text-sm font-medium"
                          >
                            {predefinedTypes.map((key) => (
                              <option key={key} value={key}>
                                {eventTypeConfig[key].emoji} {eventTypeConfig[key].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {editForm.type === 'other' && (
                        <div className="space-y-2 animate-fade-in">
                          <Label className="font-bold text-sm">Nazwa własnego typu</Label>
                          <Input
                            placeholder="np. Medytacja, Spacer, Spotkanie..."
                            value={editForm.customType}
                            onChange={(e) => setEditForm({ ...editForm, customType: e.target.value })}
                            className="rounded-2xl h-10"
                            maxLength={30}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={!editForm.title.trim() || isLoading}
                          className="flex-1 rounded-2xl h-10"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {isLoading ? 'Zapisywanie...' : 'Zapisz'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="rounded-2xl h-10"
                          size="sm"
                        >
                          Anuluj
                        </Button>
                      </div>
                    </div>
                  );
                }

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
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            config.textColor
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", config.dotColor)} />
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEvent(event)}
                        className="rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Info */}
        <div className="bg-primary/10 rounded-3xl p-4 text-center border border-primary/30">
          <p className="text-sm text-muted-foreground">
            💡 Pełna integracja z kalendarzem telefonu oraz powiadomienia push będą dostępne w aplikacji mobilnej
          </p>
        </div>
      </div>
    </div>
  );
}
