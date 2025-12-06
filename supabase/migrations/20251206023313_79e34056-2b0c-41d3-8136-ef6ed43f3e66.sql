-- Remove the overly permissive policy that exposes all profile data to friends
-- Friends should access profile data ONLY through secure RPC functions:
-- get_friend_profile() and get_friend_activity_stats()
-- which return only non-sensitive data (display_name, username, avatar_url, bio, gender)

DROP POLICY IF EXISTS "Friends can view each other profiles" ON public.profiles;