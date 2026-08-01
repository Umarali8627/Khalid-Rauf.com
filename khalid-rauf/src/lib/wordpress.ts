// Base WordPress REST API configuration
export const WP_API_URL = import.meta.env.WP_API_URL || 'https://khalidrauf.com/wp-json';
export const WP_SITE_URL = import.meta.env.WP_SITE_URL || 'https://khalidrauf.com';

interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Generic fetch wrapper for WordPress REST API endpoints.
 * Handles query param building, error handling, and JSON parsing.
 */
export async function wpFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = new URL(`${WP_API_URL}${endpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`WordPress API error (${res.status}) at ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

/** Extracts total pages from WP's X-WP-TotalPages header, useful for pagination */
export async function wpFetchWithPagination<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T; totalPages: number; total: number }> {
  const url = new URL(`${WP_API_URL}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`WordPress API error (${res.status}) at ${endpoint}`);

  const data = (await res.json()) as T;
  const totalPages = Number(res.headers.get('X-WP-TotalPages')) || 1;
  const total = Number(res.headers.get('X-WP-Total')) || 0;

  return { data, totalPages, total };
}