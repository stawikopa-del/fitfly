-- Create a view that exposes only non-sensitive profile data for friends
-- This view can be queried by friends to see basic profile info
CREATE OR REPLACE VIEW public.friend_profiles AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.gender
FROM public.profiles p
WHERE 
  -- Users can see their own profile
  p.user_id = auth.uid()
  OR
  -- Users can see profiles of accepted friends
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.sender_id = auth.uid() AND f.receiver_id = p.user_id) OR
      (f.receiver_id = auth.uid() AND f.sender_id = p.user_id)
    )
  );

-- Grant access to the view
GRANT SELECT ON public.friend_profiles TO authenticated;
GRANT SELECT ON public.friend_profiles TO anon;