"use client"
/* eslint-disable react-refresh/only-export-components */

import { useEffect, useRef } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/lib/hooks'

export const DOCUMENT_TYPES = [
  { value: 'pdf',        label: 'PDF' },
  { value: 'word',       label: 'Word' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'autre',      label: 'Autre' },
]

export const SORT_OPTIONS = [
  { value: 'recent',  label: 'Plus récents' },
  { value: 'oldest',  label: 'Plus anciens' },
  { value: 'popular', label: 'Plus consultés' },
  { value: 'rating',  label: 'Mieux notés' },
]

export const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Allemand']

export const DEFAULT_FILTERS = {
  category_id: null,
  type: 'all',
  language: 'all',
  sort: 'recent',
}

function OptionGroup({ legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const selected = String(opt.value) === String(value)
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                selected
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FiltersPanel({ open, onOpenChange, filters, onChange, activeCount, categories = [] }) {
  const ref = useRef(null)
  
  useClickOutside(ref, () => {
    if (open) onOpenChange(false)
  })

  useEffect(() => {
    function onKey(e)   { if (e.key === 'Escape') onOpenChange(false) }
    if (open) {
      document.addEventListener('keydown', onKey)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  const set = (key, value) => onChange({ ...filters, [key]: value })

  const categoryOptions = [
    { value: null, label: 'Toutes' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  const languageOptions = [
    { value: 'all', label: 'Toutes' },
    ...LANGUAGES.map(l => ({ value: l, label: l })),
  ]

  const typeOptions = [
    { value: 'all', label: 'Tous' },
    ...DOCUMENT_TYPES,
  ]

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="h-11 gap-2"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filtres
        {activeCount > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Filtres de recherche"
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Affiner la recherche</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fermer les filtres"
              className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <OptionGroup legend="Catégorie" value={filters.category_id} onChange={v => set('category_id', v)} options={categoryOptions} />
            <OptionGroup legend="Type de document" value={filters.type} onChange={v => set('type', v)} options={typeOptions} />
            <OptionGroup legend="Langue" value={filters.language} onChange={v => set('language', v)} options={languageOptions} />
            <OptionGroup legend="Trier par" value={filters.sort} onChange={v => set('sort', v)} options={SORT_OPTIONS} />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Réinitialiser
            </button>
            <Button size="lg" onClick={() => onOpenChange(false)}>
              Voir les résultats
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
