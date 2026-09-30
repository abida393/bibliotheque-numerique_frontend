import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { usePaginated } from '@/lib/hooks'
import { Pagination } from '@/components/pagination'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { DocumentIcon } from '@/components/document-icon'

function RejectModal({ onConfirm, onCancel }) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    if (!comment.trim()) { setErr('Un commentaire est requis.'); return }
    setLoading(true)
    await onConfirm(comment)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="reject-modal-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
      >
        <h2 id="reject-modal-title" className="mb-2 text-base font-semibold text-foreground">Motif du refus</h2>
        <p className="mb-4 text-sm text-muted-foreground">Indiquez la raison du refus. Elle sera visible par le contributeur.</p>
        <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} autoFocus
          placeholder="Ce document ne respecte pas les critères de qualité…" />
        {err && <p className="mt-1.5 text-xs text-destructive">{err}</p>}
        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={onCancel} disabled={loading}>Annuler</Button>
          <Button variant="destructive" size="lg" className="flex-1 bg-destructive/80 hover:bg-destructive text-white" onClick={submit} disabled={loading}>
            {loading ? 'Envoi…' : 'Confirmer le refus'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminModerationPage() {
  const [page, setPage] = useState(1)
  const { items, meta, loading, error, refetch } = usePaginated('/contribution-requests', { page })
  const [localItems, setLocalItems] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [validating, setValidating] = useState(null)

  const displayed = localItems ?? items

  async function validate(id) {
    if (!confirm('Valider et publier ce document ?')) return
    setValidating(id)
    try {
      await api.post(`/contribution-requests/${id}/validate`)
      setLocalItems(prev => (prev ?? items).filter(r => r.id !== id))
      toast.success('Document validé et publié.')
    } catch (err) {
      toast.error(err.message ?? 'Erreur lors de la validation.')
    } finally {
      setValidating(null)
    }
  }

  async function reject(id, comment) {
    try {
      await api.post(`/contribution-requests/${id}/reject`, { comment })
      setLocalItems(prev => (prev ?? items).filter(r => r.id !== id))
      toast.success('Contribution refusée.')
    } catch (err) {
      toast.error(err.message ?? 'Erreur lors du refus.')
    } finally {
      setRejectTarget(null)
    }
  }

  return (
    <>
      {rejectTarget && (
        <RejectModal
          onConfirm={comment => reject(rejectTarget, comment)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <Shield className="size-6 text-primary" /> Modération
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {displayed.length} demande{displayed.length > 1 ? 's' : ''} en attente de validation.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner className="size-8" /></div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={refetch} className="mt-3 text-sm text-primary hover:underline">Réessayer</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="size-7" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Tout est à jour !</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Aucune contribution en attente de modération.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {displayed.map(cr => (
              <li key={cr.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <DocumentIcon type={cr.resource?.type ?? 'autre'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {cr.resource?.category && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                          {cr.resource.category.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Soumis le {new Date(cr.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <Link to={`/ressources/${cr.resource?.id}`}
                      className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {cr.resource?.title ?? 'Document'}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Par {cr.resource?.author_user?.name ?? cr.resource?.authors ?? '—'} · {cr.resource?.language ?? ''}
                    </p>
                    {cr.resource?.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{cr.resource.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" className="gap-1.5" onClick={() => validate(cr.id)} disabled={validating === cr.id}>
                      <CheckCircle className="size-3.5" /> {validating === cr.id ? 'Validation…' : 'Valider'}
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={() => setRejectTarget(cr.id)}>
                      <XCircle className="size-3.5" /> Refuser
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && (meta?.last_page ?? 1) > 1 && (
          <div className="mt-10">
            <Pagination page={page} totalPages={meta.last_page}
              onPageChange={p => { setPage(p); setLocalItems(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </div>
        )}
      </main>
    </>
  )
}
