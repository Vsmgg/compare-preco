"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ImageOff } from "lucide-react";
import type { ScoredOffer } from "@/lib/types";
import { PriceDisplay } from "./PriceDisplay";
import { Rating } from "./Rating";
import { StoreBadge } from "./StoreBadge";
import { ShippingBadge } from "./ShippingBadge";
import { OfferBadge } from "./OfferBadge";

export function OfferCard({
  offer,
  searchId,
  selected,
  onToggleSelect,
  index = 0,
}: {
  offer: ScoredOffer;
  searchId?: string;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  index?: number;
}) {
  const href = `/api/go?offer=${offer.id}${searchId ? `&search=${searchId}` : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red/30 hover:shadow-lg hover:shadow-black/20 sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3 sm:items-center">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(offer.id)}
            className="mt-1.5 h-4 w-4 shrink-0 accent-red sm:mt-0"
            aria-label="Selecionar para comparar"
          />
        )}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card-secondary">
          {offer.imageUrl ? (
            <Image
              src={offer.imageUrl}
              alt={offer.title}
              width={96}
              height={96}
              className="h-full w-full object-contain p-1.5"
              unoptimized
            />
          ) : (
            <ImageOff size={18} className="text-text-muted" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-card-secondary px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
            #{offer.rank}
          </span>
          {offer.availability === false && <OfferBadge label="Indisponível" />}
          {offer.badges.map((b) => (
            <OfferBadge key={b} label={b} />
          ))}
        </div>
        <Link
          href={`/produto/${offer.id}`}
          className="line-clamp-1 text-sm font-medium text-text hover:text-red-soft"
        >
          {offer.title}
        </Link>
        <div className="mt-1.5">
          <StoreBadge store={offer.store} trustLabel={offer.trustLabel} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Rating rating={offer.rating} reviewCount={offer.reviewCount} />
          <ShippingBadge shippingDate={offer.shippingDate} shippingPrice={offer.shippingPrice} />
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <div className="flex items-center gap-3">
          <span
            className="flex flex-col items-center font-mono text-xs text-text-muted"
            title="Índice Compare: combina preço, avaliação, confiabilidade e entrega"
          >
            <span className="font-semibold text-text">{Math.round(offer.score)}</span>
            <span className="text-[9px] uppercase tracking-wide">índice</span>
          </span>
          <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="sm" />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text transition-colors hover:border-red hover:text-red-soft"
        >
          Ver oferta
          <ExternalLink size={13} />
        </a>
      </div>
    </motion.div>
  );
}
