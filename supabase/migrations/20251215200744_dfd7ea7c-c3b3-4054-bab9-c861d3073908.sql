-- Create gratitude_entries table for daily gratitude journaling
CREATE TABLE public.gratitude_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_1 TEXT,
  entry_2 TEXT,
  entry_3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Enable RLS
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own gratitude entries"
ON public.gratitude_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude entries"
ON public.gratitude_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gratitude entries"
ON public.gratitude_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gratitude entries"
ON public.gratitude_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_gratitude_entries_updated_at
BEFORE UPDATE ON public.gratitude_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();