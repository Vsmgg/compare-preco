"use client";

import { Search, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "Pesquise por um produto...",
  "iPhone 17 Pro 256GB",
  "Notebook gamer até R$ 6.000",
  "TV Samsung 55 4K",
  "Honda Civic 2022",
  "Sofá retrátil 3 lugares",
];

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (value || focused) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % EXAMPLES.length);
    }, 2600);
    return () => clearInterval(id);
  }, [value, focused]);

  function submit() {
    const q = value.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="w-full">
      <div className="group relative flex items-center rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/40 transition-colors focus-within:border-red">
        <Search className="ml-3 shrink-0 text-text-muted" size={22} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={EXAMPLES[placeholderIndex]}
          className="focus-ring-inherit w-full bg-transparent px-3 py-3.5 text-base text-text placeholder:text-text-muted sm:text-lg"
          aria-label="O que você está procurando?"
        />
        <button
          onClick={submit}
          className="focus-ring-inherit flex shrink-0 items-center gap-2 rounded-xl bg-red px-4 py-3.5 text-sm font-semibold text-white transition-transform hover:bg-red-soft active:scale-95 sm:px-6"
        >
          <span className="hidden sm:inline">Comparar preços</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
