import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { ChartIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { ProgressChart } from '../../components/ProgressChart'
import { useAsync } from '../../hooks/useAsync'
import { useCurrentUser } from '../../hooks/useAuth'
import { exerciseService, workoutService } from '../../services/workoutService'
import { exerciseLogService, workoutLogService } from '../../services/workoutLogService'
import type { Exercise, ExerciseLog, WorkoutLog } from '../../types/api'
import { formatNumber, formatShortDate, parseDate } from '../../utils/format'

type Metric = 'max' | 'total' | 'sets'

const METRICS: Record<Metric, { label: string; unit: string }> = {
  max: { label: 'Carga máxima', unit: 'kg' },
  total: { label: 'Carga somada', unit: 'kg' },
  sets: { label: 'Séries', unit: 'séries' },
}

interface SessionPoint {
  performedAt: string
  max: number
  total: number
  sets: number
}

/** One point per workout session, oldest first. */
function bySession(sets: ExerciseLog[], logs: Map<number, WorkoutLog>): SessionPoint[] {
  const grouped = new Map<number, ExerciseLog[]>()
  for (const set of sets) grouped.set(set.workoutLogId, [...(grouped.get(set.workoutLogId) ?? []), set])
  return [...grouped.entries()]
    .filter(([logId]) => logs.has(logId))
    .map(([logId, items]) => ({
      performedAt: logs.get(logId)!.performedAt,
      max: Math.max(...items.map((s) => s.weight ?? 0)),
      total: items.reduce((sum, s) => sum + (s.weight ?? 0), 0),
      sets: items.length,
    }))
    .sort((a, b) => parseDate(a.performedAt).getTime() - parseDate(b.performedAt).getTime())
}

export function WorkoutProgressPage() {
  const workoutId = Number(useParams().workoutId)
  const user = useCurrentUser()
  const [metric, setMetric] = useState<Metric>('max')

  const { data, error, loading, reload } = useAsync(async () => {
    const [workout, exercises, logs] = await Promise.all([
      workoutService.get(workoutId),
      exerciseService.listByWorkout(workoutId),
      workoutLogService.listByUser(user.id),
    ])
    const sets = await Promise.all(exercises.map((e) => exerciseLogService.listByExercise(e.id)))
    const logMap = new Map(logs.map((l) => [l.id, l]))
    return {
      workout,
      exercises: exercises.map((exercise, i) => ({ exercise, points: bySession(sets[i], logMap) })),
    }
  }, [workoutId, user.id])

  if (loading && !data) return (<><PageHeader backTo="/progress" title="Progresso" /><Loading /></>)
  if (error || !data) {
    return (<><PageHeader backTo="/progress" title="Progresso" /><RetryableError message={error ?? ''} onRetry={reload} /></>)
  }

  const { label, unit } = METRICS[metric]

  return (
    <>
      <PageHeader backTo="/progress" eyebrow="Progresso" title={data.workout.name} />

      {data.exercises.length === 0 ? (
        <EmptyState icon={<ChartIcon className="size-8" />} title="Treino sem exercícios" />
      ) : (
        <>
          <div role="tablist" aria-label="Métrica" className="sticky top-0 z-10 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-bg px-4 py-2">
            {(Object.keys(METRICS) as Metric[]).map((key) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={metric === key}
                onClick={() => setMetric(key)}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                  metric === key ? 'bg-brand text-black' : 'bg-surface-2 text-muted hover:text-fg'
                }`}
              >
                {METRICS[key].label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.exercises.map(({ exercise, points }) => (
              <ExerciseChart key={exercise.id} exercise={exercise} points={points} metric={metric} label={label} unit={unit} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

interface ExerciseChartProps {
  exercise: Exercise
  points: SessionPoint[]
  metric: Metric
  label: string
  unit: string
}

function ExerciseChart({ exercise, points, metric, label, unit }: ExerciseChartProps) {
  const record = points.length ? Math.max(...points.map((p) => p.max)) : 0
  const delta = points.length > 1 ? points.at(-1)!.max - points[0].max : 0

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="min-w-0 break-words font-display text-2xl font-extrabold uppercase leading-tight">{exercise.name}</h2>
        {points.length > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs uppercase tracking-wider text-muted">Recorde</p>
            <p className="font-display text-2xl font-extrabold text-brand">
              {formatNumber(record)}
              <span className="ml-0.5 text-sm text-muted">kg</span>
            </p>
          </div>
        )}
      </div>

      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Nenhuma carga registrada ainda.</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted">
            Última: <span className="font-semibold text-fg">{formatNumber(points.at(-1)!.max)} kg</span>
            {points.length > 1 && (
              <>
                {' · '}Evolução:{' '}
                <span className={`font-semibold ${delta > 0 ? 'text-brand' : 'text-fg'}`}>
                  {delta > 0 ? '+' : ''}
                  {formatNumber(delta)} kg
                </span>
              </>
            )}
          </p>
          <ProgressChart
            title={`${label} de ${exercise.name} por treino`}
            unit={unit}
            data={points.map((p) => ({ label: formatShortDate(p.performedAt), value: p[metric] }))}
          />
        </>
      )}
    </section>
  )
}
