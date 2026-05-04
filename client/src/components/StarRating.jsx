import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({ value = 0, className }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={cn("flex items-center gap-0.5 text-amber-500", className)} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < full ? "fill-current" : i === full && half ? "fill-current opacity-60" : "text-muted-foreground"
          )}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({Number(value).toFixed(1)})</span>
    </div>
  );
}
