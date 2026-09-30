import { useState, useEffect, useCallback } from 'react'
import { api } from './api'

// ── Debounce ───────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Generic fetcher ────────────────────────────────────────────────────────
export function useFetch(path, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Stringify params for stable dep comparison
  const paramsKey = JSON.stringify(params)

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(path, params, signal)
      setData(res)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message ?? 'Erreur inconnue')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { data, loading, error, refetch: () => load() }
}

// ── Paginated fetcher ──────────────────────────────────────────────────────
export function usePaginated(path, params) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const paramsKey = JSON.stringify(params)

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(path, params, signal)
      setItems(res.data ?? [])
      setMeta(res.meta ?? null)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message ?? 'Erreur inconnue')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { items, meta, loading, error, refetch: () => load() }
}

// ── Click-outside ──────────────────────────────────────────────────────────
export function useClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler])
}
