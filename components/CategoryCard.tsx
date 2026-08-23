"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function CategoryCard({
  icon: Icon,
  label,
  query,
}: {
  icon: LucideIcon;
  label: string;
  query: string;
}) {
  return (
    <Link
      href={`/buscar?q=${encodeURIComponent(query)}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-6 text-center transition-all hover:-translate-y-1 hover:border-red/60 hover:bg-card-secondary"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-secondary text-text-muted transition-colors group-hover:bg-red/15 group-hover:text-red-soft">
        <Icon size={22} />
      </span>
      <span className="text-sm font-medium text-text">{label}</span>
    </Link>
  );
}
