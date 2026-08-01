import { wpFetch } from '../lib/wordpress';
import { mapBook, type Book } from '../types/book';

const WC_STORE_BASE = '/wc/store/v1';

export async function getBooks(limit = 4): Promise<Book[]> {
  try {
    const raw = await wpFetch<any[]>(`${WC_STORE_BASE}/products`, {
      params: {
        per_page: limit,
        orderby: 'date',
        order: 'desc',
      },
    });
    return raw.map(mapBook);
  } catch (err) {
    console.error('[services/books] getBooks failed:', err);
    return [];
  }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  try {
    const raw = await wpFetch<any[]>(`${WC_STORE_BASE}/products`, {
      params: { slug },
    });
    return raw.length ? mapBook(raw[0]) : null;
  } catch (err) {
    console.error('[services/books] getBookBySlug failed:', err);
    return null;
  }
}

export async function getAllBooks(): Promise<Book[]> {
  try {
    const raw = await wpFetch<any[]>(`${WC_STORE_BASE}/products`, {
      params: { per_page: 100 },
    });
    return raw.map(mapBook);
  } catch (err) {
    console.error('[services/books] getAllBooks failed:', err);
    return [];
  }
}