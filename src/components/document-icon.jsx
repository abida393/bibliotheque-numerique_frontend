import { FileText, FileType, Presentation, File } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONFIG = {
  pdf: {
    label: 'PDF',
    Icon: FileText,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  word: {
    label: 'Word',
    Icon: FileType,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  powerpoint: {
    label: 'PowerPoint',
    Icon: Presentation,
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  // Fallback for backend `autre` type
  autre: {
    label: 'Document',
    Icon: File,
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  },
}

export function DocumentIcon({ type, className }) {
  const cfg = CONFIG[type] ?? CONFIG.autre
  const { label, Icon, className: color } = cfg
  return (
    <span
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg',
        color,
        className,
      )}
      title={label}
      aria-label={`Type de document : ${label}`}
    >
      <Icon className="size-4.5" aria-hidden="true" />
    </span>
  )
}
