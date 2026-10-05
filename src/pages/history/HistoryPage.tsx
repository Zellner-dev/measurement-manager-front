import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { ChevronRightIcon, HistoryIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { useCurrentUser } from '../../hooks/useAuth'
import { useWorkoutsOverview } from '../../hooks/useWorkouts'
import type { WorkoutLog } from '../../types/api'
import { dayKey, formatDayLabel, formatTime } from '../../utils/format'

export function HistoryPage() {
  const user = useCurrentUser()
  const { data, error, loading, reload } = useWorkoutsOverview(user.id)

  if (loading && !data) return (<><PageHeader title="Histórico" /><Loading /></>)
  if (error || !data) return (<><PageHeader title="Histórico" /><RetryableError message={error ?? ''} onRetry={reload} /></>)

  const workoutName = new Map(data.workouts.map((w) => [w.id, w.name]))
  const groups = new Map<string, WorkoutLog[]>()
  for (const log of data.logs) {
    const key = dayKey(log.performedAt)
    groups.set(key, [...(groups.get(key) ?? []), log])
  }

  return (
    <>
      <PageHeader title="Histórico" eyebrow={`${data.logs.length} treinos realizados`} />
      {data.logs.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="size-8" />}
          title="Nenhum treino realizado"
          description="Inicie um treino e ele aparecerá aqui."
          action={<ButtonLink to="/workouts" block>Ver treinos</ButtonLink>}
        />
      ) : (
        <div className="space-y-6">
          {[...groups.values()].map((logs) => (
            <section key={dayKey(logs[0].performedAt)}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                {formatDayLabel(logs[0].performedAt)}
              </h2>
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li key={log.id}>
                    <Link
                      to={`/history/${log.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand/50"
                    >
                      <div className="h-10 w-1 rounded-full bg-brand" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-xl font-bold uppercase">
                          {workoutName.get(log.workoutId) ?? 'Treino'}
                        </p>
                        <p className="text-sm text-muted">{formatTime(log.performedAt)}</p>
                      </div>
                      <ChevronRightIcon className="size-5 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
