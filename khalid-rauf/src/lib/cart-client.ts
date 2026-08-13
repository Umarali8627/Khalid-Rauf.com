// Client-side helper — calls our own same-origin API routes only.
// No CORS issues here since /api/* is served from the same domain as the page.

export interface CartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  images: { src: string }[];
  totals: { line_total: string; currency_minor_unit: number; currency_symbol: string };
}

export interface CartResponse {
  items: CartItem[];
  items_count: number;
  totals: {
    total_items: string;
    total_price: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  shipping_rates: Array<{
    package_id: number;
    shipping_rates: Array<{
      rate_id: string;
      name: string;
      price: string;
      selected: boolean;
    }>;
  }>;
  needs_shipping_address: boolean;
}

export async function getCart(): Promise<CartResponse | null> {
  try {
    const res = await fetch('/api/cart/get');
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('[cart-client] getCart failed:', err);
    return null;
  }
}

export async function addToCart(id: number, quantity = 1): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data?.message || 'Could not add item.' };
    return { success: true };
  } catch (err) {
    console.error('[cart-client] addToCart failed:', err);
    return { success: false, message: 'Network error.' };
  }
}

export async function updateCartItem(key: string, quantity: number): Promise<boolean> {
  try {
    const res = await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, quantity }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeCartItem(key: string): Promise<boolean> {
  try {
    const res = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function selectShippingRate(packageId: number, rateId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/cart/select-shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, rateId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export async function submitCheckout(
  billingAddress: Address,
  shippingAddress: Address,
  note = ''
): Promise<{ success: boolean; redirectUrl?: string; message?: string }> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingAddress, shippingAddress, note }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data?.message || 'Checkout failed. Please check your details.' };
    }

    // PayPal (and other redirect-based gateways) return a redirect_url here
    const redirectUrl = data?.payment_result?.redirect_url;

    return { success: true, redirectUrl };
  } catch (err) {
    console.error('[cart-client] submitCheckout failed:', err);
    return { success: false, message: 'Network error during checkout.' };
  }
}