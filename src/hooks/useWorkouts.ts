import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../services/api'
import { exerciseService, workoutService } from '../services/workoutService'
import { workoutLogService } from '../services/workoutLogService'
import type { Workout, WorkoutLog } from '../types/api'
import { useAsync } from './useAsync'
import { useToast } from './useToast'

export interface WorkoutsOverview {
  workouts: Workout[]
  exerciseCounts: Map<number, number>
  /** All sessions of the user, newest first */
  logs: WorkoutLog[]
}

/** Workouts with exercise counts and the user's session history. */
export function useWorkoutsOverview(userId: number) {
  return useAsync<WorkoutsOverview>(async () => {
    const [workouts, logs] = await Promise.all([
      workoutService.listByUser(userId),
      workoutLogService.listByUser(userId),
    ])
    const counts = await Promise.all(workouts.map((w) => exerciseService.listByWorkout(w.id)))
    const exerciseCounts = new Map(workouts.map((w, i) => [w.id, counts[i].length]))
    return { workouts, exerciseCounts, logs }
  }, [userId])
}

/** Creates a workout log (session) and opens the execution screen. */
export function useStartWorkout() {
  const navigate = useNavigate()
  const toast = useToast()
  const [startingId, setStartingId] = useState<number | null>(null)

  const start = async (workoutId: number) => {
    setStartingId(workoutId)
    try {
      const log = await workoutLogService.start(workoutId)
      navigate(`/session/${log.id}`)
    } catch (err) {
      toast.error(errorMessage(err))
      setStartingId(null)
    }
  }

  return { start, startingId }
}
