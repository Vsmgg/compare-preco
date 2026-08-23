"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PricePoint {
  price: number;
  capturedAt: string;
}

const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PriceChart({ history }: { history: PricePoint[] }) {
  if (history.length < 2) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-semibold text-text">Histórico de preço</h3>
        <p className="mt-3 text-sm text-text-muted">
          Ainda não temos dados suficientes para mostrar a evolução de preço desta oferta. Voltamos a checar em
          buscas futuras.
        </p>
      </div>
    );
  }

  const prices = history.map((h) => h.price);
  const current = prices[prices.length - 1];
  const min = Math.min(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variation = ((current - avg) / avg) * 100;

  const data = history.map((h) => ({
    date: new Date(h.capturedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    price: h.price,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-sm font-semibold text-text">Histórico de preço</h3>

      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} width={70} />
            <Tooltip
              formatter={(value) => currency(Number(value))}
              contentStyle={{
                background: "var(--color-card-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="price" stroke="var(--color-red)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
        <div>
          <p className="text-[11px] text-text-muted">Preço atual</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-text">{currency(current)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Menor já registrado</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-text">{currency(min)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Variação vs. média</p>
          <p
            className={`mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-semibold ${
              variation <= 0 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {variation <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {Math.abs(variation).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
