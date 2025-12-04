-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('start', 'fit', 'premium');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'start',
  status subscription_status NOT NULL DEFAULT 'active',
  shopify_order_id TEXT,
  shopify_customer_id TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert/update (webhook)
CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id UUID)
RETURNS subscription_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.user_subscriptions 
     WHERE user_id = p_user_id 
     AND status = 'active'
     AND (ends_at IS NULL OR ends_at > now())
     LIMIT 1),
    'start'::subscription_tier
  )
$$;