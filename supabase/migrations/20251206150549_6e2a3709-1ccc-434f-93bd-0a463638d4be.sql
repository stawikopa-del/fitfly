-- Add latitude and longitude columns to day_plans table
ALTER TABLE public.day_plans 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;