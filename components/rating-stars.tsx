import { Star } from "lucide-react";

export function RatingStars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-sm text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          className={index < Math.round(rating) ? "fill-amber-400" : "text-slate-300"}
        />
      ))}
      <span className="ml-1 text-slate-500">{rating.toFixed(1)}{count !== undefined ? ` (${count})` : ""}</span>
    </div>
  );
}
