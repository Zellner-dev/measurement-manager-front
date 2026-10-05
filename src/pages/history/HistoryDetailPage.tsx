import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ButtonLink, IconButton } from '../../components/Button'
import { RetryableError } from '../../components/Feedback'
import { PlayIcon, TrashIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { MetricCard } from '../../components/MetricCard'
import { ConfirmDialog } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../services/api'
import { exerciseService, workoutService } from '../../services/workoutService'
import { exerciseLogService, workoutLogService } from '../../services/workoutLogService'
import { formatDate, formatKg, formatNumber, formatTime } from '../../utils/format'

export function HistoryDetailPage() {
  const logId = Number(useParams().logId)
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data, error, loading, reload } = useAsync(async () => {
    const log = await workoutLogService.get(logId)
    const [workout, exercises, sets] = await Promise.all([
      workoutService.get(log.workoutId),
      exerciseService.listByWorkout(log.workoutId),
      exerciseLogService.listByWorkoutLog(logId),
    ])
    return { log, workout, exercises, sets }
  }, [logId])

  if (loading && !data) return <Loading />
  if (error || !data) return <RetryableError message={error ?? ''} onRetry={reload} />

  const { log, workout, exercises, sets } = data
  const performed = exercises
    .map((exercise) => ({ exercise, sets: sets.filter((s) => s.exerciseId === exercise.id) }))
    .filter((e) => e.sets.length > 0)
  const total = sets.reduce((sum, s) => sum + (s.weight ?? 0), 0)
  const best = Math.max(0, ...sets.map((s) => s.weight ?? 0))

  const remove = async () => {
    try {
      await workoutLogService.remove(log.id)
      toast.success('Registro excluído.')
      navigate('/history', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        backTo="/history"
        eyebrow={`${formatDate(log.performedAt)} · ${formatTime(log.performedAt)}`}
        title={workout.name}
        action={
          <IconButton label="Excluir registro" className="hover:text-danger" onClick={() => setConfirmDelete(true)}>
            <TrashIcon className="size-5" />
          </IconButton>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Exercícios" value={performed.length} />
        <MetricCard label="Séries" value={sets.length} />
        <MetricCard label="Maior carga" value={formatNumber(best)} unit="kg" highlight />
      </div>

      <section className="mt-6 space-y-3">
        {performed.length === 0 && <p className="py-8 text-center text-muted">Nenhuma série registrada neste treino.</p>}
        {performed.map(({ exercise, sets }) => (
          <div key={exercise.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-display text-xl font-bold uppercase">{exercise.name}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {sets.map((set, i) => (
                <li key={set.id} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
                  <span className="text-muted">S{i + 1}</span> <span className="font-semibold">{formatKg(set.weight)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-4 text-sm text-muted">Carga somada: {formatKg(total)}</p>

      <ButtonLink to={`/session/${log.id}`} variant="secondary" block className="mt-6" icon={<PlayIcon className="size-5" />}>
        Continuar / editar treino
      </ButtonLink>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir registro?"
        message="Este treino realizado e suas séries serão removidos do histórico."
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}
