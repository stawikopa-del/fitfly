import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/flyfit/AppLayout';
import { PageHeader } from '@/components/flyfit/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Flame, 
  Loader2,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import { useSharing } from '@/hooks/useSharing';
import { useAuth } from '@/hooks/useAuth';

interface Recipe {
  name: string;
  time: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: { instruction: string; time?: string; tip?: string }[];
}

export default function SharedRecipe() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getSharedRecipe } = useSharing();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!token) {
        setError('Nieprawidłowy link');
        setIsLoading(false);
        return;
      }

      const data = await getSharedRecipe(token);
      
      if (!data || !data.favorite_recipes) {
        setError('Przepis nie został znaleziony lub link wygasł');
        setIsLoading(false);
        return;
      }

      setRecipe(data.favorite_recipes.recipe_data as unknown as Recipe);
      setIsLoading(false);
    };

    fetchRecipe();
  }, [token, getSharedRecipe]);

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !recipe) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-xl font-bold text-center mb-2">
            {error || 'Przepis nie znaleziony'}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Link może być nieprawidłowy lub przepis został usunięty
          </p>
          <Button onClick={() => navigate('/')}>
            Przejdź do aplikacji
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <div className="min-h-screen pb-8 px-4 pt-4">
        <PageHeader title="Udostępniony przepis" backTo="/" />

        <Card className="mt-4 bg-card/80 backdrop-blur-sm border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{recipe.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.time}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {recipe.servings} porcji
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {recipe.calories} kcal
                  </Badge>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Białko</p>
                <p className="font-bold text-primary">{recipe.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Węgle</p>
                <p className="font-bold text-orange-500">{recipe.carbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tłuszcze</p>
                <p className="font-bold text-yellow-500">{recipe.fat}g</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Składniki:</h3>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h3 className="font-semibold mb-2">Przygotowanie:</h3>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{step.instruction}</p>
                      {step.tip && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          💡 {step.tip}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {!user && (
              <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center">
                <p className="text-sm mb-3">
                  Chcesz zapisać ten przepis? Dołącz do FITFLY!
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Zaloguj się
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
