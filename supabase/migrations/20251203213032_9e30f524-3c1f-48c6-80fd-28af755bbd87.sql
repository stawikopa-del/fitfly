-- Dodaj kolumny do tabeli profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS goal_weight NUMERIC,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS daily_calories INTEGER,
ADD COLUMN IF NOT EXISTS daily_water INTEGER,
ADD COLUMN IF NOT EXISTS daily_steps_goal INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Funkcja do aktualizacji updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger dla updated_at
DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Zaktualizuj funkcję tworzenia profilu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    gender,
    age,
    height,
    weight,
    goal_weight,
    goal,
    daily_calories,
    daily_water
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'gender',
    (new.raw_user_meta_data ->> 'age')::INTEGER,
    (new.raw_user_meta_data ->> 'height')::INTEGER,
    (new.raw_user_meta_data ->> 'weight')::NUMERIC,
    (new.raw_user_meta_data ->> 'goal_weight')::NUMERIC,
    new.raw_user_meta_data ->> 'goal',
    (new.raw_user_meta_data ->> 'daily_calories')::INTEGER,
    (new.raw_user_meta_data ->> 'daily_water')::INTEGER
  );
  RETURN new;
END;
$$;