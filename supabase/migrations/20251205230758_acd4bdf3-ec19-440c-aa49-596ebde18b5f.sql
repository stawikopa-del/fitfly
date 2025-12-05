-- Add reply_to column for message replies
ALTER TABLE public.direct_messages 
ADD COLUMN reply_to_id uuid REFERENCES public.direct_messages(id) ON DELETE SET NULL;

-- Create index for faster reply lookups
CREATE INDEX idx_direct_messages_reply_to ON public.direct_messages(reply_to_id);
