const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
}: {
  price: number | null;
  originalPrice?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (price == null) {
    return <span className="font-mono text-sm text-text-muted">Preço não informado</span>;
  }

  const sizeClass =
    size === "lg" ? "text-3xl sm:text-4xl" : size === "md" ? "text-2xl" : "text-base";

  const hasDiscount = originalPrice != null && originalPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : null;

  return (
    <div className="flex flex-col gap-0.5">
      {hasDiscount && (
        <span className="font-mono text-xs text-text-muted line-through">{formatter.format(originalPrice!)}</span>
      )}
      <div className="flex items-baseline gap-2">
        <span className={`font-mono font-bold text-text ${sizeClass}`}>{formatter.format(price)}</span>
        {discountPct != null && discountPct > 0 && (
          <span className="rounded-md bg-red/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-red-soft">
            -{discountPct}%
          </span>
        )}
      </div>
    </div>
  );
}
