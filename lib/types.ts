export type Condition = "novo" | "usado" | "seminovo" | null;

export interface RawOffer {
  title: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  imageUrl: string | null;
  productUrl: string;
  store: string;
  domain: string;
  rating: number | null;
  reviewCount: number | null;
  shippingPrice: number | null;
  shippingDate: string | null;
  availability: boolean | null;
  condition: Condition;
  seller: string | null;
  source: string;
  /** true when the price came from Brave's structured product data, false when regex-parsed from free text (less reliable). */
  priceConfident: boolean;
}

export interface ScoredOffer extends RawOffer {
  id: string;
  score: number;
  subScores: {
    price: number;
    rating: number;
    trust: number;
    delivery: number;
    condition: number;
  };
  trustLabel: "Confiabilidade alta" | "Confiabilidade média" | "Dados insuficientes";
  badges: string[];
  rank: number;
}

export interface SearchIntent {
  category: string;
  brand: string | null;
  model: string | null;
  maxPrice: number | null;
  queries: string[];
  weights: {
    price: number;
    rating: number;
    trust: number;
    delivery: number;
    condition: number;
  };
  intentSummary: string;
}

export interface AIAnalysis {
  bestOfferReasoning: string;
  pros: string[];
  cons: string[];
  confidence: "alta" | "média" | "baixa";
}

export type SearchStage =
  | "entendendo"
  | "pesquisando"
  | "coletando"
  | "avaliacoes"
  | "entrega"
  | "confiabilidade"
  | "calculando"
  | "completo"
  | "erro";

export interface SearchEvent {
  stage: SearchStage;
  message: string;
  sourcesCount?: number;
  offersCount?: number;
  searchId?: string;
  productId?: string;
  query?: string;
  offers?: ScoredOffer[];
  analysis?: AIAnalysis;
  error?: string;
}
