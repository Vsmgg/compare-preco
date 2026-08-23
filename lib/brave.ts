const BRAVE_WEB_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
const BRAVE_IMAGE_ENDPOINT = "https://api.search.brave.com/res/v1/images/search";

let lastCallAt = 0;
const MIN_INTERVAL_MS = 1100;

async function throttle() {
  const now = Date.now();
  const wait = lastCallAt + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

function apiKey(): string {
  const key = process.env.BRAVE_API_KEY;
  if (!key) throw new Error("BRAVE_API_KEY não configurada.");
  return key;
}

export interface BraveProduct {
  type: "Product";
  name: string;
  price: string;
  thumbnail?: { src: string; original: string };
  description?: string;
  offers?: { url: string; priceCurrency: string; price: string; availability?: string }[];
  rating?: { ratingValue: number; bestRating: number; reviewCount: number };
}

export interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
  thumbnail?: { src: string; original: string };
  subtype?: string;
  product?: BraveProduct;
  age?: string;
}

export interface BraveImageResult {
  title: string;
  url: string;
  source: string;
  properties?: { url: string };
  thumbnail?: { src: string };
}

export async function braveWebSearch(query: string, count = 8): Promise<BraveWebResult[]> {
  await throttle();
  const url = `${BRAVE_WEB_ENDPOINT}?q=${encodeURIComponent(query)}&count=${count}&country=BR&search_lang=pt-br&safesearch=moderate`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey() },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Brave web search falhou", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return data?.web?.results ?? [];
}

export async function braveImageSearch(query: string, count = 6): Promise<BraveImageResult[]> {
  await throttle();
  const url = `${BRAVE_IMAGE_ENDPOINT}?q=${encodeURIComponent(query)}&count=${count}&country=BR&search_lang=pt-br&safesearch=strict`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey() },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Brave image search falhou", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return data?.results ?? [];
}
