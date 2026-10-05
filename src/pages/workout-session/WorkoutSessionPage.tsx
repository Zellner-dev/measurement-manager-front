import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, IconButton } from '../../components/Button'
import { RetryableError } from '../../components/Feedback'
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, FlagIcon, MinusIcon, PlusIcon, XIcon } from '../../components/Icons'
import { FullScreenLoading } from '../../components/Loading'
import { ConfirmDialog } from '../../components/Modal'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../services/api'
import { exerciseService, workoutService } from '../../services/workoutService'
import { exerciseLogService, workoutLogService } from '../../services/workoutLogService'
import type { ExerciseLog } from '../../types/api'
import { formatKg, formatNumber, pluralize } from '../../utils/format'
import { SessionSummary } from './SessionSummary'

const WEIGHT_STEP = 2.5

async function loadSession(logId: number) {
  const log = await workoutLogService.get(logId)
  const [workout, exercises, sessionLogs] = await Promise.all([
    workoutService.get(log.workoutId),
    exerciseService.listByWorkout(log.workoutId),
    exerciseLogService.listByWorkoutLog(logId),
  ])
  // Sets of the previous session, per exercise (logs have no date: the highest workoutLogId is the latest)
  const history = await Promise.all(exercises.map((e) => exerciseLogService.listByExercise(e.id)))
  const previous = new Map<number, ExerciseLog[]>()
  exercises.forEach((exercise, i) => {
    const past = history[i].filter((l) => l.workoutLogId !== logId)
    const lastLogId = Math.max(...past.map((l) => l.workoutLogId))
    previous.set(
      exercise.id,
      past.filter((l) => l.workoutLogId === lastLogId),
    )
  })
  return { log, workout, exercises, sessionLogs, previous }
}

type Confirm = 'finish' | 'exit' | null

export function WorkoutSessionPage() {
  const logId = Number(useParams().logId)
  const navigate = useNavigate()
  const toast = useToast()
  const { data, error, loading, reload, setData } = useAsync(() => loadSession(logId), [logId])
  // The user picks the exercise: the order depends on which equipment is free
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [weights, setWeights] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState(false)
  const [confirm, setConfirm] = useState<Confirm>(null)

  if (loading && !data) return <FullScreenLoading />
  if (error || !data) {
    return (
      <div className="mx-auto max-w-md p-4">
        <RetryableError message={error ?? ''} onRetry={reload} />
        <Button variant="ghost" block onClick={() => navigate('/workouts')}>
          Voltar aos treinos
        </Button>
      </div>
    )
  }

  const { log, workout, exercises, sessionLogs, previous } = data

  if (finished) {
    return (
      <SessionSummary
        log={log}
        workoutName={workout.name}
        exercises={exercises}
        sessionLogs={sessionLogs}
        onDone={() => {
          toast.success('Treino salvo com sucesso.')
          navigate(`/history/${log.id}`, { replace: true })
        }}
        onBack={() => setFinished(false)}
      />
    )
  }

  const setsOf = (exerciseId: number) => sessionLogs.filter((l) => l.exerciseId === exerciseId)
  const doneCount = exercises.filter((e) => setsOf(e.id).length > 0).length
  const exercise = exercises.find((e) => e.id === currentId)

  const discard = async () => {
    try {
      await workoutLogService.remove(log.id)
      toast.success('Treino descartado.')
      navigate(`/workouts/${workout.id}`, { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const confirmFinish = () => {
    setConfirm(null)
    if (sessionLogs.length === 0) return discard()
    setFinished(true)
  }

  const finishButton = (
    <Button block size="xl" icon={<FlagIcon className="size-6" />} onClick={() => setConfirm('finish')}>
      Finalizar treino
    </Button>
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2">
        {exercise ? (
          <IconButton label="Voltar à lista de exercícios" onClick={() => setCurrentId(null)}>
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <IconButton label="Sair do treino" onClick={() => setConfirm('exit')}>
            <XIcon />
          </IconButton>
        )}
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-lg font-bold uppercase">{workout.name}</p>
          <p className="text-xs text-muted">
            {doneCount}/{exercises.length} exercícios feitos
          </p>
        </div>
        <div className="size-11" aria-hidden="true" />
      </header>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {exercises.map((e) => (
          <div
            key={e.id}
            className={`h-1.5 flex-1 rounded-full ${
              e.id === currentId ? 'bg-fg' : setsOf(e.id).length > 0 ? 'bg-brand' : 'bg-line'
            }`}
          />
        ))}
      </div>

      {exercise ? (
        <ExerciseView
          key={exercise.id}
          name={exercise.name}
          sets={setsOf(exercise.id)}
          lastSession={previous.get(exercise.id) ?? []}
          weightText={weights[exercise.id]}
          onWeightChange={(value) => setWeights((w) => ({ ...w, [exercise.id]: value }))}
          saving={saving}
          onRegister={async (weight) => {
            setSaving(true)
            try {
              const created = await exerciseLogService.create(log.id, exercise.id, weight)
              setData((prev) => prev && { ...prev, sessionLogs: [...prev.sessionLogs, created] })
              toast.success(`Série ${setsOf(exercise.id).length + 1} registrada: ${formatKg(weight)}`)
            } catch (err) {
              toast.error(errorMessage(err))
            } finally {
              setSaving(false)
            }
          }}
          onRemove={async (set) => {
            try {
              await exerciseLogService.remove(set.id)
              setData((prev) => prev && { ...prev, sessionLogs: prev.sessionLogs.filter((l) => l.id !== set.id) })
            } catch (err) {
              toast.error(errorMessage(err))
            }
          }}
          onBack={() => setCurrentId(null)}
          finishButton={
            <Button variant="ghost" block icon={<FlagIcon className="size-5" />} onClick={() => setConfirm('finish')}>
              Finalizar treino
            </Button>
          }
        />
      ) : (
        <>
          <section className="mt-6 flex-1">
            <h1 className="font-display text-3xl font-extrabold uppercase">Escolha o exercício</h1>
            <p className="mt-1 text-sm text-muted">Faça na ordem que preferir, conforme os aparelhos estiverem livres.</p>
            <ul className="mt-5 space-y-2">
              {exercises.map((e) => {
                const count = setsOf(e.id).length
                const last = previous.get(e.id)?.at(-1)?.weight
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentId(e.id)}
                      className={`flex min-h-18 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        count > 0 ? 'border-brand/50 bg-brand/10' : 'border-line bg-surface hover:border-muted'
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                          count > 0 ? 'bg-brand text-black' : 'border-2 border-line'
                        }`}
                      >
                        {count > 0 && <CheckIcon className="size-5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-display text-xl font-bold uppercase leading-tight">
                          {e.name}
                        </span>
                        <span className="text-sm text-muted">
                          {count > 0
                            ? pluralize(count, 'série feita', 'séries feitas')
                            : last != null
                              ? `Último: ${formatKg(last)}`
                              : 'Não iniciado'}
                        </span>
                      </span>
                      <ChevronRightIcon className="size-5 shrink-0 text-muted" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
          <div className="sticky bottom-0 mt-6 bg-bg pb-1 pt-3">{finishButton}</div>
        </>
      )}

      <ConfirmDialog
        open={confirm === 'finish'}
        tone="primary"
        title="Finalizar treino?"
        message={
          sessionLogs.length === 0
            ? 'Nenhuma série foi registrada. O treino será descartado e não aparecerá no histórico.'
            : `Você fez ${doneCount} de ${exercises.length} exercícios (${pluralize(sessionLogs.length, 'série', 'séries')}). Deseja finalizar o treino?`
        }
        confirmLabel="Finalizar"
        cancelLabel="Continuar"
        onConfirm={confirmFinish}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'exit'}
        title="Descartar treino?"
        message="O treino e as séries registradas serão apagados. Para salvar, use Finalizar treino."
        confirmLabel="Descartar"
        cancelLabel="Voltar"
        onConfirm={discard}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

interface ExerciseViewProps {
  name: string
  sets: ExerciseLog[]
  lastSession: ExerciseLog[]
  weightText: string | undefined
  onWeightChange: (value: string) => void
  saving: boolean
  onRegister: (weight: number) => Promise<void>
  onRemove: (set: ExerciseLog) => Promise<void>
  onBack: () => void
  finishButton: ReactNode
}

function ExerciseView({
  name,
  sets,
  lastSession,
  weightText: typed,
  onWeightChange,
  saving,
  onRegister,
  onRemove,
  onBack,
  finishButton,
}: ExerciseViewProps) {
  const suggested = sets.at(-1)?.weight ?? lastSession.at(-1)?.weight ?? null
  const weightText = typed ?? (suggested != null ? String(suggested) : '')
  const weight = Number(weightText.replace(',', '.'))
  const weightValid = weightText.trim() !== '' && Number.isFinite(weight) && weight >= 0

  const step = (delta: number) => {
    const base = weightValid ? weight : 0
    onWeightChange(formatNumber(Math.max(0, base + delta)).replace(/\./g, ''))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (weightValid) void onRegister(weight)
  }

  return (
    <>
      <section className="mt-8 flex-1" aria-live="polite">
        <h1 className="break-words font-display text-5xl font-extrabold uppercase leading-[0.95]">{name}</h1>

        <div className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <span className="text-muted">Último treino: </span>
          {lastSession.length > 0 ? (
            <span className="font-semibold">{lastSession.map((l) => formatKg(l.weight)).join(' · ')}</span>
          ) : (
            <span className="text-muted">sem registro anterior</span>
          )}
        </div>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="weight" className="block text-center text-sm font-semibold uppercase tracking-widest text-muted">
            Série {sets.length + 1} · Carga
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label={`Diminuir ${formatNumber(WEIGHT_STEP)} kg`}
              onClick={() => step(-WEIGHT_STEP)}
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-fg active:bg-line"
            >
              <MinusIcon className="size-7" />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                id="weight"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={weightText}
                onChange={(e) => onWeightChange(e.target.value.replace(/[^\d.,]/g, ''))}
                className="h-20 w-full rounded-2xl border-2 border-line bg-surface text-center font-display text-5xl font-extrabold tabular-nums outline-none focus:border-brand"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg font-semibold text-muted">
                kg
              </span>
            </div>
            <button
              type="button"
              aria-label={`Aumentar ${formatNumber(WEIGHT_STEP)} kg`}
              onClick={() => step(WEIGHT_STEP)}
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-fg active:bg-line"
            >
              <PlusIcon className="size-7" />
            </button>
          </div>
          <Button
            type="submit"
            block
            size="xl"
            className="mt-4"
            loading={saving}
            disabled={!weightValid}
            icon={<CheckIcon className="size-6" />}
          >
            Concluir série
          </Button>
        </form>

        {sets.length > 0 && (
          <ul className="mt-6 space-y-2" aria-label="Séries registradas">
            {sets.map((set, i) => (
              <li key={set.id} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-2">
                <CheckIcon className="size-5 text-brand" />
                <span className="text-sm text-muted">Série {i + 1}</span>
                <span className="flex-1 font-semibold">{formatKg(set.weight)}</span>
                <IconButton
                  label={`Desfazer série ${i + 1}`}
                  className="size-9 hover:text-danger"
                  onClick={() => void onRemove(set)}
                >
                  <XIcon className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="secondary" block size="lg" className="mt-8" icon={<ChevronLeftIcon className="size-5" />} onClick={onBack}>
        {sets.length > 0 ? 'Exercício feito · escolher outro' : 'Escolher outro exercício'}
      </Button>
      <div className="mt-2">{finishButton}</div>
    </>
  )
}
