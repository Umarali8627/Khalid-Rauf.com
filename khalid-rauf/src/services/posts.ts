import { wpFetch, wpFetchWithPagination } from '../lib/wordpress';
import { mapPost, type Post } from '../types/post';

const WP_BASE = '/wp/v2';

export async function getPosts(limit = 4): Promise<Post[]> {
  try {
    const raw = await wpFetch<any[]>(`${WP_BASE}/posts`, {
      params: { per_page: limit, _embed: true, status: 'publish' },
    });
    return raw.map(mapPost);
  } catch (err) {
    console.error('[services/posts] getPosts failed:', err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // Try exact match first
    let raw = await wpFetch<any[]>(`${WP_BASE}/posts`, {
      params: { slug, _embed: true },
    });

    // If not found, try the encoded form (WP sometimes stores non-Latin
    // slugs percent-encoded internally even though REST returns them decoded)
    if (raw.length === 0) {
      const encoded = encodeURIComponent(slug);
      if (encoded !== slug) {
        raw = await wpFetch<any[]>(`${WP_BASE}/posts`, {
          params: { slug: encoded, _embed: true },
        });
      }
    }

    return raw.length ? mapPost(raw[0]) : null;
  } catch (err) {
    console.error('[services/posts] getPostBySlug failed:', err);
    return null;
  }
}

/** Fetches posts by page number, returning both data and total page count for pagination UI */
export async function getPostsPaginated(
  page = 1,
  perPage = 9
): Promise<{ posts: Post[]; totalPages: number; total: number }> {
  try {
    const { data, totalPages, total } = await wpFetchWithPagination<any[]>(`${WP_BASE}/posts`, {
      params: { page, per_page: perPage, _embed: true, status: 'publish' },
    });
    return { posts: data.map(mapPost), totalPages, total };
  } catch (err) {
    console.error('[services/posts] getPostsPaginated failed:', err);
    return { posts: [], totalPages: 1, total: 0 };
  }
}

/** Fetches all posts (used for getStaticPaths in blog/[slug].astro) */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const raw = await wpFetch<any[]>(`${WP_BASE}/posts`, {
      params: { per_page: 100, _embed: true, status: 'publish' },
    });
    return raw.map(mapPost);
  } catch (err) {
    console.error('[services/posts] getAllPosts failed:', err);
    return [];
  }
}