-- Drop and recreate the view with SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.friend_profiles;

CREATE VIEW public.friend_profiles 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.gender
FROM public.profiles p;

-- Grant access to the view
GRANT SELECT ON public.friend_profiles TO authenticated;
GRANT SELECT ON public.friend_profiles TO anon;

-- Add RLS policy on profiles table to allow friends to see limited data
-- This uses the existing is_friend_with function which is already security definer
CREATE POLICY "Friends can view limited profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  public.is_friend_with(auth.uid(), user_id)
);