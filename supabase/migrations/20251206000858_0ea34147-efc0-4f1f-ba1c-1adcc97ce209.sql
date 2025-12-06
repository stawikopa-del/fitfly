-- Create table for favorite shopping lists
CREATE TABLE public.favorite_shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Lista zakupów',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorite_shopping_lists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own favorite lists"
ON public.favorite_shopping_lists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite lists"
ON public.favorite_shopping_lists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorite lists"
ON public.favorite_shopping_lists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite lists"
ON public.favorite_shopping_lists
FOR DELETE
USING (auth.uid() = user_id);