import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { usePaginated } from '@/lib/hooks'
import { Pagination } from '@/components/pagination'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { cn } from '@/lib/utils'

function StatusBadge({ status }) {
  const map = {
    validated: { icon: CheckCircle, label: 'Validé',     cls: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
    pending:   { icon: Clock,        label: 'En attente', cls: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' },
    rejected:  { icon: XCircle,      label: 'Rejeté',     cls: 'text-red-600   bg-red-100   dark:text-red-400   dark:bg-red-900/30' },
  }
  const { icon: Icon, label, cls } = map[status] ?? { icon: Clock, label: status, cls: 'text-muted-foreground bg-muted' }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      <Icon className="size-3" />
      {label}
    </span>
  )
}

export function MyContributionsPage() {
  const [page, setPage] = useState(1)
  const { items, meta, loading, error, refetch } = usePaginated('/my-contributions', { page })
  const navigate = useNavigate()
  
  async function deleteResource(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette contribution ?')) return
    try {
      await api.delete(`/resources/${id}`)
      toast.success('Contribution supprimée.')
      refetch()
    } catch (err) {
      toast.error(err.message ?? 'Erreur lors de la suppression.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <ClipboardList className="size-6 text-primary" /> Mes contributions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Suivez l'état de vos documents soumis à la bibliothèque.</p>
        </div>
        <ButtonLink to="/contribuer" size="lg" className="shrink-0 gap-2">
          <Plus className="size-4" /> Soumettre un document
        </ButtonLink>
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
            <ClipboardList className="size-7" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Aucune contribution</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Partagez vos documents avec la communauté universitaire.</p>
          <ButtonLink to="/contribuer" size="lg" className="mt-5 gap-2">
            <Plus className="size-4" /> Soumettre mon premier document
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map(cr => (
              <li key={cr.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <StatusBadge status={cr.status} />
                      {cr.resource?.category && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                          {cr.resource.category.name}
                        </span>
                      )}
                    </div>
                    {cr.resource?.id ? (
                      <Link to={`/ressources/${cr.resource.id}`} className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {cr.resource.title}
                      </Link>
                    ) : (
                      <span className="text-base font-semibold text-muted-foreground line-clamp-1">Document supprimé</span>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Soumis le {new Date(cr.created_at).toLocaleDateString('fr-FR')}
                      {cr.processed_at && ` · Traité le ${new Date(cr.processed_at).toLocaleDateString('fr-FR')}`}
                      {cr.moderator && ` par ${cr.moderator.name}`}
                    </p>
                      {cr.comment && (
                        <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          <strong>Motif du refus :</strong> {cr.comment}
                        </div>
                      )}
                    </div>
                    {cr.status === 'pending' && cr.resource?.id && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button onClick={() => navigate(`/ressources/${cr.resource.id}/modifier`)} variant="outline" size="sm" className="gap-1.5 h-8">
                          <Edit className="size-3.5" /> Modifier
                        </Button>
                        <Button onClick={() => deleteResource(cr.resource.id)} variant="destructive" size="sm" className="gap-1.5 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20">
                          <Trash2 className="size-3.5" /> Supprimer
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
            ))}
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
