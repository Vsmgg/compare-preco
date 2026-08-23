import Image from "next/image";
import { ShieldCheck, Ban, Link as LinkIcon } from "lucide-react";

const TRUST_POINTS = [
  { icon: Ban, text: "Nunca inventamos preço, avaliação ou disponibilidade" },
  { icon: ShieldCheck, text: "Cada dado exibido veio de uma fonte real e verificável" },
  { icon: LinkIcon, text: "Link direto para o anúncio original na loja" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Image src="/logo.png" alt="Compare Preço" width={150} height={67} className="h-7 w-auto opacity-90" />
          <p className="text-center text-sm text-text-muted sm:text-right">
            Você procura. A IA compara. Você escolhe melhor.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-border py-5 sm:justify-start">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-text-muted">
              <Icon size={14} className="shrink-0 text-emerald-400" />
              {text}
            </span>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-text-muted/70 sm:text-left">
          O Compare Preço pesquisa ofertas reais na web e nunca fabrica preço, avaliação, prazo ou disponibilidade.
          Quando um dado não pode ser confirmado, mostramos “Não informado” em vez de arriscar um valor incorreto.
        </p>
      </div>
    </footer>
  );
}
