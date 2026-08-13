import type { APIRoute } from 'astro';
import { wcProxy } from '../../lib/wc-proxy';


export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const body = await request.json();

  // Validate payment method — only allow the ones we actually support in the UI
  const allowedMethods = ['paypal', 'cod'];
  const paymentMethod = allowedMethods.includes(body.paymentMethod) ? body.paymentMethod : 'cod';

  const checkoutPayload = {
    billing_address: body.billingAddress,
    shipping_address: body.shippingAddress,
    payment_method: paymentMethod,
    customer_note: body.note ?? '',
  };

  const { status, data, setCookieHeaders } = await wcProxy('/checkout', {
    method: 'POST',
    cookieHeader,
    body: checkoutPayload,
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setCookieHeaders.forEach((c) => headers.append('Set-Cookie', c));

  return new Response(JSON.stringify(data), { status, headers });
};