import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, MapPin, Flag, Tag, Check, Trash2, GripVertical, Sparkles, Sun, CloudSun, Moon, Calendar, Star, Navigation, Map, X, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import fitekCel from '@/assets/fitek/fitek-cel.png';

// Lazy load the map component
const LocationPickerMap = lazy(() => import('@/components/flyfit/LocationPickerMap'));

interface DayPlan {
  id: string;
  name: string;
  time: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
  priority: string;
  is_completed: boolean;
  notes: string | null;
  time_of_day: string | null;
  order_index: number;
  plan_date: string;
  recurrence: string | null;
}

const CATEGORIES = [
  { id: 'praca', label: 'Praca', icon: '💼', color: 'bg-blue-500' },
  { id: 'zdrowie', label: 'Zdrowie', icon: '🏃', color: 'bg-green-500' },
  { id: 'rodzina', label: 'Rodzina', icon: '👨‍👩‍👧', color: 'bg-pink-500' },
  { id: 'zakupy', label: 'Zakupy', icon: '🛒', color: 'bg-orange-500' },
  { id: 'nauka', label: 'Nauka', icon: '📚', color: 'bg-purple-500' },
  { id: 'hobby', label: 'Hobby', icon: '🎨', color: 'bg-yellow-500' },
  { id: 'spotkanie', label: 'Spotkanie', icon: '🤝', color: 'bg-cyan-500' },
  { id: 'inne', label: 'Inne', icon: '📌', color: 'bg-gray-500' },
  { id: 'custom', label: 'Własna...', icon: '✏️', color: 'bg-muted' },
];

const PRIORITIES = [
  { id: 'low', label: 'Niski', color: 'text-muted-foreground', bg: 'bg-muted' },
  { id: 'normal', label: 'Normalny', color: 'text-primary', bg: 'bg-primary/20' },
  { id: 'high', label: 'Wysoki', color: 'text-accent', bg: 'bg-accent/20' },
  { id: 'urgent', label: 'Pilne!', color: 'text-destructive', bg: 'bg-destructive/20' },
];

const TIME_SECTIONS = [
  { id: 'morning', label: 'Rano', icon: Sun, time: '6:00 - 12:00', color: 'from-amber-400/20 to-orange-300/10' },
  { id: 'afternoon', label: 'Południe', icon: CloudSun, time: '12:00 - 18:00', color: 'from-sky-400/20 to-blue-300/10' },
  { id: 'evening', label: 'Wieczór', icon: Moon, time: '18:00 - 24:00', color: 'from-indigo-400/20 to-purple-300/10' },
];

const RECURRENCE_OPTIONS = [
  { id: null, label: 'Bez powtarzania', icon: '📌' },
  { id: 'daily', label: 'Codziennie', icon: '📅' },
  { id: 'weekly', label: 'Co tydzień', icon: '🗓️' },
  { id: 'monthly', label: 'Co miesiąc', icon: '📆' },
];

export default function DayPlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<'loose' | 'template'>('loose');
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingTimeOfDay, setEditingTimeOfDay] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<DayPlan | null>(null);
  
  // Form state
  const [planName, setPlanName] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [planDate, setPlanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [planLocation, setPlanLocation] = useState('');
  const [planCoords, setPlanCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [planCategory, setPlanCategory] = useState('inne');
  const [customCategory, setCustomCategory] = useState('');
  const [planPriority, setPlanPriority] = useState('normal');
  const [planNotes, setPlanNotes] = useState('');
  const [planRecurrence, setPlanRecurrence] = useState<string | null>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  // Date state - initialize from URL if present
  const urlDate = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (urlDate) {
      const parsed = new Date(urlDate);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [plansCountByDate, setPlansCountByDate] = useState<Record<string, number>>({});
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    if (urlDate) {
      const parsed = new Date(urlDate);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchPlansCount();
    }
  }, [user, selectedDateStr]);

  // Fetch plans count for calendar indicators
  useEffect(() => {
    if (user) fetchPlansCount();
  }, [user, calendarMonth]);

  const fetchPlansCount = async () => {
    if (!user) return;
    try {
      const monthStart = format(startOfMonth(calendarMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(calendarMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('day_plans')
        .select('plan_date')
        .eq('user_id', user.id)
        .gte('plan_date', monthStart)
        .lte('plan_date', monthEnd);
      
      if (error) throw error;
      
      const countObj: Record<string, number> = {};
      (data || []).forEach(p => {
        countObj[p.plan_date] = (countObj[p.plan_date] || 0) + 1;
      });
      setPlansCountByDate(countObj);
    } catch (err) {
      console.error('Error fetching plans count:', err);
    }
  };

  const fetchPlans = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('day_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_date', selectedDateStr)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlanName('');
    setPlanTime('');
    setPlanDate(format(selectedDate, 'yyyy-MM-dd'));
    setPlanLocation('');
    setPlanCoords(null);
    setShowMapPicker(false);
    setPlanCategory('inne');
    setCustomCategory('');
    setPlanPriority('normal');
    setPlanNotes('');
    setPlanRecurrence(null);
    setEditingTimeOfDay(null);
    setEditingPlan(null);
  };

  // Handle location selection from map picker
  const handleLocationSelect = (coords: { lat: number; lng: number }, address: string) => {
    setPlanCoords(coords);
    setPlanLocation(address);
    setShowMapPicker(false);
    
    // Reopen sheet with saved location
    setTimeout(() => {
      setIsAddingPlan(true);
    }, 150);
    
    toast.success('Lokalizacja zapisana!');
  };

  const openNavigationToLocation = (lat?: number | null, lng?: number | null) => {
    const targetLat = lat ?? planCoords?.lat;
    const targetLng = lng ?? planCoords?.lng;
    
    if (!targetLat || !targetLng) {
      toast.error('Brak zapisanej lokalizacji');
      return;
    }
    
    // Detect if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Apple Maps
      window.open(`maps://maps.apple.com/?daddr=${targetLat},${targetLng}&dirflg=d`, '_blank');
    } else {
      // Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`, '_blank');
    }
  };

  const openEditForm = (plan: DayPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanTime(plan.time || '');
    setPlanDate(plan.plan_date);
    setPlanLocation(plan.location || '');
    setPlanCoords(plan.latitude && plan.longitude ? { lat: plan.latitude, lng: plan.longitude } : null);
    setPlanCategory(plan.category);
    setPlanPriority(plan.priority);
    setPlanNotes(plan.notes || '');
    setEditingTimeOfDay(plan.time_of_day);
    setIsAddingPlan(true);
  };

  const handleSavePlan = async () => {
    if (!user || !planName.trim()) {
      toast.error('Wpisz nazwę planu');
      return;
    }

    const finalCategory = planCategory === 'custom' ? customCategory || 'inne' : planCategory;
    const timeOfDay = mode === 'template' ? editingTimeOfDay : (editingPlan?.time_of_day || null);

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('day_plans')
          .update({
            name: planName.trim(),
            time: planTime || null,
            location: planLocation || null,
            latitude: planCoords?.lat || null,
            longitude: planCoords?.lng || null,
            category: finalCategory,
            priority: planPriority,
            notes: planNotes || null,
            time_of_day: timeOfDay,
          })
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Plan zaktualizowany!');
      } else {
        // Insert new plan(s)
        const basePlan = {
          user_id: user.id,
          name: planName.trim(),
          time: planTime || null,
          location: planLocation || null,
          latitude: planCoords?.lat || null,
          longitude: planCoords?.lng || null,
          category: finalCategory,
          priority: planPriority,
          notes: planNotes || null,
          time_of_day: timeOfDay,
          order_index: plans.length,
          recurrence: planRecurrence,
        };

        // Generate dates based on recurrence
        const datesToCreate: string[] = [planDate];
        
        if (planRecurrence) {
          const startDate = new Date(planDate);
          const iterations = planRecurrence === 'daily' ? 30 : planRecurrence === 'weekly' ? 12 : 6;
          
          for (let i = 1; i < iterations; i++) {
            let nextDate: Date;
            if (planRecurrence === 'daily') {
              nextDate = addDays(startDate, i);
            } else if (planRecurrence === 'weekly') {
              nextDate = addDays(startDate, i * 7);
            } else {
              // monthly
              nextDate = new Date(startDate);
              nextDate.setMonth(nextDate.getMonth() + i);
            }
            datesToCreate.push(format(nextDate, 'yyyy-MM-dd'));
          }
        }

        const plansToInsert = datesToCreate.map((date, idx) => ({
          ...basePlan,
          plan_date: date,
          order_index: plans.length + idx,
        }));

        const { error } = await supabase.from('day_plans').insert(plansToInsert);

        if (error) throw error;
        
        if (planRecurrence) {
          toast.success(`Dodano ${plansToInsert.length} planów!`);
        } else {
          toast.success('Plan dodany!');
        }
      }
      
      resetForm();
      setIsAddingPlan(false);
      fetchPlans();
      fetchPlansCount();
    } catch (err) {
      console.error('Error saving plan:', err);
      toast.error('Błąd podczas zapisywania planu');
    }
  };

  const toggleComplete = async (plan: DayPlan) => {
    try {
      const { error } = await supabase
        .from('day_plans')
        .update({ is_completed: !plan.is_completed })
        .eq('id', plan.id);

      if (error) throw error;
      
      setPlans(prev => prev.map(p => 
        p.id === plan.id ? { ...p, is_completed: !p.is_completed } : p
      ));
      
      if (!plan.is_completed) {
        toast.success('Świetnie! ✅');
      }
    } catch (err) {
      console.error('Error toggling plan:', err);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase.from('day_plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      fetchPlansCount();
      toast.success('Plan usunięty');
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  const deleteRecurringSeries = async (plan: DayPlan) => {
    if (!user || !plan.recurrence) return;
    
    try {
      // Delete all plans with same name, time, category, and recurrence pattern
      const { error, count } = await supabase
        .from('day_plans')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .eq('name', plan.name)
        .eq('recurrence', plan.recurrence)
        .eq('category', plan.category);
      
      if (error) throw error;
      
      fetchPlans();
      fetchPlansCount();
      toast.success(`Usunięto ${count || 0} planów z serii`);
    } catch (err) {
      console.error('Error deleting series:', err);
      toast.error('Błąd podczas usuwania serii');
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
  };

  const handleDragEnd = async () => {
    if (!draggedId || !dragOverId.current || draggedId === dragOverId.current) {
      setDraggedId(null);
      return;
    }

    const oldIndex = plans.findIndex(p => p.id === draggedId);
    const newIndex = plans.findIndex(p => p.id === dragOverId.current);

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newPlans = [...plans];
    const [removed] = newPlans.splice(oldIndex, 1);
    newPlans.splice(newIndex, 0, removed);

    // Update order_index for all affected items
    const updatedPlans = newPlans.map((p, idx) => ({ ...p, order_index: idx }));
    setPlans(updatedPlans);
    setDraggedId(null);

    // Save to database
    try {
      const updates = updatedPlans.map(p => 
        supabase.from('day_plans').update({ order_index: p.order_index }).eq('id', p.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error('Error reordering plans:', err);
      fetchPlans(); // Revert on error
    }
  };

  // Touch drag support
  const handleTouchStart = (id: string) => {
    setDraggedId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedId) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const planCard = element?.closest('[data-plan-id]');
    
    if (planCard) {
      const planId = planCard.getAttribute('data-plan-id');
      if (planId) {
        dragOverId.current = planId;
      }
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES.find(c => c.id === 'inne')!;
  };

  const getPriorityInfo = (priorityId: string) => {
    return PRIORITIES.find(p => p.id === priorityId) || PRIORITIES[1];
  };

  const completedCount = plans.filter(p => p.is_completed).length;
  const progressPercent = plans.length > 0 ? Math.round((completedCount / plans.length) * 100) : 0;

  const renderPlanCard = (plan: DayPlan, isDraggable = false) => {
    const category = getCategoryInfo(plan.category);
    const priority = getPriorityInfo(plan.priority);

    return (
      <div
        key={plan.id}
        data-plan-id={plan.id}
        draggable={isDraggable}
        onDragStart={() => handleDragStart(plan.id)}
        onDragOver={(e) => handleDragOver(e, plan.id)}
        onDragEnd={handleDragEnd}
        onTouchStart={() => isDraggable && handleTouchStart(plan.id)}
        onTouchMove={isDraggable ? handleTouchMove : undefined}
        onTouchEnd={isDraggable ? handleTouchEnd : undefined}
        className={cn(
          'bg-card rounded-2xl p-4 border border-border/50 transition-all',
          plan.is_completed && 'opacity-60 bg-muted/30',
          draggedId === plan.id && 'opacity-50 scale-95',
          isDraggable && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex items-start gap-3">
          {isDraggable && (
            <div className="p-1 text-muted-foreground/50 touch-none">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          
          <button
            onClick={() => toggleComplete(plan)}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
              plan.is_completed 
                ? 'bg-secondary border-secondary text-secondary-foreground' 
                : 'border-muted-foreground/40 hover:border-secondary'
            )}
          >
            {plan.is_completed && <Check className="w-4 h-4" />}
          </button>

          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => openEditForm(plan)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{category.icon}</span>
              <h4 className={cn(
                'font-bold text-foreground truncate',
                plan.is_completed && 'line-through text-muted-foreground'
              )}>
                {plan.name}
              </h4>
              {plan.priority === 'urgent' && (
                <Star className="w-4 h-4 text-destructive fill-destructive shrink-0" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {plan.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {plan.time}
                </span>
              )}
              {plan.location && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.latitude && plan.longitude) {
                      openNavigationToLocation(plan.latitude, plan.longitude);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1",
                    plan.latitude && plan.longitude && "text-primary hover:underline"
                  )}
                >
                  <MapPin className="w-3 h-3" />
                  {plan.location}
                  {plan.latitude && plan.longitude && (
                    <Navigation className="w-3 h-3 ml-0.5" />
                  )}
                </button>
              )}
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', priority.bg, priority.color)}>
                {priority.label}
              </span>
              {plan.recurrence && (
                <span className="flex items-center gap-1 text-secondary">
                  <Repeat className="w-3 h-3" />
                  {plan.recurrence === 'daily' ? 'Codziennie' : plan.recurrence === 'weekly' ? 'Co tydzień' : 'Co miesiąc'}
                </span>
              )}
            </div>

            {plan.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{plan.notes}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => deletePlan(plan.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Usuń ten plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {plan.recurrence && (
              <button
                onClick={() => deleteRecurringSeries(plan)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Usuń całą serię"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Separate form JSX to avoid re-render issues
  const formContent = (
    <div className="space-y-4 p-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Nazwa planu *</label>
        <Input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Co chcesz zrobić?"
          className="bg-background"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Czas
          </label>
          <Input
            type="time"
            value={planTime}
            onChange={(e) => setPlanTime(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Data
            {(() => {
              const today = format(new Date(), 'yyyy-MM-dd');
              const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
              if (planDate === today) return <span className="text-xs text-secondary font-normal ml-1">(Dzisiaj)</span>;
              if (planDate === tomorrow) return <span className="text-xs text-secondary font-normal ml-1">(Jutro)</span>;
              return null;
            })()}
          </label>
          <Input
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Miejsce
        </label>
        <Input
          value={planLocation}
          onChange={(e) => setPlanLocation(e.target.value)}
          placeholder="np. Dom, Biuro"
          className="bg-background"
        />
      </div>

      {/* Map location buttons */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Close sheet first, then open map
            setIsAddingPlan(false);
            setTimeout(() => setShowMapPicker(true), 150);
          }}
          className="w-full justify-start gap-2 h-11"
        >
          <Map className="w-4 h-4 text-primary" />
          Wybierz lokalizację na mapie
        </Button>
        
        {planCoords && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/10 rounded-lg p-2">
              <MapPin className="w-3 h-3 text-secondary" />
              <span className="truncate flex-1">{planLocation}</span>
              <button
                type="button"
                onClick={() => {
                  setPlanCoords(null);
                  setPlanLocation('');
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => openNavigationToLocation()}
              className="w-full justify-start gap-2 h-11 border-secondary text-secondary hover:bg-secondary/10"
            >
              <Navigation className="w-4 h-4" />
              Wyznacz trasę do tego miejsca
            </Button>
          </>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-muted-foreground" />
          Kategoria
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setPlanCategory(cat.id)}
              className={cn(
                'p-2 rounded-xl border text-center transition-all text-sm',
                planCategory === cat.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background hover:border-primary/50'
              )}
            >
              <span className="text-lg block mb-0.5">{cat.icon}</span>
              <span className="text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
        {planCategory === 'custom' && (
          <Input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Wpisz własną kategorię..."
            className="mt-2 bg-background"
          />
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <Flag className="w-4 h-4 text-muted-foreground" />
          Priorytet
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map((pri) => (
            <button
              key={pri.id}
              type="button"
              onClick={() => setPlanPriority(pri.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all',
                planPriority === pri.id
                  ? `border-2 ${pri.bg} ${pri.color}`
                  : 'border-border bg-background hover:border-primary/50'
              )}
            >
              {pri.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence - only for new plans */}
      {!editingPlan && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-muted-foreground" />
            Powtarzanie
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RECURRENCE_OPTIONS.map((opt) => (
              <button
                key={opt.id || 'none'}
                type="button"
                onClick={() => setPlanRecurrence(opt.id)}
                className={cn(
                  'p-2 rounded-xl border text-center transition-all text-sm',
                  planRecurrence === opt.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/50'
                )}
              >
                <span className="text-lg block mb-0.5">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
          {planRecurrence && (
            <p className="text-xs text-muted-foreground mt-2">
              {planRecurrence === 'daily' && 'Plan zostanie utworzony na 30 kolejnych dni'}
              {planRecurrence === 'weekly' && 'Plan zostanie utworzony na 12 tygodni'}
              {planRecurrence === 'monthly' && 'Plan zostanie utworzony na 6 miesięcy'}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Notatki</label>
        <Textarea
          value={planNotes}
          onChange={(e) => setPlanNotes(e.target.value)}
          placeholder="Dodatkowe informacje..."
          className="bg-background resize-none"
          rows={2}
        />
      </div>

      <Button onClick={handleSavePlan} className="w-full" size="lg">
        {editingPlan ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Zapisz zmiany
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            Dodaj plan
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold font-display text-lg">Planowanie dnia</h1>
          </div>
          <img src={fitekCel} alt="FITEK" className="w-12 h-12 object-contain" />
        </div>
        
        {/* Date navigation */}
        <div className="flex items-center justify-between mt-3 bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-card rounded-lg transition-colors">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">
                  {isToday(selectedDate) 
                    ? 'Dzisiaj' 
                    : isTomorrow(selectedDate) 
                      ? 'Jutro' 
                      : isYesterday(selectedDate) 
                        ? 'Wczoraj' 
                        : format(selectedDate, 'd MMMM', { locale: pl })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(selectedDate, 'EEEE', { locale: pl })}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                onMonthChange={setCalendarMonth}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={pl}
                modifiers={{
                  hasPlans: (date) => !!plansCountByDate[format(date, 'yyyy-MM-dd')]
                }}
                modifiersClassNames={{
                  hasPlans: 'relative'
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const count = plansCountByDate[dateStr];
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {count > 0 && (
                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 min-w-[14px] h-[14px] bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Mode Switcher */}
        <div className="bg-muted/50 rounded-2xl p-1 flex">
          <button
            onClick={() => setMode('loose')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all',
              mode === 'loose' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            📝 Luźne
          </button>
          <button
            onClick={() => setMode('template')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all',
              mode === 'template' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            📋 Szablon
          </button>
        </div>

        {/* Progress */}
        {plans.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Postęp dnia</span>
              <span className="text-sm font-bold text-primary">{completedCount}/{plans.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Wszystko zrobione! Brawo! 🎉
              </p>
            )}
          </div>
        )}

        {/* Drag hint for loose mode */}
        {mode === 'loose' && plans.length > 1 && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <GripVertical className="w-3 h-3" />
            Przeciągnij, aby zmienić kolejność
          </p>
        )}

        {/* Content */}
        {mode === 'loose' ? (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Brak planów na dziś</p>
                <p className="text-sm text-muted-foreground/70">Dodaj swój pierwszy plan!</p>
              </div>
            ) : (
              plans.map(plan => renderPlanCard(plan, true))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {TIME_SECTIONS.map((section) => {
              const sectionPlans = plans.filter(p => p.time_of_day === section.id);
              const SectionIcon = section.icon;

              return (
                <div key={section.id} className={cn('rounded-2xl border border-border/50 overflow-hidden bg-gradient-to-br', section.color)}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-card/80 flex items-center justify-center">
                        <SectionIcon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{section.label}</h3>
                        <p className="text-xs text-muted-foreground">{section.time}</p>
                      </div>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-xl"
                          onClick={() => setEditingTimeOfDay(section.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle className="text-left">Dodaj plan - {section.label}</SheetTitle>
                        </SheetHeader>
                        {formContent}
                      </SheetContent>
                    </Sheet>
                  </div>
                  
                  {sectionPlans.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                      {sectionPlans.map(plan => renderPlanCard(plan, false))}
                    </div>
                  )}
                  
                  {sectionPlans.length === 0 && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-muted-foreground text-center py-3">Brak planów</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB for Loose mode */}
      {mode === 'loose' && (
        <Sheet open={isAddingPlan} onOpenChange={(open) => { setIsAddingPlan(open); if (!open) resetForm(); }}>
          <SheetTrigger asChild>
            <button className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform z-50">
              <Plus className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
              <SheetTitle className="text-left">{editingPlan ? 'Edytuj plan' : 'Nowy plan'}</SheetTitle>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }>
          <LocationPickerMap
            onSelectLocation={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
          />
        </Suspense>
      )}
    </div>
  );
}