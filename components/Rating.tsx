import { Star } from "lucide-react";

export function Rating({
  rating,
  reviewCount,
  size = 14,
}: {
  rating: number | null;
  reviewCount: number | null;
  size?: number;
}) {
  if (rating == null) {
    return <span className="text-xs text-text-muted">Avaliação não encontrada</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-red text-red" : "fill-transparent text-border"}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-text">{rating.toFixed(1)}</span>
      {reviewCount != null && (
        <span className="text-xs text-text-muted">
          ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
        </span>
      )}
    </div>
  );
}
