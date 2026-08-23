import { sql } from "@/lib/db";
import { trustLabel } from "@/lib/scoring";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ offers: [] });

  const ids = idsParam.split(",").filter(Boolean).slice(0, 6);
  if (ids.length === 0) return NextResponse.json({ offers: [] });

  const rows = await sql`
    SELECT o.*, sr.score, sr.rank
    FROM offers o
    LEFT JOIN search_results sr ON sr.offer_id = o.id
    WHERE o.id = ANY(${ids})
  `;

  const offers = rows.map((r) => {
    const rating = r.rating != null ? parseFloat(r.rating) : null;
    return {
      id: r.id,
      title: r.title,
      store: r.store,
      price: r.price != null ? parseFloat(r.price) : null,
      originalPrice: r.original_price != null ? parseFloat(r.original_price) : null,
      imageUrl: r.image_url,
      productUrl: r.product_url,
      rating,
      reviewCount: r.review_count,
      shippingDate: r.shipping_date,
      shippingPrice: r.shipping_price != null ? parseFloat(r.shipping_price) : null,
      condition: r.condition,
      score: r.score != null ? parseFloat(r.score) : null,
      trustLabel: trustLabel({ store: r.store, reviewCount: r.review_count, rating }),
    };
  });

  return NextResponse.json({ offers });
}
