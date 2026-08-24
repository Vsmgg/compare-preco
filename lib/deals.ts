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
  category: string;
  /** ISO timestamp of when this discount was last confirmed against the source. Null for a deal not yet persisted. */
  verifiedAt: string | null;
}

export interface FeaturedDealsResult {
  deals: FeaturedDeal[];
  intro: string;
}

export interface DealQuery {
  query: string;
  category: string;
}

// Categories a shopper actually thinks in terms of. Scoping each query to a
// known, trusted retailer's domain (the same site:-operator technique the
// main search pipeline uses) makes it far more likely results come from a
// real store with genuine listed prices, instead of hoping an open web
// search happens to surface one.
const DEAL_QUERY_GROUPS: { category: string; queries: string[] }[] = [
  {
    category: "Eletrônicos",
    queries: [
      "smart tv oferta site:amazon.com.br",
      "smart tv oferta site:magazineluiza.com.br",
      "smart tv oferta site:casasbahia.com.br",
      "smart tv site:kabum.com.br liquidação",
      "iphone oferta site:amazon.com.br",
      "iphone oferta site:magazineluiza.com.br",
      "smartphone oferta site:amazon.com.br",
      "smartphone oferta site:mercadolivre.com.br",
      "smartphone site:kabum.com.br oferta",
      "smartwatch oferta site:amazon.com.br",
      "câmera oferta site:amazon.com.br",
      "fone de ouvido oferta site:amazon.com.br",
      "fone de ouvido oferta site:kabum.com.br",
      "tablet oferta site:amazon.com.br",
      "tablet oferta site:magazineluiza.com.br",
    ],
  },
  {
    category: "Informática",
    queries: [
      "notebook oferta site:kabum.com.br",
      "notebook oferta site:amazon.com.br",
      "notebook gamer oferta site:pichau.com.br",
      "notebook site:amazon.com.br liquidação",
      "notebook site:pichau.com.br oferta",
      "placa de video oferta site:kabum.com.br",
      "placa de video oferta site:terabyteshop.com.br",
      "placa de vídeo site:pichau.com.br oferta",
      "processador oferta site:pichau.com.br",
      "processador site:kabum.com.br oferta",
      "monitor gamer oferta site:kabum.com.br",
      "monitor site:terabyteshop.com.br oferta",
      "memória ram site:kabum.com.br oferta",
      "ssd site:kabum.com.br oferta",
      "fonte gamer site:pichau.com.br oferta",
      "gabinete gamer site:pichau.com.br oferta",
    ],
  },
  {
    category: "Games",
    queries: [
      "playstation 5 oferta site:amazon.com.br",
      "playstation 5 oferta site:magazineluiza.com.br",
      "xbox oferta site:amazon.com.br",
      "console xbox series site:kabum.com.br oferta",
      "cadeira gamer site:kabum.com.br oferta",
      "headset gamer site:kabum.com.br oferta",
      "teclado mecânico site:kabum.com.br oferta",
      "mouse gamer site:kabum.com.br oferta",
    ],
  },
  {
    category: "Moda",
    queries: [
      "tênis oferta site:netshoes.com.br",
      "tênis oferta site:centauro.com.br",
      "roupa oferta site:netshoes.com.br",
      "mochila oferta site:americanas.com.br",
    ],
  },
  {
    category: "Beleza",
    queries: ["perfume importado oferta site:amazon.com.br", "perfume importado oferta site:magazineluiza.com.br"],
  },
  {
    category: "Casa e Eletrodomésticos",
    queries: [
      "geladeira oferta site:magazineluiza.com.br",
      "geladeira oferta site:casasbahia.com.br",
      "máquina de lavar oferta site:magazineluiza.com.br",
      "máquina de lavar oferta site:casasbahia.com.br",
      "ar condicionado oferta site:magazineluiza.com.br",
      "micro-ondas oferta site:casasbahia.com.br",
      "aspirador de pó oferta site:amazon.com.br",
      "air fryer oferta site:amazon.com.br",
    ],
  },
  {
    category: "Brinquedos",
    queries: ["brinquedo oferta site:amazon.com.br", "brinquedo oferta site:mercadolivre.com.br"],
  },
  {
    category: "Esportes e Mobilidade",
    queries: ["bicicleta oferta site:mercadolivre.com.br"],
  },
];

export const DEFAULT_DEAL_QUERIES: DealQuery[] = DEAL_QUERY_GROUPS.flatMap(({ category, queries }) =>
  queries.map((query) => ({ query, category })),
);

// Display order for category sections — matches how the queries above are
// grouped, so the page doesn't have to guess a sensible order.
export const DEAL_CATEGORY_ORDER: string[] = DEAL_QUERY_GROUPS.map((g) => g.category);

const DEFAULT_RESULTS_PER_QUERY = 15;
const DEFAULT_MAX_CANDIDATES = 150;
const DEFAULT_MAX_DEALS_PER_CATEGORY = 8;
const DISCOUNT_CHECK_BATCH_SIZE = 25;

export interface DiscoverDealsOptions {
  queries?: DealQuery[];
  resultsPerQuery?: number;
  maxCandidates?: number;
  maxDealsPerCategory?: number;
  onProgress?: (message: string) => void;
}

interface Candidate {
  offer: RawOffer & { price: number };
  text: string;
  category: string;
}

export async function getFeaturedDeals(options: DiscoverDealsOptions = {}): Promise<FeaturedDealsResult> {
  const queries = options.queries ?? DEFAULT_DEAL_QUERIES;
  const resultsPerQuery = options.resultsPerQuery ?? DEFAULT_RESULTS_PER_QUERY;
  const maxCandidates = options.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const maxDealsPerCategory = options.maxDealsPerCategory ?? DEFAULT_MAX_DEALS_PER_CATEGORY;
  const log = options.onProgress ?? (() => {});

  const rawResults: { result: BraveWebResult; category: string }[] = [];
  for (const [i, { query, category }] of queries.entries()) {
    const results = await braveWebSearch(query, resultsPerQuery);
    for (const result of results) rawResults.push({ result, category });
    log(`[${i + 1}/${queries.length}] "${query}" (${category}) → ${results.length} resultados`);
  }

  const seenUrls = new Set<string>();
  const candidates: Candidate[] = [];
  for (const { result, category } of rawResults) {
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
    candidates.push({ offer: { ...offer, price: offer.price }, text, category });
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

  const verified = topCandidates
    .map((candidate, id) => {
      const verdict = byId.get(id);
      const originalPrice = verdict?.hasDiscount ? (verdict.originalPrice ?? candidate.offer.originalPrice) : null;
      if (originalPrice == null || originalPrice <= candidate.offer.price) return null;
      const deal: FeaturedDeal = {
        ...candidate.offer,
        id: crypto.randomUUID(),
        originalPrice,
        discountPercent: Math.round((1 - candidate.offer.price / originalPrice) * 100),
        category: candidate.category,
        verifiedAt: new Date().toISOString(),
      };
      return deal;
    })
    .filter((d): d is FeaturedDeal => d !== null);

  // Cap per category so one category with lots of hits (e.g. Informática)
  // doesn't crowd out everything else — this is meant to read as a
  // catalogue of sections, not one long list.
  const byCategory = new Map<string, FeaturedDeal[]>();
  for (const deal of verified) {
    const list = byCategory.get(deal.category) ?? [];
    list.push(deal);
    byCategory.set(deal.category, list);
  }

  const deals: FeaturedDeal[] = [...byCategory.values()].flatMap((list) =>
    list.sort((a, b) => b.discountPercent - a.discountPercent).slice(0, maxDealsPerCategory),
  );

  log(`${deals.length} descontos confirmados em ${byCategory.size} categorias`);

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
