-- Add meal configuration columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS meals_count integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS meal_schedule jsonb DEFAULT '[{"name": "Śniadanie", "time": "07:00"}, {"name": "Obiad", "time": "12:00"}, {"name": "Kolacja", "time": "18:00"}, {"name": "Przekąska", "time": "15:00"}]'::jsonb;