-- Create meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no auth yet)
CREATE POLICY "Anyone can view meals" 
ON public.meals 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert meals" 
ON public.meals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete meals" 
ON public.meals 
FOR DELETE 
USING (true);