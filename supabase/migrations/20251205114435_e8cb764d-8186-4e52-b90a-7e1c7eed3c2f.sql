-- Allow authenticated users to search other users (view basic profile info)
CREATE POLICY "Users can search other users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);