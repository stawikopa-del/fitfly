-- Create storage bucket for chat media (images, voice messages)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own media
CREATE POLICY "Users can upload chat media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view chat media (messages are already protected by RLS)
CREATE POLICY "Chat media is publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete own chat media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);