-- Create direct messages table for friend-to-friend chat
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  recipe_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages to friends
CREATE POLICY "Users can send messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read
CREATE POLICY "Users can update read status"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Users can delete own sent messages
CREATE POLICY "Users can delete own messages"
ON public.direct_messages
FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;