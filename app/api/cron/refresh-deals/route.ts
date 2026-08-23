import { DEFAULT_DEAL_QUERIES, getFeaturedDeals } from "@/lib/deals";
import { saveDealsIntro, saveFeaturedDeals } from "@/lib/dealsStore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Sized to comfortably finish well inside the 60s function limit even with
// throttled Brave calls and a Gemini verification pass.
const BATCH_SIZE = 6;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  // With no explicit offset (the daily Vercel Cron trigger), rotate through
  // the query list by day so repeated automatic runs eventually cover all
  // of it instead of only ever refreshing the first few queries.
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const defaultOffset = (dayIndex * BATCH_SIZE) % DEFAULT_DEAL_QUERIES.length;
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? String(defaultOffset), 10) || 0);
  const batch = DEFAULT_DEAL_QUERIES.slice(offset, offset + BATCH_SIZE);

  if (batch.length === 0) {
    return NextResponse.json({ done: true, message: "Todas as consultas já foram processadas neste ciclo." });
  }

  try {
    const { deals, intro } = await getFeaturedDeals({ queries: batch });
    if (deals.length > 0) await saveFeaturedDeals(deals);
    if (intro) await saveDealsIntro(intro);

    return NextResponse.json({
      done: offset + BATCH_SIZE >= DEFAULT_DEAL_QUERIES.length,
      nextOffset: offset + BATCH_SIZE,
      totalQueries: DEFAULT_DEAL_QUERIES.length,
      processedQueries: batch,
      dealsFound: deals.length,
      deals: deals.map((d) => ({ title: d.title, store: d.store, price: d.price, discountPercent: d.discountPercent })),
    });
  } catch (err) {
    console.error("Falha ao atualizar destaques", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
