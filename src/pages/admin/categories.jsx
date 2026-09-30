import { useState, useEffect, useRef } from 'react'
import { Folder, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

function CategoryFormModal({ category, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ name: category?.name ?? '', parent_id: category?.parent_id ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firstInputRef = useRef(null)

  // Focus first input on open
  useEffect(() => { firstInputRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Le nom est requis.'); return }
    setLoading(true)
    setError('')
    try {
      let res
      if (category) {
        res = await api.put(`/categories/${category.id}`, { name: form.name, parent_id: form.parent_id || null })
      } else {
        res = await api.post('/categories', { name: form.name, parent_id: form.parent_id || null })
      }
      onSave(res.data ?? res)
      toast.success(category ? 'Catégorie modifiée.' : 'Catégorie créée.')
    } catch (err) {
      if (err.status === 422) setError(err.message ?? 'Veuillez vérifier les champs.')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 id="cat-modal-title" className="mb-4 text-lg font-semibold text-foreground">
          {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </h2>
        {error && <p className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom</label>
            <Input ref={firstInputRef} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Catégorie parente <span className="text-xs text-muted-foreground">(un seul niveau de hiérarchie)</span></label>
            <Select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
              <option value="">Aucune (Catégorie racine)</option>
              {categories.filter(c => c.id !== category?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/categories')
      setCategories(res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function deleteCategory(id, name) {
    if (!confirm(`Supprimer la catégorie « ${name} » ?`)) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success(`Catégorie « ${name} » supprimée.`)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  function openModal(category = null) {
    setEditingCategory(category)
    setModalOpen(true)
  }

  function handleSave() {
    setModalOpen(false)
    load()
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner className="size-8" /></div>
  if (error) return <div className="text-center py-16"><p className="text-destructive">{error}</p><Button onClick={load} className="mt-4">Réessayer</Button></div>

  // Flatten the tree for display and for the dropdown
  const flatCategories = categories.flatMap(parent => [
    parent, 
    ...(parent.children?.map(child => ({ ...child, isChild: true, parentName: parent.name })) ?? [])
  ])

  return (
    <>
      {modalOpen && (
        <CategoryFormModal 
          category={editingCategory} 
          categories={flatCategories.filter(c => !c.isChild)}
          onSave={handleSave} 
          onCancel={() => setModalOpen(false)} 
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Folder className="size-6 text-primary" /> Gestion des catégories
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Créez et organisez les catégories de documents.</p>
          </div>
          <Button onClick={() => openModal()} size="lg" className="gap-2">
            <Plus className="size-4" /> Nouvelle catégorie
          </Button>
        </div>

        {flatCategories.length === 0 ? (
           <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
             <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
               <Folder className="size-7" />
             </span>
             <h2 className="text-lg font-semibold text-foreground">Aucune catégorie</h2>
             <p className="mt-1.5 text-sm text-muted-foreground">Ajoutez des catégories pour organiser la bibliothèque.</p>
           </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Hiérarchie</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {flatCategories.map(c => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.isChild && <span className="ml-4 w-2 h-px bg-border shrink-0" />}
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {c.isChild ? `Sous-catégorie de ${c.parentName}` : 'Catégorie racine'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" onClick={() => openModal(c)} className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Edit className="size-4" />
                      </button>
                      <button type="button" onClick={() => deleteCategory(c.id, c.name)} className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
