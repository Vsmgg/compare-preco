"use client";

import { motion } from "framer-motion";

function qualLabel(score: number) {
  if (score >= 85) return "Excelente compra";
  if (score >= 70) return "Boa compra";
  if (score >= 50) return "Compra razoável";
  return "Avalie com atenção";
}

export function ScoreGauge({
  score,
  size = 96,
  showLabel = true,
}: {
  score: number;
  size?: number;
  showLabel?: boolean;
}) {
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#score-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-red-soft)" />
              <stop offset="100%" stopColor="var(--color-red)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-text sm:text-2xl">{Math.round(clamped)}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-center text-xs font-medium text-text-muted">
          Índice Compare · {qualLabel(clamped)}
        </span>
      )}
    </div>
  );
}
