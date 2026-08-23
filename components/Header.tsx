"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Comparar" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#como-funciona", label: "Como funciona" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Compare Preço, início">
          <Image src="/logo.png" alt="Compare Preço" width={168} height={75} priority className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text transition-colors hover:border-red hover:text-red">
            Entrar
          </button>
        </div>

        <button
          className="text-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button className="mt-2 rounded-full border border-border px-5 py-2 text-left text-sm font-medium text-text">
              Entrar
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
