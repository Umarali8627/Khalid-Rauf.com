export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
  featuredImage: string;
  featuredImageAlt: string;
  categories: string[];
  author: string;
}

/**
 * Safely decodes a WP slug that may be percent-encoded (common for
 * non-Latin titles like Urdu/Arabic). Falls back to the raw value if
 * decoding fails or it's already plain text, to avoid throwing on
 * malformed encoding.
 */
function normalizeSlug(rawSlug: string): string {
  if (!rawSlug) return '';
  try {
    // Only decode if it actually looks percent-encoded (contains %XX sequences)
    if (/%[0-9A-Fa-f]{2}/.test(rawSlug)) {
      return decodeURIComponent(rawSlug);
    }
    return rawSlug;
  } catch {
    // decodeURIComponent throws on malformed sequences — fall back to raw
    return rawSlug;
  }
}

export function mapPost(raw: any): Post {
  const media = raw._embedded?.['wp:featuredmedia']?.[0];
  const terms = raw._embedded?.['wp:term']?.[0] ?? [];
  const authorData = raw._embedded?.author?.[0];

  return {
    id: raw.id,
    slug: normalizeSlug(raw.slug),
    title: raw.title?.rendered ?? '',
    excerpt: raw.excerpt?.rendered ?? '',
    content: raw.content?.rendered ?? '',
    date: raw.date,
    link: raw.link,
    featuredImage: media?.source_url ?? '/placeholder-article.jpg',
    featuredImageAlt: media?.alt_text ?? '',
    categories: terms.map((t: any) => t.name),
    author: authorData?.name ?? '',
  };
}