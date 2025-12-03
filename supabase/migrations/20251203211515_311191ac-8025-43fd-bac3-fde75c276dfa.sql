-- Dodaj kolumnę user_id do chat_messages
ALTER TABLE public.chat_messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Usuń stare polityki
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- Nowe polityki RLS dla chat_messages
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Dodaj kolumnę user_id do meals
ALTER TABLE public.meals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Usuń stare polityki
DROP POLICY IF EXISTS "Anyone can delete meals" ON public.meals;
DROP POLICY IF EXISTS "Anyone can insert meals" ON public.meals;
DROP POLICY IF EXISTS "Anyone can view meals" ON public.meals;

-- Nowe polityki RLS dla meals
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- Utwórz tabelę profili
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS dla profili
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trigger do automatycznego tworzenia profilu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();