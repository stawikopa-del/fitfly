-- Drop the insecure view
DROP VIEW IF EXISTS public.searchable_profiles;

-- Create a secure function to search profiles (requires authentication)
CREATE OR REPLACE FUNCTION public.search_profiles(search_term text)
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    p.username ILIKE '%' || search_term || '%'
    OR p.display_name ILIKE '%' || search_term || '%'
  LIMIT 20;
$$;

-- Revoke execute from public, only allow authenticated users
REVOKE EXECUTE ON FUNCTION public.search_profiles(text) FROM public;
GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated;