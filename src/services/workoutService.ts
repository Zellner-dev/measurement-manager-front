import type { Exercise, Workout } from '../types/api'
import { request } from './api'

export const workoutService = {
  listByUser: (userId: number) => request<Workout[]>(`/users/${userId}/workouts`),
  get: (id: number) => request<Workout>(`/workouts/${id}`),
  create: (userId: number, name: string) =>
    request<Workout>(`/users/${userId}/workouts`, { method: 'POST', body: { name } }),
  update: (id: number, name: string) => request<Workout>(`/workouts/${id}`, { method: 'PUT', body: { name } }),
  remove: (id: number) => request<void>(`/workouts/${id}`, { method: 'DELETE' }),
}

export const exerciseService = {
  listByWorkout: (workoutId: number) => request<Exercise[]>(`/workouts/${workoutId}/exercises`),
  create: (workoutId: number, name: string) =>
    request<Exercise>(`/workouts/${workoutId}/exercises`, { method: 'POST', body: { name } }),
  update: (id: number, name: string) => request<Exercise>(`/exercises/${id}`, { method: 'PUT', body: { name } }),
  remove: (id: number) => request<void>(`/exercises/${id}`, { method: 'DELETE' }),
}
