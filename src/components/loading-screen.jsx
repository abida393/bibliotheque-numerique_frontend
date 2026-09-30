import { BookOpen } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <BookOpen className="size-6" />
      </span>
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
