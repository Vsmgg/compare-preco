"use client";

import {
  Smartphone,
  Laptop,
  Home as HomeIcon,
  Car,
  Bike,
  Gamepad2,
  Shirt,
  Camera,
  Wrench,
  Search,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { ParticleBackground } from "@/components/ParticleBackground";

const CATEGORIES = [
  { icon: Smartphone, label: "Eletrônicos", query: "eletrônicos" },
  { icon: Laptop, label: "Informática", query: "notebook" },
  { icon: HomeIcon, label: "Casa", query: "casa e decoração" },
  { icon: Car, label: "Carros", query: "carro seminovo" },
  { icon: Bike, label: "Motos", query: "moto" },
  { icon: Gamepad2, label: "Games", query: "console de videogame" },
  { icon: Shirt, label: "Moda", query: "tênis esportivo" },
  { icon: Camera, label: "Câmeras", query: "câmera fotográfica" },
  { icon: Wrench, label: "Ferramentas", query: "furadeira" },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "Você pesquisa",
    text: "Digite qualquer produto, marca ou intenção de compra — do jeito que você fala.",
  },
  {
    icon: Sparkles,
    title: "A IA compara",
    text: "Buscamos ofertas reais na web, coletamos preço, avaliação, frete e prazo, e rankeamos tudo.",
  },
  {
    icon: Truck,
    title: "Você escolhe melhor",
    text: "Veja a melhor opção, o menor preço e a entrega mais rápida — e vá direto para o anúncio.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <ParticleBackground />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-red/20 blur-[140px]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-text-muted">
              <Sparkles size={13} className="text-red-soft" />
              Você procura. A IA compara. Você escolhe melhor.
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-6xl">
              Compare <span className="text-gradient-red">antes</span> de comprar.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-text-muted sm:text-lg">
              A IA pesquisa a internet, compara preços, avaliações, entrega e confiabilidade para
              encontrar as melhores opções para você.
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
              <SearchBar />
            </div>

            <p className="mt-4 text-xs text-text-muted">
              Sem cadastro. Resultados baseados em dados reais encontrados na web.
            </p>
          </div>
        </section>

        <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              O que você quer comparar?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c) => (
              <CategoryCard key={c.label} {...c} />
            ))}
          </div>
        </section>

        <section id="como-funciona" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">
              Como o Compare Preço funciona
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title} className="relative rounded-2xl border border-border bg-card p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red/15 text-red-soft">
                    <step.icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-text">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.text}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border sm:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-red-soft" /> Nunca fabricamos dados
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-red-soft" /> Link direto para a loja original
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-red-soft" /> Ranking explicado pela IA
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
