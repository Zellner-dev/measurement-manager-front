import type { WorkoutLog } from '../types/api'
import { dayKey, parseDate, toDateInput } from './format'

/** Workout sessions performed in the current week (Monday to Sunday). */
export function sessionsThisWeek(logs: WorkoutLog[], now = new Date()): number {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return logs.filter((log) => parseDate(log.performedAt) >= start).length
}

/** Consecutive days with at least one session, ending today (or yesterday, if not trained yet today). */
export function dayStreak(logs: WorkoutLog[], now = new Date()): number {
  const days = new Set(logs.map((log) => dayKey(log.performedAt)))
  const cursor = new Date(now)
  if (!days.has(toDateInput(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(toDateInput(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** The workout whose last session is the oldest (never performed comes first). */
export function nextWorkoutId(workoutIds: number[], logs: WorkoutLog[]): number | undefined {
  const lastPerformed = new Map<number, number>()
  for (const log of logs) {
    const time = parseDate(log.performedAt).getTime()
    lastPerformed.set(log.workoutId, Math.max(lastPerformed.get(log.workoutId) ?? 0, time))
  }
  return [...workoutIds].sort((a, b) => (lastPerformed.get(a) ?? -1) - (lastPerformed.get(b) ?? -1))[0]
}
