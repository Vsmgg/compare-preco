"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, ExternalLink, ImageOff } from "lucide-react";
import type { ScoredOffer } from "@/lib/types";
import { PriceDisplay } from "./PriceDisplay";
import { Rating } from "./Rating";
import { StoreBadge } from "./StoreBadge";
import { ShippingBadge } from "./ShippingBadge";
import { ScoreGauge } from "./ScoreGauge";

export function BestOfferCard({
  offer,
  searchId,
  reasoning,
}: {
  offer: ScoredOffer;
  searchId?: string;
  reasoning?: string;
}) {
  const href = `/api/go?offer=${offer.id}${searchId ? `&search=${searchId}` : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glow-red relative overflow-hidden rounded-3xl border border-red/30 bg-gradient-to-b from-card to-card-secondary"
    >
      <div className="flex items-center gap-2 border-b border-red/20 bg-red/10 px-5 py-3 sm:px-8">
        <Trophy size={16} className="text-red-soft" />
        <span className="text-sm font-semibold text-red-soft">Melhor opção</span>
      </div>

      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,220px)_1fr_auto] lg:items-center lg:gap-8">
        <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl bg-card-secondary sm:h-52 sm:w-52 lg:mx-0">
          {offer.imageUrl ? (
            <Image
              src={offer.imageUrl}
              alt={offer.title}
              width={280}
              height={280}
              className="h-full w-full object-contain p-3"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-muted">
              <ImageOff size={28} />
              <span className="text-[11px]">Imagem não disponível</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <StoreBadge store={offer.store} trustLabel={offer.trustLabel} />
          <h2 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold text-text sm:text-xl">
            {offer.title}
          </h2>
          <div className="mt-3">
            <Rating rating={offer.rating} reviewCount={offer.reviewCount} />
          </div>
          <div className="mt-3">
            <ShippingBadge shippingDate={offer.shippingDate} shippingPrice={offer.shippingPrice} />
          </div>
          <div className="mt-4">
            <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="lg" />
          </div>
          {reasoning && (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted">{reasoning}</p>
          )}
        </div>

        <div className="flex flex-row items-center justify-between gap-6 border-t border-border pt-6 lg:flex-col lg:border-t-0 lg:pt-0">
          <ScoreGauge score={offer.score} size={104} />
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:bg-red-soft active:scale-95 lg:w-auto"
          >
            Ver oferta
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
