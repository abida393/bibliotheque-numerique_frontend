import { Spinner } from '@/components/ui/spinner'

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <span className="text-2xl font-semibold text-foreground">Biblia</span>
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
