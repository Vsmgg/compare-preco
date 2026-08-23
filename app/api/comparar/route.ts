import { sql } from "@/lib/db";
import { trustLabel } from "@/lib/scoring";
import { compareOffers } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ offers: [], analysis: null });

  const ids = idsParam.split(",").filter(Boolean).slice(0, 6);
  if (ids.length < 2) return NextResponse.json({ offers: [], analysis: null });

  const rows = await sql`
    SELECT o.*, sr.score
    FROM offers o
    LEFT JOIN search_results sr ON sr.offer_id = o.id
    WHERE o.id = ANY(${ids})
  `;

  const offers = rows.map((r) => {
    const rating = r.rating != null ? parseFloat(r.rating) : null;
    return {
      id: r.id as string,
      title: r.title as string,
      store: r.store as string,
      price: r.price != null ? parseFloat(r.price) : null,
      originalPrice: r.original_price != null ? parseFloat(r.original_price) : null,
      imageUrl: r.image_url as string | null,
      productUrl: r.product_url as string,
      rating,
      reviewCount: r.review_count as number | null,
      shippingDate: r.shipping_date as string | null,
      shippingPrice: r.shipping_price != null ? parseFloat(r.shipping_price) : null,
      condition: r.condition as string | null,
      score: r.score != null ? parseFloat(r.score) : null,
      trustLabel: trustLabel({ store: r.store, reviewCount: r.review_count, rating }),
    };
  });

  let analysis = null;
  try {
    analysis = await compareOffers(
      offers.map((o) => ({
        id: o.id,
        title: o.title,
        store: o.store,
        price: o.price,
        rating: o.rating,
        reviewCount: o.reviewCount,
        shippingDate: o.shippingDate,
        score: o.score,
      })),
    );
  } catch (err) {
    console.error("Falha ao gerar análise comparativa", err);
  }

  return NextResponse.json({ offers, analysis });
}
