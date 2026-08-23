import Image from "next/image";

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
        <p className="mt-8 text-center text-xs leading-relaxed text-text-muted/70 sm:text-left">
          O Compare Preço pesquisa ofertas reais na web e nunca fabrica preço, avaliação, prazo ou disponibilidade.
          Quando um dado não é encontrado, mostramos “Não informado”. Os links de oferta redirecionam diretamente
          para o anúncio original na loja.
        </p>
      </div>
    </footer>
  );
}
