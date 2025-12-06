-- Fix 1: Drop the friend_profiles view (publicly accessible without RLS)
DROP VIEW IF EXISTS public.friend_profiles;

-- Fix 2: Update direct_messages UPDATE policy for reactions
DROP POLICY IF EXISTS "Users can update read status" ON public.direct_messages;

CREATE POLICY "Users can update messages in their conversations" 
ON public.direct_messages 
FOR UPDATE 
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));