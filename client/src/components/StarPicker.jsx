import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive star picker — controlled component.
 * Props:
 *   value    : number 1–5 (current selected rating)
 *   onChange : (rating: number) => void
 *   size     : "sm" | "md" | "lg"  (default "md")
 */
export default function StarPicker({ value = 0, onChange, size = "md" }) {
  const [hovered, setHovered] = useState(0);

  const starSize = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  }[size];

  const display = hovered || value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={cn(
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
            display >= star
              ? "text-amber-400 scale-110 drop-shadow-sm"
              : "text-muted-foreground hover:text-amber-300",
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
        >
          <Star
            className={cn(
              starSize,
              "transition-all duration-150",
              display >= star ? "fill-current" : "",
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground min-w-[3rem]">
        {display > 0 ? `${display} / 5` : "Rate it"}
      </span>
    </div>
  );
}
