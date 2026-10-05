import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { ErrorMessage } from '../../components/Feedback'
import { Input } from '../../components/Input'
import { errorMessage } from '../../services/api'
import { measurementService } from '../../services/measurementService'
import type { Measurement } from '../../types/api'
import { toDateInput } from '../../utils/format'
import { MEASUREMENT_PRESETS } from './measurementPresets'

interface MeasurementFormProps {
  userId: number
  onSaved: (created: Measurement[]) => void
}

export function MeasurementForm({ userId, onSaved }: MeasurementFormProps) {
  const today = toDateInput(new Date())
  const [date, setDate] = useState(today)
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const entries = MEASUREMENT_PRESETS.map((p) => ({ name: p.name, raw: values[p.name]?.trim() ?? '' }))
    .filter((e) => e.raw !== '')
    .map((e) => ({ name: e.name, value: Number(e.raw.replace(',', '.')) }))
  const invalid = entries.some((e) => !Number.isFinite(e.value) || e.value <= 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (date > today) return setError('A data não pode estar no futuro.')
    if (invalid) return setError('Os valores precisam ser números positivos.')
    setSubmitting(true)
    try {
      // One API record per metric, all sharing the same date
      const measuredAt = `${date}T00:00:00`
      const created = await Promise.all(
        entries.map((entry) =>
          measurementService.create(userId, { name: entry.name, measuredValue: entry.value, measuredAt }),
        ),
      )
      onSaved(created)
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <Input label="Data" type="date" max={today} required value={date} onChange={(e) => setDate(e.target.value)} />
      <p className="text-xs text-muted">Preencha apenas o que mediu hoje.</p>
      <div className="grid max-h-[45dvh] grid-cols-2 gap-3 overflow-y-auto pr-1">
        {MEASUREMENT_PRESETS.map((preset) => (
          <Input
            key={preset.name}
            label={preset.name}
            inputMode="decimal"
            suffix={preset.unit}
            value={values[preset.name] ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, [preset.name]: e.target.value.replace(/[^\d.,]/g, '') }))}
          />
        ))}
      </div>
      <Button type="submit" block size="xl" loading={submitting} disabled={entries.length === 0 || !date}>
        Salvar medidas
      </Button>
    </form>
  )
}
