import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareView } from "@/components/CompareView";

export const metadata: Metadata = {
  title: "Comparar ofertas",
  description: "Compare lado a lado preço, avaliação, entrega e confiabilidade das ofertas selecionadas.",
};

export default function CompararPage() {
  return (
    <Suspense fallback={null}>
      <CompareView />
    </Suspense>
  );
}
