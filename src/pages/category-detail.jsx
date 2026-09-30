import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Folder, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { ResourceCard } from '@/components/resource-card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { usePaginated } from '@/lib/hooks'
import { Pagination } from '@/components/pagination'

export function CategoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const { items: resources, meta, loading: loadingRes } = usePaginated('/resources', { category_id: id, per_page: 20, page })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(`/categories/${id}`)
        setCategory(res.data)
      } catch (err) {
        setError(err.message ?? 'Erreur lors du chargement de la catégorie.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-32">
      <Spinner className="size-8" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="text-destructive mb-4">{error}</p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="size-4" /> Retour
        </Button>
      </div>
    </div>
  )

  if (!category) return null

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Retour
      </button>

      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Folder className="size-5" />
          </span>
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Explorez les ressources de cette catégorie.</p>
      </div>

      {category.children?.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Sous-catégories</h2>
          <div className="flex flex-wrap gap-2">
            {category.children.map(child => (
              <Link
                key={child.id}
                to={`/categories/${child.id}`}
                className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Ressources ({meta?.total ?? 0})</h2>
        
        {loadingRes ? (
          <div className="flex justify-center py-16"><Spinner className="size-6" /></div>
        ) : !resources || resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Folder className="size-7" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">Aucune ressource</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Cette catégorie ne contient pas encore de documents validés.</p>
            <button onClick={() => navigate(-1)} className="mt-5 text-sm font-medium text-primary hover:underline">
              Retour
            </button>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map(resource => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
            {(meta?.last_page ?? 1) > 1 && (
              <div className="mt-10">
                <Pagination page={page} totalPages={meta.last_page} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
