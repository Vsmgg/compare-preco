import { ShieldCheck, ShieldQuestion, ShieldAlert } from "lucide-react";

const ICONS: Record<string, typeof ShieldCheck> = {
  "Confiabilidade alta": ShieldCheck,
  "Confiabilidade média": ShieldQuestion,
  "Dados insuficientes": ShieldAlert,
};

const COLORS: Record<string, string> = {
  "Confiabilidade alta": "text-emerald-400",
  "Confiabilidade média": "text-amber-400",
  "Dados insuficientes": "text-text-muted",
};

export function StoreBadge({ store, trustLabel }: { store: string; trustLabel: string }) {
  const Icon = ICONS[trustLabel] ?? ShieldQuestion;
  const color = COLORS[trustLabel] ?? "text-text-muted";

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-text">{store}</span>
      <span className={`flex items-center gap-1 text-xs ${color}`} title={trustLabel}>
        <Icon size={13} />
      </span>
    </div>
  );
}
