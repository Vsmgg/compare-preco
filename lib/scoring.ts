import { KNOWN_TRUSTED_STORES } from "./parse";
import type { RawOffer, SearchIntent } from "./types";

export interface ScoreContext {
  minPrice: number | null;
  weights: SearchIntent["weights"];
}

function priceSubScore(offer: RawOffer, minPrice: number | null): number {
  if (offer.price == null || minPrice == null || minPrice <= 0) return 25;
  const ratio = minPrice / offer.price;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function ratingSubScore(offer: RawOffer): number {
  if (offer.rating == null) return 45;
  return Math.max(0, Math.min(100, Math.round((offer.rating / 5) * 100)));
}

function trustSubScore(offer: RawOffer): number {
  let base = KNOWN_TRUSTED_STORES.has(offer.store) ? 82 : 52;
  if (offer.reviewCount != null) {
    const bonus = Math.min(18, Math.round(Math.log10(offer.reviewCount + 1) * 6));
    base += bonus;
  }
  return Math.max(0, Math.min(100, base));
}

function deliverySubScore(offer: RawOffer): number {
  switch (offer.shippingDate) {
    case "Hoje":
      return 100;
    case "Amanhã":
      return 90;
    default:
      break;
  }
  if (offer.shippingDate?.startsWith("Até")) {
    const days = parseInt(offer.shippingDate.replace(/\D/g, ""), 10);
    if (days <= 3) return 75;
    if (days <= 7) return 55;
    return 40;
  }
  return 40;
}

function conditionSubScore(offer: RawOffer): number {
  switch (offer.condition) {
    case "novo":
      return 100;
    case "seminovo":
      return 70;
    case "usado":
      return 55;
    default:
      return 60;
  }
}

export function trustLabel(
  offer: Pick<RawOffer, "store" | "reviewCount" | "rating">,
): "Confiabilidade alta" | "Confiabilidade média" | "Dados insuficientes" {
  const known = KNOWN_TRUSTED_STORES.has(offer.store);
  const hasSignal = offer.reviewCount != null || offer.rating != null;
  if (known && hasSignal) return "Confiabilidade alta";
  if (known || hasSignal) return "Confiabilidade média";
  return "Dados insuficientes";
}

export function scoreOffer(offer: RawOffer, ctx: ScoreContext) {
  const subScores = {
    price: priceSubScore(offer, ctx.minPrice),
    rating: ratingSubScore(offer),
    trust: trustSubScore(offer),
    delivery: deliverySubScore(offer),
    condition: conditionSubScore(offer),
  };

  const w = ctx.weights;
  const totalWeight = w.price + w.rating + w.trust + w.delivery + w.condition || 1;
  let score =
    (subScores.price * w.price +
      subScores.rating * w.rating +
      subScores.trust * w.trust +
      subScores.delivery * w.delivery +
      subScores.condition * w.condition) /
    totalWeight;

  // An unavailable offer should never outrank an in-stock one, even if it
  // otherwise scores well on price/rating/trust.
  if (offer.availability === false) score *= 0.3;

  return {
    score: Math.round(score * 10) / 10,
    subScores,
    trustLabel: trustLabel(offer),
  };
}
