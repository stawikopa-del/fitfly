-- Create security definer function to check friendship
CREATE OR REPLACE FUNCTION public.is_friend_with(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (sender_id = user1_id AND receiver_id = user2_id) OR
      (receiver_id = user1_id AND sender_id = user2_id)
    )
  )
$$;

-- Drop existing policy and create new one that checks friendship
DROP POLICY IF EXISTS "Users can send messages" ON direct_messages;

CREATE POLICY "Users can send messages to friends"
ON direct_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_friend_with(auth.uid(), receiver_id)
);