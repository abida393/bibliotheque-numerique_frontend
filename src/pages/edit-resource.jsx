import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { Edit, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

export function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    title: '', authors: '', category_id: '', language: '', description: '', publication_date: ''
  })
  const [categories, setCategories] = useState([])
  
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialError, setInitialError]     = useState('')
  const [loading, setLoading]               = useState(false)
  const [errors, setErrors]                 = useState({})
  const [globalErr, setGlobalErr]           = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [catRes, resData] = await Promise.all([
          api.get('/categories'),
          api.get(`/resources/${id}`)
        ])
        setCategories(catRes.data ?? [])
        
        const data = resData.data
        setForm({
          title: data.title ?? '',
          authors: data.authors ?? '',
          category_id: data.category?.id ?? '',
          language: data.language ?? '',
          description: data.description ?? '',
          publication_date: data.publication_date ?? '',
        })
      } catch {
        setInitialError('Impossible de charger la ressource. Vérifiez votre connexion.')
      } finally {
        setInitialLoading(false)
      }
    }
    load()
  }, [id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setGlobalErr('')
  }

  async function onSubmit(e) {
    e.preventDefault()

    // Client-side validation
    const clientErrors = {}
    if (!form.title.trim()) clientErrors.title = 'Le titre est requis.'
    if (!form.category_id) clientErrors.category_id = 'La catégorie est requise.'
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setLoading(true); setErrors({}); setGlobalErr('')
    
    const payload = {
      title: form.title,
      authors: form.authors || null,
      category_id: form.category_id,
      language: form.language || null,
      description: form.description || null,
      publication_date: form.publication_date || null,
    }

    try {
      await api.put(`/resources/${id}`, payload)
      toast.success('Modifications enregistrées.')
      navigate(`/ressources/${id}`, { replace: true })
    } catch (err) {
      if (err.status === 422 && err.errors) {
        const flat = {}
        Object.entries(err.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setGlobalErr(err.message ?? 'Erreur lors de la modification.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (initialError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-destructive mb-4">{initialError}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="size-4" /> Retour
          </Button>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to={`/ressources/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Retour à la ressource
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Modifier le document</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mettez à jour les métadonnées du document.</p>
      </div>

      {globalErr && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {globalErr}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <label htmlFor="sr-title" className="mb-1.5 block text-sm font-medium text-foreground">Titre <span className="text-destructive">*</span></label>
            <Input id="sr-title" type="text" value={form.title} onChange={e => set('title', e.target.value)} aria-invalid={!!errors.title} required />
            <FieldError message={errors.title} />
          </div>

          <div>
            <label htmlFor="sr-authors" className="mb-1.5 block text-sm font-medium text-foreground">Auteur(s)</label>
            <Input id="sr-authors" type="text" value={form.authors} onChange={e => set('authors', e.target.value)} aria-invalid={!!errors.authors} />
            <FieldError message={errors.authors} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sr-category" className="mb-1.5 block text-sm font-medium text-foreground">Catégorie <span className="text-destructive">*</span></label>
              <Select id="sr-category" value={form.category_id} onChange={e => set('category_id', e.target.value)} aria-invalid={!!errors.category_id} required>
                <option value="">Sélectionner…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <FieldError message={errors.category_id} />
            </div>
            <div>
              <label htmlFor="sr-language" className="mb-1.5 block text-sm font-medium text-foreground">Langue</label>
              <Select id="sr-language" value={form.language} onChange={e => set('language', e.target.value)}>
                <option value="">Sélectionner…</option>
                {['Français','Anglais','Arabe','Espagnol','Allemand'].map(l => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="sr-date" className="mb-1.5 block text-sm font-medium text-foreground">Date de publication</label>
            <Input id="sr-date" type="date" value={form.publication_date} onChange={e => set('publication_date', e.target.value)} />
          </div>

          <div>
            <label htmlFor="sr-description" className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
            <Textarea id="sr-description" rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          <Edit className="size-4" />
          {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </main>
  )
}
