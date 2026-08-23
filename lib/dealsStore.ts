import { sql } from "./db";
import type { FeaturedDeal } from "./deals";

export async function saveFeaturedDeals(deals: FeaturedDeal[]): Promise<void> {
  for (const deal of deals) {
    await sql`
      INSERT INTO featured_deals (
        title, store, price, original_price, discount_percent, currency,
        image_url, product_url, rating, review_count, availability, condition, seller
      ) VALUES (
        ${deal.title}, ${deal.store}, ${deal.price}, ${deal.originalPrice}, ${deal.discountPercent}, ${deal.currency},
        ${deal.imageUrl}, ${deal.productUrl}, ${deal.rating}, ${deal.reviewCount}, ${deal.availability}, ${deal.condition}, ${deal.seller}
      )
      ON CONFLICT (product_url) DO UPDATE SET
        title = EXCLUDED.title,
        store = EXCLUDED.store,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        discount_percent = EXCLUDED.discount_percent,
        image_url = EXCLUDED.image_url,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        availability = EXCLUDED.availability,
        condition = EXCLUDED.condition,
        verified_at = now()
    `;
  }
}

interface FeaturedDealRow {
  id: string;
  title: string;
  store: string;
  price: string;
  original_price: string;
  discount_percent: number;
  currency: string;
  image_url: string | null;
  product_url: string;
  rating: string | null;
  review_count: number | null;
  availability: boolean | null;
  condition: string | null;
  seller: string | null;
}

// Only surfaces deals verified within the last few days — commercial data
// this old is stale enough that we'd rather show nothing than something
// that might no longer be accurate.
const MAX_AGE_HOURS = 72;
const LIMIT = 24;

export async function saveDealsIntro(intro: string): Promise<void> {
  await sql`
    INSERT INTO deals_meta (id, intro, updated_at) VALUES ('latest', ${intro}, now())
    ON CONFLICT (id) DO UPDATE SET intro = EXCLUDED.intro, updated_at = now()
  `;
}

export async function loadDealsIntro(): Promise<string> {
  const rows = (await sql`SELECT intro FROM deals_meta WHERE id = 'latest'`) as { intro: string | null }[];
  return rows[0]?.intro ?? "";
}

export async function loadFeaturedDeals(): Promise<FeaturedDeal[]> {
  const rows = (await sql`
    SELECT * FROM featured_deals
    WHERE verified_at > now() - make_interval(hours => ${MAX_AGE_HOURS})
    ORDER BY discount_percent DESC
    LIMIT ${LIMIT}
  `) as FeaturedDealRow[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    store: r.store,
    domain: "",
    price: parseFloat(r.price),
    originalPrice: parseFloat(r.original_price),
    discountPercent: r.discount_percent,
    currency: r.currency,
    imageUrl: r.image_url,
    productUrl: r.product_url,
    rating: r.rating != null ? parseFloat(r.rating) : null,
    reviewCount: r.review_count,
    shippingPrice: null,
    shippingDate: null,
    availability: r.availability,
    condition: r.condition as FeaturedDeal["condition"],
    seller: r.seller,
    source: "brave_search",
    priceConfident: true,
  }));
}
