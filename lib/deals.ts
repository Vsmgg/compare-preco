import { braveWebSearch, type BraveWebResult } from "./brave";
import { summarizeDeals } from "./gemini";
import { dedupe, normalizeOffer } from "./pipeline";
import type { RawOffer } from "./types";

export interface FeaturedDeal extends RawOffer {
  id: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
}

export interface FeaturedDealsResult {
  deals: FeaturedDeal[];
  intro: string;
}

// A spread of high-ticket categories that regularly carry real discounts and
// tend to sell well above the R$ 2.000 floor this page is meant to show.
const DEAL_QUERIES = [
  "smart tv 65 polegadas desconto oferta",
  "iphone desconto oferta",
  "notebook gamer desconto oferta",
  "geladeira frost free desconto oferta",
  "smartwatch desconto oferta",
  "console playstation 5 desconto oferta",
  "câmera mirrorless desconto oferta",
];

const MIN_PRICE = 2000;
const MAX_DEALS = 15;

export async function getFeaturedDeals(): Promise<FeaturedDealsResult> {
  const rawResults: BraveWebResult[] = [];
  for (const query of DEAL_QUERIES) {
    const results = await braveWebSearch(query, 8);
    rawResults.push(...results);
  }

  const normalized = rawResults.map(normalizeOffer).filter((o): o is RawOffer => o !== null);
  const unique = dedupe(normalized);

  const withDiscount = unique.filter(
    (o): o is RawOffer & { price: number; originalPrice: number } =>
      o.price != null && o.price >= MIN_PRICE && o.originalPrice != null && o.originalPrice > o.price,
  );

  const deals: FeaturedDeal[] = withDiscount
    .map((offer) => ({
      ...offer,
      id: crypto.randomUUID(),
      discountPercent: Math.round((1 - offer.price / offer.originalPrice) * 100),
    }))
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, MAX_DEALS);

  let intro = "";
  try {
    intro = await summarizeDeals(
      deals.map((d) => ({
        title: d.title,
        store: d.store,
        price: d.price,
        originalPrice: d.originalPrice,
        discountPercent: d.discountPercent,
      })),
    );
  } catch (err) {
    console.error("Falha ao gerar resumo de destaques", err);
  }

  return { deals, intro };
}
