-- Update search_profiles function to require minimum 3 characters
-- This prevents enumeration attacks by requiring meaningful search terms

CREATE OR REPLACE FUNCTION public.search_profiles(search_term text)
RETURNS TABLE (user_id uuid, username text, display_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.username, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE 
    -- Require minimum 3 characters to prevent enumeration
    length(trim(search_term)) >= 3
    AND (
      p.username ILIKE '%' || trim(search_term) || '%'
      OR p.display_name ILIKE '%' || trim(search_term) || '%'
    )
    -- Exclude user's own profile from search results
    AND p.user_id != auth.uid()
  LIMIT 20;
$$;