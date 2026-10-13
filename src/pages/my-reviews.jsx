import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, FileText, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { usePaginated } from '@/lib/hooks'
import { Pagination } from '@/components/pagination'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

function RatingStars({ rating }) {
  return (
    <div className="flex text-amber-500" aria-label={`Note de ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < rating ? 'fill-current' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function MyReviewsPage() {
  const [page, setPage] = useState(1)
  const { items, meta, loading, error, refetch } = usePaginated('/my-reviews', { page })

  async function deleteReview(id) {
    const result = await MySwal.fire({
      title: 'Supprimer cet avis ?',
      text: "Cette action est irréversible. Voulez-vous continuer ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border border-border bg-background text-foreground shadow-xl',
        title: 'text-xl font-bold text-foreground',
        htmlContainer: 'text-muted-foreground mt-2',
        actions: 'flex gap-3 mt-6',
        confirmButton: 'inline-flex items-center justify-center rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors',
        cancelButton: 'inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors'
      }
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Avis supprimé avec succès.')
      refetch()
    } catch (err) {
      toast.error(err.message ?? "Erreur lors de la suppression de l'avis.")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <MessageSquare className="size-6 text-amber-500" /> Mes avis
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Consultez et gérez les avis que vous avez laissés sur les ressources.</p>
        </div>
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
            <MessageSquare className="size-7" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Aucun avis</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Vous n'avez pas encore commenté ou noté de documents.</p>
          <ButtonLink to="/" size="lg" className="mt-5">Parcourir le catalogue</ButtonLink>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {items.map(review => (
              <li key={review.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <RatingStars rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {review.resource ? (
                      <Link 
                        to={`/ressources/${review.resource.id}`} 
                        className="inline-flex items-center gap-1.5 text-base font-semibold text-foreground hover:text-primary transition-colors mb-2"
                      >
                        <FileText className="size-4" />
                        {review.resource.title}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-base font-semibold text-muted-foreground mb-2">
                        <FileText className="size-4" />
                        Ressource supprimée
                      </span>
                    )}

                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2 italic bg-muted/30 p-3 rounded-lg border border-border/50">
                        "{review.comment}"
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <Button 
                      onClick={() => deleteReview(review.id)} 
                      variant="destructive" 
                      size="sm" 
                      className="gap-1.5 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 w-full sm:w-auto"
                    >
                      <Trash2 className="size-3.5" /> Supprimer
                    </Button>
                  </div>
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
