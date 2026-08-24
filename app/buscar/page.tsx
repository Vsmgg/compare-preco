import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResultsView } from "@/components/SearchResultsView";

export const metadata: Metadata = {
  title: "Resultados da busca",
  description: "Compare preços, avaliações e prazos de entrega de ofertas reais encontradas na web.",
};

export default function BuscarPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsView />
    </Suspense>
  );
}
