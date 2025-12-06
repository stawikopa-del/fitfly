-- Update the get_friend_profile function to also allow viewing profiles 
-- of people with pending friend requests (so you can see who's inviting you)
CREATE OR REPLACE FUNCTION public.get_friend_profile(friend_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, username text, avatar_url text, bio text, gender text)
LANGUAGE sql
STABLE SECURITY DEFINER
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
      -- Or they are friends (accepted)
      EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
        AND (
          (f.sender_id = auth.uid() AND f.receiver_id = friend_user_id) OR
          (f.receiver_id = auth.uid() AND f.sender_id = friend_user_id)
        )
      )
      OR
      -- Or there's a pending request (so user can see who's inviting them)
      EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'pending'
        AND (
          (f.sender_id = auth.uid() AND f.receiver_id = friend_user_id) OR
          (f.receiver_id = auth.uid() AND f.sender_id = friend_user_id)
        )
      )
    );
$$;