import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, ArrowLeft, FileText, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Input, Textarea, Select } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { toast } from 'sonner'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx'

export function SubmitResourcePage() {
  const [form, setForm] = useState({
    title: '', authors: '', category_id: '', language: '',
    publication_date: '', description: '', file: null, parent_resource_id: '',
  })
  const [categories, setCategories] = useState([])
  const [errors, setErrors]         = useState({})
  const [globalErr, setGlobalErr]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [aiLoading, setAiLoading]   = useState(false)

  async function generateAiDescription() {
    if (!form.file) {
      toast.error("Veuillez d'abord sélectionner un fichier.")
      return
    }
    setAiLoading(true)
    const formData = new FormData()
    formData.append('file', form.file)
    try {
      const res = await api.post('/resources/generate-description', formData)
      if (res?.summary) {
        set('description', res.summary)
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la génération de la description.')
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data ?? [])).catch(() => {})
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setGlobalErr('')
  }

  async function onSubmit(e) {
    e.preventDefault()

    let hasClientErrors = false
    const clientErrors = {}
    if (!form.title.trim()) { clientErrors.title = 'Le titre est requis.'; hasClientErrors = true }
    if (!form.category_id) { clientErrors.category_id = 'La catégorie est requise.'; hasClientErrors = true }
    if (!form.file) { clientErrors.file = 'Veuillez sélectionner un fichier.'; hasClientErrors = true }
    if (hasClientErrors) { setErrors(clientErrors); return }

    setLoading(true); setErrors({}); setGlobalErr('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      if (form.authors) fd.append('authors', form.authors)
      fd.append('category_id', form.category_id)
      if (form.language) fd.append('language', form.language)
      if (form.publication_date) fd.append('publication_date', form.publication_date)
      if (form.description) fd.append('description', form.description)
      if (form.parent_resource_id) fd.append('parent_resource_id', form.parent_resource_id)
      fd.append('file', form.file)
      await api.post('/resources', fd)
      setSuccess(true)
    } catch (err) {
      if (err.status === 422 && err.errors) {
        const flat = {}
        Object.entries(err.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setGlobalErr(err.message ?? 'Erreur lors de la soumission.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
      <span className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        <FileText className="size-8" />
      </span>
      <h1 className="text-2xl font-bold text-foreground">Document soumis !</h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
        Votre document a été reçu et sera examiné par un modérateur. Vous pouvez suivre son état dans « Mes contributions ».
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink to="/mes-contributions" variant="outline" size="lg">Voir mes contributions</ButtonLink>
        <Button size="lg" onClick={() => {
          setSuccess(false)
          setForm({ title: '', authors: '', category_id: '', language: '', publication_date: '', description: '', file: null, parent_resource_id: '' })
        }}>
          Soumettre un autre document
        </Button>
      </div>
    </main>
  )

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/mes-contributions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Mes contributions
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Soumettre un document</h1>
        <p className="mt-2 text-sm text-muted-foreground">Partagez un document avec la communauté. Il sera examiné par un modérateur avant publication.</p>
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
            <Input id="sr-title" type="text" placeholder="Titre du document" value={form.title} onChange={e => set('title', e.target.value)} aria-invalid={!!errors.title} required />
            <FieldError message={errors.title} />
          </div>

          <div>
            <label htmlFor="sr-authors" className="mb-1.5 block text-sm font-medium text-foreground">Auteur(s)</label>
            <Input id="sr-authors" type="text" placeholder="Pr. Dupont, Dr. Martin…" value={form.authors} onChange={e => set('authors', e.target.value)} aria-invalid={!!errors.authors} />
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
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="sr-description" className="block text-sm font-medium text-foreground">Description</label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs gap-1.5" 
                onClick={generateAiDescription}
                disabled={aiLoading}
              >
                <Sparkles className="size-3" />
                {aiLoading ? 'Génération…' : "Générer avec l'IA"}
              </Button>
            </div>
            <Textarea id="sr-description" rows={4} placeholder="Décrivez brièvement le contenu…" value={form.description} onChange={e => set('description', e.target.value)} disabled={aiLoading} />
          </div>
        </div>

        {/* File upload */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium text-foreground">Fichier <span className="text-destructive">*</span></label>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('sr-file')?.click() } }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); set('file', e.dataTransfer.files[0]) }}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              errors.file && 'border-destructive',
            )}
            onClick={() => document.getElementById('sr-file').click()}
          >
            <UploadCloud className={cn('size-10 mb-3', dragOver ? 'text-primary' : 'text-muted-foreground')} />
            {form.file ? (
              <p className="text-sm font-medium text-foreground">{form.file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">Glisser-déposer ou cliquer pour sélectionner</p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, Word, PowerPoint — max 50 Mo</p>
              </>
            )}
          </div>
          <input id="sr-file" type="file" accept={ACCEPTED} className="sr-only"
            onChange={e => set('file', e.target.files?.[0])} />
          <FieldError message={errors.file} />
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          <UploadCloud className="size-4" />
          {loading ? 'Soumission en cours…' : 'Soumettre le document'}
        </Button>
      </form>
    </main>
  )
}
