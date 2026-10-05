import type { ExerciseLog, WorkoutLog } from '../types/api'
import { request } from './api'

export const workoutLogService = {
  listByUser: (userId: number) => request<WorkoutLog[]>(`/users/${userId}/workout-logs`),
  get: (id: number) => request<WorkoutLog>(`/workout-logs/${id}`),
  /** Starts a session; performedAt defaults to "now" on the server. */
  start: (workoutId: number) => request<WorkoutLog>(`/workouts/${workoutId}/logs`, { method: 'POST', body: {} }),
  remove: (id: number) => request<void>(`/workout-logs/${id}`, { method: 'DELETE' }),
}

export const exerciseLogService = {
  listByWorkoutLog: (workoutLogId: number) => request<ExerciseLog[]>(`/workout-logs/${workoutLogId}/exercise-logs`),
  listByExercise: (exerciseId: number) => request<ExerciseLog[]>(`/exercises/${exerciseId}/logs`),
  create: (workoutLogId: number, exerciseId: number, weight: number) =>
    request<ExerciseLog>(`/workout-logs/${workoutLogId}/exercise-logs`, {
      method: 'POST',
      body: { exerciseId, weight },
    }),
  remove: (id: number) => request<void>(`/exercise-logs/${id}`, { method: 'DELETE' }),
}
