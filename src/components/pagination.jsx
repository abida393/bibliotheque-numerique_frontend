"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  
  const pages = []
  // Always show first
  pages.push(1)
  
  if (current > 4) pages.push('...')
  
  // Show pages around current
  const start = Math.max(2, current - 2)
  const end   = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  
  if (current < total - 3) pages.push('...')
  
  // Always show last
  pages.push(total)
  
  return pages
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = getPageRange(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Page précédente"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="inline-flex size-9 items-center justify-center text-muted-foreground">
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Page suivante"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
