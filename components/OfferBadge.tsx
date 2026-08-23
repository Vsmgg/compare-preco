import { Trophy, DollarSign, Star, Zap, ShieldCheck, PackageX } from "lucide-react";

const CONFIG: Record<string, { icon: typeof Trophy; className: string }> = {
  "Melhor opção": { icon: Trophy, className: "bg-red text-white" },
  "Melhor preço": { icon: DollarSign, className: "bg-emerald-400/15 text-emerald-400" },
  "Melhor avaliação": { icon: Star, className: "bg-amber-400/15 text-amber-400" },
  "Entrega mais rápida": { icon: Zap, className: "bg-sky-400/15 text-sky-400" },
  "Mais confiável": { icon: ShieldCheck, className: "bg-violet-400/15 text-violet-400" },
  Indisponível: { icon: PackageX, className: "bg-amber-400/15 text-amber-400" },
};

export function OfferBadge({ label }: { label: string }) {
  const config = CONFIG[label] ?? { icon: Trophy, className: "bg-card-secondary text-text-muted" };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}
