-- Add reactions and comments columns to shared_shopping_lists
ALTER TABLE public.shared_shopping_lists 
ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comments jsonb DEFAULT '[]';