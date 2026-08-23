import { GoogleGenAI, Type } from "@google/genai";
import type { AIAnalysis, ScoredOffer, SearchIntent } from "./types";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");
  return new GoogleGenAI({ apiKey });
}

const CATEGORY_SITES: Record<string, string[]> = {
  eletronicos: ["amazon.com.br", "mercadolivre.com.br", "magazineluiza.com.br", "fastshop.com.br"],
  informatica: ["kabum.com.br", "terabyteshop.com.br", "pichau.com.br", "amazon.com.br"],
  celulares: ["amazon.com.br", "mercadolivre.com.br", "magazineluiza.com.br", "fastshop.com.br"],
  casa: ["magazineluiza.com.br", "casasbahia.com.br", "amazon.com.br", "mercadolivre.com.br"],
  moveis: ["magazineluiza.com.br", "mercadolivre.com.br", "casasbahia.com.br"],
  carros: ["webmotors.com.br", "olx.com.br", "icarros.com.br"],
  motos: ["webmotors.com.br", "olx.com.br"],
  moda: ["netshoes.com.br", "centauro.com.br", "amazon.com.br", "mercadolivre.com.br"],
  default: ["amazon.com.br", "mercadolivre.com.br", "magazineluiza.com.br", "casasbahia.com.br"],
};

export async function interpretIntent(query: string): Promise<SearchIntent> {
  const ai = client();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Você é o motor de interpretação de busca do Compare Preço, um comparador de preços brasileiro.
Analise a busca do usuário e devolva a interpretação estruturada.

Busca do usuário: "${query}"

Regras:
- category: uma destas palavras-chave em minúsculo: eletronicos, informatica, celulares, casa, moveis, carros, motos, moda, ou "default" se não identificar.
- brand/model: extraia se houver, senão null.
- maxPrice: se o usuário mencionar um teto de preço (ex: "até R$ 6.000"), extraia o número. Senão null.
- queries: gere de 3 a 5 termos de busca curtos e eficazes para encontrar esse produto à venda em lojas brasileiras (sem "site:", isso é adicionado depois). Inclua o nome do produto o mais completo possível.
- weights: pesos de 0 a 1 (não precisam somar 1) para price, rating, trust, delivery, condition, refletindo o que o usuário parece priorizar. Default equilibrado: price 0.4, rating 0.2, trust 0.2, delivery 0.1, condition 0.1. Se o usuário disser algo como "mais barato possível", aumente price. Se mencionar prazo/urgência ("chegar amanhã", "rápido"), aumente delivery. Se mencionar confiança/loja conhecida, aumente trust.
- intentSummary: uma frase curta em português explicando o que você entendeu que a pessoa quer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          brand: { type: Type.STRING, nullable: true },
          model: { type: Type.STRING, nullable: true },
          maxPrice: { type: Type.NUMBER, nullable: true },
          queries: { type: Type.ARRAY, items: { type: Type.STRING } },
          weights: {
            type: Type.OBJECT,
            properties: {
              price: { type: Type.NUMBER },
              rating: { type: Type.NUMBER },
              trust: { type: Type.NUMBER },
              delivery: { type: Type.NUMBER },
              condition: { type: Type.NUMBER },
            },
            required: ["price", "rating", "trust", "delivery", "condition"],
          },
          intentSummary: { type: Type.STRING },
        },
        required: ["category", "queries", "weights", "intentSummary"],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");
  const category = (parsed.category || "default").toLowerCase();

  return {
    category,
    brand: parsed.brand ?? null,
    model: parsed.model ?? null,
    maxPrice: parsed.maxPrice ?? null,
    queries: parsed.queries?.length ? parsed.queries : [query],
    weights: {
      price: parsed.weights?.price ?? 0.4,
      rating: parsed.weights?.rating ?? 0.2,
      trust: parsed.weights?.trust ?? 0.2,
      delivery: parsed.weights?.delivery ?? 0.1,
      condition: parsed.weights?.condition ?? 0.1,
    },
    intentSummary: parsed.intentSummary ?? query,
  };
}

export function sitesForCategory(category: string): string[] {
  return CATEGORY_SITES[category] ?? CATEGORY_SITES.default;
}

export async function explainRanking(query: string, offers: ScoredOffer[]): Promise<AIAnalysis> {
  const ai = client();
  const top = offers.slice(0, 8).map((o) => ({
    id: o.id,
    title: o.title,
    store: o.store,
    price: o.price,
    rating: o.rating,
    reviewCount: o.reviewCount,
    shippingDate: o.shippingDate,
    score: o.score,
    rank: o.rank,
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Você é o analista do Compare Preço. Recebeu ofertas REAIS já coletadas e pontuadas (não invente novas ofertas, preços ou lojas — use somente os dados abaixo).

Busca original: "${query}"

Ofertas rankeadas (rank 1 = melhor opção calculada pelo sistema):
${JSON.stringify(top, null, 2)}

Escreva, em português brasileiro, uma análise curta e direta explicando por que a oferta de rank 1 é a recomendada, considerando o equilíbrio entre preço, avaliação, confiabilidade da loja e prazo de entrega. Aponte prós e contras reais baseados apenas nos dados fornecidos. Se algum dado estiver ausente (null), não invente — mencione a ausência apenas se for relevante para a decisão.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestOfferReasoning: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.STRING, enum: ["alta", "média", "baixa"] },
        },
        required: ["bestOfferReasoning", "pros", "cons", "confidence"],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");
  return {
    bestOfferReasoning: parsed.bestOfferReasoning ?? "",
    pros: parsed.pros ?? [],
    cons: parsed.cons ?? [],
    confidence: parsed.confidence ?? "média",
  };
}

export interface ComparableOffer {
  id: string;
  title: string;
  store: string;
  price: number | null;
  rating: number | null;
  reviewCount: number | null;
  shippingDate: string | null;
  score: number | null;
}

export async function compareOffers(offers: ComparableOffer[]): Promise<AIAnalysis> {
  const ai = client();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Você é o analista do Compare Preço. O usuário selecionou estas ofertas REAIS para comparar lado a lado (não invente dados novos, use somente os fornecidos):

${JSON.stringify(offers, null, 2)}

Explique, em português brasileiro, qual oferta apresenta o melhor equilíbrio entre preço, avaliação, confiabilidade e prazo de entrega, e por quê. Se algum dado estiver ausente (null), não invente um valor — apenas não use esse critério para aquela oferta.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestOfferReasoning: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.STRING, enum: ["alta", "média", "baixa"] },
        },
        required: ["bestOfferReasoning", "pros", "cons", "confidence"],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");
  return {
    bestOfferReasoning: parsed.bestOfferReasoning ?? "",
    pros: parsed.pros ?? [],
    cons: parsed.cons ?? [],
    confidence: parsed.confidence ?? "média",
  };
}
