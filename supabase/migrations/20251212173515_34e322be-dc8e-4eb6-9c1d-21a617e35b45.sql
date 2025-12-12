-- Add explicit policy to deny anonymous/unauthenticated access to profiles
-- This is a defense-in-depth measure to ensure personal health data is protected

CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);