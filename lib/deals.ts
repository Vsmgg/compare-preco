import { braveWebSearch, type BraveWebResult } from "./brave";
import { checkDiscounts, summarizeDeals } from "./gemini";
import { normalizeOffer } from "./pipeline";
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
  "tablet ipad desconto oferta",
  "monitor gamer desconto oferta",
  "fone de ouvido premium desconto oferta",
  "máquina de lavar desconto oferta",
  "ar condicionado desconto oferta",
];

const MIN_PRICE = 2000;
const MAX_CANDIDATES = 40;
const MAX_DEALS = 15;

interface Candidate {
  offer: RawOffer & { price: number };
  text: string;
}

export async function getFeaturedDeals(): Promise<FeaturedDealsResult> {
  const rawResults: BraveWebResult[] = [];
  for (const query of DEAL_QUERIES) {
    const results = await braveWebSearch(query, 12);
    rawResults.push(...results);
  }

  const seenUrls = new Set<string>();
  const candidates: Candidate[] = [];
  for (const result of rawResults) {
    const offer = normalizeOffer(result);
    if (!offer || offer.price == null || offer.price < MIN_PRICE) continue;

    const urlKey = offer.productUrl.split("?")[0].replace(/\/$/, "");
    if (seenUrls.has(urlKey)) continue;
    seenUrls.add(urlKey);

    // originalPrice already found by the regex-based parser is a free win —
    // still worth double-checking with Gemini so obviously-wrong percentage
    // guesses don't sneak in, but no need to spend a candidate slot twice.
    const text = [result.title, result.description, ...(result.extra_snippets ?? [])].join(" ");
    candidates.push({ offer: { ...offer, price: offer.price }, text });
  }

  const topCandidates = candidates.slice(0, MAX_CANDIDATES);

  let discountResults: Awaited<ReturnType<typeof checkDiscounts>> = [];
  try {
    discountResults = await checkDiscounts(
      topCandidates.map((c, id) => ({ id, title: c.offer.title, price: c.offer.price, text: c.text })),
    );
  } catch (err) {
    console.error("Falha ao verificar descontos com Gemini", err);
  }

  const byId = new Map(discountResults.map((r) => [r.id, r]));

  const deals: FeaturedDeal[] = topCandidates
    .map((candidate, id) => {
      const verdict = byId.get(id);
      const originalPrice = verdict?.hasDiscount ? (verdict.originalPrice ?? candidate.offer.originalPrice) : null;
      if (originalPrice == null || originalPrice <= candidate.offer.price) return null;
      return {
        ...candidate.offer,
        id: crypto.randomUUID(),
        originalPrice,
        discountPercent: Math.round((1 - candidate.offer.price / originalPrice) * 100),
      };
    })
    .filter((d): d is FeaturedDeal => d !== null)
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
