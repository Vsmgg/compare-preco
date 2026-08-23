"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { Rating } from "./Rating";

export interface CompareOffer {
  id: string;
  title: string;
  store: string;
  price: number | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  shippingDate: string | null;
  shippingPrice: number | null;
  condition: string | null;
  availability: boolean | null;
  score: number | null;
  trustLabel: string;
}

const currency = (v: number | null) =>
  v != null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Não informado";

export function ComparisonTable({ offers }: { offers: CompareOffer[] }) {
  const bestId = [...offers].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))[0]?.id;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-card-secondary">
            <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              &nbsp;
            </th>
            {offers.map((o) => (
              <th key={o.id} className="min-w-[180px] px-4 py-4 text-left">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-card">
                  {o.imageUrl ? (
                    <Image
                      src={o.imageUrl}
                      alt={o.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <ImageOff size={16} className="text-text-muted" />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-medium text-text">{o.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {o.id === bestId && (
                    <span className="inline-block rounded-full bg-red px-2 py-0.5 text-[10px] font-semibold text-white">
                      Recomendado
                    </span>
                  )}
                  {o.availability === false && (
                    <span className="inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      Indisponível
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Loja" values={offers.map((o) => o.store)} />
          <Row label="Preço" values={offers.map((o) => currency(o.price))} highlightMin={offers.map((o) => o.price)} />
          <Row
            label="Avaliação"
            values={offers.map((o) => (
              <Rating key={o.id} rating={o.rating} reviewCount={null} />
            ))}
          />
          <Row label="Avaliações" values={offers.map((o) => (o.reviewCount != null ? o.reviewCount : "Não informado"))} />
          <Row label="Entrega" values={offers.map((o) => o.shippingDate ?? "Não informado")} />
          <Row
            label="Frete"
            values={offers.map((o) => (o.shippingPrice === 0 ? "Grátis" : o.shippingPrice != null ? currency(o.shippingPrice) : "Não informado"))}
          />
          <Row label="Condição" values={offers.map((o) => o.condition ?? "Não informado")} />
          <Row label="Disponibilidade" values={offers.map((o) => (o.availability === false ? "Indisponível" : "Disponível"))} />
          <Row label="Confiabilidade" values={offers.map((o) => o.trustLabel)} />
          <Row
            label="Índice Compare"
            values={offers.map((o) => (o.score != null ? Math.round(o.score) : "—"))}
            bold
          />
          <tr>
            <td className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">Oferta</td>
            {offers.map((o) => (
              <td key={o.id} className="px-4 py-4">
                <a
                  href={`/api/go?offer=${o.id}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:border-red hover:text-red-soft"
                >
                  Ver oferta <ExternalLink size={12} />
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  values,
  highlightMin,
  bold,
}: {
  label: string;
  values: ReactNode[];
  highlightMin?: (number | null)[];
  bold?: boolean;
}) {
  const minValue = highlightMin ? Math.min(...highlightMin.filter((v): v is number => v != null)) : null;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-4 py-3 text-text ${bold ? "font-mono font-bold" : ""} ${
            highlightMin && highlightMin[i] === minValue && minValue != null ? "font-semibold text-emerald-400" : ""
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}
