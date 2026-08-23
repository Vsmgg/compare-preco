import { Truck, Zap } from "lucide-react";

export function ShippingBadge({
  shippingDate,
  shippingPrice,
}: {
  shippingDate: string | null;
  shippingPrice: number | null;
}) {
  const isFast = shippingDate === "Hoje" || shippingDate === "Amanhã";

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted">
      {isFast ? <Zap size={13} className="text-red-soft" /> : <Truck size={13} />}
      <span className={isFast ? "font-medium text-text" : ""}>
        {shippingDate ? `Entrega: ${shippingDate}` : "Prazo não informado"}
      </span>
      {shippingPrice === 0 && (
        <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          Frete grátis
        </span>
      )}
    </div>
  );
}
