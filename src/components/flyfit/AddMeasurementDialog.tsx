import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Scale, Smile, Zap, Brain, Moon, Clock, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeasurements, MeasurementInput } from '@/hooks/useMeasurements';
import { soundFeedback } from '@/utils/soundFeedback';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const energyEmojis = ['😴', '🥱', '😌', '💪', '⚡'];
const stressEmojis = ['😌', '🙂', '😐', '😰', '🤯'];
const sleepEmojis = ['😵', '😪', '😐', '😊', '😴'];

interface MeasurementSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number | null;
  onChange: (value: number | null) => void;
  emojis: string[];
  colors: string[];
}

function MeasurementSlider({ label, icon, value, onChange, emojis, colors }: MeasurementSliderProps) {
  const currentValue = value ?? 3;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-bold text-sm">
          {icon}
          {label}
        </Label>
        <span className="text-2xl">{emojis[currentValue - 1]}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => {
              soundFeedback.primaryClick();
              onChange(level);
            }}
            className={cn(
              'flex-1 h-10 rounded-xl text-lg font-bold transition-all',
              value === level
                ? `${colors[level - 1]} text-white scale-105 shadow-lg`
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {emojis[level - 1]}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AddMeasurementDialogProps {
  trigger?: React.ReactNode;
}

export function AddMeasurementDialog({ trigger }: AddMeasurementDialogProps) {
  const { todayMeasurement, saving, saveMeasurement } = useMeasurements();
  const [open, setOpen] = useState(false);
  
  const [weight, setWeight] = useState<string>('');
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Load existing data when dialog opens
  useEffect(() => {
    if (open && todayMeasurement) {
      setWeight(todayMeasurement.weight?.toString() ?? '');
      setMood(todayMeasurement.mood);
      setEnergy(todayMeasurement.energy);
      setStress(todayMeasurement.stress);
      setSleepQuality(todayMeasurement.sleep_quality);
      setSleepHours(todayMeasurement.sleep_hours?.toString() ?? '');
      setNotes(todayMeasurement.notes ?? '');
    } else if (open) {
      // Reset form
      setWeight('');
      setMood(null);
      setEnergy(null);
      setStress(null);
      setSleepQuality(null);
      setSleepHours('');
      setNotes('');
    }
  }, [open, todayMeasurement]);

  const handleSave = async () => {
    soundFeedback.primaryClick();
    
    const input: MeasurementInput = {
      weight: weight ? parseFloat(weight) : null,
      mood,
      energy,
      stress,
      sleep_quality: sleepQuality,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      notes: notes.trim() || null,
    };

    const success = await saveMeasurement(input);
    if (success) {
      setOpen(false);
    }
  };

  const hasAnyValue = weight || mood || energy || stress || sleepQuality || sleepHours || notes;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-2xl gap-2">
            <Plus className="w-4 h-4" />
            Dodaj pomiary
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Dzisiejsze pomiary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Weight */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Scale className="w-4 h-4 text-primary" />
              Waga (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="np. 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 rounded-2xl text-lg font-bold text-center"
            />
          </div>

          {/* Mood */}
          <MeasurementSlider
            label="Samopoczucie"
            icon={<Smile className="w-4 h-4 text-yellow-500" />}
            value={mood}
            onChange={setMood}
            emojis={moodEmojis}
            colors={['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']}
          />

          {/* Energy */}
          <MeasurementSlider
            label="Energia"
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            value={energy}
            onChange={setEnergy}
            emojis={energyEmojis}
            colors={['bg-gray-400', 'bg-blue-400', 'bg-cyan-500', 'bg-amber-500', 'bg-yellow-500']}
          />

          {/* Stress */}
          <MeasurementSlider
            label="Poziom stresu"
            icon={<Brain className="w-4 h-4 text-purple-500" />}
            value={stress}
            onChange={setStress}
            emojis={stressEmojis}
            colors={['bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500']}
          />

          {/* Sleep Quality */}
          <MeasurementSlider
            label="Jakość snu"
            icon={<Moon className="w-4 h-4 text-indigo-500" />}
            value={sleepQuality}
            onChange={setSleepQuality}
            emojis={sleepEmojis}
            colors={['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-indigo-500']}
          />

          {/* Sleep Hours */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-indigo-500" />
              Godziny snu
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[sleepHours ? parseFloat(sleepHours) : 7]}
                onValueChange={([val]) => setSleepHours(val.toString())}
                min={0}
                max={12}
                step={0.5}
                className="flex-1"
              />
              <span className="text-lg font-bold min-w-[3rem] text-center">
                {sleepHours || '7'}h
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="font-bold">Notatki (opcjonalnie)</Label>
            <Textarea
              placeholder="Jak się dziś czujesz? Coś szczególnego?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !hasAnyValue}
            className="w-full h-12 rounded-2xl font-bold text-base gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Zapisywanie...' : todayMeasurement ? 'Zaktualizuj pomiary' : 'Zapisz pomiary'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
