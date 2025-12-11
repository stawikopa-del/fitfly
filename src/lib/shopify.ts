import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Shopify configuration (no secrets exposed)
export const SHOPIFY_API_VERSION = '2025-07';
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'fitfly-6ke6w.myshopify.com';

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

// Storefront API helper function - routes through Edge Function
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('shopify-storefront', {
      body: {
        action: 'graphql',
        query,
        variables,
      },
    });

    if (error) {
      console.error('Shopify Edge Function error:', error);
      
      if (error.message?.includes('402') || error.message?.includes('Payment')) {
        toast.error("Shopify: Wymagana płatność", {
          description: "API Shopify wymaga aktywnego planu. Odwiedź admin.shopify.com aby upgrade'ować."
        });
      }
      return null;
    }

    if (data?.error) {
      console.error('Shopify API error:', data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Shopify API request failed:', error);
    return null;
  }
}

// GraphQL query to fetch products
export const STOREFRONT_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
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
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

// Cart create mutation
export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Create checkout function
export async function createStorefrontCheckout(variantId: string, quantity: number = 1): Promise<string | null> {
  try {
    if (!variantId) return null;
    
    const lines = [{
      quantity,
      merchandiseId: variantId,
    }];

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: { lines },
    });

    if (!cartData) return null;

    // Safe access with optional chaining
    const userErrors = cartData?.data?.cartCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('Cart creation errors:', userErrors);
      return null;
    }

    const cart = cartData?.data?.cartCreate?.cart;
    
    if (!cart?.checkoutUrl) {
      console.error('No checkout URL returned from Shopify');
      return null;
    }

    try {
      const url = new URL(cart.checkoutUrl);
      url.searchParams.set('channel', 'online_store');
      return url.toString();
    } catch {
      return cart.checkoutUrl;
    }
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    return null;
  }
}

// Fetch subscription products
export async function fetchSubscriptionProducts(): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
      first: 10,
      query: 'product_type:Subscription'
    });

    if (!data) return [];

    return data.data?.products?.edges || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
