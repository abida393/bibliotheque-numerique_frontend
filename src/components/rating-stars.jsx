import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({ rating = 0, reviews }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Note moyenne : ${(rating ?? 0).toFixed(1)} sur 5`}
    >
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating)
          return (
            <Star
              key={i}
              className={cn(
                "size-3.5",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          )
        })}
      </div>
      <span className="text-xs font-medium text-foreground">
        {(rating ?? 0).toFixed(1)}
      </span>
      {typeof reviews === "number" && (
        <span className="text-xs text-muted-foreground">({reviews})</span>
      )}
    </div>
  )
}
