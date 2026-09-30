import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ name: '', email: '', department: '', password: '', password_confirmation: '' })
  const [errors, setErrors]     = useState({})
  const [globalErr, setGlobalErr] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setGlobalErr('')
  }

  async function onSubmit(e) {
    e.preventDefault()

    // Client-side validation
    const clientErrors = {}
    if (!form.name.trim()) clientErrors.name = 'Le nom complet est requis.'
    if (!form.email.trim()) clientErrors.email = "L'adresse e-mail est requise."
    if (!form.password) clientErrors.password = 'Le mot de passe est requis.'
    if (form.password.length > 0 && form.password.length < 8) clientErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    if (form.password !== form.password_confirmation) clientErrors.password_confirmation = 'Les mots de passe ne correspondent pas.'
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setLoading(true)
    setErrors({})
    setGlobalErr('')
    try {
      await register(form)
      toast.success(`Bienvenue, ${form.name.split(' ')[0]} ! Votre compte a été créé.`)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.status === 422 && err.errors) {
        const flat = {}
        Object.entries(err.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setGlobalErr(err.message ?? 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <Link to="/" className="mb-8 flex flex-col items-center gap-2">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BookOpen className="size-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-foreground">Bibliothèque Digitale</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground">
            Créer un compte
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Rejoignez la bibliothèque numérique de votre université.
          </p>

          {globalErr && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {globalErr}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Nom complet <span className="text-destructive">*</span>
              </label>
              <Input id="reg-name" type="text" autoComplete="name" placeholder="Marie Laurent" autoFocus
                value={form.name} onChange={e => set('name', e.target.value)}
                aria-invalid={!!errors.name} required />
              <FieldError message={errors.name} />
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-foreground">
                Adresse e-mail <span className="text-destructive">*</span>
              </label>
              <Input id="reg-email" type="email" autoComplete="email" placeholder="prenom.nom@univ.fr"
                value={form.email} onChange={e => set('email', e.target.value)}
                aria-invalid={!!errors.email} required />
              <FieldError message={errors.email} />
            </div>

            <div>
              <label htmlFor="reg-department" className="mb-1.5 block text-sm font-medium text-foreground">
                Département <span className="text-xs text-muted-foreground">(facultatif)</span>
              </label>
              <Input id="reg-department" type="text" autoComplete="organization-title" placeholder="Informatique"
                value={form.department} onChange={e => set('department', e.target.value)}
                aria-invalid={!!errors.department} />
              <FieldError message={errors.department} />
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-foreground">
                Mot de passe <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input id="reg-password" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="8 caractères minimum" value={form.password}
                  onChange={e => set('password', e.target.value)}
                  aria-invalid={!!errors.password} className="pr-11" required />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirmer le mot de passe <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input id="reg-confirm" type={showConfirmPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••" value={form.password_confirmation}
                  onChange={e => set('password_confirmation', e.target.value)}
                  aria-invalid={!!errors.password_confirmation} className="pr-11" required />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirmPwd ? 'Masquer' : 'Afficher'}>
                  {showConfirmPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError message={errors.password_confirmation} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Création du compte…' : "Créer mon compte"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
