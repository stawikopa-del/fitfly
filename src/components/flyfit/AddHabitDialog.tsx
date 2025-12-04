import { useState } from 'react';
import { Plus, Target, Droplets, Dumbbell, BookOpen, Heart, Brain, Footprints, Sparkles, Bell, Link2, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { suggestedHabits } from '@/hooks/useHabitsAndChallenges';

interface AddHabitDialogProps {
  onAdd: (habit: any) => Promise<any>;
}

const iconOptions = [
  { icon: Target, name: 'target', label: 'Cel' },
  { icon: Droplets, name: 'droplets', label: 'Woda' },
  { icon: Dumbbell, name: 'dumbbell', label: 'Siłownia' },
  { icon: BookOpen, name: 'book-open', label: 'Książka' },
  { icon: Heart, name: 'heart', label: 'Serce' },
  { icon: Brain, name: 'brain', label: 'Umysł' },
  { icon: Footprints, name: 'footprints', label: 'Spacer' },
  { icon: Sparkles, name: 'sparkles', label: 'Magia' },
];

const colorOptions = [
  { name: 'primary', bg: 'bg-primary', label: 'Niebieski' },
  { name: 'green', bg: 'bg-fitfly-green', label: 'Zielony' },
  { name: 'orange', bg: 'bg-fitfly-orange', label: 'Pomarańczowy' },
  { name: 'purple', bg: 'bg-fitfly-purple', label: 'Fioletowy' },
  { name: 'pink', bg: 'bg-fitfly-pink', label: 'Różowy' },
];

export function AddHabitDialog({ onAdd }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'zdrowie',
    icon: 'target',
    color: 'primary',
    target_value: 1,
    unit: 'razy',
    reminder_enabled: false,
    reminder_time: '08:00',
    cue: '',
    reward: '',
    habit_stack_after: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsLoading(true);
    await onAdd(formData);
    setIsLoading(false);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'zdrowie',
      icon: 'target',
      color: 'primary',
      target_value: 1,
      unit: 'razy',
      reminder_enabled: false,
      reminder_time: '08:00',
      cue: '',
      reward: '',
      habit_stack_after: '',
    });
  };

  const handleSelectSuggested = (suggested: typeof suggestedHabits[0]) => {
    setFormData({
      ...formData,
      title: suggested.title,
      description: suggested.description,
      category: suggested.category,
      icon: suggested.icon,
      color: suggested.color,
      cue: suggested.cue,
      reward: suggested.reward,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl gap-2">
          <Plus className="w-5 h-5" />
          Dodaj nawyk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-display text-center">
            Nowy nawyk 🎯
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="w-full rounded-2xl mb-4">
            <TabsTrigger value="custom" className="flex-1 rounded-xl">Własny</TabsTrigger>
            <TabsTrigger value="suggested" className="flex-1 rounded-xl">Sugerowane</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggested" className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Oparte na zasadach z "Atomowych Nawyków" ✨
            </p>
            {suggestedHabits.map((habit, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggested(habit)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border-2 transition-all',
                  'hover:-translate-y-0.5 hover:border-primary/50',
                  formData.title === habit.title 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 bg-muted/30'
                )}
              >
                <p className="font-bold text-foreground">{habit.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{habit.description}</p>
              </button>
            ))}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Nazwa nawyku *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="np. 10 pompek dziennie"
                className="rounded-2xl h-12 border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Opis (opcjonalnie)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Dlaczego ten nawyk jest dla Ciebie ważny?"
                className="rounded-2xl border-2 resize-none"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Ikona</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => setFormData({ ...formData, icon: opt.name })}
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                      formData.icon === opt.name 
                        ? 'bg-primary text-primary-foreground shadow-playful' 
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <opt.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Kolor</Label>
              <div className="flex gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => setFormData({ ...formData, color: opt.name })}
                    className={cn(
                      'w-10 h-10 rounded-full transition-all',
                      opt.bg,
                      formData.color === opt.name 
                        ? 'ring-4 ring-offset-2 ring-primary scale-110' 
                        : ''
                    )}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Atomic Habits section - always visible when title is set */}
        {formData.title && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <p className="text-sm font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Zasady Atomowych Nawyków
            </p>
            
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                Sygnał (kiedy wykonasz nawyk?)
              </Label>
              <Input
                value={formData.cue}
                onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                placeholder="np. Po porannej kawie..."
                className="rounded-2xl h-10 border-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Gift className="w-4 h-4 text-muted-foreground" />
                Nagroda (co zyskujesz?)
              </Label>
              <Input
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="np. Więcej energii na cały dzień"
                className="rounded-2xl h-10 border-2 text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Przypomnienie</p>
                  <p className="text-xs text-muted-foreground">Powiadomienie o nawyku</p>
                </div>
              </div>
              <Switch
                checked={formData.reminder_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
              />
            </div>
            
            {formData.reminder_enabled && (
              <Input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                className="rounded-2xl h-10 border-2"
              />
            )}
          </div>
        )}
        
        <Button 
          onClick={handleSubmit}
          disabled={!formData.title.trim() || isLoading}
          className="w-full rounded-2xl mt-4"
        >
          {isLoading ? 'Dodawanie...' : 'Dodaj nawyk 🎯'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
