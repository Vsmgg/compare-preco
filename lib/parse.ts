const STORE_NAMES: Record<string, string> = {
  "mercadolivre.com.br": "Mercado Livre",
  "amazon.com.br": "Amazon",
  "amazon.com": "Amazon",
  "magazineluiza.com.br": "Magazine Luiza",
  "magazinevoce.com.br": "Magazine Luiza",
  "kabum.com.br": "KaBuM!",
  "casasbahia.com.br": "Casas Bahia",
  "americanas.com.br": "Americanas",
  "shopee.com.br": "Shopee",
  "carrefour.com.br": "Carrefour",
  "fastshop.com.br": "Fast Shop",
  "pontofrio.com.br": "Ponto Frio",
  "extra.com.br": "Extra",
  "submarino.com.br": "Submarino",
  "netshoes.com.br": "Netshoes",
  "centauro.com.br": "Centauro",
  "apple.com": "Apple",
  "samsung.com": "Samsung",
  "girafa.com.br": "Girafa",
  "webmotors.com.br": "WebMotors",
  "olx.com.br": "OLX",
  "icarros.com.br": "iCarros",
  "zoom.com.br": "Zoom",
  "buscape.com.br": "Buscapé",
  "ninetech.com.br": "Nine Tech",
  "terabyteshop.com.br": "Terabyte Shop",
  "pichau.com.br": "Pichau",
  "sephora.com.br": "Sephora",
  "epocacosmeticos.com.br": "Época Cosméticos",
  "boticario.com.br": "O Boticário",
  "lojasrenner.com.br": "Renner",
  "riachuelo.com.br": "Riachuelo",
  "dafiti.com.br": "Dafiti",
  "leroymerlin.com.br": "Leroy Merlin",
  "tokstok.com.br": "Tok&Stok",
  "rihappy.com.br": "Ri Happy",
  "pbkids.com.br": "PBKids",
  "decathlon.com.br": "Decathlon",
};

export const KNOWN_TRUSTED_STORES = new Set([
  "Amazon",
  "Mercado Livre",
  "Magazine Luiza",
  "KaBuM!",
  "Casas Bahia",
  "Americanas",
  "Shopee",
  "Carrefour",
  "Fast Shop",
  "Ponto Frio",
  "Extra",
  "Submarino",
  "Netshoes",
  "Centauro",
  "Apple",
  "Samsung",
  "WebMotors",
  "Terabyte Shop",
  "Pichau",
  "Sephora",
  "Época Cosméticos",
  "O Boticário",
  "Renner",
  "Riachuelo",
  "Dafiti",
  "Leroy Merlin",
  "Tok&Stok",
  "Ri Happy",
  "PBKids",
  "Decathlon",
]);

export function extractDomain(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "";
  }
}

const MULTI_PART_TLDS = new Set(["com.br", "org.br", "net.br", "gov.br", "edu.br", "co.uk"]);

export function storeNameFromDomain(domain: string): string {
  if (STORE_NAMES[domain]) return STORE_NAMES[domain];

  for (const [knownDomain, name] of Object.entries(STORE_NAMES)) {
    if (domain === knownDomain || domain.endsWith(`.${knownDomain}`)) return name;
  }

  const parts = domain.split(".");
  const lastTwo = parts.slice(-2).join(".");
  const base = MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3 ? parts[parts.length - 3] : parts[0];
  if (!base) return domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const EDITORIAL_BLACKLIST = new Set([
  "tudocelular.com",
  "canaltech.com.br",
  "tecmundo.com.br",
  "olhardigital.com.br",
  "adrenaline.com.br",
  "oficinadanet.com.br",
  "g1.globo.com",
  "uol.com.br",
  "terra.com.br",
  "showmetech.com.br",
  "meubolso.com",
  "wikipedia.org",
]);

const AGGREGATOR_SEARCH_HOSTS = new Set(["buscape.com.br", "zoom.com.br", "jacotei.com.br", "static.com.br"]);

// Classifieds sites list many ads under one category/search URL — only a
// path with a long numeric ad id points at a single real listing.
const CLASSIFIEDS_REQUIRE_AD_ID = new Set(["olx.com.br", "webmotors.com.br", "icarros.com.br", "mobiauto.com.br"]);

// Category/department landing pages ("Eletrônicos - Amazon.com.br") sometimes
// rank well for broad queries but aren't an actual product to compare.
const GENERIC_CATEGORY_TITLES = new Set([
  "eletronicos",
  "eletrodomesticos",
  "informatica",
  "celulares",
  "celulares e smartphones",
  "smartphones",
  "casa",
  "casa e decoracao",
  "decoracao",
  "moveis",
  "carros",
  "carros seminovos",
  "carros novos",
  "motos",
  "motos seminovas",
  "moda",
  "roupas",
  "roupas femininas",
  "roupas masculinas",
  "calcados",
  "cameras",
  "cameras fotograficas",
  "ferramentas",
  "games",
  "consoles",
  "video games",
  "ofertas",
  "promocoes",
  "departamento",
  "loja oficial",
  "ver todos",
  "todas as categorias",
  "todos os produtos",
]);

const ACCENT_MAP: Record<string, string> = {
  á: "a", à: "a", â: "a", ã: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c",
};

function stripAccents(text: string): string {
  return text.replace(/[áàâãäéèêëíìîïóòôõöúùûüç]/g, (ch) => ACCENT_MAP[ch] ?? ch);
}

export function isGenericCategoryTitle(title: string): boolean {
  const normalized = stripAccents(title.toLowerCase())
    .replace(/[|].*$/, "")
    .replace(/[-–—:].*$/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return false;
  if (/\d/.test(normalized)) return false;
  if (normalized.split(" ").length > 4) return false;
  return GENERIC_CATEGORY_TITLES.has(normalized);
}

const LISTING_PATH_PATTERNS =
  /\/(c|categoria|category|departamento|dept|colecao|colecoes|collections?|l|lp)\/[a-z0-9-]+\/?(\?|$)|\/(s|busca|search)(\/|\?|$)|[?&](k|q|busca|node)=/i;

export function looksLikeListingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    if (path === "/" || path === "") return true;
    const hasSpecificId = /\d{5,}/.test(path + parsed.search);
    if (hasSpecificId) return false;
    return LISTING_PATH_PATTERNS.test(path + parsed.search);
  } catch {
    return false;
  }
}

const UNAVAILABLE_PATTERNS =
  /\b(indispon[ií]vel|fora de estoque|sem estoque|esgotado|produto esgotado|out of stock|sold ?out|temporariamente indispon[ií]vel)\b/i;

export function detectUnavailable(text: string | null | undefined): boolean {
  if (!text) return false;
  return UNAVAILABLE_PATTERNS.test(text);
}

export function isLikelyStorefront(url: string, domain: string): boolean {
  if (EDITORIAL_BLACKLIST.has(domain)) return false;
  if (AGGREGATOR_SEARCH_HOSTS.has(domain)) {
    try {
      const path = new URL(url).pathname;
      if (/busca|search/i.test(path)) return false;
    } catch {
      return false;
    }
  }
  if (CLASSIFIEDS_REQUIRE_AD_ID.has(domain)) {
    try {
      const path = new URL(url).pathname;
      if (!/\d{5,}/.test(path)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function parsePriceBR(text: string | null | undefined): number | null {
  if (!text) return null;
  // Installment fragments ("12x de R$ 199,90") tend to be much smaller than
  // the real price, so instead of the first match we take the largest value
  // found — the full price is almost always the biggest number mentioned.
  const matches = [...text.matchAll(/R\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/g)];
  if (matches.length === 0) return null;
  const values = matches
    .map((m) => parseFloat(m[1].replace(/\./g, "").replace(",", ".")))
    .filter((v) => Number.isFinite(v) && v >= 10);
  if (values.length === 0) return null;
  return Math.max(...values);
}

function priceToNumberBR(raw: string): number | null {
  const value = parseFloat(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) && value >= 10 ? value : null;
}

const PRICE_NUMBER = String.raw`(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)`;
const DE_POR_PATTERN = new RegExp(`de:?\\s*R\\$\\s?${PRICE_NUMBER}\\s*por:?\\s*R\\$\\s?${PRICE_NUMBER}`, "i");
const DE_ONLY_PATTERN = new RegExp(`\\bde:?\\s*R\\$\\s?${PRICE_NUMBER}\\b`, "i");
// Detects a listed "original" price from common Brazilian discount phrasing
// ("de R$ 3.999 por R$ 2.499") for a price that's already known to be
// reliable (e.g. Brave's structured product price).
//
// Deliberately does NOT derive a number from a bare percentage ("37% OFF"):
// that would be a computed/inferred value, not a price actually stated in
// the source — and this app never presents inferred data as confirmed.
export function parseOriginalPrice(text: string | null | undefined, price: number | null): number | null {
  if (!text || price == null) return null;

  const deParaMatch = text.match(DE_POR_PATTERN);
  if (deParaMatch) {
    const original = priceToNumberBR(deParaMatch[1]);
    if (original != null && original > price) return original;
  }

  const deOnlyMatch = text.match(DE_ONLY_PATTERN);
  if (deOnlyMatch) {
    const original = priceToNumberBR(deOnlyMatch[1]);
    if (original != null && original > price) return original;
  }

  return null;
}

// Same idea, but for free-text results where we don't have a trusted price
// yet: the "de X por Y" phrasing pins both the sale price and the original
// directly, which is far more reliable than picking the largest number in
// the text (that would grab the *original*, pre-discount price instead).
export function parsePriceWithDiscount(text: string | null | undefined): { price: number | null; originalPrice: number | null } {
  if (!text) return { price: null, originalPrice: null };

  const deParaMatch = text.match(DE_POR_PATTERN);
  if (deParaMatch) {
    const original = priceToNumberBR(deParaMatch[1]);
    const sale = priceToNumberBR(deParaMatch[2]);
    if (original != null && sale != null && original > sale) {
      return { price: sale, originalPrice: original };
    }
  }

  // "De R$ 3.999,00" mentioned on its own (sale price stated elsewhere in the
  // same snippet) — exclude that number from the sale-price candidates so it
  // doesn't get picked as "the price" by the max-value fallback below.
  const deOnlyMatch = text.match(DE_ONLY_PATTERN);
  if (deOnlyMatch && deOnlyMatch.index != null) {
    const original = priceToNumberBR(deOnlyMatch[1]);
    const remaining = text.slice(0, deOnlyMatch.index) + text.slice(deOnlyMatch.index + deOnlyMatch[0].length);
    const sale = parsePriceBR(remaining);
    if (original != null && sale != null && original > sale) {
      return { price: sale, originalPrice: original };
    }
  }

  const price = parsePriceBR(text);
  return { price, originalPrice: null };
}

export function parseRating(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/(\d(?:[.,]\d)?)\s*(?:de\s*5|\/\s*5|estrelas)/i);
  if (match) {
    const value = parseFloat(match[1].replace(",", "."));
    if (value >= 0 && value <= 5) return value;
  }
  return null;
}

export function parseReviewCount(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/([\d.]{1,7})\s*(?:avalia[cç][oõ]es|reviews|opini[oõ]es)/i);
  if (match) {
    const value = parseInt(match[1].replace(/\./g, ""), 10);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

export function detectFreeShipping(text: string | null | undefined): boolean {
  if (!text) return false;
  return /frete\s*gr[aá]tis/i.test(text);
}

export function parseShippingDate(text: string | null | undefined): string | null {
  if (!text) return null;
  if (/entrega\s*(hoje|no mesmo dia)/i.test(text)) return "Hoje";
  if (/entrega\s*amanh[ãa]/i.test(text)) return "Amanhã";
  const days = text.match(/entrega\s*em\s*at[eé]?\s*(\d{1,2})\s*dias?/i);
  if (days) return `Até ${days[1]} dias`;
  const chegaEm = text.match(/chega\s*em\s*(\d{1,2})\s*dias?/i);
  if (chegaEm) return `Até ${chegaEm[1]} dias`;
  return null;
}

export function detectCondition(title: string): "novo" | "usado" | "seminovo" | null {
  const t = title.toLowerCase();
  if (/(usado|recondicionado)/.test(t)) return "usado";
  if (/(seminovo|semi-novo|caixa aberta|open box)/.test(t)) return "seminovo";
  if (/(novo|lacrado|original)/.test(t)) return "novo";
  return null;
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*(Amazon\.com\.br|Mercado Livre|Magazine Luiza).*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}
