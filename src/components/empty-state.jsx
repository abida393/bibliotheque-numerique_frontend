import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">
        Aucune ressource trouvée
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Aucun document ne correspond à votre recherche ou à vos filtres.
        Essayez d'élargir vos critères ou de réinitialiser les filtres.
      </p>
      <Button size="lg" className="mt-5" onClick={onReset}>
        Réinitialiser la recherche
      </Button>
    </div>
  )
}
