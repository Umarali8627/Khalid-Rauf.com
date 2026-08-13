import type { APIRoute } from 'astro';
import { wcProxy } from '../../../lib/wc-proxy';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const body = await request.json();

  const { status, data, setCookieHeaders } = await wcProxy('/cart/select-shipping-rate', {
    method: 'POST',
    cookieHeader,
    body: { package_id: body.packageId ?? 0, rate_id: body.rateId },
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setCookieHeaders.forEach((c) => headers.append('Set-Cookie', c));

  return new Response(JSON.stringify(data), { status, headers });
};