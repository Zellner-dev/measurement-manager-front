import { useState } from 'react'
import { Button } from '../../components/Button'
import { CheckIcon } from '../../components/Icons'
import { MetricCard } from '../../components/MetricCard'
import type { Exercise, ExerciseLog, WorkoutLog } from '../../types/api'
import { formatNumber, parseDate } from '../../utils/format'

interface SessionSummaryProps {
  log: WorkoutLog
  workoutName: string
  exercises: Exercise[]
  sessionLogs: ExerciseLog[]
  onDone: () => void
  onBack: () => void
}

export function SessionSummary({ log, workoutName, exercises, sessionLogs, onDone, onBack }: SessionSummaryProps) {
  // Duration is only known while the session is open: the backend stores the start time, not the end.
  const [now] = useState(() => Date.now())
  const minutes = Math.max(1, Math.round((now - parseDate(log.performedAt).getTime()) / 60000))
  const doneExercises = exercises.filter((e) => sessionLogs.some((l) => l.exerciseId === e.id)).length
  const totalWeight = sessionLogs.reduce((sum, l) => sum + (l.weight ?? 0), 0)
  const durationValid = minutes < 24 * 60

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand text-black">
          <CheckIcon className="size-10" strokeWidth={3} />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">{workoutName}</p>
        <h1 className="mt-1 font-display text-5xl font-extrabold uppercase leading-none">
          Treino concluído <span aria-hidden="true">🎉</span>
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        {durationValid && <MetricCard label="Duração" value={minutes} unit="min" />}
        <MetricCard label="Exercícios" value={`${doneExercises}/${exercises.length}`} />
        <MetricCard label="Séries" value={sessionLogs.length} />
        <MetricCard label="Carga somada" value={formatNumber(totalWeight)} unit="kg" highlight />
      </div>

      <Button block size="xl" className="mt-10" onClick={onDone}>
        Concluir
      </Button>
      <Button block variant="ghost" className="mt-2" onClick={onBack}>
        Voltar ao treino
      </Button>
    </div>
  )
}
