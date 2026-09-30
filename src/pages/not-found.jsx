
import { BookOpen, ArrowLeft } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <span className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <BookOpen className="size-8" aria-hidden="true" />
      </span>
      <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-3 text-lg font-medium text-foreground">Page introuvable</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <ButtonLink to="/" size="lg" className="mt-8 gap-2">
        <ArrowLeft className="size-4" />
        Retour au catalogue
      </ButtonLink>
    </div>
  )
}
