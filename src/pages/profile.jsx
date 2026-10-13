import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  Clock3,
  FileText,
  Heart,
  Mail,
  Plus,
  Shield,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

function getRoleBadge(roles) {
  if (roles.includes('admin')) {
    return { label: 'Administrateur', className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', icon: ShieldCheck }
  }
  if (roles.includes('moderator')) {
    return { label: 'Modérateur', className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', icon: Shield }
  }
  return { label: 'Membre', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', icon: UserRound }
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-4 sm:px-6">
      <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none tabular-nums text-foreground">{value}</p>
        <p className="mt-1.5 truncate text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

const spaces = [
  {
    title: 'Mes contributions',
    description: 'Documents partagés et suivi de validation',
    to: '/mes-contributions',
    icon: FileText,
    tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  },
  {
    title: 'Mes favoris',
    description: 'Ressources enregistrées pour plus tard',
    to: '/favoris',
    icon: Heart,
    tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  },
  {
    title: 'Historique',
    description: 'Documents consultés récemment',
    to: '/historique',
    icon: Clock3,
    tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    title: 'Mes avis',
    description: 'Avis et notes laissés sur les ressources',
    to: '/mes-avis',
    icon: Star,
    tone: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  },
]

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const roleInfo = getRoleBadge(Array.isArray(user.roles) ? user.roles : [])
  const RoleIcon = roleInfo.icon

  return (
    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <BookOpen className="size-4 text-primary" aria-hidden="true" />
        <span>Bibliothèque</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Mon profil</span>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-2 bg-primary" aria-hidden="true" />
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="inline-flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-semibold text-primary ring-1 ring-primary/15 sm:size-20 sm:text-2xl">
              {getInitials(user.name) || <UserRound className="size-8" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Espace membre</p>
              <h1 className="mt-1 truncate text-2xl font-semibold text-foreground sm:text-3xl">{user.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{user.email ?? 'Adresse e-mail non renseignée'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 shrink-0" aria-hidden="true" />
                  {user.department ?? 'Département non renseigné'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
            <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold', roleInfo.className)}>
              <RoleIcon className="size-3.5" aria-hidden="true" />
              {roleInfo.label}
            </span>
            <Link
              to="/contribuer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Nouvelle contribution</span>
            </Link>
          </div>
        </div>

        <div className="grid divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat icon={FileText} label="Documents publiés" value={user.resources_count ?? 0} tone="bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" />
          <Stat icon={Heart} label="Favoris enregistrés" value={user.favorites_count ?? 0} tone="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" />
          <Stat icon={Star} label="Avis laissés" value={user.reviews_count ?? 0} tone="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:gap-10">
        <section aria-labelledby="spaces-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Accès rapide</p>
              <h2 id="spaces-heading" className="mt-1 text-lg font-semibold text-foreground">Votre bibliothèque</h2>
            </div>
            <Activity className="mb-1 size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="divide-y divide-border border-y border-border">
            {spaces.map(({ title, description, to, icon: Icon, tone }) => (
              <Link key={to} to={to} className="group flex items-center gap-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4">
                <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-lg', tone)}>
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground group-hover:text-primary">{title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <aside className="h-fit border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Compte</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Informations du profil</h2>
          <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Nom</dt>
              <dd className="max-w-[65%] truncate text-right font-medium text-foreground">{user.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Département</dt>
              <dd className="max-w-[65%] truncate text-right font-medium text-foreground">{user.department ?? 'Non renseigné'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Rôle</dt>
              <dd className="font-medium text-foreground">{roleInfo.label}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  )
}