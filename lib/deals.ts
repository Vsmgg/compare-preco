import { braveWebSearch, type BraveWebResult } from "./brave";
import { checkDiscounts, summarizeDeals } from "./gemini";
import { KNOWN_TRUSTED_STORES } from "./parse";
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

// Scoping each query to a known, trusted retailer's domain (the same
// site:-operator technique the main search pipeline uses) makes it far more
// likely results actually come from a real store with genuine listed prices,
// instead of hoping an open web search happens to surface one. Spans a mix
// of ticket sizes and categories since there's no minimum price — this is
// meant to surface real Brazilian promotions in general, not just
// high-end items.
export const DEFAULT_DEAL_QUERIES = [
  "smart tv oferta site:amazon.com.br",
  "smart tv oferta site:magazineluiza.com.br",
  "smart tv oferta site:casasbahia.com.br",
  "iphone oferta site:amazon.com.br",
  "iphone oferta site:magazineluiza.com.br",
  "smartphone oferta site:amazon.com.br",
  "smartphone oferta site:mercadolivre.com.br",
  "notebook oferta site:kabum.com.br",
  "notebook oferta site:amazon.com.br",
  "notebook gamer oferta site:pichau.com.br",
  "placa de video oferta site:kabum.com.br",
  "placa de video oferta site:terabyteshop.com.br",
  "processador oferta site:pichau.com.br",
  "monitor gamer oferta site:kabum.com.br",
  "tênis oferta site:netshoes.com.br",
  "tênis oferta site:centauro.com.br",
  "roupa oferta site:netshoes.com.br",
  "perfume importado oferta site:amazon.com.br",
  "perfume importado oferta site:magazineluiza.com.br",
  "fone de ouvido oferta site:amazon.com.br",
  "fone de ouvido oferta site:kabum.com.br",
  "smartwatch oferta site:amazon.com.br",
  "câmera oferta site:amazon.com.br",
  "playstation 5 oferta site:amazon.com.br",
  "playstation 5 oferta site:magazineluiza.com.br",
  "xbox oferta site:amazon.com.br",
  "geladeira oferta site:magazineluiza.com.br",
  "geladeira oferta site:casasbahia.com.br",
  "máquina de lavar oferta site:magazineluiza.com.br",
  "máquina de lavar oferta site:casasbahia.com.br",
  "ar condicionado oferta site:magazineluiza.com.br",
  "micro-ondas oferta site:casasbahia.com.br",
  "aspirador de pó oferta site:amazon.com.br",
  "air fryer oferta site:amazon.com.br",
  "brinquedo oferta site:amazon.com.br",
  "brinquedo oferta site:mercadolivre.com.br",
  "tablet oferta site:amazon.com.br",
  "tablet oferta site:magazineluiza.com.br",
  "bicicleta oferta site:mercadolivre.com.br",
  "mochila oferta site:americanas.com.br",
];

const DEFAULT_RESULTS_PER_QUERY = 15;
const DEFAULT_MAX_CANDIDATES = 150;
const DEFAULT_MAX_DEALS = 30;
const DISCOUNT_CHECK_BATCH_SIZE = 25;

export interface DiscoverDealsOptions {
  queries?: string[];
  resultsPerQuery?: number;
  maxCandidates?: number;
  maxDeals?: number;
  onProgress?: (message: string) => void;
}

interface Candidate {
  offer: RawOffer & { price: number };
  text: string;
}

export async function getFeaturedDeals(options: DiscoverDealsOptions = {}): Promise<FeaturedDealsResult> {
  const queries = options.queries ?? DEFAULT_DEAL_QUERIES;
  const resultsPerQuery = options.resultsPerQuery ?? DEFAULT_RESULTS_PER_QUERY;
  const maxCandidates = options.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const maxDeals = options.maxDeals ?? DEFAULT_MAX_DEALS;
  const log = options.onProgress ?? (() => {});

  const rawResults: BraveWebResult[] = [];
  for (const [i, query] of queries.entries()) {
    const results = await braveWebSearch(query, resultsPerQuery);
    rawResults.push(...results);
    log(`[${i + 1}/${queries.length}] "${query}" → ${results.length} resultados`);
  }

  const seenUrls = new Set<string>();
  const candidates: Candidate[] = [];
  for (const result of rawResults) {
    const offer = normalizeOffer(result);
    if (!offer || offer.price == null) continue;
    // A "was/now" price claim is only as trustworthy as the site publishing
    // it — unknown storefronts sometimes inflate the "original" price to
    // fake a bigger discount, so only well-known retailers are eligible here.
    if (!KNOWN_TRUSTED_STORES.has(offer.store)) continue;

    const urlKey = offer.productUrl.split("?")[0].replace(/\/$/, "");
    if (seenUrls.has(urlKey)) continue;
    seenUrls.add(urlKey);

    const text = [result.title, result.description, ...(result.extra_snippets ?? [])].join(" ");
    candidates.push({ offer: { ...offer, price: offer.price }, text });
  }

  const topCandidates = candidates.slice(0, maxCandidates);
  log(`${candidates.length} candidatos únicos de lojas confiáveis (analisando ${topCandidates.length})`);

  const byId = new Map<number, { hasDiscount: boolean; originalPrice: number | null }>();
  for (let i = 0; i < topCandidates.length; i += DISCOUNT_CHECK_BATCH_SIZE) {
    const batch = topCandidates.slice(i, i + DISCOUNT_CHECK_BATCH_SIZE);
    try {
      const results = await checkDiscounts(
        batch.map((c, j) => ({ id: i + j, title: c.offer.title, price: c.offer.price, text: c.text })),
      );
      for (const r of results) byId.set(r.id, r);
    } catch (err) {
      console.error("Falha ao verificar descontos com Gemini", err);
    }
    log(`Verificado lote de descontos ${i + 1}-${Math.min(i + DISCOUNT_CHECK_BATCH_SIZE, topCandidates.length)}`);
  }

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
    .slice(0, maxDeals);

  log(`${deals.length} descontos confirmados`);

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
