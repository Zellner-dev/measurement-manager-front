import type { ReactNode } from 'react'
import { Button } from './Button'
import { AlertIcon } from './Icons'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm">
      <AlertIcon className="size-5 shrink-0 text-danger" />
      <div className="flex-1 whitespace-pre-line text-fg">{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 font-semibold text-brand hover:underline">
          Tentar de novo
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      {icon && <div className="mb-4 rounded-2xl bg-brand/10 p-4 text-brand">{icon}</div>}
      <p className="font-display text-xl font-bold uppercase">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  )
}

export function RetryableError({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="space-y-4 py-6">
      <ErrorMessage message={message} />
      {onRetry && (
        <Button variant="secondary" block onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
