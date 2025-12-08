-- Create table for conversation summaries
CREATE TABLE public.chat_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary_date DATE NOT NULL,
  summary TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  mood TEXT,
  key_points TEXT[],
  questions_asked TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, summary_date)
);

-- Enable RLS
ALTER TABLE public.chat_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own summaries"
ON public.chat_summaries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
ON public.chat_summaries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
ON public.chat_summaries
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_chat_summaries_updated_at
BEFORE UPDATE ON public.chat_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_chat_summaries_user_date ON public.chat_summaries(user_id, summary_date DESC);