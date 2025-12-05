
-- Table for friend relationships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Table for shared challenges between friends
CREATE TABLE public.shared_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for shared recipes (internal + public links)
CREATE TABLE public.shared_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.favorite_recipes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_id UUID, -- NULL means public link
  share_token TEXT UNIQUE, -- for public links
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique username field to profiles for friend search
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Shared challenges policies
CREATE POLICY "Users can view shared challenges"
  ON public.shared_challenges FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

CREATE POLICY "Users can share own challenges"
  ON public.shared_challenges FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own shared challenges"
  ON public.shared_challenges FOR DELETE
  USING (auth.uid() = owner_id);

-- Shared recipes policies
CREATE POLICY "Users can view shared recipes"
  ON public.shared_recipes FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_id OR is_public = true);

CREATE POLICY "Users can share own recipes"
  ON public.shared_recipes FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own shared recipes"
  ON public.shared_recipes FOR DELETE
  USING (auth.uid() = owner_id);

-- Policy to allow viewing friend profiles (limited data)
CREATE POLICY "Users can view friend profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((sender_id = auth.uid() AND receiver_id = profiles.user_id)
           OR (receiver_id = auth.uid() AND sender_id = profiles.user_id))
    )
  );

-- Policy to view friend's daily progress
CREATE POLICY "Users can view friend progress"
  ON public.daily_progress FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((sender_id = auth.uid() AND receiver_id = daily_progress.user_id)
           OR (receiver_id = auth.uid() AND sender_id = daily_progress.user_id))
    )
  );

-- Index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_shared_recipes_token ON public.shared_recipes(share_token);
