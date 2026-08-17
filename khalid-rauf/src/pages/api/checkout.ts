import type { APIRoute } from 'astro';
import { wcProxy } from '../../lib/wc-proxy';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const body = await request.json();

    const allowedMethods = ['paypal', 'cod'];
    const paymentMethod = allowedMethods.includes(body.paymentMethod) ? body.paymentMethod : 'cod';

    const checkoutPayload = {
      billing_address: body.billingAddress,
      shipping_address: body.shippingAddress,
      payment_method: paymentMethod,
      customer_note: body.note ?? '',
    };

    console.log('[api/checkout] Sending to WooCommerce:', JSON.stringify(checkoutPayload, null, 2));

    const { status, data, setCookieHeaders } = await wcProxy('/checkout', {
      method: 'POST',
      cookieHeader,
      body: checkoutPayload,
    });

    if (status >= 400) {
      // Log WooCommerce's detailed validation error so we can see exactly
      // which field/rule failed, instead of just the generic summary message.
      console.error('[api/checkout] WooCommerce rejected checkout:', JSON.stringify(data, null, 2));
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    setCookieHeaders.forEach((c) => headers.append('Set-Cookie', c));

    return new Response(JSON.stringify(data), { status, headers });
  } catch (err) {
    console.error('[api/checkout] Unhandled error:', err);
    return new Response(
      JSON.stringify({ message: 'Server error during checkout. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};