import { wpFetch } from '../lib/wordpress';
import { mapPage, type Page } from '../types/page';

const WP_BASE = '/wp/v2';

/** Fetches a single WP page by slug (e.g. "about", "campaign") */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const raw = await wpFetch<any[]>(`${WP_BASE}/pages`, {
      params: { slug, _embed: true },
    });
    return raw.length ? mapPage(raw[0]) : null;
  } catch (err) {
    console.error('[services/pages] getPageBySlug failed:', err);
    return null;
  }
}