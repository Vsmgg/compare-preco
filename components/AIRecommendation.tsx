import { Bot, ThumbsUp, ThumbsDown } from "lucide-react";
import type { AIAnalysis } from "@/lib/types";

const CONFIDENCE_LABEL: Record<AIAnalysis["confidence"], string> = {
  alta: "Confiança alta",
  média: "Confiança média",
  baixa: "Confiança baixa",
};

export function AIRecommendation({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red/15 text-red-soft">
            <Bot size={16} />
          </span>
          <h3 className="font-display text-sm font-semibold text-text">Análise do Compare Preço</h3>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-muted">
          {CONFIDENCE_LABEL[analysis.confidence]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-text-muted">{analysis.bestOfferReasoning}</p>

      {(analysis.pros.length > 0 || analysis.cons.length > 0) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {analysis.pros.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ThumbsUp size={12} /> Pontos positivos
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.pros.map((p) => (
                  <li key={p} className="text-xs leading-relaxed text-text-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.cons.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <ThumbsDown size={12} /> Pontos de atenção
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.cons.map((c) => (
                  <li key={c} className="text-xs leading-relaxed text-text-muted">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
