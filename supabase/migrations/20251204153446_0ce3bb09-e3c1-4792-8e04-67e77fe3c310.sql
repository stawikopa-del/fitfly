-- Create calendar_events table for storing user calendar events/reminders
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view own events"
ON public.calendar_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
ON public.calendar_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
ON public.calendar_events
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
ON public.calendar_events
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries by user and date
CREATE INDEX idx_calendar_events_user_date ON public.calendar_events(user_id, event_date);