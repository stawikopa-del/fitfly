-- First create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create day_plans table for storing user plans
CREATE TABLE public.day_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'inne',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  time_of_day TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.day_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own plans" 
ON public.day_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" 
ON public.day_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" 
ON public.day_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" 
ON public.day_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_day_plans_updated_at
BEFORE UPDATE ON public.day_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();