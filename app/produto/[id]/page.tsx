import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ImageOff } from "lucide-react";
import { sql } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Rating } from "@/components/Rating";
import { StoreBadge } from "@/components/StoreBadge";
import { ShippingBadge } from "@/components/ShippingBadge";
import { PriceChart } from "@/components/PriceChart";
import { OfferBadge } from "@/components/OfferBadge";
import { trustLabel as computeTrustLabel } from "@/lib/scoring";
import type { Condition } from "@/lib/types";

export const runtime = "nodejs";

interface OfferRow {
  id: string;
  product_id: string;
  store: string;
  title: string;
  price: string | null;
  original_price: string | null;
  image_url: string | null;
  product_url: string;
  rating: string | null;
  review_count: number | null;
  shipping_price: string | null;
  shipping_date: string | null;
  availability: boolean | null;
  condition: Condition;
  score: string | null;
  rank: number | null;
}

const getData = cache(async (id: string) => {
  const offerRows = await sql`SELECT * FROM offers WHERE id = ${id}`;
  const offer = offerRows[0] as OfferRow | undefined;
  if (!offer) return null;

  const siblings = (await sql`
    SELECT o.*, sr.score, sr.rank
    FROM offers o
    LEFT JOIN search_results sr ON sr.offer_id = o.id
    WHERE o.product_id = ${offer.product_id}
    ORDER BY o.price ASC NULLS LAST
  `) as OfferRow[];

  const history = (await sql`
    SELECT price, captured_at FROM price_history WHERE offer_id = ${id} ORDER BY captured_at ASC
  `) as { price: string; captured_at: string }[];

  const productRows = await sql`SELECT * FROM products WHERE id = ${offer.product_id}`;

  return { offer, siblings, history, product: productRows[0] };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return {};

  const { offer } = data;
  return {
    title: offer.title,
    description: `Compare o preço de "${offer.title}" na ${offer.store} com outras lojas e veja o histórico de preço.`,
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { offer, siblings, history, product } = data;
  const price = offer.price != null ? parseFloat(offer.price) : null;
  const originalPrice = offer.original_price != null ? parseFloat(offer.original_price) : null;
  const rating = offer.rating != null ? parseFloat(offer.rating) : null;
  const label = computeTrustLabel({
    store: offer.store,
    reviewCount: offer.review_count,
    rating,
  });

  const otherOffers = siblings.filter((s) => s.id !== offer.id);
  const goHref = `/api/go?offer=${offer.id}`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/" className="text-xs text-text-muted hover:text-text">
            ← Voltar para a busca
          </Link>

          <div className="mt-4 grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card lg:h-auto">
              {offer.image_url ? (
                <Image
                  src={offer.image_url}
                  alt={offer.title}
                  width={320}
                  height={320}
                  className="h-full w-full object-contain p-6"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <ImageOff size={28} />
                  <span className="text-xs">Imagem não disponível</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StoreBadge store={offer.store} trustLabel={label} />
                {offer.availability === false && <OfferBadge label="Indisponível" />}
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">{offer.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Rating rating={rating} reviewCount={offer.review_count} />
                <ShippingBadge
                  shippingDate={offer.shipping_date}
                  shippingPrice={offer.shipping_price != null ? parseFloat(offer.shipping_price) : null}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                <div>
                  <p className="mb-1.5 text-xs text-text-muted">Preço nesta loja</p>
                  <PriceDisplay price={price} originalPrice={originalPrice} size="lg" />
                </div>
                <a
                  href={goHref}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-2 rounded-xl bg-red px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-soft"
                >
                  Comprar
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <PriceChart
              history={history.map((h) => ({ price: parseFloat(h.price), capturedAt: h.captured_at }))}
            />

            {otherOffers.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-sm font-semibold text-text">
                  Outras ofertas para {product?.name ?? "este produto"}
                </h3>
                <div className="mt-4 space-y-3">
                  {otherOffers.slice(0, 6).map((o) => (
                    <a
                      key={o.id}
                      href={`/api/go?offer=${o.id}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-red/30"
                    >
                      <span className="min-w-0 flex-1 truncate text-text-muted">{o.store}</span>
                      <span className="font-mono font-semibold text-text">
                        {o.price != null
                          ? parseFloat(o.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "Não informado"}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
