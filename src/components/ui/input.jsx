import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors outline-none resize-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})
