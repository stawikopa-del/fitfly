-- Fix the security definer view warning by using SECURITY INVOKER
DROP VIEW IF EXISTS public.searchable_profiles;

CREATE VIEW public.searchable_profiles 
WITH (security_invoker = true) AS
SELECT 
  user_id, 
  display_name, 
  username, 
  avatar_url
FROM public.profiles
WHERE username IS NOT NULL OR display_name IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.searchable_profiles TO authenticated;