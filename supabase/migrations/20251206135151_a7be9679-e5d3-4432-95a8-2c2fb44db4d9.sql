-- Add reactions column to direct_messages table
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;