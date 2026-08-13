import type { APIRoute } from 'astro';
import { wcProxy } from '../../../lib/wc-proxy';

export const prerender = false; // this route must run on-demand, not at build time

export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') ?? '';

  const { status, data, setCookieHeaders } = await wcProxy('/cart', {
    method: 'GET',
    cookieHeader,
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  setCookieHeaders.forEach((c) => headers.append('Set-Cookie', c));

  return new Response(JSON.stringify(data), { status, headers });
};