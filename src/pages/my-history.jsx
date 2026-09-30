import { ResourceCard } from '@/components/resource-card'
import { Pagination } from '@/components/pagination'
import { Spinner } from '@/components/ui/spinner'
import { ButtonLink } from '@/components/ui/button-link'
import { History } from 'lucide-react'
import { usePaginated } from '@/lib/hooks'
import { useState } from 'react'

export function MyHistoryPage() {
  const [page, setPage] = useState(1)
  const { items, meta, loading, error, refetch } = usePaginated('/my-history', { page })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <History className="size-6 text-primary" /> Mon historique
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Les ressources que vous avez consultées récemment.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="size-8" /></div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-destructive text-sm">{error}</p>
          <button onClick={refetch} className="mt-3 text-sm text-primary hover:underline">Réessayer</button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <History className="size-7" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Historique vide</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Ouvrez des documents pour les retrouver ici.</p>
          <ButtonLink to="/" size="lg" className="mt-5">Parcourir le catalogue</ButtonLink>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Use index in key to handle duplicate resource visits */}
            {items.filter(Boolean).map((r, i) => <li key={`${r.id}-${i}`}><ResourceCard resource={r} /></li>)}
          </ul>
          {(meta?.last_page ?? 1) > 1 && (
            <div className="mt-10">
              <Pagination page={page} totalPages={meta.last_page}
                onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>
          )}
        </>
      )}
    </main>
  )
}
