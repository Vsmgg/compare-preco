import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareView } from "@/components/CompareView";

export const metadata: Metadata = {
  title: "Comparar ofertas",
};

export default function CompararPage() {
  return (
    <Suspense fallback={null}>
      <CompareView />
    </Suspense>
  );
}
