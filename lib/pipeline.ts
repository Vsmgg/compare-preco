import { sql } from "./db";
import { braveWebSearch, braveImageSearch, type BraveWebResult } from "./brave";
import { explainRanking, interpretIntent, sitesForCategory } from "./gemini";
import {
  cleanTitle,
  detectCondition,
  detectFreeShipping,
  extractDomain,
  isLikelyStorefront,
  parsePriceBR,
  parseRating,
  parseReviewCount,
  parseShippingDate,
  storeNameFromDomain,
} from "./parse";
import { scoreOffer } from "./scoring";
import type { RawOffer, ScoredOffer, SearchEvent } from "./types";

function normalizeOffer(result: BraveWebResult): RawOffer | null {
  const domain = extractDomain(result.url);
  if (!domain) return null;
  if (!isLikelyStorefront(result.url, domain)) return null;
  const store = storeNameFromDomain(domain);

  if (result.subtype === "product" && result.product) {
    const p = result.product;
    const price = p.price ? parseFloat(p.price) : null;
    const productUrl = p.offers?.[0]?.url || result.url;
    const textBlob = [p.description, ...(result.extra_snippets ?? [])].join(" ");
    return {
      title: cleanTitle(p.name || result.title),
      price,
      originalPrice: null,
      currency: p.offers?.[0]?.priceCurrency || "BRL",
      imageUrl: p.thumbnail?.original || result.thumbnail?.original || null,
      productUrl,
      store,
      domain,
      rating: p.rating?.ratingValue ?? null,
      reviewCount: p.rating?.reviewCount ?? null,
      shippingPrice: detectFreeShipping(textBlob) ? 0 : null,
      shippingDate: parseShippingDate(textBlob),
      availability: true,
      condition: detectCondition(p.name || result.title),
      seller: store,
      source: "brave_search",
      priceConfident: true,
    };
  }

  const textBlob = [result.description, ...(result.extra_snippets ?? [])].join(" ");
  return {
    title: cleanTitle(result.title),
    price: parsePriceBR(textBlob),
    originalPrice: null,
    currency: "BRL",
    imageUrl: result.thumbnail?.original || null,
    productUrl: result.url,
    store,
    domain,
    rating: parseRating(textBlob),
    reviewCount: parseReviewCount(textBlob),
    shippingPrice: detectFreeShipping(textBlob) ? 0 : null,
    shippingDate: parseShippingDate(textBlob),
    availability: null,
    condition: detectCondition(result.title),
    seller: store,
    source: "brave_search",
    priceConfident: false,
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function sanitizeOutlierPrices(offers: RawOffer[]): void {
  const confidentPrices = offers.filter((o) => o.priceConfident && o.price != null).map((o) => o.price!);
  const reference = median(confidentPrices) ?? median(offers.filter((o) => o.price != null).map((o) => o.price!));
  if (reference == null) return;

  for (const offer of offers) {
    if (!offer.priceConfident && offer.price != null && offer.price < reference * 0.2) {
      offer.price = null;
    }
  }
}

// Guards against blatant category mismatches Brave sometimes returns (e.g. a
// desktop PC showing up for a "notebook" search just because both mention a GPU).
const FORM_FACTOR_GROUPS: { trigger: RegExp; mustNotHave: RegExp; unlessAlsoHas: RegExp }[] = [
  { trigger: /notebook|laptop/i, mustNotHave: /\b(desktop|pc\s*gamer|computador\s*gamer|gabinete)\b/i, unlessAlsoHas: /notebook|laptop/i },
  { trigger: /\b(geladeira|refrigerador)\b/i, mustNotHave: /\b(freezer|frigobar)\b/i, unlessAlsoHas: /\b(geladeira|refrigerador)\b/i },
];

function matchesRequestedFormFactor(query: string, title: string): boolean {
  for (const rule of FORM_FACTOR_GROUPS) {
    if (rule.trigger.test(query) && rule.mustNotHave.test(title) && !rule.unlessAlsoHas.test(title)) {
      return false;
    }
  }
  return true;
}

function dedupe(offers: RawOffer[]): RawOffer[] {
  const seen = new Map<string, RawOffer>();
  for (const offer of offers) {
    const urlKey = offer.productUrl.split("?")[0].replace(/\/$/, "");
    const titleKey = `${offer.domain}::${offer.title.toLowerCase().slice(0, 50)}`;
    const key = seen.has(urlKey) ? urlKey : titleKey;
    const existing = seen.get(urlKey) ?? seen.get(titleKey);
    if (!existing) {
      seen.set(urlKey, offer);
      seen.set(titleKey, offer);
    } else if (offer.price != null && existing.price == null) {
      seen.set(urlKey, offer);
      seen.set(titleKey, offer);
    }
  }
  const unique = new Map<string, RawOffer>();
  for (const offer of seen.values()) {
    unique.set(offer.productUrl, offer);
  }
  return Array.from(unique.values()).filter((o) => o.title.length > 3);
}

async function fillMissingImages(offers: RawOffer[], query: string) {
  const missing = offers.filter((o) => !o.imageUrl);
  if (missing.length === 0) return;
  try {
    const images = await braveImageSearch(query, 8);
    for (const offer of missing) {
      const match = images.find((img) => {
        try {
          return new URL(img.url).hostname.replace(/^www\./, "") === offer.domain;
        } catch {
          return false;
        }
      });
      if (match) {
        offer.imageUrl = match.properties?.url || match.thumbnail?.src || null;
      }
    }
  } catch (err) {
    console.error("Falha ao buscar imagens de fallback", err);
  }
}

function assignBadges(offers: ScoredOffer[]) {
  if (offers.length === 0) return;

  const cheapest = [...offers].filter((o) => o.price != null).sort((a, b) => a.price! - b.price!)[0];
  const bestRated = [...offers]
    .filter((o) => o.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0))[0];
  const fastest = [...offers].sort((a, b) => b.subScores.delivery - a.subScores.delivery)[0];
  const mostTrusted = [...offers].sort((a, b) => b.subScores.trust - a.subScores.trust)[0];

  if (cheapest) cheapest.badges.push("Melhor preço");
  if (bestRated && bestRated.rating != null) bestRated.badges.push("Melhor avaliação");
  if (fastest && fastest.subScores.delivery >= 90) fastest.badges.push("Entrega mais rápida");
  if (mostTrusted && mostTrusted.subScores.trust >= 90) mostTrusted.badges.push("Mais confiável");
}

export interface PipelineResult {
  searchId: string;
  productId: string;
  offers: ScoredOffer[];
  analysis: Awaited<ReturnType<typeof explainRanking>>;
}

export async function runSearch(query: string, onEvent: (e: SearchEvent) => void): Promise<PipelineResult> {
  const startedAt = Date.now();

  onEvent({ stage: "entendendo", message: "Entendendo sua busca" });
  const intent = await interpretIntent(query);

  onEvent({ stage: "pesquisando", message: `Pesquisando: ${intent.intentSummary}` });

  const primaryQuery = intent.queries[0] || query;
  const sites = sitesForCategory(intent.category).slice(0, 4);
  const searchQueries = [primaryQuery, ...sites.map((s) => `${primaryQuery} site:${s}`)];
  if (intent.queries[1]) searchQueries.push(intent.queries[1]);

  const rawResultBatches: BraveWebResult[][] = [];
  let sourcesUsed = 0;
  for (const q of searchQueries) {
    const results = await braveWebSearch(q, 8);
    rawResultBatches.push(results);
    sourcesUsed += 1;
    onEvent({
      stage: "coletando",
      message: `Pesquisando ${sourcesUsed} de ${searchQueries.length} fontes...`,
      sourcesCount: sourcesUsed,
    });
  }

  const allResults = rawResultBatches.flat();
  const normalized = allResults
    .map(normalizeOffer)
    .filter((o): o is RawOffer => o !== null)
    .filter((o) => matchesRequestedFormFactor(query, o.title));
  const uniqueOffers = dedupe(normalized);
  sanitizeOutlierPrices(uniqueOffers);

  onEvent({
    stage: "coletando",
    message: `${uniqueOffers.length} ofertas encontradas`,
    offersCount: uniqueOffers.length,
  });

  if (uniqueOffers.length === 0) {
    onEvent({ stage: "erro", message: "Não encontramos ofertas suficientes para essa busca.", error: "no_offers" });
    throw new Error("no_offers");
  }

  onEvent({ stage: "avaliacoes", message: "Verificando avaliações" });
  await fillMissingImages(uniqueOffers, primaryQuery);

  onEvent({ stage: "entrega", message: "Analisando prazos de entrega" });
  onEvent({ stage: "confiabilidade", message: "Comparando confiabilidade das lojas" });

  onEvent({ stage: "calculando", message: "Calculando a melhor opção" });
  const prices = uniqueOffers.map((o) => o.price).filter((p): p is number => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  const scored: ScoredOffer[] = uniqueOffers.map((offer) => {
    const { score, subScores, trustLabel } = scoreOffer(offer, { minPrice, weights: intent.weights });
    return {
      ...offer,
      id: crypto.randomUUID(),
      score,
      subScores,
      trustLabel,
      badges: [],
      rank: 0,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((o, i) => (o.rank = i + 1));
  assignBadges(scored);

  const analysis = await explainRanking(query, scored);

  const durationMs = Date.now() - startedAt;

  const [searchRow] = await sql`
    INSERT INTO searches (query, normalized_query, category, weights, status, sources_used, offers_found, search_duration_ms)
    VALUES (${query}, ${intent.intentSummary}, ${intent.category}, ${JSON.stringify(intent.weights)}, 'completed', ${sourcesUsed}, ${scored.length}, ${durationMs})
    RETURNING id
  `;
  const searchId = searchRow.id as string;

  const bestImage = scored.find((o) => o.imageUrl)?.imageUrl ?? null;
  const [productRow] = await sql`
    INSERT INTO products (name, brand, model, category, image_url)
    VALUES (${query}, ${intent.brand}, ${intent.model}, ${intent.category}, ${bestImage})
    RETURNING id
  `;
  const productId = productRow.id as string;

  for (const offer of scored) {
    const [offerRow] = await sql`
      INSERT INTO offers (
        product_id, store, title, price, original_price, currency, image_url, product_url,
        rating, review_count, shipping_price, shipping_date, availability, condition, seller, source
      ) VALUES (
        ${productId}, ${offer.store}, ${offer.title}, ${offer.price}, ${offer.originalPrice}, ${offer.currency},
        ${offer.imageUrl}, ${offer.productUrl}, ${offer.rating}, ${offer.reviewCount}, ${offer.shippingPrice},
        ${offer.shippingDate}, ${offer.availability}, ${offer.condition}, ${offer.seller}, ${offer.source}
      )
      RETURNING id
    `;
    const offerId = offerRow.id as string;
    offer.id = offerId;

    await sql`
      INSERT INTO search_results (search_id, offer_id, score, rank, badge, reason)
      VALUES (${searchId}, ${offerId}, ${offer.score}, ${offer.rank}, ${offer.badges[0] ?? null}, ${offer.rank === 1 ? analysis.bestOfferReasoning : null})
    `;

    if (offer.price != null) {
      await sql`
        INSERT INTO price_history (offer_id, price)
        VALUES (${offerId}, ${offer.price})
      `;
    }
  }

  onEvent({
    stage: "completo",
    message: "Encontramos a melhor opção para você",
    searchId,
    productId,
    offers: scored,
    analysis,
  });

  return { searchId, productId, offers: scored, analysis };
}
