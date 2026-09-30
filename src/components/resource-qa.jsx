import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

function SourceChip({ source }) {
  if (!source) return null
  return (
    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wide">
      {typeof source === 'object' ? `Extrait ${source.chunk_index ?? ''}` : source}
    </span>
  )
}

function ChatMessage({ msg, isAi }) {
  return (
    <div className={cn('flex gap-3', isAi ? 'bg-muted/30 p-4 rounded-xl border border-border/50' : 'px-4')}>
      <span className={cn('mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg', isAi ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
        {isAi ? <Bot className="size-4" /> : <UserIcon className="size-4" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{isAi ? msg.answer : msg.question}</p>
        {isAi && msg.cited_sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.cited_sources.map((s, i) => <SourceChip key={i} source={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export function ResourceQA({ resourceId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [askError, setAskError] = useState(null)
  
  const endRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/resources/${resourceId}/conversation`)
        setMessages(res.data?.messages ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resourceId])

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  async function onSubmit(e) {
    e.preventDefault()
    if (!question.trim() || submitting) return
    
    setSubmitting(true)
    setAskError(null)
    const currentQ = question
    setQuestion('') // Optimistic clear

    const tempId = 'pending'
    const tempMsg = { id: tempId, question: currentQ, answer: null, cited_sources: [] }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await api.post(`/resources/${resourceId}/ask`, { question: currentQ })
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m))
    } catch (err) {
      setAskError(err.message ?? 'Erreur inattendue')
      setQuestion(currentQ) // Restore on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Erreur: ' + (err.message ?? 'Erreur inattendue'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-8">
      <Spinner className="size-6" />
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
      <p className="text-sm text-destructive">{error}</p>
    </div>
  )

  return (
    <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="border-b border-border bg-muted/20 px-5 py-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Poser une question à l'IA</h2>
      </div>

      <div className="flex-1 max-h-[400px] overflow-y-auto p-2 space-y-4">
        {messages.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">Posez une question sur le contenu de ce document.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {messages.map(m => (
              <div key={m.id} className="flex flex-col gap-4">
                <ChatMessage msg={m} isAi={false} />
                <ChatMessage msg={m} isAi={true} />
              </div>
            ))}
            {submitting && (
              <div className="flex gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </span>
                <div className="flex items-center">
                  <Spinner className="size-4" />
                  <span className="ml-2 text-sm text-muted-foreground">Analyse en cours...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-background">
        <form onSubmit={onSubmit} className="relative flex items-end gap-2">
          <div className="flex-1">
            <Textarea 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ex: Quel est le sujet principal de ce texte ?"
              rows={2}
              className="resize-none min-h-[44px] py-3 text-sm pr-12 focus-visible:ring-1 focus-visible:ring-primary/50"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(e)
                }
              }}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!question.trim() || submitting}
            size="icon"
            className="absolute bottom-2 right-2 size-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="size-4" />
          </Button>
        </form>
        {askError && (
          <p className="mt-2 text-xs text-destructive px-1">{askError}</p>
        )}
      </div>
    </div>
  )
}
