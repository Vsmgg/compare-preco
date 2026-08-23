"use client";

export interface ResultFilters {
  sort: "melhor" | "preco" | "avaliacao" | "entrega" | "economia";
  stores: string[];
  minRating: number | null;
  maxPrice: number | null;
  delivery: "hoje" | "amanha" | "3dias" | "7dias" | null;
  condition: "novo" | "usado" | "seminovo" | null;
}

export const SORT_OPTIONS: { value: ResultFilters["sort"]; label: string }[] = [
  { value: "melhor", label: "Melhor opção" },
  { value: "preco", label: "Menor preço" },
  { value: "avaliacao", label: "Melhor avaliação" },
  { value: "entrega", label: "Entrega mais rápida" },
  { value: "economia", label: "Maior economia" },
];

export function FilterSidebar({
  filters,
  onChange,
  stores,
  priceBounds,
}: {
  filters: ResultFilters;
  onChange: (f: ResultFilters) => void;
  stores: string[];
  priceBounds: [number, number];
}) {
  function toggleStore(store: string) {
    const next = filters.stores.includes(store)
      ? filters.stores.filter((s) => s !== store)
      : [...filters.stores, store];
    onChange({ ...filters, stores: next });
  }

  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Ordenar por</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sort: opt.value })}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                filters.sort === opt.value
                  ? "bg-red/15 font-medium text-red-soft"
                  : "text-text-muted hover:bg-card-secondary hover:text-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Preço máximo</h3>
        <input
          type="range"
          min={priceBounds[0]}
          max={priceBounds[1]}
          value={filters.maxPrice ?? priceBounds[1]}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-red"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-text-muted">
          <span>{priceBounds[0].toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span>
            {(filters.maxPrice ?? priceBounds[1]).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {stores.length > 1 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Lojas</h3>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {stores.map((store) => (
              <label key={store} className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  checked={filters.stores.includes(store)}
                  onChange={() => toggleStore(store)}
                  className="h-3.5 w-3.5 accent-red"
                />
                {store}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Avaliação mínima</h3>
        <div className="flex gap-2">
          {[4.5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? null : r })}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                filters.minRating === r ? "border-red bg-red/15 text-red-soft" : "border-border text-text-muted"
              }`}
            >
              {r}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Entrega</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "hoje" as const, label: "Hoje" },
            { value: "amanha" as const, label: "Amanhã" },
            { value: "3dias" as const, label: "Até 3 dias" },
            { value: "7dias" as const, label: "Até 7 dias" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, delivery: filters.delivery === opt.value ? null : opt.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                filters.delivery === opt.value ? "border-red bg-red/15 text-red-soft" : "border-border text-text-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Condição</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "novo" as const, label: "Novo" },
            { value: "seminovo" as const, label: "Seminovo" },
            { value: "usado" as const, label: "Usado" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, condition: filters.condition === opt.value ? null : opt.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                filters.condition === opt.value ? "border-red bg-red/15 text-red-soft" : "border-border text-text-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
