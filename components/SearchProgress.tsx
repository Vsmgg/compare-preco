"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { SearchStage } from "@/lib/types";

const STAGES: { key: SearchStage; label: string }[] = [
  { key: "entendendo", label: "Entendendo sua busca" },
  { key: "pesquisando", label: "Pesquisando a web" },
  { key: "coletando", label: "Coletando ofertas" },
  { key: "avaliacoes", label: "Verificando avaliações" },
  { key: "entrega", label: "Analisando entrega" },
  { key: "confiabilidade", label: "Comparando confiabilidade" },
  { key: "calculando", label: "Calculando a melhor opção" },
];

export function SearchProgress({
  stage,
  message,
  sourcesCount,
  offersCount,
  query,
}: {
  stage: SearchStage;
  message: string;
  sourcesCount?: number;
  offersCount?: number;
  query: string;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-red animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full border-2 border-red-soft/60" />
        <span className="h-3 w-3 rounded-full bg-red" />
      </div>

      <h1 className="font-display text-xl font-bold text-text sm:text-2xl">Comparando preços</h1>
      <p className="mt-2 text-sm text-text-muted">
        para <span className="text-text">&ldquo;{query}&rdquo;</span>
      </p>

      <div className="mt-10 w-full space-y-3 text-left">
        {STAGES.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  done
                    ? "border-red bg-red"
                    : active
                      ? "border-red-soft"
                      : "border-border"
                }`}
              >
                {done && <Check size={12} className="text-white" />}
                {active && <Loader2 size={12} className="animate-spin text-red-soft" />}
              </span>
              <span
                className={`text-sm ${done ? "text-text-muted line-through decoration-border" : active ? "font-medium text-text" : "text-text-muted/50"}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mt-10 font-mono text-xs text-text-muted"
        >
          {message}
          {sourcesCount != null && ` · ${sourcesCount} fontes consultadas`}
          {offersCount != null && ` · ${offersCount} ofertas encontradas`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
