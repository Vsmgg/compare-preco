"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterSidebar, type ResultFilters } from "./FilterSidebar";

export function MobileFilters(props: {
  filters: ResultFilters;
  onChange: (f: ResultFilters) => void;
  stores: string[];
  priceBounds: [number, number];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text lg:hidden"
      >
        <SlidersHorizontal size={15} />
        Filtros
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-border bg-bg p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-text">Filtros</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar filtros">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <FilterSidebar {...props} />
            <button
              onClick={() => setOpen(false)}
              className="mt-8 w-full rounded-xl bg-red py-3 text-sm font-semibold text-white"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
