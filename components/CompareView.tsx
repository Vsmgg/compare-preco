"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ComparisonTable, type CompareOffer } from "./ComparisonTable";
import { AIRecommendation } from "./AIRecommendation";
import type { AIAnalysis } from "@/lib/types";

export function CompareView() {
  const params = useSearchParams();
  const ids = params.get("ids") ?? "";
  const [offers, setOffers] = useState<CompareOffer[] | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    if (!ids) return;
    setOffers(null);
    setAnalysis(null);
    fetch(`/api/comparar?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers ?? []);
        setAnalysis(data.analysis ?? null);
      });
  }, [ids]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-text">Comparação de ofertas</h1>
          <p className="mt-1 text-sm text-text-muted">
            Lado a lado: preço, avaliação, entrega e confiabilidade das ofertas selecionadas.
          </p>

          {!offers && (
            <div className="flex items-center gap-2 py-24 text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              Comparando ofertas...
            </div>
          )}

          {offers && offers.length >= 2 && (
            <div className="mt-8 space-y-8">
              <ComparisonTable offers={offers} />
              {analysis && <AIRecommendation analysis={analysis} />}
            </div>
          )}

          {offers && offers.length < 2 && (
            <p className="mt-10 text-sm text-text-muted">
              Selecione ao menos duas ofertas nos resultados de busca para comparar.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
