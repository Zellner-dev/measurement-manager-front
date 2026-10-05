import type { LocalDateTime } from '../types/api'

/** Backend LocalDateTime has no timezone: parse it as local time. */
export function parseDate(value: LocalDateTime): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00` : value)
}

/** yyyy-MM-dd of a local date */
export function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function dayKey(value: LocalDateTime): string {
  return toDateInput(parseDate(value))
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateInput(a) === toDateInput(b)
}

export function formatDayLabel(value: LocalDateTime): string {
  const date = parseDate(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, today)) return 'Hoje'
  if (isSameDay(date, yesterday)) return 'Ontem'
  const sameYear = date.getFullYear() === today.getFullYear()
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function formatDate(value: LocalDateTime): string {
  return parseDate(value).toLocaleDateString('pt-BR')
}

export function formatTime(value: LocalDateTime): string {
  return parseDate(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatShortDate(value: LocalDateTime): string {
  return parseDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatKg(value: number | null | undefined): string {
  return value == null ? '—' : `${numberFormat.format(value)} kg`
}

export function greeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
