-- Add sound_theme column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sound_theme text DEFAULT 'off';