import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  unit?: string
  highlight?: boolean
}

export function MetricCard({ label, value, unit, highlight }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl font-extrabold leading-none ${highlight ? 'text-brand' : ''}`}>
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-muted">{unit}</span>}
      </p>
    </div>
  )
}
