import type { Metadata } from "next";
import { Flame, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DealCard } from "@/components/DealCard";
import { loadDealsIntro, loadFeaturedDeals } from "@/lib/dealsStore";
import type { FeaturedDeal } from "@/lib/deals";

export const metadata: Metadata = {
  title: "Destaques com desconto",
};

export const runtime = "nodejs";
// The DB read is cheap — always render fresh so newly verified deals (added
// by the cron job at any time) show up immediately instead of waiting for
// the next full rebuild of the app.
export const dynamic = "force-dynamic";

export default async function DestaquesPage() {
  let deals: FeaturedDeal[] = [];
  let intro = "";
  let failed = false;

  try {
    [deals, intro] = await Promise.all([loadFeaturedDeals(), loadDealsIntro()]);
  } catch (err) {
    console.error("Falha ao carregar destaques", err);
    failed = true;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-red-soft">
            <Flame size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Destaques de hoje</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Promoções em <span className="text-gradient-red">destaque</span> no Brasil
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">
            A IA vasculha a web em busca de descontos reais, de qualquer valor. Cada preço original é conferido
            diretamente na fonte antes de entrar aqui — sem estimativas, sem percentuais calculados.
          </p>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-text-muted">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>
              <span className="font-semibold text-text">Só mostramos o que conseguimos confirmar.</span> Se não há
              evidência clara de desconto na própria loja, o produto simplesmente não aparece — preferimos uma lista
              curta e correta a uma lista longa e incerta.
            </span>
          </div>

          {intro && (
            <p className="mt-5 max-w-2xl rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-text-muted">
              {intro}
            </p>
          )}

          {!failed && deals.length > 0 && (
            <>
              <p className="mt-8 text-xs font-medium uppercase tracking-wide text-text-muted">
                {deals.length} {deals.length === 1 ? "oferta verificada" : "ofertas verificadas"}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </>
          )}

          {!failed && deals.length === 0 && (
            <p className="mt-10 rounded-2xl border border-border bg-card p-6 text-center text-sm text-text-muted">
              Não encontramos nenhum desconto que pudéssemos confirmar no momento. Preferimos não mostrar nada a
              mostrar um preço ou promoção não verificados. Volte em breve.
            </p>
          )}

          {failed && (
            <p className="mt-10 rounded-2xl border border-border bg-card p-6 text-center text-sm text-text-muted">
              Não foi possível carregar os destaques agora. Tente novamente em instantes.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
