-- Add notes column to shared_shopping_lists
ALTER TABLE public.shared_shopping_lists 
ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Allow both owner and recipient to update the shared list (add items, notes, check items)
DROP POLICY IF EXISTS "Recipients can update shared lists" ON public.shared_shopping_lists;
DROP POLICY IF EXISTS "Users can update shared lists" ON public.shared_shopping_lists;

CREATE POLICY "Users can update shared lists" 
ON public.shared_shopping_lists 
FOR UPDATE 
USING ((auth.uid() = owner_id) OR (auth.uid() = shared_with_id));

-- Enable realtime for shared_shopping_lists
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_shopping_lists;