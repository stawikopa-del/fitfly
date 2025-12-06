-- Create table for user measurements
CREATE TABLE public.user_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2) NULL,
  mood INTEGER NULL CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER NULL CHECK (energy >= 1 AND energy <= 5),
  stress INTEGER NULL CHECK (stress >= 1 AND stress <= 5),
  sleep_quality INTEGER NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_hours NUMERIC(3,1) NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, measurement_date)
);

-- Enable RLS
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own measurements"
  ON public.user_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON public.user_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON public.user_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON public.user_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_measurements_updated_at
  BEFORE UPDATE ON public.user_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();