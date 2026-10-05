import { Link } from 'react-router-dom'
import type { Workout } from '../types/api'
import { pluralize } from '../utils/format'
import { Button } from './Button'
import { ChevronRightIcon, PlayIcon } from './Icons'

interface WorkoutCardProps {
  workout: Workout
  exerciseCount?: number
  lastPerformed?: string
  onStart: () => void
  starting?: boolean
  featured?: boolean
}

export function WorkoutCard({ workout, exerciseCount, lastPerformed, onStart, starting, featured }: WorkoutCardProps) {
  const noExercises = exerciseCount === 0
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        featured ? 'border-brand/50 bg-gradient-to-br from-brand/15 to-surface' : 'border-line bg-surface'
      }`}
    >
      {featured && <div className="absolute inset-y-0 left-0 w-1 bg-brand" aria-hidden="true" />}
      <Link to={`/workouts/${workout.id}`} className="group flex items-start justify-between gap-3">
        <div className="min-w-0">
          {featured && <p className="text-xs font-semibold uppercase tracking-widest text-brand">Próximo treino</p>}
          <h3 className="break-words font-display text-3xl font-extrabold uppercase leading-tight group-hover:text-brand">
            {workout.name}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {exerciseCount === undefined ? '...' : pluralize(exerciseCount, 'exercício', 'exercícios')}
            {lastPerformed && <> · último: {lastPerformed}</>}
          </p>
        </div>
        <ChevronRightIcon className="mt-2 size-5 shrink-0 text-muted group-hover:text-brand" />
      </Link>
      <Button
        className="mt-5"
        block
        size={featured ? 'xl' : 'lg'}
        variant={featured ? 'primary' : 'secondary'}
        icon={<PlayIcon className="size-5" />}
        onClick={onStart}
        loading={starting}
        disabled={noExercises}
        title={noExercises ? 'Adicione exercícios antes de iniciar' : undefined}
      >
        {noExercises ? 'Sem exercícios' : 'Iniciar treino'}
      </Button>
    </article>
  )
}
