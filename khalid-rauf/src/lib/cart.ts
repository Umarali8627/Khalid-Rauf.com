const WP_SITE_URL = import.meta.env.PUBLIC_WP_SITE_URL || 'https://khalidrauf.com';
const STORE_API = `${WP_SITE_URL}/wp-json/wc/store/v1`;

interface AddToCartResult {
  success: boolean;
  message?: string;
}

async function getCartNonce(): Promise<string | null> {
  try {
    const res = await fetch(`${STORE_API}/cart`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    console.log('[cart] GET /cart status:', res.status);
    console.log('[cart] Response headers:', [...res.headers.entries()]);

    if (!res.ok) {
      console.error('[cart] Cart fetch failed with status', res.status);
      return null;
    }

    const nonce = res.headers.get('Nonce');

    if (!nonce) {
      console.error(
        '[cart] Request succeeded but no Nonce header found. ' +
        'This usually means Access-Control-Expose-Headers is missing on the WordPress server.'
      );
    }

    return nonce;
  } catch (err) {
    // This branch fires specifically for CORS blocks / network failures —
    // the browser throws a generic "Failed to fetch" with no useful detail
    // by design (security), so we log what we can.
    console.error('[cart] Failed to fetch nonce (likely CORS or network issue):', err);
    return null;
  }
}

export async function addToCart(productId: number, quantity = 1): Promise<AddToCartResult> {
  const nonce = await getCartNonce();

  if (!nonce) {
    return {
      success: false,
      message: 'Could not connect to the store. Please try again.',
    };
  }

  try {
    const res = await fetch(`${STORE_API}/cart/add-item`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Nonce: nonce,
      },
      body: JSON.stringify({ id: productId, quantity }),
    });

    console.log('[cart] POST /cart/add-item status:', res.status);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error('[cart] add-item error body:', errorBody);
      return {
        success: false,
        message: errorBody?.message || 'This item could not be added to your cart.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[cart] addToCart failed:', err);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export function goToCheckout(): void {
  window.location.href = `${WP_SITE_URL}/checkout/`;
}

export function goToCart(): void {
  window.location.href = `${WP_SITE_URL}/cart/`;
}