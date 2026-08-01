// Matches WP REST /wp/v2/pages response
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
}

/** Maps raw WP page JSON (with ?_embed=true) to a typed Page */
export function mapPage(raw: any): Page {
  const media = raw._embedded?.['wp:featuredmedia']?.[0];

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title?.rendered ?? '',
    content: raw.content?.rendered ?? '',
    excerpt: raw.excerpt?.rendered ?? '',
    featuredImage: media?.source_url ?? '',
  };
}