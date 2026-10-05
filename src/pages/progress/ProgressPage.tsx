import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { ChartIcon, ChevronRightIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { useCurrentUser } from '../../hooks/useAuth'
import { useWorkoutsOverview } from '../../hooks/useWorkouts'
import { formatDayLabel, pluralize } from '../../utils/format'

export function ProgressPage() {
  const user = useCurrentUser()
  const { data, error, loading, reload } = useWorkoutsOverview(user.id)

  const header = (
    <PageHeader
      title="Progresso"
      action={
        <Link to="/history" className="text-sm font-semibold text-brand hover:underline lg:hidden">
          Histórico
        </Link>
      }
    />
  )

  if (loading && !data) return (<>{header}<Loading /></>)
  if (error || !data) return (<>{header}<RetryableError message={error ?? ''} onRetry={reload} /></>)

  if (data.workouts.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<ChartIcon className="size-8" />}
          title="Sem dados ainda"
          description="Cadastre treinos e registre suas cargas para acompanhar a evolução."
          action={<ButtonLink to="/workouts" block>Ir para treinos</ButtonLink>}
        />
      </>
    )
  }

  return (
    <>
      {header}
      <p className="-mt-3 mb-5 text-sm text-muted">Escolha um treino para ver a evolução de cada exercício.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.workouts.map((workout) => {
          const sessions = data.logs.filter((l) => l.workoutId === workout.id)
          return (
            <li key={workout.id}>
              <Link
                to={`/progress/${workout.id}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-brand/50"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ChartIcon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-display text-2xl font-extrabold uppercase leading-tight">{workout.name}</p>
                  <p className="text-sm text-muted">
                    {pluralize(data.exerciseCounts.get(workout.id) ?? 0, 'exercício', 'exercícios')} ·{' '}
                    {pluralize(sessions.length, 'treino feito', 'treinos feitos')}
                    {sessions[0] && <> · último: {formatDayLabel(sessions[0].performedAt)}</>}
                  </p>
                </div>
                <ChevronRightIcon className="size-5 shrink-0 text-muted" />
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
