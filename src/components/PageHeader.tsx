import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './Icons'

interface PageHeaderProps {
  title: string
  eyebrow?: string
  backTo?: string
  action?: ReactNode
}

export function PageHeader({ title, eyebrow, backTo, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="-ml-2 mb-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-muted hover:text-fg"
          >
            <ChevronLeftIcon className="size-4" /> Voltar
          </Link>
        )}
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>}
        <h1 className="break-words font-display text-4xl font-extrabold uppercase leading-none">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide">{children}</h2>
      {action}
    </div>
  )
}
