import { Plus, Coffee, UtensilsCrossed, Moon, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Meal } from '@/types/flyfit';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealCardProps {
  type: MealType;
  meals: Meal[];
  onAddMeal: (type: MealType) => void;
}

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; color: string }> = {
  breakfast: { label: 'Śniadanie', icon: Coffee, color: 'text-orange-500 bg-orange-500/10' },
  lunch: { label: 'Obiad', icon: UtensilsCrossed, color: 'text-green-500 bg-green-500/10' },
  dinner: { label: 'Kolacja', icon: Moon, color: 'text-blue-500 bg-blue-500/10' },
  snack: { label: 'Przekąski', icon: Cookie, color: 'text-purple-500 bg-purple-500/10' },
};

export function MealCard({ type, meals, onAddMeal }: MealCardProps) {
  const config = mealConfig[type];
  const Icon = config.icon;
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${config.color.split(' ')[1]}`}>
            <Icon className={`w-5 h-5 ${config.color.split(' ')[0]}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <p className="text-xs text-muted-foreground">{totalCalories} kcal</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAddMeal(type)}
          className="rounded-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {meals.length > 0 ? (
        <div className="space-y-2">
          {meals.map(meal => (
            <div key={meal.id} className="flex justify-between items-center py-1 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{meal.name}</span>
              <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Brak posiłków
        </p>
      )}
    </div>
  );
}
