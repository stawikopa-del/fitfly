import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import fitekDetective from '@/assets/fitek-detective.png';

const emailSchema = z.string().email('Nieprawidłowy adres email');
const passwordSchema = z.string().min(6, 'Hasło musi mieć minimum 6 znaków');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Nieprawidłowy email lub hasło');
          } else {
            toast.error('Błąd logowania');
          }
        } else {
          toast.success('Zalogowano! 🎉');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Ten email jest już zarejestrowany');
          } else {
            toast.error('Błąd rejestracji');
          }
        } else {
          toast.success('Konto utworzone! 🎉');
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* FITEK Detektyw */}
      <div className="relative z-10 mb-6">
        <div className="w-48 h-48 animate-float-slow">
          <img 
            src={fitekDetective} 
            alt="FITEK Detektyw" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Nagłówek */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-extrabold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
          FLYFIT
          <Sparkles className="w-6 h-6 text-fitfly-yellow" />
        </h1>
        <p className="text-muted-foreground font-medium">
          {isLogin ? 'Witaj ponownie, przyjacielu!' : 'Dołącz do zabawy!'}
        </p>
      </div>

      {/* Formularz */}
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="font-bold text-foreground">
                  Jak mamy Cię wołać?
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Twoje imię"
                    className="pl-12 h-12 rounded-2xl border-2"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="twoj@email.pl"
                  className="pl-12 h-12 rounded-2xl border-2"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-foreground">
                Hasło
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-2xl border-2"
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs font-medium">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl font-bold text-base"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                  {isLogin ? 'Logowanie...' : 'Rejestracja...'}
                </span>
              ) : (
                isLogin ? 'Zaloguj się' : 'Zarejestruj się'
              )}
            </Button>
          </form>
        </div>

        {/* Przełącznik */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="mt-1 font-bold text-primary hover:underline"
          >
            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </div>
      </div>
    </div>
  );
}
