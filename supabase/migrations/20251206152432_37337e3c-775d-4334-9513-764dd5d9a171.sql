-- Add recurrence column to day_plans table
ALTER TABLE public.day_plans 
ADD COLUMN recurrence text DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.day_plans.recurrence IS 'Recurrence pattern: daily, weekly, monthly, or null for no recurrence';