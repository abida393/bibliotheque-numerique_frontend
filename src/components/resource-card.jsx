import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { DocumentIcon } from '@/components/document-icon'
import { RatingStars } from '@/components/rating-stars'
import { FavoriteButton } from '@/components/favorite-button'
import { useFavorites } from '@/contexts/favorites-context'

export function ResourceCard({ resource }) {
  const { ids, toggle } = useFavorites()
  const isFavorite = ids.has(resource.id)

  const categoryName = resource.category?.name ?? resource.category ?? '—'
  const authors      = resource.authors ?? resource.author ?? '—'
  const rating       = resource.average_rating ?? resource.rating ?? 0
  const reviewCount  = resource.reviews_count  ?? resource.reviews ?? 0
  const year         = resource.publication_date
    ? new Date(resource.publication_date).getFullYear()
    : resource.created_at
      ? new Date(resource.created_at).getFullYear()
      : resource.year ?? '—'

  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DocumentIcon type={resource.type} />
          {resource.category && (
            <Link 
              to={`/categories/${resource.category.id ?? resource.category}`}
              className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground hover:bg-accent/80 transition-colors"
            >
              {categoryName}
            </Link>
          )}
        </div>
        <FavoriteButton
          active={isFavorite}
          onToggle={() => toggle(resource.id)}
          label={resource.title}
        />
      </div>

      <Link to={`/ressources/${resource.id}`} className="flex-1">
        <h3 className="mt-4 text-base leading-snug font-semibold text-balance text-card-foreground group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {authors} · {year}
        </p>

        {rating > 0 && (
          <div className="mt-3">
            <RatingStars rating={rating} reviews={reviewCount} />
          </div>
        )}

        {resource.description && (
          <div className="mt-4 rounded-lg bg-muted/60 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Description
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {resource.description}
            </p>
          </div>
        )}
      </Link>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
        <span>{resource.language ?? '—'}</span>
        {resource.status && resource.status !== 'validated' && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            resource.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {resource.status === 'pending' ? 'En attente' : 'Rejeté'}
          </span>
        )}
      </div>
    </article>
  )
}
