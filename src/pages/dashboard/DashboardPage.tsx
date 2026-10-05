import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { DumbbellIcon, PlusIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { MetricCard } from '../../components/MetricCard'
import { SectionTitle } from '../../components/PageHeader'
import { WorkoutCard } from '../../components/WorkoutCard'
import { useCurrentUser } from '../../hooks/useAuth'
import { useStartWorkout, useWorkoutsOverview } from '../../hooks/useWorkouts'
import { firstName, formatDayLabel, formatTime, greeting } from '../../utils/format'
import { dayStreak, nextWorkoutId, sessionsThisWeek } from '../../utils/stats'

export function DashboardPage() {
  const user = useCurrentUser()
  const { data, error, loading, reload } = useWorkoutsOverview(user.id)
  const { start, startingId } = useStartWorkout()

  const header = (
    <header className="mb-6">
      <p className="text-sm text-muted">{greeting()},</p>
      <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
        {firstName(user.name)} <span aria-hidden="true">👋</span>
      </h1>
    </header>
  )

  if (loading && !data) return (<>{header}<Loading /></>)
  if (error || !data) return (<>{header}<RetryableError message={error ?? ''} onRetry={reload} /></>)

  const { workouts, exerciseCounts, logs } = data
  const workoutName = new Map(workouts.map((w) => [w.id, w.name]))
  const nextId = nextWorkoutId(
    workouts.filter((w) => (exerciseCounts.get(w.id) ?? 0) > 0).map((w) => w.id),
    logs,
  )
  const next = workouts.find((w) => w.id === nextId) ?? workouts[0]
  const streak = dayStreak(logs)

  return (
    <>
      {header}

      {workouts.length === 0 ? (
        <EmptyState
          icon={<DumbbellIcon className="size-8" />}
          title="Você ainda não possui treinos"
          description="Crie seu primeiro treino para começar."
          action={
            <ButtonLink to="/workouts?new=1" block icon={<PlusIcon className="size-5" />}>
              Criar treino
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <WorkoutCard
            featured
            workout={next}
            exerciseCount={exerciseCounts.get(next.id)}
            onStart={() => start(next.id)}
            starting={startingId === next.id}
          />
          <section aria-label="Resumo" className="grid grid-cols-2 gap-3">
            <MetricCard label="Treinos feitos" value={logs.length} />
            <MetricCard label="Esta semana" value={sessionsThisWeek(logs)} highlight />
            <MetricCard label="Sequência" value={streak} unit={streak === 1 ? 'dia' : 'dias'} />
            <MetricCard label="Fichas" value={workouts.length} />
          </section>
        </div>
      )}

      {logs.length > 0 && (
        <section className="mt-8">
          <SectionTitle
            action={
              <Link to="/history" className="text-sm font-semibold text-brand hover:underline">
                Ver tudo
              </Link>
            }
          >
            Últimos treinos
          </SectionTitle>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {logs.slice(0, 4).map((log) => (
              <li key={log.id}>
                <Link to={`/history/${log.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2">
                  <span className="truncate font-semibold">{workoutName.get(log.workoutId)}</span>
                  <span className="shrink-0 text-sm text-muted">
                    {formatDayLabel(log.performedAt)} · {formatTime(log.performedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
