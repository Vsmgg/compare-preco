import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const offerId = searchParams.get("offer");
  const searchId = searchParams.get("search");

  if (!offerId) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const rows = await sql`SELECT product_url FROM offers WHERE id = ${offerId}`;
  const offer = rows[0];

  if (!offer) {
    return NextResponse.redirect(new URL("/", origin));
  }

  await sql`INSERT INTO clicks (search_id, offer_id) VALUES (${searchId}, ${offerId})`;

  return NextResponse.redirect(offer.product_url as string, { status: 302 });
}
