-- First, delete any orphaned rows with NULL user_id (if any exist)
DELETE FROM public.chat_messages WHERE user_id IS NULL;
DELETE FROM public.meals WHERE user_id IS NULL;

-- Make user_id NOT NULL in chat_messages table
ALTER TABLE public.chat_messages ALTER COLUMN user_id SET NOT NULL;

-- Make user_id NOT NULL in meals table (also found nullable)
ALTER TABLE public.meals ALTER COLUMN user_id SET NOT NULL;