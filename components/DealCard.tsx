import Image from "next/image";
import { ExternalLink, ImageOff } from "lucide-react";
import type { FeaturedDeal } from "@/lib/deals";
import { trustLabel } from "@/lib/scoring";
import { PriceDisplay } from "./PriceDisplay";
import { Rating } from "./Rating";
import { StoreBadge } from "./StoreBadge";
import { OfferBadge } from "./OfferBadge";

export function DealCard({ deal }: { deal: FeaturedDeal }) {
  const label = trustLabel({ store: deal.store, reviewCount: deal.reviewCount, rating: deal.rating });

  return (
    <a
      href={deal.productUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-red/30"
    >
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-card-secondary">
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StoreBadge store={deal.store} trustLabel={label} />
        {deal.availability === false && <OfferBadge label="Indisponível" />}
      </div>

      <p className="line-clamp-2 min-h-10 text-sm font-medium text-text">{deal.title}</p>

      <Rating rating={deal.rating} reviewCount={deal.reviewCount} />

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <PriceDisplay price={deal.price} originalPrice={deal.originalPrice} size="sm" />
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-soft">
          Ver oferta
          <ExternalLink size={12} />
        </span>
      </div>
    </a>
  );
}
