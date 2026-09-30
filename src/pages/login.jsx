import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [globalErr, setGlobalErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setGlobalErr('')
  }

  async function onSubmit(e) {
    e.preventDefault()

    // Client-side validation
    const clientErrors = {}
    if (!form.email.trim()) clientErrors.email = "L'adresse e-mail est requise."
    if (!form.password) clientErrors.password = 'Le mot de passe est requis.'
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setLoading(true)
    setErrors({})
    setGlobalErr('')
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.status === 422 && err.errors) {
        const flat = {}
        Object.entries(err.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setGlobalErr(err.message ?? 'Identifiants invalides.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link to="/" className="mb-8 flex flex-col items-center gap-2">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BookOpen className="size-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-foreground">Bibliothèque Digitale</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground">
            Connexion
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Accédez à votre espace documentaire.
          </p>

          {globalErr && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {globalErr}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
                Adresse e-mail
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@univ.fr"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                aria-invalid={!!errors.email}
                autoFocus
                required
              />
              <FieldError message={errors.email} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  aria-invalid={!!errors.password}
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
