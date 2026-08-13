// Server-side only. Handles cookie relay between the browser and WooCommerce's
// Store API, plus nonce fetching — this is what eliminates the CORS problem,
// since this code runs on our own server and talks to WordPress server-to-server.

const WP_SITE_URL = import.meta.env.WP_SITE_URL || 'https://khalidrauf.com';
const STORE_API = `${WP_SITE_URL}/wp-json/wc/store/v1`;

interface ProxyResult<T = any> {
  status: number;
  data: T;
  setCookieHeaders: string[];
}

/**
 * Fetches a fresh Store API nonce, forwarding the visitor's existing cart
 * cookie (if any) so we're operating on their actual cart session.
 */
async function getNonce(cookieHeader: string): Promise<{ nonce: string | null; setCookie: string[] }> {
  const res = await fetch(`${STORE_API}/cart`, {
    headers: { Cookie: cookieHeader, Accept: 'application/json' },
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { nonce: res.headers.get('Nonce'), setCookie };
}

/**
 * Generic proxy for Store API requests. Call this from any /api/cart/* route.
 * Automatically fetches a nonce for write operations and relays cookies both ways.
 */
export async function wcProxy<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    cookieHeader: string;
  }
): Promise<ProxyResult<T>> {
  const { method = 'GET', body, cookieHeader } = options;

  let nonce: string | null = null;
  let cookiesFromNonceFetch: string[] = [];

  if (method === 'POST') {
    const nonceResult = await getNonce(cookieHeader);
    nonce = nonceResult.nonce;
    cookiesFromNonceFetch = nonceResult.setCookie;
  }

  const headers: Record<string, string> = {
    Cookie: cookieHeader,
    Accept: 'application/json',
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    if (nonce) headers['Nonce'] = nonce;
  }

  const res = await fetch(`${STORE_API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookieHeaders = [...cookiesFromNonceFetch, ...(res.headers.getSetCookie?.() ?? [])];
  const data = (await res.json().catch(() => null)) as T;

  return { status: res.status, data, setCookieHeaders };
}