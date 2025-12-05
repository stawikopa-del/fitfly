-- Create a SECURITY DEFINER function to safely get friend profile data
-- This returns ONLY non-sensitive fields for friends

CREATE OR REPLACE FUNCTION public.get_friend_profile(friend_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  gender text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.gender
  FROM public.profiles p
  WHERE p.user_id = friend_user_id
    AND (
      -- User can see their own profile
      friend_user_id = auth.uid()
      OR
      -- Or they are friends
      EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
        AND (
          (f.sender_id = auth.uid() AND f.receiver_id = friend_user_id) OR
          (f.receiver_id = auth.uid() AND f.sender_id = friend_user_id)
        )
      )
    );
$$;

-- Create a function to get friend activity stats (steps, water, active minutes)
CREATE OR REPLACE FUNCTION public.get_friend_activity_stats(friend_user_id uuid)
RETURNS TABLE (
  total_steps bigint,
  total_water bigint,
  total_active_minutes bigint,
  days_tracked bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(SUM(dp.steps), 0)::bigint as total_steps,
    COALESCE(SUM(dp.water), 0)::bigint as total_water,
    COALESCE(SUM(dp.active_minutes), 0)::bigint as total_active_minutes,
    COUNT(*)::bigint as days_tracked
  FROM public.daily_progress dp
  WHERE dp.user_id = friend_user_id
    AND (
      -- User can see their own stats
      friend_user_id = auth.uid()
      OR
      -- Or they are friends
      EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
        AND (
          (f.sender_id = auth.uid() AND f.receiver_id = friend_user_id) OR
          (f.receiver_id = auth.uid() AND f.sender_id = friend_user_id)
        )
      )
    );
$$;

-- Drop the overly permissive friend profile policies
DROP POLICY IF EXISTS "Users can view friend profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can search basic profile info" ON public.profiles;

-- Create a more restrictive policy - users can ONLY view their own profile directly
-- Friends must use the get_friend_profile function
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_friend_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friend_activity_stats(uuid) TO authenticated;