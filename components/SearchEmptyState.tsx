"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

export function SearchEmptyState({ query }: { query: string }) {
  const suggestions = [
    "Tente um nome mais genérico do produto",
    "Remova filtros de preço muito específicos",
    "Verifique a grafia da marca ou modelo",
  ];

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card-secondary text-text-muted">
        <SearchX size={26} />
      </span>
      <h1 className="mt-6 font-display text-xl font-bold text-text">
        Não encontramos ofertas suficientes para essa busca.
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Pesquisamos por &ldquo;{query}&rdquo; em diversas fontes, mas os resultados não foram suficientes.
      </p>
      <ul className="mt-6 space-y-2 text-left text-sm text-text-muted">
        {suggestions.map((s) => (
          <li key={s} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-soft" />
            {s}
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-8 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-soft"
      >
        Fazer nova busca
      </Link>
    </div>
  );
}
