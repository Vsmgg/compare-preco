import Image from "next/image";
import { BadgeCheck, ExternalLink, ImageOff } from "lucide-react";
import type { FeaturedDeal } from "@/lib/deals";
import { trustLabel } from "@/lib/scoring";
import { formatRelativeTime } from "@/lib/format";
import { PriceDisplay } from "./PriceDisplay";
import { Rating } from "./Rating";
import { StoreBadge } from "./StoreBadge";
import { OfferBadge } from "./OfferBadge";

export function DealCard({ deal }: { deal: FeaturedDeal }) {
  const label = trustLabel({ store: deal.store, reviewCount: deal.reviewCount, rating: deal.rating });
  const verifiedAgo = formatRelativeTime(deal.verifiedAt);

  return (
    <a
      href={deal.productUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red/30 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-card-secondary">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            width={200}
            height={200}
            className="h-full w-full object-contain p-3"
            unoptimized
          />
        ) : (
          <ImageOff size={20} className="text-text-muted" />
        )}
        <span className="absolute right-2 top-2 rounded-full bg-red px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-sm">
          -{deal.discountPercent}%
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StoreBadge store={deal.store} trustLabel={label} />
        {deal.availability === false && <OfferBadge label="Indisponível" />}
      </div>

      <p className="line-clamp-2 min-h-10 text-sm font-medium text-text">{deal.title}</p>

      <Rating rating={deal.rating} reviewCount={deal.reviewCount} />

      <div className="flex items-end justify-between gap-2 pt-1">
        <PriceDisplay price={deal.price} originalPrice={deal.originalPrice} size="sm" />
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-soft transition-transform group-hover:translate-x-0.5">
          Ver oferta
          <ExternalLink size={12} />
        </span>
      </div>

      {verifiedAgo && (
        <div className="flex items-center gap-1.5 border-t border-border pt-2.5 text-[11px] text-text-muted">
          <BadgeCheck size={13} className="shrink-0 text-emerald-400" />
          <span>
            Preço e desconto confirmados na loja <span className="text-text-muted/80">· verificado {verifiedAgo}</span>
          </span>
        </div>
      )}
    </a>
  );
}
