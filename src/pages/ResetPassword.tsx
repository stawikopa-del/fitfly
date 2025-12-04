import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Lock, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import fitekDetective from '@/assets/fitek-detective.png';

const passwordSchema = z.string().min(6, 'Hasło musi mieć minimum 6 znaków');

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have access token in URL (means user came from reset link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      toast.error('Nieprawidłowy link do resetu hasła');
      navigate('/auth');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { password?: string; confirm?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirm = 'Hasła nie są identyczne';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        toast.error('Nie udało się zmienić hasła');
      } else {
        setIsSuccess(true);
        toast.success('Hasło zostało zmienione! 🎉');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-48 h-48 mb-6 animate-float-slow">
          <img 
            src={fitekDetective} 
            alt="FITEK Detektyw" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="bg-card border-2 border-secondary/50 rounded-3xl p-8 shadow-card-playful text-center max-w-sm">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-xl font-bold font-display text-foreground mb-2">
            Hasło zmienione! 🎉
          </h2>
          <p className="text-muted-foreground text-sm">
            Za chwilę zostaniesz przekierowany...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* FITEK Detektyw */}
      <div className="mb-6">
        <div className="w-40 h-40 animate-float-slow">
          <img 
            src={fitekDetective}
            alt="FITEK Detektyw" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Nagłówek */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-2xl font-extrabold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
          Nowe hasło
          <Sparkles className="w-5 h-5 text-fitfly-yellow" />
        </h1>
        <p className="text-muted-foreground font-medium text-sm">
          Ustaw nowe hasło do swojego konta
        </p>
      </div>

      {/* Formularz */}
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-card-playful">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-foreground">
                Nowe hasło
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold text-foreground">
                Potwierdź hasło
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirm: undefined });
                  }}
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-2xl border-2"
                />
              </div>
              {errors.confirm && (
                <p className="text-destructive text-xs font-medium">{errors.confirm}</p>
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
                  Zmieniam hasło...
                </span>
              ) : (
                'Zmień hasło'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
