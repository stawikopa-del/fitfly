-- Fix get_user_subscription_tier to only allow users to check their own subscription
-- This prevents subscription tier enumeration attacks

CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id uuid)
RETURNS subscription_tier
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT tier FROM public.user_subscriptions 
     WHERE user_id = p_user_id 
     AND user_id = auth.uid()  -- Only allow checking own subscription
     AND status = 'active'
     AND (ends_at IS NULL OR ends_at > now())
     LIMIT 1),
    'start'::subscription_tier
  )
$function$;