import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { DumbbellIcon, PlusIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { Modal } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'
import { WorkoutCard } from '../../components/WorkoutCard'
import { useCurrentUser } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useStartWorkout, useWorkoutsOverview } from '../../hooks/useWorkouts'
import { workoutService } from '../../services/workoutService'
import { formatDayLabel } from '../../utils/format'
import { NameForm } from './WorkoutNameForm'

export function WorkoutsPage() {
  const user = useCurrentUser()
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data, error, loading, reload } = useWorkoutsOverview(user.id)
  const { start, startingId } = useStartWorkout()
  const creating = params.get('new') === '1'

  const openCreate = () => setParams({ new: '1' })
  const closeCreate = () => setParams({}, { replace: true })

  const handleCreate = async (name: string) => {
    const workout = await workoutService.create(user.id, name)
    toast.success('Treino criado. Agora adicione os exercícios.')
    navigate(`/workouts/${workout.id}`, { replace: true })
  }

  const lastPerformed = (workoutId: number) => {
    const log = data?.logs.find((l) => l.workoutId === workoutId)
    return log ? formatDayLabel(log.performedAt) : undefined
  }

  return (
    <>
      <PageHeader
        title="Meus treinos"
        action={
          data && data.workouts.length > 0 ? (
            <Button size="md" icon={<PlusIcon className="size-5" />} onClick={openCreate}>
              Novo
            </Button>
          ) : undefined
        }
      />

      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <RetryableError message={error ?? ''} onRetry={reload} />
      ) : data.workouts.length === 0 ? (
        <EmptyState
          icon={<DumbbellIcon className="size-8" />}
          title="Você ainda não possui treinos"
          description="Crie seu primeiro treino para começar."
          action={
            <Button block icon={<PlusIcon className="size-5" />} onClick={openCreate}>
              Criar treino
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              exerciseCount={data.exerciseCounts.get(workout.id)}
              lastPerformed={lastPerformed(workout.id)}
              onStart={() => start(workout.id)}
              starting={startingId === workout.id}
            />
          ))}
        </div>
      )}

      <Modal open={creating} title="Novo treino" onClose={closeCreate}>
        <NameForm label="Nome do treino" placeholder="Ex.: Treino A — Peito e Tríceps" submitLabel="Criar treino" onSubmit={handleCreate} />
      </Modal>
    </>
  )
}
