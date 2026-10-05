import { useState } from 'react'
import { Button, IconButton } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { PlusIcon, RulerIcon, TrashIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { ProgressChart } from '../../components/ProgressChart'
import { useAsync } from '../../hooks/useAsync'
import { useCurrentUser } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../services/api'
import { measurementService } from '../../services/measurementService'
import type { Measurement } from '../../types/api'
import { dayKey, formatDate, formatNumber, formatShortDate, parseDate } from '../../utils/format'
import { MEASUREMENT_PRESETS, unitOf } from './measurementPresets'
import { MeasurementForm } from './MeasurementForm'

export function BodyMeasurementsPage() {
  const user = useCurrentUser()
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Measurement | null>(null)
  const { data, error, loading, reload, setData } = useAsync(() => measurementService.listByUser(user.id), [user.id])

  const header = (
    <PageHeader
      title="Medidas"
      eyebrow="Corporais"
      action={
        data && data.length > 0 ? (
          <Button size="md" icon={<PlusIcon className="size-5" />} onClick={() => setFormOpen(true)}>
            Nova
          </Button>
        ) : undefined
      }
    />
  )

  const form = (
    <Modal open={formOpen} title="Nova medição" onClose={() => setFormOpen(false)}>
      <MeasurementForm
        userId={user.id}
        onSaved={(created) => {
          setData((prev) => [...created, ...(prev ?? [])])
          setFormOpen(false)
          toast.success('Medidas salvas.')
        }}
      />
    </Modal>
  )

  if (loading && !data) return (<>{header}<Loading /></>)
  if (error || !data) return (<>{header}<RetryableError message={error ?? ''} onRetry={reload} /></>)

  if (data.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<RulerIcon className="size-8" />}
          title="Nenhuma medida registrada"
          description="Registre peso e medidas para acompanhar sua evolução corporal."
          action={
            <Button block icon={<PlusIcon className="size-5" />} onClick={() => setFormOpen(true)}>
              Registrar medidas
            </Button>
          }
        />
        {form}
      </>
    )
  }

  // API returns newest first
  const sorted = [...data].sort((a, b) => parseDate(b.measuredAt).getTime() - parseDate(a.measuredAt).getTime())
  const presetOrder: string[] = MEASUREMENT_PRESETS.map((p) => p.name)
  const names = [...new Set(sorted.map((m) => m.name))].sort(
    (a, b) => (presetOrder.indexOf(a) + 1 || 99) - (presetOrder.indexOf(b) + 1 || 99),
  )
  const metric = selected && names.includes(selected) ? selected : names[0]
  const latest = new Map<string, Measurement>()
  for (const m of sorted) if (!latest.has(m.name)) latest.set(m.name, m)

  const series = sorted.filter((m) => m.name === metric).reverse()
  const first = series[0]?.measuredValue
  const last = series.at(-1)?.measuredValue
  const delta = first != null && last != null ? last - first : 0

  const byDay = new Map<string, Measurement[]>()
  for (const m of sorted) byDay.set(dayKey(m.measuredAt), [...(byDay.get(dayKey(m.measuredAt)) ?? []), m])

  const remove = async () => {
    if (!toDelete) return
    try {
      await measurementService.remove(toDelete.id)
      setData((prev) => prev?.filter((m) => m.id !== toDelete.id))
      toast.success('Medida excluída.')
      setToDelete(null)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      {header}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div role="tablist" aria-label="Métrica" className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {names.map((name) => (
              <button
                key={name}
                role="tab"
                type="button"
                aria-selected={metric === name}
                onClick={() => setSelected(name)}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                  metric === name ? 'bg-brand text-black' : 'bg-surface-2 text-muted hover:text-fg'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="font-display text-4xl font-extrabold">
              {formatNumber(last ?? 0)}
              <span className="ml-1 text-base font-semibold text-muted">{unitOf(metric)}</span>
            </p>
            {series.length > 1 && (
              <p className={`text-sm font-semibold ${delta === 0 ? 'text-muted' : 'text-brand'}`}>
                {delta > 0 ? '+' : ''}
                {formatNumber(delta)} {unitOf(metric)} desde {formatDate(series[0].measuredAt)}
              </p>
            )}
          </div>
          {series.length < 2 && <p className="mb-2 text-xs text-muted">Registre em outra data para ver a evolução.</p>}
          <ProgressChart
            title={`Evolução de ${metric}`}
            unit={unitOf(metric)}
            data={series.map((m) => ({ label: formatShortDate(m.measuredAt), value: m.measuredValue }))}
          />
        </section>

        <section>
          <SectionTitle>Atual</SectionTitle>
          <ul className="grid grid-cols-2 gap-3">
            {names.map((name) => (
              <li key={name} className="rounded-2xl border border-line bg-surface p-3">
                <p className="text-xs uppercase tracking-wider text-muted">{name}</p>
                <p className="font-display text-2xl font-extrabold">
                  {formatNumber(latest.get(name)!.measuredValue)}
                  <span className="ml-1 text-sm font-semibold text-muted">{unitOf(name)}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <SectionTitle>Histórico</SectionTitle>
        <div className="space-y-3">
          {[...byDay.entries()].map(([day, items]) => (
            <div key={day} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-display text-lg font-bold">{formatDate(items[0].measuredAt)}</p>
              <ul className="mt-1 divide-y divide-line">
                {items.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-1">
                    <span className="flex-1 text-sm text-muted">{m.name}</span>
                    <span className="font-semibold">
                      {formatNumber(m.measuredValue)} {unitOf(m.name)}
                    </span>
                    <IconButton label={`Excluir ${m.name}`} className="size-9 hover:text-danger" onClick={() => setToDelete(m)}>
                      <TrashIcon className="size-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {form}
      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir medida?"
        message={toDelete ? `${toDelete.name} de ${formatDate(toDelete.measuredAt)} será removida.` : ''}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
