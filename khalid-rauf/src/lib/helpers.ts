/** Strips HTML tags from WP rendered content (e.g. excerpts) */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Decodes HTML entities from WP titles/content — handles both named entities
 * (&amp;, &nbsp;) AND numeric character references (&#8211;, &#8217;, etc.)
 * generically, since WooCommerce/WP data is inconsistent about pre-decoding
 * these depending on the field and how it was saved.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  return text
    // Numeric decimal entities: &#8211; -> –
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    // Numeric hex entities: &#x2013; -> –
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Common named entities not covered by numeric patterns
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/** Formats WP date strings (2024-05-01T12:00:00) into readable form */
export function formatDate(dateString: string, locale = 'en-US'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Estimates reading time from rendered HTML content */
export function readingTime(html: string, wordsPerMinute = 200): number {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/** Truncates text to a max length, breaking on word boundary */
export function truncate(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}