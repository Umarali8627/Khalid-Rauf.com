export interface WPImage {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
  name: string;
}

export interface BookCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface Book {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  description: string;
  shortDescription: string;
  price: string;            // formatted, e.g. "13.87"
  regularPrice: string;
  currencySymbol: string;   // e.g. "$"
  priceHtml: string;        // WooCommerce's pre-rendered price markup (safe fallback)
  onSale: boolean;
  isPurchasable: boolean;
  isInStock: boolean;
  averageRating: number;    // parsed float, e.g. 5 or 0
  reviewCount: number;
  categories: BookCategory[];
  images: WPImage[];
  featuredImage: string;
  addToCartText: string;    // "Add to cart" or "Read more" depending on purchasability
  addToCartUrl: string;
}

/** Maps a raw WooCommerce Store API product (wc/store/v1/products) to a typed Book */
export function mapBook(raw: any): Book {
  const minorUnit = Number(raw.prices?.currency_minor_unit ?? 2);
  const divisor = 10 ** minorUnit;

  const formatPrice = (val: string | undefined): string => {
    if (val === undefined || val === null) return '0.00';
    const num = Number(val) / divisor;
    return num.toFixed(minorUnit);
  };

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name ?? '',
    permalink: raw.permalink ?? '',
    description: raw.description ?? '',
    shortDescription: raw.short_description ?? '',
    price: formatPrice(raw.prices?.price),
    regularPrice: formatPrice(raw.prices?.regular_price),
    currencySymbol: raw.prices?.currency_symbol ?? '$',
    priceHtml: raw.price_html ?? '',
    onSale: Boolean(raw.on_sale),
    isPurchasable: Boolean(raw.is_purchasable),
    isInStock: Boolean(raw.is_in_stock),
    averageRating: parseFloat(raw.average_rating ?? '0') || 0,
    reviewCount: Number(raw.review_count ?? 0),
    categories: (raw.categories ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      link: c.link,
    })),
    images: (raw.images ?? []).map((img: any) => ({
      id: img.id,
      src: img.src,
      thumbnail: img.thumbnail ?? img.src,
      alt: img.alt || img.name || raw.name,
      name: img.name ?? '',
    })),
    featuredImage: raw.images?.[0]?.src ?? '/placeholder-book.jpg',
    addToCartText: raw.add_to_cart?.text ?? 'View Book',
    addToCartUrl: raw.add_to_cart?.url ?? raw.permalink,
  };
}