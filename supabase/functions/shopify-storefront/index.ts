import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_URL = Deno.env.get('SHOPIFY_STORE_URL') || '';
const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN') || '';

interface CartItem {
  variantId: string;
  quantity: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, items } = await req.json();
    console.log(`Shopify Storefront API - Action: ${action}`);

    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      console.error('Missing Shopify configuration');
      throw new Error('Shopify configuration is missing');
    }

    const storefrontUrl = `https://${SHOPIFY_STORE_URL}/api/2024-01/graphql.json`;

    // Fetch products
    if (action === 'getProducts') {
      console.log('Fetching products from Shopify...');
      
      const query = `
        query {
          products(first: 20) {
            edges {
              node {
                id
                title
                description
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(storefrontUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      console.log('Products fetched successfully');

      if (data.errors) {
        console.error('Shopify API errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Shopify API error');
      }

      const products = data.data?.products?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        handle: edge.node.handle,
        image: edge.node.images?.edges[0]?.node?.url || null,
        imageAlt: edge.node.images?.edges[0]?.node?.altText || edge.node.title,
        price: edge.node.priceRange?.minVariantPrice?.amount,
        currency: edge.node.priceRange?.minVariantPrice?.currencyCode,
        variants: edge.node.variants?.edges?.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price?.amount,
          currency: v.node.price?.currencyCode,
          availableForSale: v.node.availableForSale,
        })) || [],
      })) || [];

      return new Response(JSON.stringify({ products }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create checkout
    if (action === 'createCheckout') {
      console.log('Creating checkout with items:', items);

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided for checkout');
      }

      const lineItems = items.map((item: CartItem) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const mutation = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
              totalPrice {
                amount
                currencyCode
              }
            }
            checkoutUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      const response = await fetch(storefrontUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: { lineItems },
          },
        }),
      });

      const data = await response.json();
      console.log('Checkout response:', JSON.stringify(data, null, 2));

      if (data.errors) {
        console.error('Shopify API errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Shopify API error');
      }

      const checkoutErrors = data.data?.checkoutCreate?.checkoutUserErrors;
      if (checkoutErrors && checkoutErrors.length > 0) {
        console.error('Checkout errors:', checkoutErrors);
        throw new Error(checkoutErrors[0]?.message || 'Checkout creation failed');
      }

      const checkout = data.data?.checkoutCreate?.checkout;
      if (!checkout) {
        throw new Error('Failed to create checkout');
      }

      console.log('Checkout created successfully:', checkout.webUrl);

      return new Response(JSON.stringify({
        checkoutId: checkout.id,
        checkoutUrl: checkout.webUrl,
        totalPrice: checkout.totalPrice?.amount,
        currency: checkout.totalPrice?.currencyCode,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('Error in shopify-storefront function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
