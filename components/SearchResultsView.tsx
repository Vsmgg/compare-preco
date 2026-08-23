"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import type { AIAnalysis, ScoredOffer, SearchStage } from "@/lib/types";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { SearchProgress } from "./SearchProgress";
import { SearchEmptyState } from "./SearchEmptyState";
import { BestOfferCard } from "./BestOfferCard";
import { OfferCard } from "./OfferCard";
import { AIRecommendation } from "./AIRecommendation";
import { FilterSidebar, type ResultFilters } from "./FilterSidebar";
import { MobileFilters } from "./MobileFilters";
import { OfferBadge } from "./OfferBadge";

const DEFAULT_FILTERS: ResultFilters = {
  sort: "melhor",
  stores: [],
  minRating: null,
  maxPrice: null,
  delivery: null,
  condition: null,
};

function deliveryMatches(offer: ScoredOffer, bucket: ResultFilters["delivery"]) {
  if (!bucket) return true;
  if (!offer.shippingDate) return false;
  if (bucket === "hoje") return offer.shippingDate === "Hoje";
  if (bucket === "amanha") return offer.shippingDate === "Hoje" || offer.shippingDate === "Amanhã";
  if (bucket === "3dias") return offer.subScores.delivery >= 75;
  if (bucket === "7dias") return offer.subScores.delivery >= 55;
  return true;
}

export function SearchResultsView() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q")?.trim() ?? "";

  const [stage, setStage] = useState<SearchStage>("entendendo");
  const [message, setMessage] = useState("Entendendo sua busca");
  const [sourcesCount, setSourcesCount] = useState<number | undefined>();
  const [offersCount, setOffersCount] = useState<number | undefined>();
  const [offers, setOffers] = useState<ScoredOffer[] | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [searchId, setSearchId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResultFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!query) return;
    setStage("entendendo");
    setOffers(null);
    setAnalysis(null);
    setError(null);
    setFilters(DEFAULT_FILTERS);
    setSelected([]);

    const es = new EventSource(`/api/search?q=${encodeURIComponent(query)}`);
    esRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStage(data.stage);
      setMessage(data.message);
      if (data.sourcesCount != null) setSourcesCount(data.sourcesCount);
      if (data.offersCount != null) setOffersCount(data.offersCount);

      if (data.stage === "completo") {
        setOffers(data.offers);
        setAnalysis(data.analysis);
        setSearchId(data.searchId);
        es.close();
      }
      if (data.stage === "erro") {
        setError(data.message);
        es.close();
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [query]);

  const stores = useMemo(() => {
    if (!offers) return [];
    return Array.from(new Set(offers.map((o) => o.store))).sort();
  }, [offers]);

  const priceBounds = useMemo<[number, number]>(() => {
    if (!offers) return [0, 20000];
    const prices = offers.map((o) => o.price).filter((p): p is number => p != null);
    if (!prices.length) return [0, 20000];
    return [0, Math.ceil(Math.max(...prices) / 100) * 100];
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    let list = offers.filter((o) => {
      if (filters.stores.length && !filters.stores.includes(o.store)) return false;
      if (filters.minRating != null && (o.rating == null || o.rating < filters.minRating)) return false;
      if (filters.maxPrice != null && o.price != null && o.price > filters.maxPrice) return false;
      if (!deliveryMatches(o, filters.delivery)) return false;
      if (filters.condition && o.condition !== filters.condition) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "preco":
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "avaliacao":
          return (b.rating ?? -1) - (a.rating ?? -1);
        case "entrega":
          return b.subScores.delivery - a.subScores.delivery;
        case "economia": {
          const discA = a.originalPrice && a.price ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice && b.price ? b.originalPrice - b.price : 0;
          return discB - discA;
        }
        default:
          return b.score - a.score;
      }
    });

    return list;
  }, [offers, filters]);

  const bestOverall = useMemo(() => offers?.find((o) => o.rank === 1), [offers]);
  const cheapest = useMemo(
    () =>
      offers
        ?.filter((o) => o.price != null)
        .sort((a, b) => a.price! - b.price!)[0],
    [offers],
  );
  const fastest = useMemo(
    () => (offers ? [...offers].sort((a, b) => b.subScores.delivery - a.subScores.delivery)[0] : undefined),
    [offers],
  );

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  if (!query) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <SearchEmptyState query="" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {!offers && !error && (
          <SearchProgress
            stage={stage}
            message={message}
            sourcesCount={sourcesCount}
            offersCount={offersCount}
            query={query}
          />
        )}

        {error && <SearchEmptyState query={query} />}

        {offers && (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-2xl">
              <SearchBar initialQuery={query} />
            </div>

            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-xl font-bold text-text sm:text-2xl">
                  Resultados para <span className="text-gradient-red">{query}</span>
                </h1>
                <p className="mt-1 text-sm text-text-muted">{offers.length} ofertas encontradas</p>
              </div>
              <MobileFilters filters={filters} onChange={setFilters} stores={stores} priceBounds={priceBounds} />
            </div>

            {bestOverall && (
              <div className="mb-8">
                <BestOfferCard offer={bestOverall} searchId={searchId} reasoning={analysis?.bestOfferReasoning} />
              </div>
            )}

            {analysis && (
              <div className="mb-8">
                <AIRecommendation analysis={analysis} />
              </div>
            )}

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              {cheapest && cheapest.id !== bestOverall?.id && (
                <HighlightMini label="Menor preço" offer={cheapest} searchId={searchId} />
              )}
              {fastest && fastest.subScores.delivery >= 75 && fastest.id !== bestOverall?.id && (
                <HighlightMini label="Mais rápido" offer={fastest} searchId={searchId} />
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
                  <FilterSidebar filters={filters} onChange={setFilters} stores={stores} priceBounds={priceBounds} />
                </div>
              </aside>

              <div>
                <h2 className="mb-4 font-display text-base font-semibold text-text">Outras ofertas</h2>
                <div className="space-y-3">
                  {filteredOffers.map((offer, i) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      searchId={searchId}
                      selected={selected.includes(offer.id)}
                      onToggleSelect={toggleSelect}
                      index={i}
                    />
                  ))}
                  {filteredOffers.length === 0 && (
                    <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-text-muted">
                      Nenhuma oferta corresponde aos filtros selecionados.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {offers && selected.length >= 2 && (
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => router.push(`/comparar?ids=${selected.join(",")}`)}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-black/40"
        >
          <Scale size={16} />
          Comparar selecionados ({selected.length})
        </motion.button>
      )}

      <Footer />
    </>
  );
}

function HighlightMini({
  label,
  offer,
  searchId,
}: {
  label: string;
  offer: ScoredOffer;
  searchId?: string;
}) {
  const href = `/api/go?offer=${offer.id}${searchId ? `&search=${searchId}` : ""}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-red/30"
    >
      <div className="min-w-0">
        <OfferBadge label={label} />
        <p className="mt-2 line-clamp-1 text-sm font-medium text-text">{offer.title}</p>
        <p className="mt-0.5 text-xs text-text-muted">{offer.store}</p>
      </div>
      <span className="shrink-0 font-mono text-lg font-bold text-text">
        {offer.price != null
          ? offer.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—"}
      </span>
    </a>
  );
}
