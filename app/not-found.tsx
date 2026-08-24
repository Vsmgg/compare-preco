import Link from "next/link";
import { Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card-secondary text-text-muted">
            <Compass size={26} />
          </span>
          <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wide text-red-soft">Erro 404</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Essa página não existe
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            O link pode estar quebrado ou a página pode ter sido movida. Volte para a busca e tente de novo.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-soft"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
