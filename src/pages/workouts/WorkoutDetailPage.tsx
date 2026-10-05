import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, IconButton } from '../../components/Button'
import { EmptyState, RetryableError } from '../../components/Feedback'
import { DumbbellIcon, PencilIcon, PlayIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { Loading } from '../../components/Loading'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { useStartWorkout } from '../../hooks/useWorkouts'
import { errorMessage } from '../../services/api'
import { exerciseService, workoutService } from '../../services/workoutService'
import type { Exercise } from '../../types/api'
import { pluralize } from '../../utils/format'
import { NameForm } from './WorkoutNameForm'

type Dialog =
  | { kind: 'rename-workout' }
  | { kind: 'delete-workout' }
  | { kind: 'add-exercise' }
  | { kind: 'edit-exercise'; exercise: Exercise }
  | { kind: 'delete-exercise'; exercise: Exercise }

export function WorkoutDetailPage() {
  const workoutId = Number(useParams().id)
  const navigate = useNavigate()
  const toast = useToast()
  const { start, startingId } = useStartWorkout()
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const close = () => setDialog(null)

  const { data, error, loading, reload, setData } = useAsync(
    () => Promise.all([workoutService.get(workoutId), exerciseService.listByWorkout(workoutId)]),
    [workoutId],
  )

  if (loading && !data) return <Loading />
  if (error || !data) return <RetryableError message={error ?? ''} onRetry={reload} />

  const [workout, exercises] = data

  const renameWorkout = async (name: string) => {
    const updated = await workoutService.update(workout.id, name)
    setData((prev) => prev && [updated, prev[1]])
    toast.success('Treino atualizado.')
    close()
  }

  const deleteWorkout = async () => {
    try {
      await workoutService.remove(workout.id)
      toast.success('Treino excluído.')
      navigate('/workouts', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const addExercise = async (name: string) => {
    const created = await exerciseService.create(workout.id, name)
    setData((prev) => prev && [prev[0], [...prev[1], created]])
    toast.success('Exercício adicionado.')
    close()
  }

  const editExercise = (exercise: Exercise) => async (name: string) => {
    const updated = await exerciseService.update(exercise.id, name)
    setData((prev) => prev && [prev[0], prev[1].map((e) => (e.id === updated.id ? updated : e))])
    toast.success('Exercício atualizado.')
    close()
  }

  const deleteExercise = (exercise: Exercise) => async () => {
    try {
      await exerciseService.remove(exercise.id)
      setData((prev) => prev && [prev[0], prev[1].filter((e) => e.id !== exercise.id)])
      toast.success('Exercício removido.')
      close()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        backTo="/workouts"
        eyebrow={pluralize(exercises.length, 'exercício', 'exercícios')}
        title={workout.name}
        action={
          <div className="flex">
            <IconButton label="Renomear treino" onClick={() => setDialog({ kind: 'rename-workout' })}>
              <PencilIcon className="size-5" />
            </IconButton>
            <IconButton
              label="Excluir treino"
              className="hover:text-danger"
              onClick={() => setDialog({ kind: 'delete-workout' })}
            >
              <TrashIcon className="size-5" />
            </IconButton>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <section>
          <SectionTitle>Exercícios</SectionTitle>
          {exercises.length === 0 ? (
            <EmptyState
              icon={<DumbbellIcon className="size-8" />}
              title="Nenhum exercício ainda"
              description="Adicione os exercícios que compõem este treino."
            />
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {exercises.map((exercise, index) => (
                <li key={exercise.id} className="flex items-center gap-4 py-2 pl-4 pr-2">
                  <span className="font-display text-2xl font-extrabold text-brand tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-semibold">{exercise.name}</span>
                  <IconButton label={`Editar ${exercise.name}`} onClick={() => setDialog({ kind: 'edit-exercise', exercise })}>
                    <PencilIcon className="size-4" />
                  </IconButton>
                  <IconButton
                    label={`Remover ${exercise.name}`}
                    className="hover:text-danger"
                    onClick={() => setDialog({ kind: 'delete-exercise', exercise })}
                  >
                    <TrashIcon className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ol>
          )}
          <Button
            variant="secondary"
            block
            className="mt-3 border-dashed"
            icon={<PlusIcon className="size-5" />}
            onClick={() => setDialog({ kind: 'add-exercise' })}
          >
            Adicionar exercício
          </Button>
        </section>

        <div className="sticky bottom-20 lg:static">
          <Button
            block
            size="xl"
            icon={<PlayIcon className="size-5" />}
            disabled={exercises.length === 0}
            loading={startingId === workout.id}
            onClick={() => start(workout.id)}
          >
            Iniciar treino
          </Button>
        </div>
      </div>

      <Modal open={dialog?.kind === 'rename-workout'} title="Renomear treino" onClose={close}>
        <NameForm label="Nome do treino" initialValue={workout.name} submitLabel="Salvar" onSubmit={renameWorkout} />
      </Modal>
      <Modal open={dialog?.kind === 'add-exercise'} title="Novo exercício" onClose={close}>
        <NameForm label="Nome do exercício" placeholder="Ex.: Supino reto" submitLabel="Adicionar" onSubmit={addExercise} />
      </Modal>
      <Modal open={dialog?.kind === 'edit-exercise'} title="Editar exercício" onClose={close}>
        {dialog?.kind === 'edit-exercise' && (
          <NameForm
            key={dialog.exercise.id}
            label="Nome do exercício"
            initialValue={dialog.exercise.name}
            submitLabel="Salvar"
            onSubmit={editExercise(dialog.exercise)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={dialog?.kind === 'delete-workout'}
        title="Excluir treino?"
        message={`"${workout.name}" e seus exercícios serão removidos.`}
        onConfirm={deleteWorkout}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog?.kind === 'delete-exercise'}
        title="Remover exercício?"
        message={dialog?.kind === 'delete-exercise' ? `"${dialog.exercise.name}" será removido deste treino.` : ''}
        confirmLabel="Remover"
        onConfirm={dialog?.kind === 'delete-exercise' ? deleteExercise(dialog.exercise) : close}
        onClose={close}
      />
    </>
  )
}
