import { useState, useEffect } from 'react'
import { tokenStorage } from '@/lib/api'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Download, Star, Heart, ArrowLeft, Sparkles, FileText, Calendar, Globe, Tag, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { useFavorites } from '@/contexts/favorites-context'
import { DocumentIcon } from '@/components/document-icon'
import { RatingStars } from '@/components/rating-stars'
import { ResourceQA } from '@/components/resource-qa'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function StatusBadge({ status }) {
  const map = {
    validated: { label: 'Validé',     cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    rejected:  { label: 'Rejeté',     cls: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>{label}</span>
}

function ReviewItem({ review, onDelete, currentUserId, isModerator }) {
  const canDelete = review.user?.id === currentUserId || isModerator
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {(review.user?.name ?? '?')[0].toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{review.user?.name ?? 'Anonyme'}</span>
          <RatingStars rating={review.rating} />
          <span className="ml-auto text-xs text-muted-foreground">{review.created_at}</span>
        </div>
        {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
        {canDelete && (
          <button onClick={() => onDelete(review.id)} className="mt-1 text-xs text-destructive hover:underline">
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}

export function ResourceDetail() {
  const { id } = useParams()
  const { user, isModerator } = useAuth()
  const { ids: favIds, toggle } = useFavorites()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const [reviewForm, setReviewForm]   = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [hasReviewed, setHasReviewed] = useState(false)

  const [downloading, setDownloading] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(`/resources/${id}`)
        setResource(res.data)
        const rev = await api.get(`/resources/${id}/reviews`)
        const revList = rev.data ?? []
        setReviews(revList)
        setHasReviewed(revList.some(r => r.user?.id === user?.id))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  async function handleDownload() {
    setDownloading(true)
    try {
      const token = tokenStorage.get()
      const resp = await fetch(`${BASE_URL}/api/resources/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok) throw new Error('Fichier introuvable')
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = resource?.title ?? 'document'
      a.click(); URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(e.message ?? 'Erreur lors du téléchargement.')
    } finally {
      setDownloading(false)
    }
  }

  async function handlePreview() {
    const newTab = window.open('about:blank', '_blank')
    if (!newTab) {
      alert("Veuillez autoriser les fenêtres contextuelles (pop-ups) pour prévisualiser ce document.")
      return
    }
    newTab.document.write("Chargement du document...")
    setPreviewing(true)
    try {
      const token = tokenStorage.get()
      const resp = await fetch(`${BASE_URL}/api/resources/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok) throw new Error('Fichier introuvable')
      
      const rawBlob = await resp.blob()
      let type = rawBlob.type
      if (resource?.type === 'pdf') type = 'application/pdf'
      
      const blob = new Blob([rawBlob], { type })
      const url = URL.createObjectURL(blob)
      newTab.location.href = url
      URL.revokeObjectURL(url)
    } catch (e) {
      newTab.close()
      toast.error(e.message ?? 'Erreur lors de la prévisualisation.')
    } finally {
      setPreviewing(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    setSubmitting(true)
    setReviewError('')
    try {
      const res = await api.post(`/resources/${id}/reviews`, reviewForm)
      setReviews(prev => {
        const newReviews = [res.data, ...prev]
        setResource(r => ({
          ...r,
          reviews_count: r.reviews_count + 1,
          average_rating: newReviews.reduce((acc, curr) => acc + curr.rating, 0) / newReviews.length
        }))
        return newReviews
      })
      setHasReviewed(true)
      toast.success('Votre avis a été publié.')
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm('Supprimer cet avis ?')) return
    await api.delete(`/reviews/${reviewId}`)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    if (reviews.find(r => r.id === reviewId)?.user?.id === user?.id) setHasReviewed(false)
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <Spinner className="size-8" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="text-destructive">{error}</p>
      <Button className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
    </div>
  )

  async function deleteResource() {
    if (!confirm('Voulez-vous vraiment supprimer ce document définitivement ?')) return
    try {
      await api.delete(`/resources/${id}`)
      toast.success('Document supprimé.')
      navigate(-1)
    } catch (err) {
      toast.error(err.message ?? 'Erreur lors de la suppression.')
    }
  }

  if (!resource) return null
  const isFav = favIds.has(resource.id)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Retour
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div>
          {/* Header */}
          <div className="flex items-start gap-4">
            <DocumentIcon type={resource.type} className="size-12 rounded-xl text-2xl" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {resource.category && (
                  <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    <Tag className="size-3 mr-1" />{resource.category.name}
                  </span>
                )}
                <StatusBadge status={resource.status} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {resource.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {resource.authors ?? '—'} · {resource.publication_date ?? resource.created_at}
              </p>
              {(resource.reviews_count > 0) && (
                <div className="mt-2">
                  <RatingStars rating={resource.average_rating ?? 0} reviews={resource.reviews_count} />
                </div>
              )}
            </div>
            {resource.status === 'validated' && (
              <button
                onClick={() => toggle(resource.id)}
                aria-pressed={isFav}
                aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={cn('shrink-0 inline-flex size-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:bg-muted', isFav ? 'text-red-500' : 'text-muted-foreground')}
              >
                <Heart className={cn('size-5 transition-all', isFav && 'fill-red-500')} />
              </button>
            )}
          </div>

          {/* Action buttons (Edit/Delete) */}
          {(isModerator || (user?.id === resource.author_user?.id && resource.status === 'pending')) && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate(`/ressources/${id}/modifier`)} variant="outline" size="sm" className="gap-1.5">
                <Edit className="size-3.5" /> Modifier
              </Button>
              <Button onClick={deleteResource} variant="destructive" size="sm" className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20">
                <Trash2 className="size-3.5" /> Supprimer
              </Button>
            </div>
          )}

          {/* Description */}
          {resource.description && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                <Sparkles className="size-4" /> Description
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
            </div>
          )}

          {/* AI Q&A */}
          {resource.status === 'validated' && (
            <ResourceQA resourceId={resource.id} />
          )}

          {/* Versions */}
          {resource.versions?.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-base font-semibold text-foreground">Versions</h2>
              <ul className="space-y-2">
                {resource.versions.map(v => (
                  <li key={v.id}>
                    <Link to={`/ressources/${v.id}`} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground hover:border-primary/30 transition-colors">
                      <FileText className="size-4 text-muted-foreground" />
                      {v.title}
                      <span className="ml-auto text-xs text-muted-foreground">{v.created_at}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews */}
          {resource.status === 'validated' && (
            <div className="mt-8">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Avis ({resource.reviews_count ?? reviews.length})
              </h2>

              {/* Add review */}
              {!hasReviewed && user?.id !== resource.author_user?.id && (
                <form onSubmit={submitReview} className="mb-6 rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-3 text-sm font-medium text-foreground">Laisser un avis</h3>
                  <div className="mb-3 flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                        className="text-amber-400 hover:scale-110 transition-transform"
                        aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>
                        <Star className={cn('size-6', n <= reviewForm.rating ? 'fill-amber-400' : 'fill-transparent')} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Partagez votre avis sur ce document… (facultatif)"
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3}
                  />
                  {reviewError && <p className="mt-2 text-xs text-destructive">{reviewError}</p>}
                  <Button type="submit" size="lg" className="mt-3" disabled={submitting}>
                    {submitting ? 'Envoi…' : 'Publier mon avis'}
                  </Button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun avis pour le moment. Soyez le premier !</p>
              ) : (
                <div className="rounded-xl border border-border bg-card px-5">
                  {reviews.map(r => (
                    <ReviewItem key={r.id} review={r} onDelete={deleteReview} currentUserId={user?.id} isModerator={isModerator} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Button className="w-full gap-2" size="lg" onClick={handleDownload} disabled={downloading}>
              <Download className="size-4" />
              {downloading ? 'Téléchargement…' : 'Télécharger'}
            </Button>
            <Button className="w-full gap-2" size="lg" variant="outline" onClick={handlePreview} disabled={previewing}>
              <Eye className="size-4" />
              {previewing ? 'Ouverture…' : 'Prévisualiser'}
            </Button>

            <dl className="space-y-3 text-sm">
              {resource.language && (
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">Langue</dt>
                  <dd className="ml-auto font-medium text-foreground">{resource.language}</dd>
                </div>
              )}
              {resource.publication_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">Publication</dt>
                  <dd className="ml-auto font-medium text-foreground">{resource.publication_date}</dd>
                </div>
              )}
              {resource.type && (
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="ml-auto font-medium text-foreground uppercase">{resource.type}</dd>
                </div>
              )}
            </dl>
          </div>

          {resource.parent_resource && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Version de</p>
              <Link to={`/ressources/${resource.parent_resource.id}`} className="text-sm font-medium text-primary hover:underline">
                {resource.parent_resource.title}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
