
-- Create table for shopping list items (custom products and checked status)
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'szt',
  category TEXT NOT NULL DEFAULT 'inne',
  is_checked BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own shopping list items"
ON public.shopping_list_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping list items"
ON public.shopping_list_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping list items"
ON public.shopping_list_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping list items"
ON public.shopping_list_items
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for checked items from diet plan (not custom)
CREATE TABLE public.shopping_list_checked (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_name)
);

-- Enable RLS
ALTER TABLE public.shopping_list_checked ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own checked items"
ON public.shopping_list_checked
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checked items"
ON public.shopping_list_checked
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checked items"
ON public.shopping_list_checked
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checked items"
ON public.shopping_list_checked
FOR DELETE
USING (auth.uid() = user_id);
