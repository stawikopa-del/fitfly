-- Add RLS policy to allow friends to view each other's profiles
CREATE POLICY "Friends can view each other profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.sender_id = auth.uid() AND f.receiver_id = profiles.user_id) OR
      (f.receiver_id = auth.uid() AND f.sender_id = profiles.user_id)
    )
  )
);

-- Drop duplicate policy
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;