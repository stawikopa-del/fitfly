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

// Verify Shopify HMAC signature
const verifyShopifyHmac = async (body: string, hmacHeader: string, secret: string): Promise<boolean> => {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computed = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return computed === hmacHeader;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body for HMAC verification
    const rawBody = await req.text();
    
    // Verify HMAC signature
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('SHOPIFY_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!hmacHeader) {
      console.error('Missing x-shopify-hmac-sha256 header');
      return new Response(JSON.stringify({ error: 'Missing HMAC signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const isValidHmac = await verifyShopifyHmac(rawBody, hmacHeader, webhookSecret);
    if (!isValidHmac) {
      console.error('Invalid HMAC signature');
      return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('HMAC signature verified successfully');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = JSON.parse(rawBody);
    const topic = req.headers.get('x-shopify-topic');
    
    console.log('Received Shopify webhook:', topic);

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
