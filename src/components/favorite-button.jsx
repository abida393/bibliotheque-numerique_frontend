"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export function FavoriteButton({ active, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={
        active
          ? `Retirer « ${label} » des favoris`
          : `Ajouter « ${label} » aux favoris`
      }
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors outline-none",
        "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "text-red-500" : "text-muted-foreground",
      )}
    >
      <Heart
        className={cn("size-4.5 transition-all", active && "fill-red-500")}
        aria-hidden="true"
      />
    </button>
  )
}
