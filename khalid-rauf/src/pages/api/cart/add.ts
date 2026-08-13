import type { APIRoute } from 'astro';
import { wcProxy } from '../../../lib/wc-proxy';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const body = await request.json();

  const { status, data, setCookieHeaders } = await wcProxy('/cart/add-item', {
    method: 'POST',
    cookieHeader,
    body: { id: body.id, quantity: body.quantity ?? 1 },
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setCookieHeaders.forEach((c) => headers.append('Set-Cookie', c));

  return new Response(JSON.stringify(data), { status, headers });
};