-- Create table for saved diet plans
CREATE TABLE public.saved_diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mój plan diety',
  diet_type TEXT NOT NULL,
  daily_calories INTEGER NOT NULL,
  plan_data JSONB NOT NULL,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own plans
CREATE POLICY "Users can view own diet plans"
  ON public.saved_diet_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans"
  ON public.saved_diet_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans"
  ON public.saved_diet_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans"
  ON public.saved_diet_plans
  FOR DELETE
  USING (auth.uid() = user_id);