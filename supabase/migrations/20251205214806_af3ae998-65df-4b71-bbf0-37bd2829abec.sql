-- Create shared_shopping_lists table for shopping list sharing
CREATE TABLE public.shared_shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  shared_with_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  date_range_start date,
  date_range_end date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_shopping_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own shared lists
CREATE POLICY "Users can share own lists"
ON public.shared_shopping_lists
FOR INSERT
WITH CHECK (auth.uid() = owner_id AND is_friend_with(auth.uid(), shared_with_id));

-- Policy: Users can view lists shared with them or by them
CREATE POLICY "Users can view shared lists"
ON public.shared_shopping_lists
FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

-- Policy: Recipients can delete lists shared with them
CREATE POLICY "Recipients can delete shared lists"
ON public.shared_shopping_lists
FOR DELETE
USING (auth.uid() = shared_with_id);

-- Policy: Recipients can update check status
CREATE POLICY "Recipients can update shared lists"
ON public.shared_shopping_lists
FOR UPDATE
USING (auth.uid() = shared_with_id);