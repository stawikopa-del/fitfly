import { useState } from 'react';
import { Plus, Trophy, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { suggestedChallenges } from '@/hooks/useHabitsAndChallenges';

interface AddChallengeDialogProps {
  onAdd: (challenge: any) => Promise<any>;
}

export function AddChallengeDialog({ onAdd }: AddChallengeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness',
    target: 7,
    unit: 'dni',
    duration_days: 7,
    points: 100,
    is_custom: true,
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
      category: 'fitness',
      target: 7,
      unit: 'dni',
      duration_days: 7,
      points: 100,
      is_custom: true,
    });
  };

  const handleSelectSuggested = (suggested: typeof suggestedChallenges[0]) => {
    setFormData({
      ...formData,
      title: suggested.title,
      description: suggested.description,
      category: suggested.category,
      target: suggested.target,
      unit: suggested.unit,
      duration_days: suggested.duration_days,
      points: suggested.points,
      is_custom: false,
    });
  };

  const durationOptions = [
    { days: 7, label: '1 tydzień', points: 100 },
    { days: 14, label: '2 tygodnie', points: 150 },
    { days: 21, label: '3 tygodnie', points: 200 },
    { days: 30, label: '1 miesiąc', points: 300 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" className="rounded-2xl gap-2">
          <Plus className="w-5 h-5" />
          Dodaj cel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-display text-center">
            Nowy cel 🎯
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="suggested" className="w-full">
          <TabsList className="w-full rounded-2xl mb-4">
            <TabsTrigger value="suggested" className="flex-1 rounded-xl">Sugerowane</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 rounded-xl">Własne</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggested" className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Wybierz cel i zdobądź punkty! 🎯
            </p>
            {suggestedChallenges.map((challenge, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggested(challenge)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border-2 transition-all',
                  'hover:-translate-y-0.5 hover:border-accent/50',
                  formData.title === challenge.title 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border/50 bg-muted/30'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-foreground">{challenge.title}</p>
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    +{challenge.points} pkt
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{challenge.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {challenge.duration_days} dni
                </div>
              </button>
            ))}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Nazwa celu *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="np. Bieganie 5km 3x w tygodniu"
                className="rounded-2xl h-12 border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Opis (opcjonalnie)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Opisz szczegóły celu..."
                className="rounded-2xl border-2 resize-none"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Czas trwania</Label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => setFormData({ 
                      ...formData, 
                      duration_days: opt.days, 
                      target: opt.days,
                      points: opt.points 
                    })}
                    className={cn(
                      'p-3 rounded-2xl border-2 transition-all text-left',
                      formData.duration_days === opt.days 
                        ? 'border-accent bg-accent/10' 
                        : 'border-border/50 hover:border-accent/30'
                    )}
                  >
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-accent font-medium">+{opt.points} pkt</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Cel</Label>
                <Input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
                  className="rounded-2xl h-12 border-2"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Jednostka</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="dni / razy / km"
                  className="rounded-2xl h-12 border-2"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {formData.title && (
          <div className="bg-accent/10 rounded-2xl p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-bold text-sm">{formData.title}</p>
                  <p className="text-xs text-muted-foreground">{formData.duration_days} dni</p>
                </div>
              </div>
              <span className="text-lg font-extrabold text-accent">+{formData.points}</span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleSubmit}
          variant="accent"
          disabled={!formData.title.trim() || isLoading}
          className="w-full rounded-2xl mt-4"
        >
          {isLoading ? 'Dodawanie...' : 'Dodaj cel 🎯'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
