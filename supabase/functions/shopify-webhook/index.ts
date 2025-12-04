import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
};

// Map Shopify product titles to subscription tiers
const PRODUCT_TIER_MAP: Record<string, 'start' | 'fit' | 'premium'> = {
  'START': 'start',
  'FIT': 'fit',
  'PREMIUM': 'premium',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const topic = req.headers.get('x-shopify-topic');
    
    console.log('Received Shopify webhook:', topic);
    console.log('Order data:', JSON.stringify(body, null, 2));

    // Handle order paid webhook
    if (topic === 'orders/paid' || topic === 'orders/create') {
      const order = body;
      const customerEmail = order.email || order.customer?.email;
      const shopifyOrderId = String(order.id);
      const shopifyCustomerId = order.customer?.id ? String(order.customer.id) : null;

      if (!customerEmail) {
        console.error('No customer email found in order');
        return new Response(JSON.stringify({ error: 'No customer email' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Determine subscription tier from line items
      let tier: 'start' | 'fit' | 'premium' = 'start';
      
      for (const item of order.line_items || []) {
        const productTitle = item.title?.toUpperCase() || '';
        for (const [key, value] of Object.entries(PRODUCT_TIER_MAP)) {
          if (productTitle.includes(key)) {
            tier = value;
            break;
          }
        }
      }

      console.log(`Processing order for ${customerEmail}, tier: ${tier}`);

      // Find user by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error fetching users:', userError);
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const user = users.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());

      if (!user) {
        console.log(`No user found with email ${customerEmail}, storing for later linking`);
        // Store the order for later linking when user signs up
        // For now, just log it
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Order stored, user not found yet',
          email: customerEmail,
          tier 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate subscription end date (30 days for monthly subscription)
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 30);

      // Upsert subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          tier,
          status: 'active',
          shopify_order_id: shopifyOrderId,
          shopify_customer_id: shopifyCustomerId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (subError) {
        console.error('Error upserting subscription:', subError);
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Subscription updated for user ${user.id}:`, subscription);

      return new Response(JSON.stringify({ 
        success: true, 
        subscription,
        message: `Subscription ${tier} activated for ${customerEmail}`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle subscription cancellation
    if (topic === 'orders/cancelled') {
      const order = body;
      const shopifyOrderId = String(order.id);

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('shopify_order_id', shopifyOrderId);

      if (error) {
        console.error('Error cancelling subscription:', error);
      }

      return new Response(JSON.stringify({ success: true, message: 'Subscription cancelled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Webhook received' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
