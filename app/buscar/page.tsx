import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResultsView } from "@/components/SearchResultsView";

export const metadata: Metadata = {
  title: "Resultados da busca",
};

export default function BuscarPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsView />
    </Suspense>
  );
}
