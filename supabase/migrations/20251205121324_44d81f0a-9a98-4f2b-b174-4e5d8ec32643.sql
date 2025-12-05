-- Drop the overly permissive search policy
DROP POLICY IF EXISTS "Users can search other users" ON public.profiles;

-- Create a view for safe user searching (only non-sensitive fields)
CREATE OR REPLACE VIEW public.searchable_profiles AS
SELECT 
  user_id, 
  display_name, 
  username, 
  avatar_url
FROM public.profiles
WHERE username IS NOT NULL OR display_name IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.searchable_profiles TO authenticated;

-- Create a more restrictive search policy that only allows viewing basic info
-- Users can see their own full profile, friends' full profiles, or basic info of others
CREATE POLICY "Users can search basic profile info"
ON public.profiles FOR SELECT
USING (
  -- Own profile - full access
  auth.uid() = user_id
  OR
  -- Friends - full access (existing policy handles this separately)
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (sender_id = auth.uid() AND receiver_id = profiles.user_id)
      OR (receiver_id = auth.uid() AND sender_id = profiles.user_id)
    )
  )
);