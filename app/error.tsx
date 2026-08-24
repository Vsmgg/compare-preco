"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red/10 text-red-soft">
            <AlertTriangle size={26} />
          </span>
          <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wide text-red-soft">Algo deu errado</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Não foi possível carregar esta página
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Foi um erro no nosso lado, não um problema com sua busca. Tente novamente em instantes.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-soft"
            >
              <RotateCw size={15} />
              Tentar de novo
            </button>
            <Link
              href="/"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-red/40"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
